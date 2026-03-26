#include "charm/platform/usb_host_adapter.hpp"

namespace charm::platform {

charm::contracts::StartResult UsbHostAdapter::Start(const charm::contracts::StartRequest& request) {
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
  if (!started_) {
    return {charm::contracts::ContractStatus::kRejected, charm::contracts::FaultCode{}, {}};
  }
  // Currently, we just return Success with a dummy InterfaceHandle
  return {charm::contracts::ContractStatus::kOk, charm::contracts::FaultCode{}, charm::contracts::InterfaceHandle{request.interface_number}};
}

void UsbHostAdapter::SetListener(charm::ports::UsbHostPortListener* listener) {
  listener_ = listener;
}

void UsbHostAdapter::SimulateDeviceConnected(const charm::ports::UsbEnumerationInfo& info, const charm::ports::DeviceDescriptorRef& desc) {
  if (started_ && listener_) {
    listener_->OnDeviceConnected(info, desc);
  }
}

void UsbHostAdapter::SimulateDeviceDisconnected(charm::contracts::DeviceHandle device_handle) {
  if (started_ && listener_) {
    listener_->OnDeviceDisconnected(device_handle);
  }
}

void UsbHostAdapter::SimulateInterfaceDescriptorAvailable(const charm::ports::InterfaceDescriptorRef& desc) {
  if (started_ && listener_) {
    listener_->OnInterfaceDescriptorAvailable(desc);
  }
}

void UsbHostAdapter::SimulateReportReceived(const charm::contracts::RawHidReportRef& report_ref) {
  if (started_ && listener_) {
    listener_->OnReportReceived(report_ref);
  }
}

void UsbHostAdapter::SimulateStatusChanged(const charm::ports::UsbHostStatus& status) {
  if (listener_) {
    listener_->OnStatusChanged(status);
  }
}

}  // namespace charm::platform
