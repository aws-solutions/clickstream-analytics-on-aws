

CREATE TABLE IF NOT EXISTS {{database_name}}.{{schema}}.clickstream_engagement_kpi (
    event_date date,
    platform varchar(255),
    avg_session_per_user float,
    avg_engagement_time_per_session float,
    avg_engagement_time_per_user float
)
BACKUP YES
SORTKEY(event_date)
;
