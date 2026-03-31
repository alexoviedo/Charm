#include "charm/platform/usb_host_adapter.hpp"

#include "esp_log.h"

namespace charm::platform {

namespace {
constexpr const char* kUsbHostTag = "usb_host_stub";
}

charm::contracts::StartResult UsbHostAdapter::Start(const charm::contracts::StartRequest& request) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (started_) {
    return {charm::contracts::ContractStatus::kRejected, charm::contracts::FaultCode{}};
  }
  started_ = true;
  ESP_LOGW(kUsbHostTag,
           "UsbHostAdapter::Start entered, but this adapter is still simulation-only. No real ESP USB host stack, VBUS control, hub traversal, or HID polling has been initialized.");
  if (listener_) {
    charm::ports::UsbHostStatus status;
    status.status = charm::contracts::ContractStatus::kOk;
    status.state = charm::contracts::AdapterState::kReady;
    listener_->OnStatusChanged(status);
  }
  return {charm::contracts::ContractStatus::kOk, charm::contracts::FaultCode{}};
}

charm::contracts::StopResult UsbHostAdapter::Stop(const charm::contracts::StopRequest& request) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!started_) {
    return {charm::contracts::ContractStatus::kRejected, charm::contracts::FaultCode{}};
  }
  started_ = false;
  ESP_LOGI(kUsbHostTag, "UsbHostAdapter::Stop entered for simulation-only adapter.");
  if (listener_) {
    charm::ports::UsbHostStatus status;
    status.status = charm::contracts::ContractStatus::kOk;
    status.state = charm::contracts::AdapterState::kStopped;
    listener_->OnStatusChanged(status);
  }
  return {charm::contracts::ContractStatus::kOk, charm::contracts::FaultCode{}};
}

charm::ports::ClaimInterfaceResult UsbHostAdapter::ClaimInterface(const charm::ports::ClaimInterfaceRequest& request) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!started_) {
    return {charm::contracts::ContractStatus::kRejected, charm::contracts::FaultCode{}, {}};
  }

  ESP_LOGW(kUsbHostTag,
           "ClaimInterface(device=%u, interface=%u) succeeded via simulated handle allocation only. No real HID interface claim occurred.",
           request.device_handle.value,
           request.interface_number);
  uint32_t handle_id = next_interface_handle_id_++;
  return {charm::contracts::ContractStatus::kOk, charm::contracts::FaultCode{}, charm::contracts::InterfaceHandle{handle_id}};
}

void UsbHostAdapter::SetListener(charm::ports::UsbHostPortListener* listener) {
  std::lock_guard<std::mutex> lock(mutex_);
  listener_ = listener;
}

void UsbHostAdapter::SimulateDeviceConnected(const charm::ports::UsbEnumerationInfo& info, const charm::ports::DeviceDescriptorRef& desc) {
  charm::ports::UsbHostPortListener* listener = nullptr;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (started_) listener = listener_;
  }
  ESP_LOGI(kUsbHostTag,
           "Simulated device connect: device=%u vid=0x%04x pid=0x%04x hub_depth=%u.",
           info.device_handle.value,
           info.vendor_id,
           info.product_id,
           static_cast<unsigned>(info.hub_path.depth));
  if (listener) {
    listener->OnDeviceConnected(info, desc);
  }
}

void UsbHostAdapter::SimulateDeviceDisconnected(charm::contracts::DeviceHandle device_handle) {
  charm::ports::UsbHostPortListener* listener = nullptr;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (started_) listener = listener_;
  }
  ESP_LOGI(kUsbHostTag, "Simulated device disconnect: device=%u.", device_handle.value);
  if (listener) {
    listener->OnDeviceDisconnected(device_handle);
  }
}

void UsbHostAdapter::SimulateInterfaceDescriptorAvailable(const charm::ports::InterfaceDescriptorRef& desc) {
  charm::ports::UsbHostPortListener* listener = nullptr;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (started_) listener = listener_;
  }
  ESP_LOGI(kUsbHostTag,
           "Simulated interface descriptor: device=%u interface=%u handle=%u descriptor_bytes=%zu.",
           desc.device_handle.value,
           static_cast<unsigned>(desc.interface_number),
           desc.interface_handle.value,
           desc.descriptor.size);
  if (listener) {
    listener->OnInterfaceDescriptorAvailable(desc);
  }
}

void UsbHostAdapter::SimulateReportReceived(const charm::contracts::RawHidReportRef& report_ref) {
  charm::ports::UsbHostPortListener* listener = nullptr;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (started_) listener = listener_;
  }
  ESP_LOGI(kUsbHostTag,
           "Simulated HID report: device=%u interface=%u report_id=%u len=%zu.",
           report_ref.device_handle.value,
           report_ref.interface_handle.value,
           static_cast<unsigned>(report_ref.report_meta.report_id),
           report_ref.byte_length);
  if (listener) {
    listener->OnReportReceived(report_ref);
  }
}

void UsbHostAdapter::SimulateStatusChanged(const charm::ports::UsbHostStatus& status) {
  charm::ports::UsbHostPortListener* listener = nullptr;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    listener = listener_;
  }
  ESP_LOGI(kUsbHostTag,
           "Simulated USB host status: status=%d state=%d reason=%u.",
           static_cast<int>(status.status),
           static_cast<int>(status.state),
           status.fault_code.reason);
  if (listener) {
    listener->OnStatusChanged(status);
  }
}

}  // namespace charm::platform
