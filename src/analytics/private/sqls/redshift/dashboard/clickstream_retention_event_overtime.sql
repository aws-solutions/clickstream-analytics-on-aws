CREATE TABLE IF NOT EXISTS {{database_name}}.{{schema}}.clickstream_retention_event_overtime(
    event_date date,
    platform varchar(255),
    event_cnt bigint
)
BACKUP YES
SORTKEY(event_date)