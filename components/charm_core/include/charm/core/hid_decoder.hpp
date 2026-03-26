#pragma once

#include <cstddef>

#include "charm/contracts/events.hpp"
#include "charm/contracts/requests.hpp"
#include "charm/contracts/status_types.hpp"
#include "charm/core/decode_plan.hpp"

namespace charm::core {

struct DecodeReportRequest {
  charm::contracts::RawHidReportRef report{};
  const DecodePlan* decode_plan{nullptr};
};

struct DecodeReportResult {
  charm::contracts::ContractStatus status{charm::contracts::ContractStatus::kUnspecified};
  charm::contracts::FaultCode fault_code{};
  const charm::contracts::InputElementEvent* events{nullptr};
  std::size_t event_count{0};
};

class HidDecoder {
 public:
  virtual ~HidDecoder() = default;

  virtual DecodeReportResult DecodeReport(const DecodeReportRequest& request) = 0;
};

}  // namespace charm::core
