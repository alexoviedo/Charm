idf_component_register(SRCS "src/app_bootstrap.cpp" "src/config_activation.cpp" "src/config_transport_service.cpp"
                       INCLUDE_DIRS "include"
                       REQUIRES charm_core charm_ports charm_platform_ble charm_platform_usb charm_platform_time charm_platform_storage nvs_flash log)
