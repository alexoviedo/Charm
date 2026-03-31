#include "charm/app/app_bootstrap.hpp"
#include "charm/app/config_activation.hpp"
#include "charm/app/config_transport_runtime_adapter.hpp"
#include "charm/app/config_transport_service.hpp"
#include "charm/app/runtime_data_plane.hpp"
#include "charm/app/startup_storage_lifecycle.hpp"

#include "charm/core/decode_plan.hpp"
#include "charm/core/device_registry.hpp"
#include "charm/core/hid_decoder.hpp"
#include "charm/core/hid_semantic_model.hpp"
#include "charm/core/logical_state.hpp"
#include "charm/core/mapping_engine.hpp"
#include "charm/core/profile_manager.hpp"
#include "charm/core/supervisor.hpp"
#include "charm/core/recovery_policy.hpp"
#include "charm/platform/ble_transport_adapter.hpp"
#include "charm/platform/time_port_esp_idf.hpp"
#include "charm/platform/usb_host_adapter.hpp"
#include "charm/platform/config_store_nvs.hpp"

#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

namespace charm::app {

namespace {

constexpr const char* kBootstrapTag = "charm_boot";
constexpr const char* kDiagTag = "charm_diag";
constexpr std::uint32_t kDiagnosticRepeats = 6;
constexpr TickType_t kDiagnosticIntervalTicks = pdMS_TO_TICKS(5000);
TaskHandle_t g_diagnostic_task_handle = nullptr;

void DiagnosticBannerTask(void* /*arg*/) {
  for (std::uint32_t i = 0; i < kDiagnosticRepeats; ++i) {
    ESP_LOGW(kDiagTag,
             "USB host adapter is simulation-only in this build. No real ESP32-S3 USB host stack, hub traversal, VBUS control, or HID polling is active yet.");
    ESP_LOGW(kDiagTag,
             "HOTAS power/session instability is expected until the real USB host adapter is implemented. Current odd hardware behavior is not a trustworthy HID-runtime signal.");
    ESP_LOGI(kDiagTag,
             "Web monitor should reconnect at 115200 baud after flashing. If the console showed garbage before, use the updated monitor reconnect path.");
    vTaskDelay(kDiagnosticIntervalTicks);
  }

  g_diagnostic_task_handle = nullptr;
  vTaskDelete(nullptr);
}

void StartDiagnosticBannerTaskOnce() {
  if (g_diagnostic_task_handle != nullptr) {
    return;
  }

  constexpr std::uint32_t kStackWords = 4096;
  BaseType_t rc = xTaskCreate(&DiagnosticBannerTask, "charm_diag_banner",
                              kStackWords, nullptr, tskIDLE_PRIORITY + 1,
                              &g_diagnostic_task_handle);
  if (rc != pdPASS) {
    g_diagnostic_task_handle = nullptr;
    ESP_LOGE(kBootstrapTag, "Failed to start diagnostic banner task.");
  }
}

}  // namespace

// Static instances for simple thin wiring. In a fully mature system
// these might be managed by a more formal context container.
static charm::platform::TimePortEspIdf time_port;
static charm::core::CanonicalLogicalStateStore state_store({1});
static charm::core::DefaultMappingEngine mapping_engine(state_store);
static charm::core::CanonicalProfileManager profile_manager;
static charm::core::InMemoryDeviceRegistry device_registry;
static charm::core::DefaultHidDescriptorParser descriptor_parser;
static charm::core::DefaultDecodePlanBuilder decode_plan_builder;
static charm::core::DefaultHidDecoder hid_decoder;
static charm::platform::UsbHostAdapter usb_host;
static charm::platform::BleTransportAdapter ble_transport;
static charm::platform::ConfigStoreNvs config_store;
static ConfigTransportService config_transport_service(config_store);
static ConfigTransportRuntimeAdapter config_transport_runtime_adapter(config_transport_service);
static charm::core::DefaultSupervisor supervisor;
static charm::core::DefaultRecoveryPolicy recovery_policy(supervisor);
static RuntimeDataPlane runtime_data_plane(usb_host, ble_transport, device_registry,
                                           descriptor_parser, decode_plan_builder,
                                           hid_decoder, mapping_engine,
                                           profile_manager, supervisor);

void InitializeAndRun() {
  ESP_LOGI(kBootstrapTag, "Charm firmware bootstrap starting.");

  if (!InitializeStorageAndActivate(config_store, supervisor,
                                    &ActivatePersistedConfig,
                                    DefaultStorageInitFns())) {
    ESP_LOGE(kBootstrapTag, "Storage initialization or persisted-config activation failed.");
    return;
  }

  ESP_LOGI(kBootstrapTag, "Storage initialized and persisted config activation completed.");

  usb_host.SetListener(&runtime_data_plane);

  const auto usb_start = usb_host.Start({});
  const auto ble_start = ble_transport.Start({});
  const auto supervisor_start = supervisor.Start({});

  ESP_LOGI(kBootstrapTag,
           "Startup status: usb=%d ble=%d supervisor=%d.",
           static_cast<int>(usb_start.status),
           static_cast<int>(ble_start.status),
           static_cast<int>(supervisor_start.status));

  StartDiagnosticBannerTaskOnce();
}

}  // namespace charm::app
