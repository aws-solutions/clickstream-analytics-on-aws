CREATE TABLE IF NOT EXISTS {{dbName}}.{{schema}}.clickstream_dashboard_day_traffic_source_user (
    event_date date,
    platform varchar(255),
    first_traffic_source varchar(65535),
    user_count bigint
)
BACKUP YES
SORTKEY(event_date)