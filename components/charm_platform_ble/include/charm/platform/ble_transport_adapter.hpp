#pragma once

#include <cstddef>
#include <cstdint>
#include <memory>
#include <vector>

#include "charm/ports/ble_transport_port.hpp"
#include "charm/contracts/requests.hpp"
#include "charm/contracts/events.hpp"
#include "charm/contracts/transport_types.hpp"

namespace charm::platform {

class BleLifecycleBackend {
 public:
  virtual ~BleLifecycleBackend() = default;
  virtual bool Start() = 0;
  virtual bool Stop() = 0;
  virtual bool ConfigureReportChannel(std::uint32_t transport_if, std::uint16_t connection_id,
                                      std::uint16_t value_handle, bool require_confirmation) = 0;
  virtual void ClearReportChannel() = 0;
  virtual bool SendReport(const charm::contracts::EncodedInputReport& report) = 0;
};

class BleTransportAdapter : public charm::ports::BleTransportPort {
 public:
  BleTransportAdapter();
  explicit BleTransportAdapter(std::unique_ptr<BleLifecycleBackend> backend);
  ~BleTransportAdapter() override = default;

  // Implement BleTransportPort overrides
  charm::contracts::StartResult Start(const charm::contracts::StartRequest& request) override;
  charm::contracts::StopResult Stop(const charm::contracts::StopRequest& request) override;
  charm::ports::NotifyInputReportResult NotifyInputReport(const charm::ports::NotifyInputReportRequest& request) override;
  void SetListener(charm::ports::BleTransportPortListener* listener) override;

  // FW-002 lifecycle callbacks from stack backend.
  void OnAdvertisingReady();
  void OnPeerConnected(const charm::ports::BlePeerInfo& peer_info);
  void OnPeerDisconnected(const charm::ports::BlePeerInfo& peer_info);
  void OnLifecycleError(std::uint32_t reason);
  void OnReportChannelReady(std::uint32_t transport_if, std::uint16_t connection_id,
                            std::uint16_t value_handle, bool require_confirmation);
  void OnReportChannelClosed();
  void SetBondingMaterial(const std::uint8_t* bytes, std::size_t size);
  charm::ports::BondingMaterialRef GetBondingMaterial() const;
  void ClearBondingMaterial();

 private:
  static constexpr std::size_t kMaxRecoveryAttempts = 2;
  bool TryRecover(std::uint32_t reason);
  void EmitStatus(charm::contracts::ContractStatus status, charm::contracts::AdapterState state,
                  charm::contracts::ErrorCategory category, std::uint32_t reason);

  charm::ports::BleTransportPortListener* listener_{nullptr};
  charm::contracts::AdapterState state_{charm::contracts::AdapterState::kStopped};
  std::unique_ptr<BleLifecycleBackend> backend_;
  bool advertising_ready_{false};
  bool peer_connected_{false};
  bool report_channel_ready_{false};
  std::size_t recovery_attempts_{0};
  charm::ports::BlePeerInfo active_peer_{};
  std::vector<std::uint8_t> bonding_material_{};
};

}  // namespace charm::platform
