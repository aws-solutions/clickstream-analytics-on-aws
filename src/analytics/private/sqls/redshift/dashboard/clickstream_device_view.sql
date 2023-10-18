CREATE MATERIALIZED VIEW {{schema}}.clickstream_device_view 
BACKUP NO
SORTKEY(event_date)
AUTO REFRESH YES
AS
select
device.vendor_id::varchar as device_id
, event_date 
, device.mobile_brand_name::varchar
, device.mobile_model_name::varchar
, device.manufacturer::varchar
, device.screen_width::int
, device.screen_height::int
, device.carrier::varchar
, device.network_type::varchar
, device.operating_system::varchar
, device.operating_system_version::varchar
, device.ua_browser::varchar
, device.ua_browser_version::varchar
, device.ua_os::varchar
, device.ua_os_version::varchar
, device.ua_device::varchar
, device.ua_device_category::varchar
, device.system_language::varchar
, device.time_zone_offset_seconds::int
, device.advertising_id::varchar
, user_pseudo_id
, user_id
, count(event_id) as usage_num
--pleaes update the following schema name with your schema name
from {{schema}}.event 
group by
device_id
, event_date
, device.mobile_brand_name
, device.mobile_model_name
, device.manufacturer
, device.screen_width
, device.screen_height
, device.carrier
, device.network_type
, device.operating_system
, device.operating_system_version
, device.ua_browser
, device.ua_browser_version
, device.ua_os 
, device.ua_os_version
, device.ua_device
, device.ua_device_category
, device.system_language
, device.time_zone_offset_seconds
, device.advertising_id
, user_pseudo_id
, user_id;