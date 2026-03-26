idf_component_register(SRCS "src/device_registry.cpp"
                            "src/hid_semantic_model.cpp"
                            "src/decode_plan.cpp"
                            "src/hid_decoder.cpp"
                            "src/logical_state.cpp"
                            "src/mapping_bundle.cpp"
                            "src/mapping_engine.cpp"
                       INCLUDE_DIRS "include"
                       REQUIRES charm_contracts charm_ports)
