#include "charm/core/mapping_bundle.hpp"

namespace charm::core {

namespace {

constexpr std::uint32_t kFnvPrime32 = 16777619;
constexpr std::uint32_t kFnvOffsetBasis32 = 2166136261;

}  // namespace

ValidateMappingBundleResult DefaultMappingBundleValidator::Validate(
    const ValidateMappingBundleRequest& request) const {
  ValidateMappingBundleResult result{};

  if (request.bundle == nullptr) {
    result.status = charm::contracts::ContractStatus::kRejected;
    result.fault_code = {charm::contracts::ErrorCategory::kInvalidRequest, 0};
    return result;
  }

  const auto& bundle = *request.bundle;

  if (bundle.bundle_ref.version != kSupportedMappingBundleVersion) {
    result.status = charm::contracts::ContractStatus::kRejected;
    result.fault_code = {charm::contracts::ErrorCategory::kUnsupportedCapability, 0};
    return result;
  }

  if (bundle.entry_count > kMaxMappingEntries) {
    result.status = charm::contracts::ContractStatus::kRejected;
    result.fault_code = {charm::contracts::ErrorCategory::kCapacityExceeded, 0};
    return result;
  }

  std::uint32_t hash = kFnvOffsetBasis32;
  const std::uint8_t* entries_ptr = reinterpret_cast<const std::uint8_t*>(bundle.entries.data());
  std::size_t bytes_to_hash = bundle.entry_count * sizeof(MappingEntry);

  for (std::size_t i = 0; i < bytes_to_hash; ++i) {
    hash ^= entries_ptr[i];
    hash *= kFnvPrime32;
  }

  if (bundle.bundle_ref.integrity != hash) {
    result.status = charm::contracts::ContractStatus::kRejected;
    result.fault_code = {charm::contracts::ErrorCategory::kIntegrityFailure, 0};
    return result;
  }

  result.status = charm::contracts::ContractStatus::kOk;
  return result;
}

DefaultMappingBundleLoader::DefaultMappingBundleLoader(const MappingBundleValidator& validator)
    : validator_(validator) {}

LoadMappingBundleResult DefaultMappingBundleLoader::Load(const LoadMappingBundleRequest& request) {
  LoadMappingBundleResult result{};

  if (request.bundle == nullptr) {
    result.status = charm::contracts::ContractStatus::kRejected;
    result.fault_code = {charm::contracts::ErrorCategory::kInvalidRequest, 0};
    return result;
  }

  ValidateMappingBundleRequest validate_req{request.bundle};
  auto validate_res = validator_.Validate(validate_req);

  if (validate_res.status != charm::contracts::ContractStatus::kOk) {
    result.status = validate_res.status;
    result.fault_code = validate_res.fault_code;
    return result;
  }

  active_bundle_ = *request.bundle;
  has_active_bundle_ = true;

  result.status = charm::contracts::ContractStatus::kOk;
  return result;
}

GetActiveBundleResult DefaultMappingBundleLoader::GetActiveBundle(
    const GetActiveBundleRequest&) const {
  GetActiveBundleResult result{};

  if (!has_active_bundle_) {
    result.status = charm::contracts::ContractStatus::kUnavailable;
    result.fault_code = {charm::contracts::ErrorCategory::kInvalidState, 0};
    return result;
  }

  result.status = charm::contracts::ContractStatus::kOk;
  result.bundle = &active_bundle_;
  return result;
}

}  // namespace charm::core
