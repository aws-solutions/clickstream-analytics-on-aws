

CREATE TABLE IF NOT EXISTS {{database_name}}.{{schema}}.clickstream_engagement_kpi (
    event_date date,
    platform varchar(255),
    avg_session_per_user DOUBLE PRECISION,
    avg_engagement_time_per_session_minutes DOUBLE PRECISION,
    avg_engagement_time_per_user_minutes DOUBLE PRECISION
)
BACKUP YES
SORTKEY(event_date)
;
