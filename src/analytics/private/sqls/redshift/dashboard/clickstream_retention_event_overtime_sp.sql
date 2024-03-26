CREATE OR REPLACE PROCEDURE {{database_name}}.{{schema}}.clickstream_retention_event_overtime_sp(day date) 
 LANGUAGE plpgsql
AS $$ 
DECLARE 

BEGIN

DELETE FROM {{database_name}}.{{schema}}.clickstream_retention_event_overtime where event_date = day;

INSERT INTO {{database_name}}.{{schema}}.clickstream_retention_event_overtime (
event_date, 
platform, 
event_cnt
)
select 
  event_date,
  platform,
  count(distinct event_id) as event_cnt
from {{database_name}}.{{schema}}.{{baseView}}
where event_date = day
group by 1,2
;

EXCEPTION WHEN OTHERS THEN
    call {{database_name}}.{{schema}}.sp_clickstream_log_non_atomic('clickstream_retention_event_overtime', 'error', 'error message:' || SQLERRM);
    RAISE INFO 'error message: %', SQLERRM;
END;      
$$
;