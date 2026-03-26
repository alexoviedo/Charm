# Unit tests for pure-core modules.
# S-008 adds device-registry coverage using a standalone compile/run path.
# S-009 adds hid-semantic-model coverage using a standalone compile/run path.
# S-010 adds decode-plan builder coverage using a standalone compile/run path.
# S-011 adds hid report decoder coverage using a standalone compile/run path.
# S-012 adds logical gamepad state container coverage using a standalone compile/run path.
# S-013 adds mapping bundle validator coverage using a standalone compile/run path.

cmake_minimum_required(VERSION 3.16)
project(CharmUnitTests)

# We want C++20 for all pure-core logic
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find GTest
find_package(GTest REQUIRED)

# The directories for contracts and ports (just headers)
set(CONTRACTS_INC "${CMAKE_CURRENT_SOURCE_DIR}/../../components/charm_contracts/include")
set(PORTS_INC "${CMAKE_CURRENT_SOURCE_DIR}/../../components/charm_ports/include")
set(TEST_SUPPORT_INC "${CMAKE_CURRENT_SOURCE_DIR}/../../components/charm_test_support/include")
set(CORE_INC "${CMAKE_CURRENT_SOURCE_DIR}/../../components/charm_core/include")

# Build pure core test support as an OBJECT library since it has no main
add_library(charm_core_obj OBJECT
    "../../components/charm_core/src/device_registry.cpp"
    "../../components/charm_core/src/hid_semantic_model.cpp"
    "../../components/charm_core/src/decode_plan.cpp"
    "../../components/charm_core/src/hid_decoder.cpp"
    "../../components/charm_core/src/logical_state.cpp"
    "../../components/charm_core/src/mapping_bundle.cpp"
)
target_include_directories(charm_core_obj PUBLIC
    ${CONTRACTS_INC}
    ${PORTS_INC}
    ${CORE_INC}
)

# S-008 Device Registry
add_executable(test_device_registry test_device_registry.cpp)
target_include_directories(test_device_registry PRIVATE ${TEST_SUPPORT_INC} ${CONTRACTS_INC} ${CORE_INC})
target_link_libraries(test_device_registry PRIVATE charm_core_obj GTest::gtest_main GTest::gtest)

# S-009 HID Semantic Model
add_executable(test_hid_semantic_model test_hid_semantic_model.cpp)
target_include_directories(test_hid_semantic_model PRIVATE ${CONTRACTS_INC} ${CORE_INC})
target_link_libraries(test_hid_semantic_model PRIVATE charm_core_obj GTest::gtest_main GTest::gtest)

# S-010 Decode Plan Builder
add_executable(test_decode_plan test_decode_plan.cpp)
target_include_directories(test_decode_plan PRIVATE ${CONTRACTS_INC} ${CORE_INC})
target_link_libraries(test_decode_plan PRIVATE charm_core_obj GTest::gtest_main GTest::gtest)

# S-011 HID Report Decoder
add_executable(test_hid_decoder test_hid_decoder.cpp)
target_include_directories(test_hid_decoder PRIVATE ${CONTRACTS_INC} ${CORE_INC})
target_link_libraries(test_hid_decoder PRIVATE charm_core_obj GTest::gtest_main GTest::gtest)

# S-012 Logical Gamepad State
add_executable(test_logical_state test_logical_state.cpp)
target_include_directories(test_logical_state PRIVATE ${CONTRACTS_INC} ${CORE_INC})
target_link_libraries(test_logical_state PRIVATE charm_core_obj GTest::gtest_main GTest::gtest)

# S-013 Mapping Bundle
add_executable(test_mapping_bundle test_mapping_bundle.cpp)
target_include_directories(test_mapping_bundle PRIVATE ${CONTRACTS_INC} ${CORE_INC})
target_link_libraries(test_mapping_bundle PRIVATE charm_core_obj GTest::gtest_main GTest::gtest)

# Register tests
include(CTest)
add_test(NAME DeviceRegistryTest COMMAND test_device_registry)
add_test(NAME HidSemanticModelTest COMMAND test_hid_semantic_model)
add_test(NAME DecodePlanTest COMMAND test_decode_plan)
add_test(NAME HidDecoderTest COMMAND test_hid_decoder)
add_test(NAME LogicalStateTest COMMAND test_logical_state)
add_test(NAME MappingBundleTest COMMAND test_mapping_bundle)
