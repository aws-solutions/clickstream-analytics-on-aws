CREATE OR REPLACE PROCEDURE {{database_name}}.{{schema}}.clickstream_retention_dau_wau_sp(day date) 
 LANGUAGE plpgsql
AS $$ 
DECLARE 

BEGIN

DELETE FROM {{database_name}}.{{schema}}.clickstream_retention_dau_wau where event_date = day;

INSERT INTO {{database_name}}.{{schema}}.clickstream_retention_dau_wau (
  event_date, 
  platform, 
  user_count
)
select 
  event_date,
  platform,
  merged_user_id
from {{database_name}}.{{schema}}.{{baseView}}
where event_date = day
group by 1, 2, 3
;

EXCEPTION WHEN OTHERS THEN
    RAISE INFO 'error message: %', SQLERRM;
END;      
$$
;