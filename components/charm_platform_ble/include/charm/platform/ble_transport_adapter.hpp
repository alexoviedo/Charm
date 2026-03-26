#pragma once

#include "charm/ports/ble_transport_port.hpp"
#include "charm/contracts/requests.hpp"
#include "charm/contracts/events.hpp"
#include "charm/contracts/transport_types.hpp"

namespace charm::platform {

class BleTransportAdapter : public charm::ports::BleTransportPort {
 public:
  BleTransportAdapter() = default;
  ~BleTransportAdapter() override = default;

  // Implement BleTransportPort overrides
  charm::contracts::StartResult Start(const charm::contracts::StartRequest& request) override;
  charm::contracts::StopResult Stop(const charm::contracts::StopRequest& request) override;
  charm::ports::NotifyInputReportResult NotifyInputReport(const charm::ports::NotifyInputReportRequest& request) override;
  void SetListener(charm::ports::BleTransportPortListener* listener) override;

 private:
  charm::ports::BleTransportPortListener* listener_{nullptr};
};

}  // namespace charm::platform
