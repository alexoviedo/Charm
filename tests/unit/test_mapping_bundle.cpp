#include <gtest/gtest.h>

#include "charm/core/mapping_bundle.hpp"

namespace charm::core::test {

namespace {

constexpr std::uint32_t kFnvPrime32 = 16777619;
constexpr std::uint32_t kFnvOffsetBasis32 = 2166136261;

std::uint32_t ComputeHash(const CompiledMappingBundle& bundle) {
  std::uint32_t hash = kFnvOffsetBasis32;
  const std::uint8_t* entries_ptr = reinterpret_cast<const std::uint8_t*>(bundle.entries.data());
  std::size_t bytes_to_hash = bundle.entry_count * sizeof(MappingEntry);

  for (std::size_t i = 0; i < bytes_to_hash; ++i) {
    hash ^= entries_ptr[i];
    hash *= kFnvPrime32;
  }
  return hash;
}

}  // namespace

TEST(MappingBundleTest, ValidateValidBundle) {
  CompiledMappingBundle bundle{};
  bundle.bundle_ref.version = kSupportedMappingBundleVersion;
  bundle.entry_count = 1;
  bundle.entries[0] = {
      .source = {123},
      .source_type = charm::contracts::InputElementType::kButton,
      .target = {LogicalElementType::kButton, 1},
      .scale = 1,
      .offset = 0};

  bundle.bundle_ref.integrity = ComputeHash(bundle);

  DefaultMappingBundleValidator validator;
  ValidateMappingBundleRequest request{&bundle};
  auto result = validator.Validate(request);

  EXPECT_EQ(result.status, charm::contracts::ContractStatus::kOk);
}

TEST(MappingBundleTest, ValidateNullBundle) {
  DefaultMappingBundleValidator validator;
  ValidateMappingBundleRequest request{nullptr};
  auto result = validator.Validate(request);

  EXPECT_EQ(result.status, charm::contracts::ContractStatus::kRejected);
  EXPECT_EQ(result.fault_code.category, charm::contracts::ErrorCategory::kInvalidRequest);
}

TEST(MappingBundleTest, ValidateUnsupportedVersion) {
  CompiledMappingBundle bundle{};
  bundle.bundle_ref.version = kSupportedMappingBundleVersion + 1;
  bundle.entry_count = 0;
  bundle.bundle_ref.integrity = ComputeHash(bundle);

  DefaultMappingBundleValidator validator;
  ValidateMappingBundleRequest request{&bundle};
  auto result = validator.Validate(request);

  EXPECT_EQ(result.status, charm::contracts::ContractStatus::kRejected);
  EXPECT_EQ(result.fault_code.category, charm::contracts::ErrorCategory::kUnsupportedCapability);
}

TEST(MappingBundleTest, ValidateCapacityExceeded) {
  CompiledMappingBundle bundle{};
  bundle.bundle_ref.version = kSupportedMappingBundleVersion;
  bundle.entry_count = kMaxMappingEntries + 1;

  DefaultMappingBundleValidator validator;
  ValidateMappingBundleRequest request{&bundle};
  auto result = validator.Validate(request);

  EXPECT_EQ(result.status, charm::contracts::ContractStatus::kRejected);
  EXPECT_EQ(result.fault_code.category, charm::contracts::ErrorCategory::kCapacityExceeded);
}

TEST(MappingBundleTest, ValidateIntegrityFailure) {
  CompiledMappingBundle bundle{};
  bundle.bundle_ref.version = kSupportedMappingBundleVersion;
  bundle.entry_count = 1;
  bundle.entries[0] = {
      .source = {123},
      .source_type = charm::contracts::InputElementType::kButton,
      .target = {LogicalElementType::kButton, 1},
      .scale = 1,
      .offset = 0};

  bundle.bundle_ref.integrity = ComputeHash(bundle) + 1;

  DefaultMappingBundleValidator validator;
  ValidateMappingBundleRequest request{&bundle};
  auto result = validator.Validate(request);

  EXPECT_EQ(result.status, charm::contracts::ContractStatus::kRejected);
  EXPECT_EQ(result.fault_code.category, charm::contracts::ErrorCategory::kIntegrityFailure);
}

TEST(MappingBundleTest, LoadValidBundle) {
  CompiledMappingBundle bundle{};
  bundle.bundle_ref.version = kSupportedMappingBundleVersion;
  bundle.entry_count = 1;
  bundle.entries[0] = {
      .source = {123},
      .source_type = charm::contracts::InputElementType::kButton,
      .target = {LogicalElementType::kButton, 1},
      .scale = 1,
      .offset = 0};

  bundle.bundle_ref.integrity = ComputeHash(bundle);

  DefaultMappingBundleValidator validator;
  DefaultMappingBundleLoader loader(validator);

  LoadMappingBundleRequest load_request{&bundle};
  auto load_result = loader.Load(load_request);

  EXPECT_EQ(load_result.status, charm::contracts::ContractStatus::kOk);

  GetActiveBundleRequest get_request{};
  auto get_result = loader.GetActiveBundle(get_request);

  EXPECT_EQ(get_result.status, charm::contracts::ContractStatus::kOk);
  ASSERT_NE(get_result.bundle, nullptr);
  EXPECT_EQ(get_result.bundle->bundle_ref.version, kSupportedMappingBundleVersion);
  EXPECT_EQ(get_result.bundle->entry_count, 1);
  EXPECT_EQ(get_result.bundle->entries[0].source.value, 123);
}

TEST(MappingBundleTest, LoadInvalidBundle) {
  CompiledMappingBundle bundle{};
  bundle.bundle_ref.version = kSupportedMappingBundleVersion + 1;

  DefaultMappingBundleValidator validator;
  DefaultMappingBundleLoader loader(validator);

  LoadMappingBundleRequest load_request{&bundle};
  auto load_result = loader.Load(load_request);

  EXPECT_EQ(load_result.status, charm::contracts::ContractStatus::kRejected);
  EXPECT_EQ(load_result.fault_code.category, charm::contracts::ErrorCategory::kUnsupportedCapability);

  GetActiveBundleRequest get_request{};
  auto get_result = loader.GetActiveBundle(get_request);

  EXPECT_EQ(get_result.status, charm::contracts::ContractStatus::kUnavailable);
}

TEST(MappingBundleTest, LoadNullBundle) {
  DefaultMappingBundleValidator validator;
  DefaultMappingBundleLoader loader(validator);

  LoadMappingBundleRequest load_request{nullptr};
  auto load_result = loader.Load(load_request);

  EXPECT_EQ(load_result.status, charm::contracts::ContractStatus::kRejected);
  EXPECT_EQ(load_result.fault_code.category, charm::contracts::ErrorCategory::kInvalidRequest);
}

TEST(MappingBundleTest, GetActiveBundleWhenEmpty) {
  DefaultMappingBundleValidator validator;
  DefaultMappingBundleLoader loader(validator);

  GetActiveBundleRequest get_request{};
  auto get_result = loader.GetActiveBundle(get_request);

  EXPECT_EQ(get_result.status, charm::contracts::ContractStatus::kUnavailable);
  EXPECT_EQ(get_result.fault_code.category, charm::contracts::ErrorCategory::kInvalidState);
  EXPECT_EQ(get_result.bundle, nullptr);
}

}  // namespace charm::core::test
