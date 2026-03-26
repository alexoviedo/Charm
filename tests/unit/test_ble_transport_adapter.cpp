#include <gtest/gtest.h>
#include "charm/platform/ble_transport_adapter.hpp"

namespace charm::platform::test {

class MockBleTransportPortListener : public charm::ports::BleTransportPortListener {
 public:
  void OnPeerConnected(const charm::ports::BlePeerInfo& peer_info) override {
    connected_count++;
    last_peer = peer_info;
  }

  void OnPeerDisconnected(const charm::ports::BlePeerInfo& peer_info) override {
    disconnected_count++;
    last_peer = peer_info;
  }

  void OnStatusChanged(const charm::ports::BleTransportStatus& status) override {
    status_changed_count++;
    last_status = status;
  }

  int connected_count{0};
  int disconnected_count{0};
  int status_changed_count{0};
  charm::ports::BlePeerInfo last_peer{};
  charm::ports::BleTransportStatus last_status{};
};

class BleTransportAdapterTest : public ::testing::Test {
 protected:
  BleTransportAdapter adapter;
  MockBleTransportPortListener listener;

  void SetUp() override {
    adapter.SetListener(&listener);
  }
};

TEST_F(BleTransportAdapterTest, StartSucceedsAndNotifiesListener) {
  charm::contracts::StartRequest req;
  auto result = adapter.Start(req);
  EXPECT_EQ(result.status, charm::contracts::ContractStatus::kOk);

  EXPECT_EQ(listener.status_changed_count, 1);
  EXPECT_EQ(listener.last_status.state, charm::contracts::AdapterState::kRunning);
}

TEST_F(BleTransportAdapterTest, StopSucceedsAndNotifiesListener) {
  charm::contracts::StartRequest start_req;
  adapter.Start(start_req);
  listener.status_changed_count = 0; // reset

  charm::contracts::StopRequest req;
  auto result = adapter.Stop(req);
  EXPECT_EQ(result.status, charm::contracts::ContractStatus::kOk);

  EXPECT_EQ(listener.status_changed_count, 1);
  EXPECT_EQ(listener.last_status.state, charm::contracts::AdapterState::kStopped);
}

TEST_F(BleTransportAdapterTest, NotifyInputReportSucceeds) {
  charm::contracts::StartRequest start_req;
  adapter.Start(start_req);

  charm::ports::NotifyInputReportRequest req;
  req.report.report_id = 1;
  req.report.size = 10;

  auto result = adapter.NotifyInputReport(req);
  EXPECT_EQ(result.status, charm::contracts::ContractStatus::kOk);
}

TEST_F(BleTransportAdapterTest, StartWhenAlreadyRunningIsRejected) {
  charm::contracts::StartRequest start_req;
  adapter.Start(start_req);

  auto result = adapter.Start(start_req);
  EXPECT_EQ(result.status, charm::contracts::ContractStatus::kRejected);
}

TEST_F(BleTransportAdapterTest, StopWhenAlreadyStoppedIsRejected) {
  charm::contracts::StopRequest stop_req;
  auto result = adapter.Stop(stop_req);
  EXPECT_EQ(result.status, charm::contracts::ContractStatus::kRejected);
}

TEST_F(BleTransportAdapterTest, NotifyWhenStoppedIsRejected) {
  charm::ports::NotifyInputReportRequest req;
  req.report.report_id = 1;
  req.report.size = 10;

  auto result = adapter.NotifyInputReport(req);
  EXPECT_EQ(result.status, charm::contracts::ContractStatus::kRejected);
}

}  // namespace charm::platform::test
