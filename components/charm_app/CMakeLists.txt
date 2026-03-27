idf_component_register(SRCS "src/app_bootstrap.cpp"
                       INCLUDE_DIRS "include"
                       REQUIRES charm_core charm_ports charm_platform_ble charm_platform_usb charm_platform_time)
