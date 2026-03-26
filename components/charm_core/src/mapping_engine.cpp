#include "charm/core/mapping_engine.hpp"

#include <algorithm>

namespace charm::core {

DefaultMappingEngine::DefaultMappingEngine(CanonicalLogicalStateStore& state_store)
    : state_store_{state_store} {}

ApplyInputEventResult DefaultMappingEngine::ApplyInputEvent(
    const ApplyInputEventRequest& request) {
  ApplyInputEventResult result{};

  if (request.active_bundle == nullptr ||
      request.active_bundle->bundle_ref.bundle_id != request.active_bundle_ref.bundle_id ||
      request.active_bundle->bundle_ref.version != request.active_bundle_ref.version) {
    result.status = charm::contracts::ContractStatus::kRejected;
    result.fault_code = charm::contracts::FaultCode{
        charm::contracts::ErrorCategory::kContractViolation, 0};
    return result;
  }

  const auto& event = request.input_event;
  const auto* bundle = request.active_bundle;

  auto& mutable_state = state_store_.GetMutableState(event.timestamp);

  bool mapped = false;

  for (std::size_t i = 0; i < bundle->entry_count; ++i) {
    const auto& entry = bundle->entries[i];

    if (entry.source.value == event.element_key_hash.value &&
        entry.source_type == event.element_type) {

      std::int32_t mapped_value = (event.value * entry.scale) + entry.offset;

      switch (entry.target.type) {
        case LogicalElementType::kAxis:
          if (entry.target.index < charm::contracts::kMaxLogicalAxes) {
            mutable_state.axes[entry.target.index].value = mapped_value;
            mapped = true;
          }
          break;
        case LogicalElementType::kButton:
          if (entry.target.index < charm::contracts::kMaxLogicalButtons) {
            mutable_state.buttons[entry.target.index].pressed = (mapped_value != 0);
            mapped = true;
          }
          break;
        case LogicalElementType::kTrigger:
          if (entry.target.index == 0) {
            mutable_state.left_trigger.value = static_cast<std::uint16_t>(std::clamp(mapped_value, 0, 65535));
            mapped = true;
          } else if (entry.target.index == 1) {
            mutable_state.right_trigger.value = static_cast<std::uint16_t>(std::clamp(mapped_value, 0, 65535));
            mapped = true;
          }
          break;
        case LogicalElementType::kHat:
          if (entry.target.index == 0) {
            mutable_state.hat.value = static_cast<std::uint8_t>(std::clamp(mapped_value, 0, 255));
            mapped = true;
          }
          break;
        default:
          break;
      }
    }
  }

  if (mapped) {
    result.status = charm::contracts::ContractStatus::kOk;
  } else {
    // Event was not mapped, but applying an unmapped event isn't necessarily a fault,
    // though the mapping engine might consider it unmapped. Returning kOk or similar.
    // The prompt says "direct event application, contract violations, and missing/rejected bundle paths."
    // Let's just return kOk.
    result.status = charm::contracts::ContractStatus::kOk;
  }

  return result;
}

GetLogicalStateResult DefaultMappingEngine::GetLogicalState(
    const GetLogicalStateRequest& request) const {
  return state_store_.GetLogicalState(request);
}

ResetLogicalStateResult DefaultMappingEngine::ResetLogicalState(
    const ResetLogicalStateRequest& request) {
  return state_store_.ResetLogicalState(request);
}

}  // namespace charm::core
