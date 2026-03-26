#pragma once

#include "charm/ports/usb_host_port.hpp"

namespace charm::platform {

class UsbHostAdapter : public charm::ports::UsbHostPort {
 public:
  UsbHostAdapter() = default;
  ~UsbHostAdapter() override = default;

  charm::contracts::StartResult Start(const charm::contracts::StartRequest& request) override;
  charm::contracts::StopResult Stop(const charm::contracts::StopRequest& request) override;
  charm::ports::ClaimInterfaceResult ClaimInterface(const charm::ports::ClaimInterfaceRequest& request) override;
  void SetListener(charm::ports::UsbHostPortListener* listener) override;

  // These methods simulate the callbacks from the ESP-IDF USB Host driver
  // Enqueue facts only, testing normalized dispatch.
  void SimulateDeviceConnected(const charm::ports::UsbEnumerationInfo& info, const charm::ports::DeviceDescriptorRef& desc);
  void SimulateDeviceDisconnected(charm::contracts::DeviceHandle device_handle);
  void SimulateInterfaceDescriptorAvailable(const charm::ports::InterfaceDescriptorRef& desc);
  void SimulateReportReceived(const charm::contracts::RawHidReportRef& report_ref);
  void SimulateStatusChanged(const charm::ports::UsbHostStatus& status);

 private:
  charm::ports::UsbHostPortListener* listener_{nullptr};
  bool started_{false};
};

}  // namespace charm::platform
