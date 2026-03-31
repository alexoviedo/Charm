#include "charm/platform/ble_transport_adapter.hpp"

#if __has_include("esp_bt.h") && __has_include("esp_bt_main.h")
#include "esp_bt.h"
#include "esp_bt_main.h"
#include "esp_gap_ble_api.h"
#include "esp_gatts_api.h"
#define CHARM_BLE_ESP_STACK_AVAILABLE 1
#else
#define CHARM_BLE_ESP_STACK_AVAILABLE 0
#endif

namespace charm::platform {

namespace {

class EspBleLifecycleBackend final : public BleLifecycleBackend {
 public:
  bool RegisterStackEventSink(StackEventSink* sink) override {
    sink_ = sink;
#if CHARM_BLE_ESP_STACK_AVAILABLE
    if (sink_ == nullptr) {
      return false;
    }
    active_instance_ = this;
    if (esp_ble_gap_register_callback(&EspBleLifecycleBackend::GapCallback) != ESP_OK) {
      active_instance_ = nullptr;
      return false;
    }
    if (esp_ble_gatts_register_callback(&EspBleLifecycleBackend::GattsCallback) != ESP_OK) {
      active_instance_ = nullptr;
      return false;
    }
#endif
    return true;
  }

  bool UsesStackEventCallbacks() const override {
    return CHARM_BLE_ESP_STACK_AVAILABLE == 1;
  }

  bool Start() override {
#if CHARM_BLE_ESP_STACK_AVAILABLE
    esp_bt_controller_config_t cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    if (esp_bt_controller_init(&cfg) != ESP_OK) return false;
    if (esp_bt_controller_enable(ESP_BT_MODE_BLE) != ESP_OK) return false;
    if (esp_bluedroid_init() != ESP_OK) return false;
    if (esp_bluedroid_enable() != ESP_OK) return false;
#endif
    return true;
  }

  bool Stop() override {
#if CHARM_BLE_ESP_STACK_AVAILABLE
    // Stop sequence is best-effort and fail-closed by caller.
    if (esp_bluedroid_disable() != ESP_OK) return false;
    if (esp_bluedroid_deinit() != ESP_OK) return false;
    if (esp_bt_controller_disable() != ESP_OK) return false;
    if (esp_bt_controller_deinit() != ESP_OK) return false;
#endif
    return true;
  }

  bool ConfigureReportChannel(std::uint32_t transport_if, std::uint16_t connection_id,
                              std::uint16_t value_handle, bool require_confirmation) override {
    transport_if_ = transport_if;
    connection_id_ = connection_id;
    value_handle_ = value_handle;
    require_confirmation_ = require_confirmation;
    report_ready_ = true;
    return true;
  }

  void ClearReportChannel() override {
    report_ready_ = false;
  }

  bool SendReport(const charm::contracts::EncodedInputReport& report) override {
    if (!report_ready_) return false;
    if (report.bytes == nullptr || report.size == 0) return false;
#if CHARM_BLE_ESP_STACK_AVAILABLE
    const auto gatts_if = static_cast<esp_gatt_if_t>(transport_if_);
    return esp_ble_gatts_send_indicate(gatts_if, connection_id_, value_handle_,
                                       static_cast<uint16_t>(report.size),
                                       const_cast<std::uint8_t*>(report.bytes), require_confirmation_) == ESP_OK;
#else
    (void)report;
    return false;
#endif
  }

 private:
#if CHARM_BLE_ESP_STACK_AVAILABLE
  static void GapCallback(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t* param) {
    if (active_instance_ == nullptr || active_instance_->sink_ == nullptr) {
      return;
    }
    if (event == ESP_GAP_BLE_ADV_START_COMPLETE_EVT) {
      if (param != nullptr &&
          param->adv_start_cmpl.status == ESP_BT_STATUS_SUCCESS) {
        active_instance_->sink_->OnStackAdvertisingReady();
      } else {
        const std::uint32_t reason = param == nullptr
                                         ? 10u
                                         : static_cast<std::uint32_t>(
                                               param->adv_start_cmpl.status);
        active_instance_->sink_->OnStackLifecycleError(reason);
      }
    }
  }

  static void GattsCallback(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if,
                            esp_ble_gatts_cb_param_t* param) {
    if (active_instance_ == nullptr || active_instance_->sink_ == nullptr ||
        param == nullptr) {
      return;
    }

    switch (event) {
      case ESP_GATTS_CONNECT_EVT: {
        charm::ports::BlePeerInfo peer{};
        for (std::size_t i = 0; i < peer.address.size(); ++i) {
          peer.address[i] = param->connect.remote_bda[i];
        }
        active_instance_->sink_->OnStackPeerConnected(peer);
        break;
      }
      case ESP_GATTS_DISCONNECT_EVT: {
        charm::ports::BlePeerInfo peer{};
        for (std::size_t i = 0; i < peer.address.size(); ++i) {
          peer.address[i] = param->disconnect.remote_bda[i];
        }
        active_instance_->sink_->OnStackReportChannelClosed();
        active_instance_->sink_->OnStackPeerDisconnected(peer);
        break;
      }
      case ESP_GATTS_WRITE_EVT: {
        if (!param->write.is_prep && param->write.len >= 2) {
          const std::uint16_t cccd = static_cast<std::uint16_t>(
              static_cast<std::uint16_t>(param->write.value[0]) |
              (static_cast<std::uint16_t>(param->write.value[1]) << 8u));
          if (cccd == 0x0000u) {
            active_instance_->sink_->OnStackReportChannelClosed();
          } else if (cccd == 0x0001u || cccd == 0x0002u) {
            active_instance_->sink_->OnStackReportChannelReady(
                static_cast<std::uint32_t>(gatts_if), param->write.conn_id,
                param->write.handle, cccd == 0x0002u);
          }
        }
        break;
      }
      default:
        break;
    }
  }
#endif

  StackEventSink* sink_{nullptr};
  std::uint32_t transport_if_{0};
  std::uint16_t connection_id_{0};
  std::uint16_t value_handle_{0};
  bool require_confirmation_{false};
  bool report_ready_{false};

#if CHARM_BLE_ESP_STACK_AVAILABLE
  static inline EspBleLifecycleBackend* active_instance_{nullptr};
#endif
};

}  // namespace

BleTransportAdapter::BleTransportAdapter()
    : backend_(std::make_unique<EspBleLifecycleBackend>()) {}

BleTransportAdapter::BleTransportAdapter(std::unique_ptr<BleLifecycleBackend> backend)
    : backend_(backend ? std::move(backend) : std::make_unique<EspBleLifecycleBackend>()) {}

charm::contracts::StartResult BleTransportAdapter::Start(const charm::contracts::StartRequest& /* request */) {
  charm::contracts::StartResult result;
  if (state_ == charm::contracts::AdapterState::kRunning) {
    result.status = charm::contracts::ContractStatus::kRejected;
    return result;
  }

  if (backend_ == nullptr || !backend_->RegisterStackEventSink(this) ||
      !backend_->Start()) {
    result.status = charm::contracts::ContractStatus::kFailed;
    result.fault_code.category = charm::contracts::ErrorCategory::kAdapterFailure;
    result.fault_code.reason = 1;
    EmitStatus(charm::contracts::ContractStatus::kFailed, charm::contracts::AdapterState::kStopped,
               charm::contracts::ErrorCategory::kAdapterFailure, 1);
    return result;
  }

  state_ = charm::contracts::AdapterState::kRunning;
  advertising_ready_ = false;
  peer_connected_ = false;
  report_channel_ready_ = false;
  recovery_attempts_ = 0;
  result.status = charm::contracts::ContractStatus::kOk;
  if (!backend_->UsesStackEventCallbacks()) {
    OnAdvertisingReady();
  }
  return result;
}

charm::contracts::StopResult BleTransportAdapter::Stop(const charm::contracts::StopRequest& /* request */) {
  charm::contracts::StopResult result;
  if (state_ == charm::contracts::AdapterState::kStopped) {
    result.status = charm::contracts::ContractStatus::kRejected;
    return result;
  }

  if (backend_ == nullptr || !backend_->Stop()) {
    result.status = charm::contracts::ContractStatus::kFailed;
    result.fault_code.category = charm::contracts::ErrorCategory::kAdapterFailure;
    result.fault_code.reason = 2;
    EmitStatus(charm::contracts::ContractStatus::kFailed, state_,
               charm::contracts::ErrorCategory::kAdapterFailure, 2);
    return result;
  }

  state_ = charm::contracts::AdapterState::kStopped;
  advertising_ready_ = false;
  peer_connected_ = false;
  report_channel_ready_ = false;
  recovery_attempts_ = 0;
  if (backend_ != nullptr) {
    backend_->ClearReportChannel();
  }
  result.status = charm::contracts::ContractStatus::kOk;
  EmitStatus(charm::contracts::ContractStatus::kOk, state_,
             charm::contracts::ErrorCategory::kAdapterFailure, 0);
  return result;
}

charm::ports::NotifyInputReportResult BleTransportAdapter::NotifyInputReport(const charm::ports::NotifyInputReportRequest& request) {
  charm::ports::NotifyInputReportResult result;

  if (state_ != charm::contracts::AdapterState::kRunning) {
    result.status = charm::contracts::ContractStatus::kRejected;
    return result;
  }

  if (!advertising_ready_) {
    result.status = charm::contracts::ContractStatus::kUnavailable;
    result.fault_code.category = charm::contracts::ErrorCategory::kInvalidState;
    result.fault_code.reason = 3;
    return result;
  }

  if (!peer_connected_ || !report_channel_ready_) {
    result.status = charm::contracts::ContractStatus::kUnavailable;
    result.fault_code.category = charm::contracts::ErrorCategory::kInvalidState;
    result.fault_code.reason = 4;
    return result;
  }

  if (backend_ == nullptr || !backend_->SendReport(request.report)) {
    result.status = charm::contracts::ContractStatus::kFailed;
    result.fault_code.category = charm::contracts::ErrorCategory::kTransportFailure;
    result.fault_code.reason = 5;
    const bool recovered = TryRecover(5);
    EmitStatus(charm::contracts::ContractStatus::kFailed, state_,
               charm::contracts::ErrorCategory::kTransportFailure, recovered ? 0u : 5u);
    return result;
  }

  result.status = charm::contracts::ContractStatus::kOk;
  return result;
}

void BleTransportAdapter::SetListener(charm::ports::BleTransportPortListener* listener) {
  listener_ = listener;
}

void BleTransportAdapter::OnAdvertisingReady() {
  if (state_ != charm::contracts::AdapterState::kRunning) return;
  advertising_ready_ = true;
  EmitStatus(charm::contracts::ContractStatus::kOk, state_,
             charm::contracts::ErrorCategory::kAdapterFailure, 0);
}

void BleTransportAdapter::OnPeerConnected(const charm::ports::BlePeerInfo& peer_info) {
  if (state_ != charm::contracts::AdapterState::kRunning || listener_ == nullptr) return;
  peer_connected_ = true;
  active_peer_ = peer_info;
  listener_->OnPeerConnected(peer_info);
}

void BleTransportAdapter::OnPeerDisconnected(const charm::ports::BlePeerInfo& peer_info) {
  if (listener_ == nullptr) return;
  peer_connected_ = false;
  active_peer_ = peer_info;
  OnReportChannelClosed();
  listener_->OnPeerDisconnected(peer_info);
}

void BleTransportAdapter::OnLifecycleError(std::uint32_t reason) {
  advertising_ready_ = false;
  (void)TryRecover(reason);
  EmitStatus(charm::contracts::ContractStatus::kFailed, state_,
             charm::contracts::ErrorCategory::kAdapterFailure, reason);
}

void BleTransportAdapter::OnReportChannelReady(std::uint32_t transport_if, std::uint16_t connection_id,
                                               std::uint16_t value_handle, bool require_confirmation) {
  if (state_ != charm::contracts::AdapterState::kRunning || backend_ == nullptr) return;
  if (!peer_connected_) {
    report_channel_ready_ = false;
    return;
  }
  report_channel_ready_ = backend_->ConfigureReportChannel(transport_if, connection_id, value_handle, require_confirmation);
  if (!report_channel_ready_) {
    (void)TryRecover(6);
  }
}

void BleTransportAdapter::OnReportChannelClosed() {
  report_channel_ready_ = false;
  if (backend_ != nullptr) {
    backend_->ClearReportChannel();
  }
}

void BleTransportAdapter::SetBondingMaterial(const std::uint8_t* bytes, std::size_t size) {
  if (bytes == nullptr || size == 0) {
    bonding_material_.clear();
    return;
  }
  bonding_material_.assign(bytes, bytes + size);
}

charm::ports::BondingMaterialRef BleTransportAdapter::GetBondingMaterial() const {
  charm::ports::BondingMaterialRef ref{};
  ref.bytes = bonding_material_.empty() ? nullptr : bonding_material_.data();
  ref.size = bonding_material_.size();
  return ref;
}

void BleTransportAdapter::ClearBondingMaterial() {
  bonding_material_.clear();
}

void BleTransportAdapter::OnStackAdvertisingReady() {
  OnAdvertisingReady();
}

void BleTransportAdapter::OnStackPeerConnected(
    const charm::ports::BlePeerInfo& peer_info) {
  OnPeerConnected(peer_info);
}

void BleTransportAdapter::OnStackPeerDisconnected(
    const charm::ports::BlePeerInfo& peer_info) {
  OnPeerDisconnected(peer_info);
}

void BleTransportAdapter::OnStackLifecycleError(std::uint32_t reason) {
  OnLifecycleError(reason);
}

void BleTransportAdapter::OnStackReportChannelReady(std::uint32_t transport_if,
                                                    std::uint16_t connection_id,
                                                    std::uint16_t value_handle,
                                                    bool require_confirmation) {
  OnReportChannelReady(transport_if, connection_id, value_handle,
                       require_confirmation);
}

void BleTransportAdapter::OnStackReportChannelClosed() {
  OnReportChannelClosed();
}

bool BleTransportAdapter::TryRecover(std::uint32_t reason) {
  if (state_ != charm::contracts::AdapterState::kRunning || backend_ == nullptr) {
    return false;
  }

  if (recovery_attempts_ >= kMaxRecoveryAttempts) {
    state_ = charm::contracts::AdapterState::kStopped;
    advertising_ready_ = false;
    peer_connected_ = false;
    report_channel_ready_ = false;
    backend_->ClearReportChannel();
    (void)backend_->Stop();
    return false;
  }

  ++recovery_attempts_;
  report_channel_ready_ = false;
  peer_connected_ = false;
  backend_->ClearReportChannel();

  const bool stopped = backend_->Stop();
  const bool started = stopped && backend_->Start();
  if (!started) {
    state_ = charm::contracts::AdapterState::kStopped;
    advertising_ready_ = false;
    report_channel_ready_ = false;
    peer_connected_ = false;
    return false;
  }

  state_ = charm::contracts::AdapterState::kRunning;
  advertising_ready_ = false;
  OnAdvertisingReady();
  EmitStatus(charm::contracts::ContractStatus::kOk, state_,
             charm::contracts::ErrorCategory::kAdapterFailure, reason);
  return true;
}

void BleTransportAdapter::EmitStatus(charm::contracts::ContractStatus status, charm::contracts::AdapterState state,
                                     charm::contracts::ErrorCategory category, std::uint32_t reason) {
  if (listener_ == nullptr) return;
  charm::ports::BleTransportStatus status_event{};
  status_event.status = status;
  status_event.state = state;
  status_event.fault_code.category = category;
  status_event.fault_code.reason = reason;
  listener_->OnStatusChanged(status_event);
}

}  // namespace charm::platform
