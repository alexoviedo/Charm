#include "charm/platform/config_store_nvs.hpp"
#include <nvs.h>
#include <nvs_flash.h>
#include <cstring>

namespace charm::platform {

static constexpr const char* kNvsNamespace = "charm_cfg";
static constexpr const char* kBundleKey = "map_bundle";
static constexpr const char* kProfileKey = "prof_id";
static constexpr const char* kBondKey = "bond_mat";

ConfigStoreNvs::~ConfigStoreNvs() {
  if (cached_config_.bonding_material != nullptr) {
    delete[] cached_config_.bonding_material;
  }
}

charm::contracts::LoadConfigResult ConfigStoreNvs::LoadConfig(const charm::contracts::LoadConfigRequest& request) {
  charm::contracts::LoadConfigResult result{};
  nvs_handle_t handle;

  if (nvs_open(kNvsNamespace, 0, &handle) != 0) {
    result.status = charm::contracts::ContractStatus::kFailed;
    return result;
  }

  size_t length = sizeof(cached_config_.mapping_bundle);
  nvs_get_blob(handle, kBundleKey, &cached_config_.mapping_bundle, &length);

  length = sizeof(cached_config_.profile_id);
  nvs_get_blob(handle, kProfileKey, &cached_config_.profile_id, &length);

  // Free existing bonding material if loaded
  if (cached_config_.bonding_material != nullptr) {
    delete[] cached_config_.bonding_material;
    cached_config_.bonding_material = nullptr;
    cached_config_.bonding_material_size = 0;
  }

  // Load bonding material length
  size_t bond_length = 0;
  if (nvs_get_blob(handle, kBondKey, nullptr, &bond_length) == 0 && bond_length > 0) {
    std::uint8_t* new_bonding_material = new std::uint8_t[bond_length];
    if (nvs_get_blob(handle, kBondKey, new_bonding_material, &bond_length) == 0) {
      cached_config_.bonding_material = new_bonding_material;
      cached_config_.bonding_material_size = bond_length;
    } else {
      delete[] new_bonding_material;
    }
  }

  nvs_close(handle);

  result.status = charm::contracts::ContractStatus::kOk;
  result.mapping_bundle = cached_config_.mapping_bundle;
  result.profile_id = cached_config_.profile_id;
  result.bonding_material = cached_config_.bonding_material;
  result.bonding_material_size = cached_config_.bonding_material_size;
  return result;
}

charm::contracts::PersistConfigResult ConfigStoreNvs::PersistConfig(const charm::contracts::PersistConfigRequest& request) {
  charm::contracts::PersistConfigResult result{};
  nvs_handle_t handle;

  if (nvs_open(kNvsNamespace, 1, &handle) != 0) {
    result.status = charm::contracts::ContractStatus::kFailed;
    return result;
  }

  cached_config_.mapping_bundle = request.mapping_bundle;
  cached_config_.profile_id = request.profile_id;

  if (cached_config_.bonding_material != nullptr) {
    delete[] cached_config_.bonding_material;
    cached_config_.bonding_material = nullptr;
    cached_config_.bonding_material_size = 0;
  }

  if (request.bonding_material != nullptr && request.bonding_material_size > 0) {
    std::uint8_t* new_bonding_material = new std::uint8_t[request.bonding_material_size];
    std::memcpy(new_bonding_material, request.bonding_material, request.bonding_material_size);
    cached_config_.bonding_material = new_bonding_material;
    cached_config_.bonding_material_size = request.bonding_material_size;
    if (nvs_set_blob(handle, kBondKey, cached_config_.bonding_material, cached_config_.bonding_material_size) != 0) {
      result.status = charm::contracts::ContractStatus::kFailed;
      nvs_close(handle);
      return result;
    }
  } else {
    nvs_erase_key(handle, kBondKey);
  }

  if (nvs_set_blob(handle, kBundleKey, &cached_config_.mapping_bundle, sizeof(cached_config_.mapping_bundle)) != 0 ||
      nvs_set_blob(handle, kProfileKey, &cached_config_.profile_id, sizeof(cached_config_.profile_id)) != 0 ||
      nvs_commit(handle) != 0) {
    result.status = charm::contracts::ContractStatus::kFailed;
  } else {
    result.status = charm::contracts::ContractStatus::kOk;
  }

  nvs_close(handle);

  return result;
}

charm::ports::ClearConfigResult ConfigStoreNvs::ClearConfig(const charm::ports::ClearConfigRequest& request) {
  charm::ports::ClearConfigResult result{};
  nvs_handle_t handle;

  if (nvs_open(kNvsNamespace, 1, &handle) == 0) {
    nvs_erase_all(handle);
    nvs_commit(handle);
    nvs_close(handle);
  }

  if (cached_config_.bonding_material != nullptr) {
    delete[] cached_config_.bonding_material;
  }
  cached_config_ = charm::ports::PersistedConfigRecord{};

  result.status = charm::contracts::ContractStatus::kOk;
  return result;
}

charm::ports::PersistedConfigRecord ConfigStoreNvs::PeekPersistedConfig() const {
  return cached_config_;
}

}  // namespace charm::platform
