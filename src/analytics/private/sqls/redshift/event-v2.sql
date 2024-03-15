CREATE TABLE IF NOT EXISTS {{schema}}.event_v2 (
    event_timestamp timestamp not null,
    event_id varchar(255) not null,
    event_time_msec bigint not null,
    event_name varchar(255) not null,
    event_value double precision,
    event_value_currency varchar(32),
    event_bundle_sequence_id bigint,
    ingest_time_msec bigint,
    device_mobile_brand_name varchar(255),
    device_mobile_model_name varchar(255),
    device_manufacturer varchar(255),
    device_carrier varchar(255),
    device_network_type varchar(255),
    device_operating_system varchar(255),
    device_operating_system_version varchar(255),
    device_vendor_id varchar(255),
    device_advertising_id varchar(255),
    device_system_language varchar(255),
    device_time_zone_offset_seconds int,
    device_ua_browser varchar(255),
    device_ua_browser_version varchar(255),
    device_ua_os varchar(255),
    device_ua_os_version varchar(255),
    device_ua_device varchar(255),
    device_ua_device_category varchar(255),
    device_ua super,
    device_screen_width int,
    device_screen_height int,
    device_viewport_width int,
    device_viewport_height int,
    geo_continent varchar(255),
    geo_sub_continent varchar(255),
    geo_country varchar(255),
    geo_region varchar(255),
    geo_metro varchar(255),
    geo_city varchar(255),
    geo_locale varchar(255),
    traffic_source_source varchar(255),
    traffic_source_medium varchar(255),
    traffic_source_campaign varchar(255),
    traffic_source_content varchar(2048),
    traffic_source_term varchar(2048),
    traffic_source_campaign_id varchar(255),
    traffic_source_clid_platform varchar(255),
    traffic_source_clid varchar(2048),
    traffic_source_channel_group varchar(255),
    traffic_source_category varchar(255),
    user_first_touch_time_msec bigint,
    app_package_id varchar(255),
    app_id varchar(255) not null,
    app_version varchar(255),
    app_title varchar(255),
    app_install_source varchar(255),
    platform varchar(255),
    project_id varchar(255) not null,
    screen_view_screen_name  varchar(255),
    screen_view_screen_id  varchar(255),
    screen_view_screen_unique_id varchar(255),
    screen_view_previous_screen_name varchar(255),
    screen_view_previous_screen_id  varchar(255),
    screen_view_previous_screen_unique_id varchar(255),
    screen_view_previous_time_msec bigint, 
    screen_view_engagement_time_msec bigint,
    screen_view_entrances bool,
    page_view_page_referrer  varchar(65535),
    page_view_page_referrer_title varchar(2048),
    page_view_previous_time_msec bigint,
    page_view_engagement_time_msec bigint,
    page_view_page_title varchar(2048),
    page_view_page_url varchar(65535),
    page_view_page_url_path varchar(65535),
    page_view_page_url_query_parameters super,
    page_view_hostname varchar(2048),
    page_view_latest_referrer varchar(65535),
    page_view_latest_referrer_host varchar(2048),
    page_view_entrances bool,
    app_start_is_first_time bool,
    upgrade_previous_app_version varchar(255),
    upgrade_previous_os_version varchar(255),
    search_key varchar(2048),
    search_term varchar(2048),
    outbound_link_classes varchar(2048),
    outbound_link_domain varchar(2048),
    outbound_link_id varchar(2048),
    outbound_link_url varchar(65535),
    outbound_link bool,
    user_engagement_time_msec bigint,
    user_id varchar(255),
    user_pseudo_id varchar(255) not null,
    session_id varchar(255),
    session_start_time_msec bigint,
    session_duration bigint,
    session_number bigint,
    scroll_engagement_time_msec bigint,
    sdk_error_code varchar(255),
    sdk_error_message varchar(2048),
    sdk_version varchar(255),
    sdk_name varchar(255),
    app_exception_message varchar(2048),
    app_exception_stack varchar(65535),
    custom_parameters_json_str varchar(65535),
    custom_parameters super,
    process_info super,
    created_time timestamp DEFAULT getdate()
) BACKUP YES DISTSTYLE EVEN SORTKEY (event_timestamp);
