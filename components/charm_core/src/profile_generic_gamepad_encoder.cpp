#include "charm/core/profile_manager.hpp"

#include <algorithm>
#include <cstdint>

namespace charm::core::profile_generic_gamepad {

namespace {

// Generic Gamepad Profile constants
constexpr charm::contracts::ProfileId kGenericGamepadProfileId{1};
constexpr charm::contracts::ReportId kInputReportId{1};

// C-structs used for deterministic byte-wise hashing and transport encoding
// must use __attribute__((packed)) to guarantee the absence of hidden compiler padding.
struct __attribute__((packed)) GenericGamepadReport {
  std::uint16_t buttons{0};
  std::uint8_t hat{0};
  std::int8_t left_x{0};
  std::int8_t left_y{0};
  std::int8_t right_x{0};
  std::int8_t right_y{0};
  std::uint8_t left_trigger{0};
  std::uint8_t right_trigger{0};
};

const ProfileCapability kCapabilities[] = {
    ProfileCapability::kSupportsHat,
    ProfileCapability::kSupportsAnalogTriggers,
};

constexpr const char* kProfileName = "Generic Gamepad";

// Static storage for the encoded report so we can return a stable pointer
GenericGamepadReport g_last_encoded_report{};

std::int8_t ClampAxis(std::int32_t logical_value) {
  // Logical axes might exceed standard int8 bounds.
  // Standard scale: map some logical range to -128..127.
  // We assume logical state values might need a clamp.
  if (logical_value < -128) return -128;
  if (logical_value > 127) return 127;
  return static_cast<std::int8_t>(logical_value);
}

std::uint8_t ClampTrigger(std::uint16_t logical_value) {
  if (logical_value > 255) return 255;
  return static_cast<std::uint8_t>(logical_value);
}

}  // namespace

GetProfileCapabilitiesResult GetCapabilities() {
  GetProfileCapabilitiesResult result{};
  result.status = charm::contracts::ContractStatus::kOk;
  result.descriptor.profile_id = kGenericGamepadProfileId;
  result.descriptor.name = kProfileName;
  // Use a simple strlen
  std::size_t name_len = 0;
  while (kProfileName[name_len] != '\0') {
    name_len++;
  }
  result.descriptor.name_length = name_len;
  result.descriptor.capabilities = kCapabilities;
  result.descriptor.capability_count = sizeof(kCapabilities) / sizeof(kCapabilities[0]);
  return result;
}

EncodeLogicalStateResult Encode(const charm::contracts::LogicalGamepadState* logical_state) {
  EncodeLogicalStateResult result{};

  if (logical_state == nullptr) {
    result.status = charm::contracts::ContractStatus::kFailed;
    result.fault_code.category = charm::contracts::ErrorCategory::kInvalidRequest;
    return result;
  }

  g_last_encoded_report = GenericGamepadReport{};

  // Encode buttons
  std::uint16_t buttons_mask = 0;
  for (std::size_t i = 0; i < 16; ++i) {
    if (logical_state->buttons[i].pressed) {
      buttons_mask |= (1 << i);
    }
  }
  g_last_encoded_report.buttons = buttons_mask;

  // Encode hat
  g_last_encoded_report.hat = logical_state->hat.value;

  // Encode axes (assumes 0=Lx, 1=Ly, 2=Rx, 3=Ry)
  g_last_encoded_report.left_x = ClampAxis(logical_state->axes[0].value);
  g_last_encoded_report.left_y = ClampAxis(logical_state->axes[1].value);
  g_last_encoded_report.right_x = ClampAxis(logical_state->axes[2].value);
  g_last_encoded_report.right_y = ClampAxis(logical_state->axes[3].value);

  // Encode triggers
  g_last_encoded_report.left_trigger = ClampTrigger(logical_state->left_trigger.value);
  g_last_encoded_report.right_trigger = ClampTrigger(logical_state->right_trigger.value);

  result.status = charm::contracts::ContractStatus::kOk;
  result.report.report_id = kInputReportId;
  result.report.bytes = reinterpret_cast<const std::uint8_t*>(&g_last_encoded_report);
  result.report.size = sizeof(GenericGamepadReport);

  return result;
}

}  // namespace charm::core::profile_generic_gamepad
