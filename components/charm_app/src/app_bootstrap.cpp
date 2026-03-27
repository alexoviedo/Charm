#include "charm/app/app_bootstrap.hpp"
#include "charm/app/config_activation.hpp"

#include "charm/core/logical_state.hpp"
#include "charm/core/mapping_engine.hpp"
#include "charm/core/profile_manager.hpp"
#include "charm/core/supervisor.hpp"
#include "charm/core/recovery_policy.hpp"
#include "charm/platform/ble_transport_adapter.hpp"
#include "charm/platform/time_port_esp_idf.hpp"
#include "charm/platform/usb_host_adapter.hpp"
#include "charm/platform/config_store_nvs.hpp"

namespace charm::app {

// Static instances for simple thin wiring. In a fully mature system
// these might be managed by a more formal context container.
static charm::platform::TimePortEspIdf time_port;
static charm::core::CanonicalLogicalStateStore state_store({1});
static charm::core::DefaultMappingEngine mapping_engine(state_store);
static charm::core::CanonicalProfileManager profile_manager;
static charm::platform::UsbHostAdapter usb_host;
static charm::platform::BleTransportAdapter ble_transport;
static charm::platform::ConfigStoreNvs config_store;
static charm::core::DefaultSupervisor supervisor;
static charm::core::DefaultRecoveryPolicy recovery_policy(supervisor);

void InitializeAndRun() {
  // At this thin integration level, we just start the adapters and the supervisor
  usb_host.Start({});
  ble_transport.Start({});
  supervisor.Start({});

  // Activate configured mappings and profile
  ActivatePersistedConfig(config_store, supervisor);
}

}  // namespace charm::app
