#pragma once

#include <array>
#include <cstddef>
#include <cstdint>

#include "charm/contracts/error_types.hpp"
#include "charm/contracts/events.hpp"
#include "charm/contracts/identity_types.hpp"
#include "charm/contracts/status_types.hpp"

namespace charm::core {

inline constexpr std::size_t kMaxMappingEntries = 256;

enum class LogicalElementType : std::uint8_t {
  kUnknown = 0,
  kAxis = 1,
  kButton = 2,
  kTrigger = 3,
  kHat = 4,
};

struct LogicalElementRef {
  LogicalElementType type{LogicalElementType::kUnknown};
  std::uint16_t index{0};
};

struct MappingEntry {
  charm::contracts::ElementKeyHash source{};
  charm::contracts::InputElementType source_type{charm::contracts::InputElementType::kUnknown};
  LogicalElementRef target{};
  std::int32_t scale{1};
  std::int32_t offset{0};
};

struct CompiledMappingBundle {
  charm::contracts::MappingBundleRef bundle_ref{};
  std::array<MappingEntry, kMaxMappingEntries> entries{};
  std::size_t entry_count{0};
};

struct MappingConfigDocument {
  const std::uint8_t* bytes{nullptr};
  std::size_t size{0};
};

}  // namespace charm::core
