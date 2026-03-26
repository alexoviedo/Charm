#include "charm/platform/ble_transport_adapter.hpp"

namespace charm::platform {

charm::contracts::StartResult BleTransportAdapter::Start(const charm::contracts::StartRequest& /* request */) {
  // Pure mock implementation: no actual NimBLE stack logic yet
  charm::contracts::StartResult result;
  result.status = charm::contracts::ContractStatus::kOk;

  if (listener_ != nullptr) {
    charm::ports::BleTransportStatus status_event{};
    status_event.status = charm::contracts::ContractStatus::kOk;
    status_event.state = charm::contracts::AdapterState::kRunning;
    listener_->OnStatusChanged(status_event);
  }

  return result;
}

charm::contracts::StopResult BleTransportAdapter::Stop(const charm::contracts::StopRequest& /* request */) {
  // Pure mock implementation
  charm::contracts::StopResult result;
  result.status = charm::contracts::ContractStatus::kOk;

  if (listener_ != nullptr) {
    charm::ports::BleTransportStatus status_event{};
    status_event.status = charm::contracts::ContractStatus::kOk;
    status_event.state = charm::contracts::AdapterState::kStopped;
    listener_->OnStatusChanged(status_event);
  }

  return result;
}

charm::ports::NotifyInputReportResult BleTransportAdapter::NotifyInputReport(const charm::ports::NotifyInputReportRequest& /* request */) {
  // Pure mock implementation
  charm::ports::NotifyInputReportResult result;
  result.status = charm::contracts::ContractStatus::kOk;
  return result;
}

void BleTransportAdapter::SetListener(charm::ports::BleTransportPortListener* listener) {
  listener_ = listener;
}

}  // namespace charm::platform
