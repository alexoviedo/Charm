#pragma once

#include <array>
#include <cstddef>
#include <cstdint>
#include <memory>
#include <unordered_map>

#include "charm/core/decode_plan.hpp"
#include "charm/core/device_registry.hpp"
#include "charm/core/hid_decoder.hpp"
#include "charm/core/hid_semantic_model.hpp"
#include "charm/core/mapping_bundle.hpp"
#include "charm/core/mapping_engine.hpp"
#include "charm/core/profile_manager.hpp"
#include "charm/core/supervisor.hpp"
#include "charm/ports/ble_transport_port.hpp"
#include "charm/ports/usb_host_port.hpp"

namespace charm::app {

class RuntimeDataPlane final : public charm::ports::UsbHostPortListener {
 public:
  RuntimeDataPlane(charm::ports::UsbHostPort& usb_host,
                   charm::ports::BleTransportPort& ble_transport,
                   charm::core::DeviceRegistry& device_registry,
                   charm::core::HidDescriptorParser& descriptor_parser,
                   charm::core::DecodePlanBuilder& decode_plan_builder,
                   charm::core::HidDecoder& hid_decoder,
                   charm::core::MappingEngine& mapping_engine,
                   charm::core::ProfileManager& profile_manager,
                   charm::core::Supervisor& supervisor);

  void OnDeviceConnected(const charm::ports::UsbEnumerationInfo& enumeration_info,
                         const charm::ports::DeviceDescriptorRef& device_descriptor) override;
  void OnDeviceDisconnected(charm::contracts::DeviceHandle device_handle) override;
  void OnInterfaceDescriptorAvailable(const charm::ports::InterfaceDescriptorRef& interface_descriptor) override;
  void OnReportReceived(const charm::contracts::RawHidReportRef& report_ref) override;
  void OnStatusChanged(const charm::ports::UsbHostStatus& status) override;

 private:
  struct InterfaceContext {
    charm::contracts::DeviceHandle device_handle{};
    charm::contracts::InterfaceHandle interface_handle{};
    charm::contracts::InterfaceNumber interface_number{0};
    std::unique_ptr<charm::core::DecodePlan> decode_plan{};
    charm::core::CompiledMappingBundle compiled_bundle{};
  };

  static std::uint32_t MakeInterfaceKey(charm::contracts::InterfaceHandle interface_handle);
  static charm::core::CompiledMappingBundle BuildRuntimeBundle(
      const charm::core::DecodePlan& decode_plan,
      charm::contracts::InterfaceHandle interface_handle);

  charm::ports::UsbHostPort& usb_host_;
  charm::ports::BleTransportPort& ble_transport_;
  charm::core::DeviceRegistry& device_registry_;
  charm::core::HidDescriptorParser& descriptor_parser_;
  charm::core::DecodePlanBuilder& decode_plan_builder_;
  charm::core::HidDecoder& hid_decoder_;
  charm::core::MappingEngine& mapping_engine_;
  charm::core::ProfileManager& profile_manager_;
  charm::core::Supervisor& supervisor_;

  std::unordered_map<std::uint32_t, InterfaceContext> interface_contexts_{};
};

}  // namespace charm::app
