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

#include <esp_err.h>
#include <esp_log.h>
#include <nvs_flash.h>

namespace charm::app {
namespace {

constexpr char kLogTag[] = "charm.bootstrap";

esp_err_t InitializeNvs() {
  esp_err_t err = nvs_flash_init();
  if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
    const esp_err_t erase_err = nvs_flash_erase();
    if (erase_err != ESP_OK) {
      return erase_err;
    }
    err = nvs_flash_init();
  }
  return err;
}

}  // namespace

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
  const esp_err_t nvs_err = InitializeNvs();
  if (nvs_err != ESP_OK) {
    ESP_LOGE(kLogTag, "Failed to initialize NVS: %s", esp_err_to_name(nvs_err));
  }

  // At this thin integration level, we just start the adapters and the supervisor.
  usb_host.Start({});
  ble_transport.Start({});
  supervisor.Start({});

  if (nvs_err == ESP_OK) {
    ActivatePersistedConfig(config_store, supervisor);
  } else {
    ESP_LOGW(kLogTag, "Skipping persisted config activation because NVS is unavailable");
  }
}

}  // namespace charm::app
