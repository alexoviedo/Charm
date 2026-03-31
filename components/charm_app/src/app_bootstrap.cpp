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

namespace charm::app {

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
  if (!InitializeStorageAndActivate(config_store, supervisor,
                                    &ActivatePersistedConfig,
                                    DefaultStorageInitFns())) {
    return;
  }

  usb_host.SetListener(&runtime_data_plane);

  usb_host.Start({});
  ble_transport.Start({});
  supervisor.Start({});
}

}  // namespace charm::app
