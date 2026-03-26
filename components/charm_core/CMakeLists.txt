idf_component_register(SRCS "src/device_registry.cpp"
                            "src/hid_semantic_model.cpp"
                            "src/decode_plan.cpp"
                       INCLUDE_DIRS "include"
                       REQUIRES charm_contracts charm_ports)
