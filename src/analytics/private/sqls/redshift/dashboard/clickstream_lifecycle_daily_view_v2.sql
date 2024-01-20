CREATE OR REPLACE VIEW {{schema}}.{{viewName}}
AS
with lag_lead as (
  select user_pseudo_id, time_period,
    lag(time_period,1) over (partition by user_pseudo_id order by time_period),
    lead(time_period,1) over (partition by user_pseudo_id order by time_period)
  from {{schema}}.clickstream_lifecycle_view_v1
),
-- calculate lag and lead size
lag_lead_with_diffs as (
  select user_pseudo_id, time_period, lag, lead, 
    datediff(day,lag,time_period) lag_size,
    datediff(day,time_period,lead) lead_size
  from lag_lead
),
-- case to lifecycle stage
calculated as (
  select 
    time_period,
    this_day_value,
    next_day_churn,
    count(user_pseudo_id) as total_users
  from (
    select time_period,
      case when lag is null then '1-NEW'
        when lag_size = 1 then '2-ACTIVE'
        when lag_size > 1 then '3-RETURN'
      end as this_day_value,
    
      case when (lead_size > 1 OR lead_size IS NULL) then '0-CHURN'
        else NULL
      end as next_day_churn,
      user_pseudo_id
    from lag_lead_with_diffs
    group by 1,2,3,4
  ) t1
  group by 1,2,3
)
select time_period as time_period , this_day_value, sum(total_users) as sum
  from calculated group by 1,2
union
select time_period+1 as time_period, '0-CHURN' as this_day_value, -1*sum(total_users) as sum
  from calculated where next_day_churn is not null 
  group by 1,2
;