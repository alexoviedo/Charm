#pragma once
#include "charm/contracts/registry_types.hpp"
#include "charm/ports/usb_host_port.hpp"
namespace charm::core {
struct RegisterDeviceRequest { charm::ports::UsbEnumerationInfo enumeration_info{}; charm::ports::DeviceDescriptorRef device_descriptor{}; };
struct RegisterDeviceResult { charm::contracts::ContractStatus status{charm::contracts::ContractStatus::kUnspecified}; charm::contracts::FaultCode fault_code{}; charm::contracts::DeviceHandle device_handle{}; };
struct RegisterInterfaceRequest { charm::ports::InterfaceDescriptorRef interface_descriptor{}; };
struct RegisterInterfaceResult { charm::contracts::ContractStatus status{charm::contracts::ContractStatus::kUnspecified}; charm::contracts::FaultCode fault_code{}; charm::contracts::RegistryEntry registry_entry{}; };
struct DetachDeviceRequest { charm::contracts::DeviceHandle device_handle{}; };
struct DetachDeviceResult { charm::contracts::ContractStatus status{charm::contracts::ContractStatus::kUnspecified}; charm::contracts::FaultCode fault_code{}; };
struct LookupDeviceRequest { charm::contracts::DeviceHandle device_handle{}; };
struct LookupDeviceResult { charm::contracts::ContractStatus status{charm::contracts::ContractStatus::kUnspecified}; charm::contracts::FaultCode fault_code{}; charm::ports::UsbEnumerationInfo enumeration_info{}; };
struct AttachDecodePlanRequest { charm::contracts::InterfaceHandle interface_handle{}; charm::contracts::DecodePlanRef decode_plan{}; };
struct AttachDecodePlanResult { charm::contracts::ContractStatus status{charm::contracts::ContractStatus::kUnspecified}; charm::contracts::FaultCode fault_code{}; charm::contracts::RegistryEntry registry_entry{}; };
class DeviceRegistry {
 public:
  virtual ~DeviceRegistry() = default;
  virtual RegisterDeviceResult RegisterDevice(const RegisterDeviceRequest& request) = 0;
  virtual RegisterInterfaceResult RegisterInterface(const RegisterInterfaceRequest& request) = 0;
  virtual DetachDeviceResult DetachDevice(const DetachDeviceRequest& request) = 0;
  virtual LookupDeviceResult LookupDevice(const LookupDeviceRequest& request) const = 0;
  virtual AttachDecodePlanResult AttachDecodePlan(const AttachDecodePlanRequest& request) = 0;
};
}  // namespace charm::core
