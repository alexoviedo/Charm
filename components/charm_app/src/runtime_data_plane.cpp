#include "charm/app/runtime_data_plane.hpp"

#include <algorithm>

namespace charm::app {

namespace {

constexpr charm::contracts::ProfileId kDefaultProfileId{1};
constexpr std::size_t kMaxRuntimeInterfaces = 32;

}  // namespace

RuntimeDataPlane::RuntimeDataPlane(charm::ports::UsbHostPort& usb_host,
                                   charm::ports::BleTransportPort& ble_transport,
                                   charm::core::DeviceRegistry& device_registry,
                                   charm::core::HidDescriptorParser& descriptor_parser,
                                   charm::core::DecodePlanBuilder& decode_plan_builder,
                                   charm::core::HidDecoder& hid_decoder,
                                   charm::core::MappingEngine& mapping_engine,
                                   charm::core::ProfileManager& profile_manager,
                                   charm::core::Supervisor& supervisor)
    : usb_host_(usb_host),
      ble_transport_(ble_transport),
      device_registry_(device_registry),
      descriptor_parser_(descriptor_parser),
      decode_plan_builder_(decode_plan_builder),
      hid_decoder_(hid_decoder),
      mapping_engine_(mapping_engine),
      profile_manager_(profile_manager),
      supervisor_(supervisor) {}

void RuntimeDataPlane::OnDeviceConnected(
    const charm::ports::UsbEnumerationInfo& enumeration_info,
    const charm::ports::DeviceDescriptorRef& device_descriptor) {
  charm::core::RegisterDeviceRequest register_request{};
  register_request.enumeration_info = enumeration_info;
  register_request.device_descriptor = device_descriptor;
  (void)device_registry_.RegisterDevice(register_request);
}

void RuntimeDataPlane::OnDeviceDisconnected(charm::contracts::DeviceHandle device_handle) {
  charm::core::DetachDeviceRequest detach_request{};
  detach_request.device_handle = device_handle;
  (void)device_registry_.DetachDevice(detach_request);

  for (auto it = interface_contexts_.begin(); it != interface_contexts_.end();) {
    if (it->second.device_handle.value == device_handle.value) {
      it = interface_contexts_.erase(it);
    } else {
      ++it;
    }
  }
}

void RuntimeDataPlane::OnInterfaceDescriptorAvailable(
    const charm::ports::InterfaceDescriptorRef& interface_descriptor) {
  if (interface_contexts_.size() >= kMaxRuntimeInterfaces) {
    return;
  }

  const charm::ports::ClaimInterfaceRequest claim_request{
      .device_handle = interface_descriptor.device_handle,
      .interface_number = interface_descriptor.interface_number,
  };
  const auto claim_result = usb_host_.ClaimInterface(claim_request);

  const auto resolved_interface_handle =
      claim_result.status == charm::contracts::ContractStatus::kOk
          ? claim_result.interface_handle
          : interface_descriptor.interface_handle;
  if (resolved_interface_handle.value == 0) {
    return;
  }

  charm::ports::InterfaceDescriptorRef claimed_descriptor = interface_descriptor;
  claimed_descriptor.interface_handle = resolved_interface_handle;

  charm::core::RegisterInterfaceRequest register_interface_request{};
  register_interface_request.interface_descriptor = claimed_descriptor;
  const auto register_result =
      device_registry_.RegisterInterface(register_interface_request);
  if (register_result.status != charm::contracts::ContractStatus::kOk) {
    return;
  }

  charm::core::ParseDescriptorRequest parse_request{};
  parse_request.device_handle = claimed_descriptor.device_handle;
  parse_request.interface_handle = claimed_descriptor.interface_handle;
  parse_request.interface_number = claimed_descriptor.interface_number;
  parse_request.descriptor = claimed_descriptor.descriptor;
  const auto parse_result = descriptor_parser_.ParseDescriptor(parse_request);
  if (parse_result.status != charm::contracts::ContractStatus::kOk) {
    return;
  }

  charm::core::BuildDecodePlanRequest build_request{};
  build_request.input.device_handle = claimed_descriptor.device_handle;
  build_request.input.interface_handle = claimed_descriptor.interface_handle;
  build_request.input.interface_number = claimed_descriptor.interface_number;
  build_request.input.semantic_model = parse_result.semantic_model;
  const auto build_result = decode_plan_builder_.BuildDecodePlan(build_request);
  if (build_result.status != charm::contracts::ContractStatus::kOk) {
    return;
  }

  auto decode_plan = std::make_unique<charm::core::DecodePlan>(build_result.decode_plan);
  auto compiled_bundle = BuildRuntimeBundle(*decode_plan, claimed_descriptor.interface_handle);

  charm::core::AttachDecodePlanRequest attach_request{};
  attach_request.interface_handle = claimed_descriptor.interface_handle;
  attach_request.decode_plan.plan = decode_plan.get();
  const auto attach_result = device_registry_.AttachDecodePlan(attach_request);
  if (attach_result.status != charm::contracts::ContractStatus::kOk) {
    return;
  }

  InterfaceContext context{};
  context.device_handle = claimed_descriptor.device_handle;
  context.interface_handle = claimed_descriptor.interface_handle;
  context.interface_number = claimed_descriptor.interface_number;
  context.decode_plan = std::move(decode_plan);
  context.compiled_bundle = compiled_bundle;

  interface_contexts_[MakeInterfaceKey(claimed_descriptor.interface_handle)] =
      std::move(context);
}

void RuntimeDataPlane::OnReportReceived(
    const charm::contracts::RawHidReportRef& report_ref) {
  const auto context_it =
      interface_contexts_.find(MakeInterfaceKey(report_ref.interface_handle));
  if (context_it == interface_contexts_.end() ||
      context_it->second.decode_plan == nullptr) {
    return;
  }

  const auto& context = context_it->second;
  std::array<charm::contracts::InputElementEvent,
             charm::core::kMaxDecodeBindingsPerInterface>
      events{};

  charm::core::DecodeReportRequest decode_request{};
  decode_request.report = report_ref;
  decode_request.decode_plan = context.decode_plan.get();
  decode_request.events_buffer = events.data();
  decode_request.events_buffer_capacity = events.size();
  const auto decode_result = hid_decoder_.DecodeReport(decode_request);
  if (decode_result.status != charm::contracts::ContractStatus::kOk) {
    return;
  }

  for (std::size_t i = 0; i < decode_result.event_count; ++i) {
    charm::core::ApplyInputEventRequest apply_request{};
    apply_request.input_event = decode_result.events[i];
    apply_request.active_bundle_ref = context.compiled_bundle.bundle_ref;
    apply_request.active_bundle = &context.compiled_bundle;
    const auto apply_result = mapping_engine_.ApplyInputEvent(apply_request);
    if (apply_result.status != charm::contracts::ContractStatus::kOk) {
      return;
    }
  }

  auto supervisor_state = supervisor_.GetState();
  auto selected_profile = supervisor_state.active_profile.profile_id;
  if (selected_profile.value == 0) {
    selected_profile = kDefaultProfileId;
  }

  (void)profile_manager_.SelectProfile(
      charm::contracts::SelectProfileRequest{.profile_id = selected_profile});

  charm::core::GetLogicalStateRequest logical_state_request{};
  logical_state_request.profile_id = selected_profile;
  const auto logical_state_result =
      mapping_engine_.GetLogicalState(logical_state_request);
  if (logical_state_result.status != charm::contracts::ContractStatus::kOk ||
      logical_state_result.snapshot.state == nullptr) {
    return;
  }

  std::array<std::uint8_t, 64> encoded_buffer{};
  charm::core::EncodeLogicalStateRequest encode_request{};
  encode_request.profile_id = selected_profile;
  encode_request.logical_state = logical_state_result.snapshot.state;
  encode_request.output_buffer = encoded_buffer.data();
  encode_request.output_buffer_capacity = encoded_buffer.size();
  const auto encode_result = profile_manager_.EncodeLogicalState(encode_request);
  if (encode_result.status != charm::contracts::ContractStatus::kOk) {
    return;
  }

  charm::ports::NotifyInputReportRequest notify_request{};
  notify_request.report = encode_result.report;
  (void)ble_transport_.NotifyInputReport(notify_request);
}

void RuntimeDataPlane::OnStatusChanged(const charm::ports::UsbHostStatus& /*status*/) {
  // Status is currently observed but no additional control-plane action is required in VS-01.
}

std::uint32_t RuntimeDataPlane::MakeInterfaceKey(
    charm::contracts::InterfaceHandle interface_handle) {
  return interface_handle.value;
}

charm::core::CompiledMappingBundle RuntimeDataPlane::BuildRuntimeBundle(
    const charm::core::DecodePlan& decode_plan,
    charm::contracts::InterfaceHandle interface_handle) {
  charm::core::CompiledMappingBundle bundle{};
  bundle.bundle_ref.bundle_id = interface_handle.value == 0 ? 1 : interface_handle.value;
  bundle.bundle_ref.version = charm::core::kSupportedMappingBundleVersion;

  std::uint16_t axis_index = 0;
  std::uint16_t button_index = 0;
  std::uint16_t trigger_index = 0;

  for (std::size_t i = 0; i < decode_plan.binding_count; ++i) {
    if (bundle.entry_count >= charm::core::kMaxMappingEntries) {
      break;
    }

    const auto& binding = decode_plan.bindings[i];
    auto& entry = bundle.entries[bundle.entry_count];

    entry.source = binding.element_key_hash;
    entry.source_type = binding.element_type;
    entry.scale = 1;
    entry.offset = 0;

    bool accepted = true;
    switch (binding.element_type) {
      case charm::contracts::InputElementType::kAxis:
      case charm::contracts::InputElementType::kScalar:
        if (axis_index >= charm::contracts::kMaxLogicalAxes) {
          accepted = false;
        } else {
          entry.target.type = charm::core::LogicalElementType::kAxis;
          entry.target.index = axis_index++;
        }
        break;
      case charm::contracts::InputElementType::kButton:
        if (button_index >= charm::contracts::kMaxLogicalButtons) {
          accepted = false;
        } else {
          entry.target.type = charm::core::LogicalElementType::kButton;
          entry.target.index = button_index++;
        }
        break;
      case charm::contracts::InputElementType::kTrigger:
        if (trigger_index > 1) {
          accepted = false;
        } else {
          entry.target.type = charm::core::LogicalElementType::kTrigger;
          entry.target.index = trigger_index++;
        }
        break;
      case charm::contracts::InputElementType::kHat:
        entry.target.type = charm::core::LogicalElementType::kHat;
        entry.target.index = 0;
        break;
      default:
        accepted = false;
        break;
    }

    if (accepted) {
      ++bundle.entry_count;
    }
  }

  bundle.bundle_ref.integrity = charm::core::ComputeMappingBundleHash(bundle);
  return bundle;
}

}  // namespace charm::app
