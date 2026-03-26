#include "charm/platform/usb_host_adapter.hpp"

namespace charm::platform {

charm::contracts::StartResult UsbHostAdapter::Start(const charm::contracts::StartRequest& request) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (started_) {
    return {charm::contracts::ContractStatus::kRejected, charm::contracts::FaultCode{}};
  }
  started_ = true;
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
  if (listener) {
    listener->OnStatusChanged(status);
  }
}

}  // namespace charm::platform
