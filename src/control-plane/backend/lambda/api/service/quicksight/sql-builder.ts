/**
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import { format } from 'sql-formatter';
import { ExploreComputeMethod, ExploreConversionIntervalType, ExploreGroupColumn, ExplorePathNodeType, ExplorePathSessionDef, ExploreRelativeTimeUnit, ExploreTimeScopeType, MetadataPlatform, MetadataValueType } from '../../common/explore-types';
import { logger } from '../../common/powertools';

export interface Condition {
  readonly category: 'user' | 'event' | 'device' | 'geo' | 'app_info' | 'traffic_source' | 'other';
  readonly property: string;
  readonly operator: string;
  readonly value: any[];
  readonly dataType: MetadataValueType;
}

export interface EventAndCondition {
  readonly eventName: string;
  readonly sqlCondition?: SQLCondition;
}

export interface SQLCondition {
  readonly conditions: Condition[];
  readonly conditionOperator?: 'and' | 'or' ;
}

export interface PathAnalysisParameter {
  readonly platform?: MetadataPlatform;
  readonly sessionType: ExplorePathSessionDef;
  readonly nodeType: ExplorePathNodeType;
  readonly lagSeconds?: number;
  readonly nodes?: string[];
}

export interface PairEventAndCondition {
  readonly startEvent: EventAndCondition;
  readonly backEvent: EventAndCondition;
}

export interface EventNameAndSQLConditions {
  readonly eventName: string;
  readonly normalConditionSql: string;
  readonly nestSqlPair: [string, string];
}

export interface SQLParameters {
  readonly schemaName: string;
  readonly computeMethod: ExploreComputeMethod;
  readonly specifyJoinColumn: boolean;
  readonly joinColumn?: string;
  readonly conversionIntervalType?: ExploreConversionIntervalType;
  readonly conversionIntervalInSeconds?: number;
  readonly globalEventCondition?: SQLCondition;
  readonly eventAndConditions?: EventAndCondition[];
  readonly timeScopeType: ExploreTimeScopeType;
  readonly timeStart?: Date;
  readonly timeEnd?: Date;
  readonly lastN?: number;
  readonly timeUnit?: ExploreRelativeTimeUnit;
  readonly groupColumn: ExploreGroupColumn;
  readonly maxStep?: number;
  readonly pathAnalysis?: PathAnalysisParameter;
  readonly pairEventAndConditions?: PairEventAndCondition[];
}

export enum ExploreAnalyticsOperators {
  NULL = 'is_null',
  NOT_NULL = 'is_not_null',
  EQUAL = '=',
  NOT_EQUAL = '<>',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
}

const baseColumns = `
 event_date
,event_name
,event_id
,event_bundle_sequence_id:: bigint as event_bundle_sequence_id
,event_previous_timestamp:: bigint as event_previous_timestamp
,event_server_timestamp_offset:: bigint as event_server_timestamp_offset
,event_timestamp::bigint as event_timestamp
,ingest_timestamp
,event_value_in_usd
,app_info.app_id:: varchar as app_info_app_id
,app_info.id:: varchar as app_info_package_id
,app_info.install_source:: varchar as app_info_install_source
,app_info.version:: varchar as app_info_version
,device.vendor_id:: varchar as device_id
,device.mobile_brand_name:: varchar as device_mobile_brand_name
,device.mobile_model_name:: varchar as device_mobile_model_name
,device.manufacturer:: varchar as device_manufacturer
,device.screen_width:: bigint as device_screen_width
,device.screen_height:: bigint as device_screen_height
,device.carrier:: varchar as device_carrier
,device.network_type:: varchar as device_network_type
,device.operating_system:: varchar as device_operating_system
,device.operating_system_version:: varchar as device_operating_system_version
,device.ua_browser:: varchar as device_ua_browser
,device.ua_browser_version:: varchar as device_ua_browser_version
,device.ua_os:: varchar as device_ua_os
,device.ua_os_version:: varchar as device_ua_os_version
,device.ua_device:: varchar as device_ua_device
,device.ua_device_category:: varchar as device_ua_device_category
,device.system_language:: varchar as device_system_language
,device.time_zone_offset_seconds:: bigint as device_time_zone_offset_seconds
,device.advertising_id:: varchar as device_advertising_id
,geo.continent:: varchar as geo_continent
,geo.country:: varchar as geo_country
,geo.city:: varchar as geo_city
,geo.metro:: varchar as geo_metro
,geo.region:: varchar as geo_region
,geo.sub_continent:: varchar as geo_sub_continent
,geo.locale:: varchar as geo_locale
,platform
,project_id
,traffic_source.name:: varchar as traffic_source_name
,traffic_source.medium:: varchar as traffic_source_medium
,traffic_source.source:: varchar as traffic_source_source
,user_first_touch_timestamp
,user_id
,user_pseudo_id
,user_ltv
,event_dimensions
,ecommerce
,items
`;

const columnTemplate = `
 event_date as event_date####
,event_name as event_name####
,event_id as event_id####
,event_bundle_sequence_id as event_bundle_sequence_id####
,event_previous_timestamp as event_previous_timestamp####
,event_server_timestamp_offset as event_server_timestamp_offset####
,event_timestamp as event_timestamp####
,ingest_timestamp as ingest_timestamp####
,event_value_in_usd as event_value_in_usd####
,app_info_app_id as app_info_app_id####
,app_info_package_id as app_info_package_id####
,app_info_install_source as app_info_install_source####
,app_info_version as app_info_version####
,device_id as device_id####
,device_mobile_brand_name as device_mobile_brand_name####
,device_mobile_model_name as device_mobile_model_name####
,device_manufacturer as device_manufacturer####
,device_screen_width as device_screen_width####
,device_screen_height as device_screen_height####
,device_carrier as device_carrier####
,device_network_type as device_network_type####
,device_operating_system as device_operating_system####
,device_operating_system_version as device_operating_system_version####
,device_ua_browser as ua_browser####
,device_ua_browser_version as ua_browser_version####
,device_ua_os as ua_os####
,device_ua_os_version as ua_os_version####
,device_ua_device as ua_device####
,device_ua_device_category as ua_device_category####
,device_system_language as device_system_language####
,device_time_zone_offset_seconds as device_time_zone_offset_seconds####
,device_advertising_id as advertising_id####
,geo_continent as geo_continent####
,geo_country as geo_country####
,geo_city as geo_city####
,geo_metro as geo_metro####
,geo_region as geo_region####
,geo_sub_continent as geo_sub_continent####
,geo_locale as geo_locale####
,platform as platform####
,project_id as project_id####
,traffic_source_name as traffic_source_name####
,traffic_source_medium as traffic_source_medium####
,traffic_source_source as traffic_source_source####
,user_first_touch_timestamp as user_first_touch_timestamp####
,user_id as user_id####
,user_pseudo_id as user_pseudo_id####
,user_ltv as user_ltv####
,event_dimensions as event_dimensions####
,ecommerce as ecommerce####
,items as items####
`;

function _buildBaseTableSql(eventNames: string[], sqlParameters: SQLParameters) : string {

  let eventDateSQL = '';
  if (sqlParameters.timeScopeType === ExploreTimeScopeType.FIXED) {
    eventDateSQL = eventDateSQL.concat(`event_date >= '${sqlParameters.timeStart}'  and event_date <= '${sqlParameters.timeEnd}'`);
  } else {
    let lastN = sqlParameters.lastN!;
    if (sqlParameters.timeUnit === ExploreRelativeTimeUnit.WK) {
      lastN = lastN * 7;
    } else if (sqlParameters.timeUnit === ExploreRelativeTimeUnit.MM) {
      lastN = lastN * 31;
    } else if (sqlParameters.timeUnit === ExploreRelativeTimeUnit.Q) {
      lastN = lastN * 31 * 3;
    }
    eventDateSQL = eventDateSQL.concat(`event_date >= DATEADD(day, -${lastN}, CURRENT_DATE) and event_date <= CURRENT_DATE`);
  }

  const propertyList: string[] = [];

  let globalConditionSql = getNormalConditionSql(sqlParameters.globalEventCondition);
  globalConditionSql = globalConditionSql !== '' ? `and (${globalConditionSql}) ` : '';

  let eventNameAndSQLConditions: EventNameAndSQLConditions[] = [];
  for (const [index, event] of eventNames.entries()) {
    eventNameAndSQLConditions.push({
      eventName: event,
      normalConditionSql: getNormalConditionSql(sqlParameters.eventAndConditions![index].sqlCondition),
      nestSqlPair: getNestPropertyConditionSql(sqlParameters.eventAndConditions![index].sqlCondition, propertyList),
    });
  }

  let conditionSql = '';
  let columnSql = '';
  for (const [index, eventNameAndSQLCondition] of eventNameAndSQLConditions.entries()) {

    let normalConditionSql = eventNameAndSQLCondition.normalConditionSql;
    if (normalConditionSql !== '') {
      normalConditionSql = `and (${normalConditionSql}) `;
    }

    let nestSqlPair0 = eventNameAndSQLCondition.nestSqlPair[0];

    if (nestSqlPair0 !== '') {
      nestSqlPair0 = `and (${nestSqlPair0}) `;
    }

    conditionSql = conditionSql.concat(`
      ${index === 0? '' : 'or' } ( event_name = '${eventNameAndSQLCondition.eventName}' ${normalConditionSql} ${nestSqlPair0} )
    `);

    columnSql = columnSql.concat(`
    ${eventNameAndSQLCondition.nestSqlPair[1]}
    `);
  }

  //remove end ,
  columnSql = columnSql.trim().length >0 ? ',' + columnSql.trim().substring(0, columnSql.trim().length-1) : '';

  let sql = `
    with tmp_data as (
      select 
      ${_renderUserPseudoIdColumn(baseColumns, sqlParameters.computeMethod, false)},
      TO_CHAR(TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second', 'YYYY-MM') as month,
      TO_CHAR(date_trunc('week', TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second'), 'YYYY-MM-DD') || ' - ' || TO_CHAR(date_trunc('week', (TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second') + INTERVAL '6 days'), 'YYYY-MM-DD') as week,
      TO_CHAR(TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second', 'YYYY-MM-DD') as day,
      TO_CHAR(TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second', 'YYYY-MM-DD HH24') || '00:00' as hour,
      user_properties,
      event_params
      from ${sqlParameters.schemaName}.ods_events ods 
      where ${eventDateSQL}
      and event_name in (${ '\'' + eventNames.join('\',\'') + '\''})
      ${globalConditionSql}
    ),
    tmp_base_data as (
      select 
      *
      ${columnSql}
      from tmp_data base 
    ),
  `;

  conditionSql = conditionSql !== '' ? `and (${conditionSql})` : '';
  sql = sql.concat(`
    base_data as (
      select 
        * 
      from tmp_base_data
      where 1=1 
      ${conditionSql}
    ),`);

  return format(sql, {
    language: 'postgresql',
  });
}

function _buildBaseTableSqlForPathAnalysis(sqlParameters: SQLParameters) : string {

  let eventDateSQL = '';
  if (sqlParameters.timeScopeType === ExploreTimeScopeType.FIXED) {
    eventDateSQL = eventDateSQL.concat(`event_date >= '${sqlParameters.timeStart}'  and event_date <= '${sqlParameters.timeEnd}'`);
  } else {
    let lastN = sqlParameters.lastN!;
    if (sqlParameters.timeUnit === ExploreRelativeTimeUnit.WK) {
      lastN = lastN * 7;
    } else if (sqlParameters.timeUnit === ExploreRelativeTimeUnit.MM) {
      lastN = lastN * 31;
    } else if (sqlParameters.timeUnit === ExploreRelativeTimeUnit.Q) {
      lastN = lastN * 31 * 3;
    }
    eventDateSQL = eventDateSQL.concat(`event_date >= DATEADD(day, -${lastN}, CURRENT_DATE) and event_date <= CURRENT_DATE`);
  }

  let sql = `
    with base_data as (
      select 
        TO_CHAR(TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second', 'YYYY-MM') as month
      , TO_CHAR(date_trunc('week', TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second'), 'YYYY-MM-DD') || ' - ' || TO_CHAR(date_trunc('week', (TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second') + INTERVAL '6 days'), 'YYYY-MM-DD') as week
      , TO_CHAR(TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second', 'YYYY-MM-DD') as day
      , TO_CHAR(TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second', 'YYYY-MM-DD HH24') || '00:00' as hour
      , event_params
      , user_properties
      , ${_renderUserPseudoIdColumn(baseColumns, sqlParameters.computeMethod, false)}
      from ${sqlParameters.schemaName}.ods_events ods 
      where ${eventDateSQL}
      and event_name = '${ (sqlParameters.pathAnalysis?.platform === MetadataPlatform.ANDROID || sqlParameters.pathAnalysis?.platform === MetadataPlatform.IOS) ? '_screen_view' : '_page_view' }'
      ${sqlParameters.pathAnalysis!.platform ? 'and platform = \'' + sqlParameters.pathAnalysis!.platform + '\'' : '' }
    ),
  `;

  return sql;
}

function _buildBaseSql(eventNames: string[], sqlParameters: SQLParameters) : string {

  let sql = _buildBaseTableSql(eventNames, sqlParameters);
  for (const [index, event] of eventNames.entries()) {
    let firstTableColumns = `
       month
      ,week
      ,day
      ,hour
      ,${_renderUserPseudoIdColumn(columnTemplate, sqlParameters.computeMethod, true).replace(/####/g, '_0')}
    `;

    sql = sql.concat(`
    table_${index} as (
      select 
        ${ index === 0 ? firstTableColumns : _renderUserPseudoIdColumn(columnTemplate, sqlParameters.computeMethod, true).replace(/####/g, `_${index}`)}
      from base_data base
      where event_name = '${event}'
    ),
    `);
  }

  let joinConditionSQL = '';
  let joinColumnsSQL = '';

  for (const [index, _item] of eventNames.entries()) {
    if (index === 0) {
      continue;
    }
    joinColumnsSQL = joinColumnsSQL.concat(`, table_${index}.event_id_${index} \n`);
    joinColumnsSQL = joinColumnsSQL.concat(`, table_${index}.event_name_${index} \n`);
    joinColumnsSQL = joinColumnsSQL.concat(`, table_${index}.user_pseudo_id_${index} \n`);
    joinColumnsSQL = joinColumnsSQL.concat(`, table_${index}.event_timestamp_${index} \n`);

    let joinCondition = 'on 1 = 1';
    if ( sqlParameters.specifyJoinColumn) {
      joinCondition = `on table_${index-1}.${sqlParameters.joinColumn}_${index-1} = table_${index}.${sqlParameters.joinColumn}_${index}`;
    }

    if (sqlParameters.conversionIntervalType == 'CUSTOMIZE') {
      joinConditionSQL = joinConditionSQL.concat(`left outer join table_${index} ${joinCondition} and table_${index}.event_timestamp_${index} - table_${index-1}.event_timestamp_${index-1} > 0 and table_${index}.event_timestamp_${index} - table_${index-1}.event_timestamp_${index-1} < ${sqlParameters.conversionIntervalInSeconds}*1000 \n`);
    } else {
      joinConditionSQL = joinConditionSQL.concat(`left outer join table_${index} ${joinCondition} and TO_CHAR(TIMESTAMP 'epoch' + cast(table_${index-1}.event_timestamp_${index-1}/1000 as bigint) * INTERVAL '1 second', 'YYYY-MM-DD') = TO_CHAR(TIMESTAMP 'epoch' + cast(table_${index}.event_timestamp_${index}/1000 as bigint) * INTERVAL '1 second', 'YYYY-MM-DD')  \n`);
    }
  }

  sql = sql.concat(`
    join_table as (
      select table_0.*
        ${joinColumnsSQL}
      from table_0 
        ${joinConditionSQL}
    )`,
  );

  return sql;
};

function _buildEventAnalysisBaseSql(eventNames: string[], sqlParameters: SQLParameters) : string {

  let eventDateSQL = '';
  if (sqlParameters.timeScopeType === ExploreTimeScopeType.FIXED) {
    eventDateSQL = eventDateSQL.concat(`event_date >= '${sqlParameters.timeStart}'  and event_date <= '${sqlParameters.timeEnd}'`);
  } else {
    const nDayNumber = getLastNDayNumber(sqlParameters.lastN!, sqlParameters.timeUnit!);
    eventDateSQL = eventDateSQL.concat(`event_date >= DATEADD(day, -${nDayNumber}, CURRENT_DATE) and event_date <= CURRENT_DATE`);
  }

  let sql = `
    with base_data as (
      select 
        TO_CHAR(TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second', 'YYYY-MM') as month
      , TO_CHAR(date_trunc('week', TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second'), 'YYYY-MM-DD') || ' - ' || TO_CHAR(date_trunc('week', (TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second') + INTERVAL '6 days'), 'YYYY-MM-DD') as week
      , TO_CHAR(TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second', 'YYYY-MM-DD') as day
      , TO_CHAR(TIMESTAMP 'epoch' + cast(event_timestamp/1000 as bigint) * INTERVAL '1 second', 'YYYY-MM-DD HH24') || '00:00' as hour
      , event_params
      , user_properties
      , ${_renderUserPseudoIdColumn(baseColumns, sqlParameters.computeMethod, false)}
      from ${sqlParameters.schemaName}.ods_events ods 
      where ${eventDateSQL}
      and event_name in (${ '\'' + eventNames.join('\',\'') + '\''})
    ),
  `;

  for (const [index, event] of eventNames.entries()) {

    const eventCondition = sqlParameters.eventAndConditions![index];
    let eventConditionSql = '';
    if (eventCondition.sqlCondition !== undefined) {
      for (const condition of eventCondition.sqlCondition.conditions) {
        if (condition.category === 'user' || condition.category === 'event') {
          continue;
        }

        let category: string = `${condition.category}_`;
        if (condition.category === 'other') {
          category = '';
        }
        const conditionSql = buildSqlFromCondition(condition, category);
        eventConditionSql = eventConditionSql.concat(`
          ${eventCondition.sqlCondition.conditionOperator ?? 'and'}  ${conditionSql}
        `);
      }
    }
    if (eventConditionSql !== '') {
      eventConditionSql = `
      and ( 1=1 ${eventConditionSql} )
      `;
    }

    let tableColumns = `
       month
      ,week
      ,day
      ,hour
      ,${_renderUserPseudoIdColumn(columnTemplate, sqlParameters.computeMethod, true).replace(/####/g, `_${index}`)}
    `;

    sql = sql.concat(`
    table_${index} as (
      select 
        ${ tableColumns}
      from base_data base
      where event_name = '${event}'
      ${eventConditionSql}
    ),
    `);
  }

  let joinTableSQL = '';

  for (const [index, _item] of eventNames.entries()) {

    let unionSql = '';
    if (index > 0) {
      unionSql = 'union all';
    }
    joinTableSQL = joinTableSQL.concat(`
    ${unionSql}
    select 
      table_${index}.month
    , table_${index}.week
    , table_${index}.day
    , table_${index}.hour
    , table_${index}.event_id_${index} as event_id
    , table_${index}.event_name_${index} as event_name
    , table_${index}.user_pseudo_id_${index} as user_pseudo_id
    , table_${index}.event_timestamp_${index} as event_timestamp
    from table_${index}
    `);

  }

  sql = sql.concat(`
    join_table as (
      ${joinTableSQL}
    )`,
  );

  return sql;
};

export function buildFunnelDataSql(schema: string, name: string, sqlParameters: SQLParameters) : string {

  let eventNames: string[] = [];
  for (const e of sqlParameters.eventAndConditions!) {
    eventNames.push(e.eventName);
  }

  let sql = _buildBaseSql(eventNames, sqlParameters);

  let prefix = 'user_pseudo_id';
  if (sqlParameters.computeMethod === ExploreComputeMethod.EVENT_CNT) {
    prefix = 'event_id';
  }
  let resultCntSQL ='';

  const maxIndex = eventNames.length - 1;
  for (const [index, _item] of eventNames.entries()) {
    resultCntSQL = resultCntSQL.concat(`, count(distinct ${prefix}_${index})  as ${eventNames[index]} \n`);
    if (index === 0) {
      resultCntSQL = resultCntSQL.concat(`, (count(distinct ${prefix}_${maxIndex}) :: decimal /  NULLIF(count(distinct ${prefix}_0), 0) ):: decimal(20, 4)  as rate \n`);
    } else {
      resultCntSQL = resultCntSQL.concat(`, (count(distinct ${prefix}_${index}) :: decimal /  NULLIF(count(distinct ${prefix}_${index-1}), 0) ):: decimal(20, 4)  as ${eventNames[index]}_rate \n`);
    }
  }

  sql = sql.concat(`
    select 
      ${sqlParameters.groupColumn}
      ${resultCntSQL}
    from join_table
    group by 
      ${sqlParameters.groupColumn}
  `);

  sql = `CREATE OR REPLACE VIEW ${schema}.${name} AS
   ${sql}
   `;

  return format(sql, {
    language: 'postgresql',
  });
};

export function buildFunnelView(schema: string, name: string, sqlParameters: SQLParameters) : string {

  let resultSql = '';
  let eventNames: string[] = [];
  for (const e of sqlParameters.eventAndConditions!) {
    eventNames.push(e.eventName);
  }
  let index = 0;
  let prefix = 'u';
  if (sqlParameters.computeMethod === ExploreComputeMethod.EVENT_CNT) {
    prefix = 'e';
  }

  let baseSQL = _buildBaseSql(eventNames, sqlParameters);
  let finalTableColumnsSQL = `
     month
    ,week
    ,day
    ,hour
  `;

  let finalTableGroupBySQL = `
     month
    ,week
    ,day
    ,hour
  `;

  for (const [ind, _item] of eventNames.entries()) {
    finalTableColumnsSQL = finalTableColumnsSQL.concat(`, event_id_${ind} as e_id_${ind} \n`);
    finalTableColumnsSQL = finalTableColumnsSQL.concat(`, event_name_${ind} as e_name_${ind} \n`);
    finalTableColumnsSQL = finalTableColumnsSQL.concat(`, user_pseudo_id_${ind} as u_id_${ind} \n`);

    finalTableGroupBySQL = finalTableGroupBySQL.concat(`, event_id_${ind} \n`);
    finalTableGroupBySQL = finalTableGroupBySQL.concat(`, event_name_${ind} \n`);
    finalTableGroupBySQL = finalTableGroupBySQL.concat(`, user_pseudo_id_${ind} \n`);
  }

  baseSQL = baseSQL.concat(`,
    final_table as (
      select 
      ${finalTableColumnsSQL}
      from join_table 
      group by
      ${finalTableGroupBySQL}
    )
  `);

  for (const e of sqlParameters.eventAndConditions!) {
    eventNames.push(e.eventName);
    resultSql = resultSql.concat(`
    ${ index === 0 ? '' : 'union all'}
    select 
       day::date as event_date
      ,e_name_${index}::varchar as event_name
      ,${prefix}_id_${index}::varchar as x_id
    from final_table where ${prefix}_id_${index} is not null
    `);
    index += 1;
  }

  let sql = `CREATE OR REPLACE VIEW ${schema}.${name} AS
   ${baseSQL}
   ${resultSql}
   `;
  return format(sql, {
    language: 'postgresql',
  });
}

export function buildEventAnalysisView(schema: string, name: string, sqlParameters: SQLParameters) : string {

  let resultSql = '';
  let eventNames: string[] = [];
  for (const e of sqlParameters.eventAndConditions!) {
    eventNames.push(e.eventName);
  }
  let prefix = 'e';
  if (sqlParameters.computeMethod === 'USER_CNT') {
    prefix = 'u';
  }

  let baseSQL = _buildEventAnalysisBaseSql(eventNames, sqlParameters);
  let finalTableColumnsSQL = `
     month
    ,week
    ,day
    ,hour
  `;

  let finalTableGroupBySQL = `
     month
    ,week
    ,day
    ,hour
  `;

  finalTableColumnsSQL = finalTableColumnsSQL.concat(', event_id as e_id , event_name as e_name , user_pseudo_id as u_id ');

  finalTableGroupBySQL = finalTableGroupBySQL.concat(', event_id , event_name , user_pseudo_id ');

  baseSQL = baseSQL.concat(`,
    final_table as (
      select 
      ${finalTableColumnsSQL}
      from join_table 
      group by
      ${finalTableGroupBySQL}
    )
  `);

  resultSql = resultSql.concat(`
  select 
      day::date as event_date
    ,e_name::varchar as event_name
    ,${prefix}_id::varchar as x_id
  from final_table where ${prefix}_id is not null
  `);

  let sql = `CREATE OR REPLACE VIEW ${schema}.${name} AS
   ${baseSQL}
   ${resultSql}
   `;
  return format(sql, {
    language: 'postgresql',
  });
}

export function buildEventPathAnalysisView(schema: string, name: string, sqlParameters: SQLParameters) : string {

  const eventNames: string[] = [];
  for (const e of sqlParameters.eventAndConditions!) {
    eventNames.push(e.eventName);
  }

  let eventConditionSqlOut = '';
  for (const [index, event] of eventNames.entries()) {
    const eventCondition = sqlParameters.eventAndConditions![index];
    let eventConditionSql = '';
    if (eventCondition.sqlCondition?.conditions !== undefined) {
      for (const [i, condition] of eventCondition.sqlCondition.conditions.entries()) {
        if (condition.category === 'user' || condition.category === 'event') {
          continue;
        }

        let category: string = `${condition.category}_`;
        if (condition.category === 'other') {
          category = '';
        }
        const conditionSql = buildSqlFromCondition(condition, category);
        eventConditionSql = eventConditionSql.concat(`
          ${i === 0 ? '' : (eventCondition.sqlCondition.conditionOperator ?? 'and')}  ${conditionSql}
        `);
      }
    }
    if (eventConditionSql !== '') {
      eventConditionSqlOut = eventConditionSqlOut.concat(`
      ${index === 0 ? ' ' : ' or ' } ( event_name = '${event}' and (${eventConditionSql}) )
      `);
    }
  }

  let midTableSql = '';
  let dataTableSql = '';
  let partitionBy = '';
  let joinSql = '';
  if (sqlParameters.pathAnalysis?.sessionType === ExplorePathSessionDef.SESSION ) {
    partitionBy = ', session_id';
    joinSql = `
    and a.session_id = b.session_id 
    `;
    midTableSql = `
      mid_table as (
        select 
        day::date as event_date,
        event_name,
        user_pseudo_id,
        event_id,
        event_timestamp,
        (
          select
              ep.value.string_value
            from
              base_data e,
              e.event_params ep
            where
              ep.key = '_session_id'
              and e.event_id = base.event_id
            limit
              1
        ) as session_id
      from base_data base
      ${eventConditionSqlOut !== '' ? 'where '+ eventConditionSqlOut : '' }
      ),
    `;
    dataTableSql = `data as (
      select 
        *,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ${partitionBy} ORDER BY event_timestamp asc) as step_1,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ${partitionBy} ORDER BY event_timestamp asc) + 1 as step_2
      from mid_table 
    )
    select 
      a.event_date as event_date,
      a.event_name || '_' || a.step_1 as source,
      CASE 
        WHEN b.event_name is not null THEN b.event_name || '_' || a.step_2
        ELSE 'other_' || a.step_2
      END as target,
      ${sqlParameters.computeMethod != ExploreComputeMethod.EVENT_CNT ? 'count(distinct a.user_pseudo_id)' : 'count(distinct a.event_id)' } as weight
    from data a left join data b 
      on a.user_pseudo_id = b.user_pseudo_id 
      ${joinSql}
      and a.step_2 = b.step_1
    where a.step_2 <= ${sqlParameters.maxStep ?? 10}
    group by 
      a.event_date,
      a.event_name || '_' || a.step_1,
      CASE 
        WHEN b.event_name is not null THEN b.event_name || '_' || a.step_2
        ELSE 'other_' || a.step_2
      END
    `;

  } else {
    midTableSql = `
      mid_table as (
        select 
        day::date as event_date,
        event_name,
        user_pseudo_id,
        event_id,
        event_timestamp
      from base_data base
      ${eventConditionSqlOut !== '' ? 'where '+ eventConditionSqlOut : '' }
      ),
    `;

    dataTableSql = `data_1 as (
      select 
        *,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ORDER BY event_timestamp asc) as step_1,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ORDER BY event_timestamp asc) + 1 as step_2
      from mid_table 
    ),
    data_2 as (
      select 
        a.event_date as a_event_date,
        a.event_name as a_event_name,
        a.user_pseudo_id as a_user_pseudo_id,
        a.event_id as a_event_id,
        b.event_date as b_event_date,
        b.event_name as b_event_name,
        b.user_pseudo_id as b_user_pseudo_id,
        b.event_id as b_event_id,
        b.event_timestamp as b_event_timestamp,
        a.event_timestamp as a_event_timestamp,
        a.step_1,
        a.step_2
      from data_1 a left join data_1 b 
      on a.user_pseudo_id = b.user_pseudo_id 
      and a.step_2 = b.step_1
    )
    ,timestamp_diff AS (
      SELECT *
      , case when (b_event_timestamp - a_event_timestamp < ${sqlParameters.pathAnalysis!.lagSeconds! * 1000} and b_event_timestamp - a_event_timestamp >0) then 0 else 1 end as group_start
      FROM
          data_2
     )
     ,grouped_data AS (
      SELECT
          *,
          SUM(group_start) over(order by a_event_timestamp ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW ) AS group_id
      FROM
          timestamp_diff
      )
    ,data as (
      select 
        a_event_date,
        a_event_name,
        a_user_pseudo_id,
        a_event_id,
        b_event_date,
        b_event_name,
        b_user_pseudo_id,
        b_event_id,
        ROW_NUMBER() OVER (PARTITION BY group_id, a_user_pseudo_id ORDER BY step_1,step_2 asc) as step_1,
        ROW_NUMBER() OVER (PARTITION BY group_id, a_user_pseudo_id ORDER BY step_1,step_2 asc) + 1 as step_2
      from grouped_data
    )
    select 
      a_event_date as event_date,
      a_event_name || '_' || step_1 as source,
      CASE 
        WHEN b_event_name is not null THEN b_event_name || '_' || step_2
        ELSE 'other_' || step_2
      END as target,
      ${sqlParameters.computeMethod != ExploreComputeMethod.EVENT_CNT ? 'count(distinct a_user_pseudo_id)' : 'count(distinct a_event_id)' } as weight
    from data
    where step_2 <= ${sqlParameters.maxStep ?? 10}
    group by 
      a_event_date,
      a_event_name || '_' || step_1,
      CASE 
        WHEN b_event_name is not null THEN b_event_name || '_' || step_2
        ELSE 'other_' || step_2
      END
    `;
  }

  const sql = `
  CREATE OR REPLACE VIEW ${schema}.${name} AS
    ${_buildBaseTableSql(eventNames, sqlParameters)}
    ${midTableSql}
    ${dataTableSql}
  `;
  return format(sql, {
    language: 'postgresql',
  });
}

export function buildNodePathAnalysisView(schema: string, name: string, sqlParameters: SQLParameters) : string {

  let midTableSql = '';
  let dataTableSql = '';
  let partitionBy = '';
  let joinSql = '';

  if (sqlParameters.pathAnalysis!.sessionType === ExplorePathSessionDef.SESSION ) {
    partitionBy = ', session_id';
    joinSql = `
    and a.session_id = b.session_id 
    `;
    midTableSql = `
      mid_table as (
        select 
        day::date as event_date,
        event_name,
        user_pseudo_id,
        event_id,
        event_timestamp,
        (
          select
              ep.value.string_value
            from
              base_data e,
              e.event_params ep
            where
              ep.key = '_session_id'
              and e.event_id = base.event_id
            limit
              1
        ) as session_id,
        (
          select
              ep.value.string_value
            from
              base_data e,
              e.event_params ep
            where
              ep.key = '${sqlParameters.pathAnalysis!.nodeType}'
              and e.event_id = base.event_id
            limit
              1
        )::varchar as node
      from base_data base
      where node in (${ '\'' + sqlParameters.pathAnalysis!.nodes!.join('\',\'') + '\''})
      ),
    `;
    dataTableSql = `data as (
      select 
        *,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ${partitionBy} ORDER BY event_timestamp asc) as step_1,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ${partitionBy} ORDER BY event_timestamp asc) + 1 as step_2
      from (
        select  
          event_date,
          event_name,
          user_pseudo_id,
          event_id,
          event_timestamp,
          session_id,
          replace(node, '"', '') as node
        from mid_table
        ) t 
    )
    select 
      a.event_date as event_date,
      a.node || '_' || a.step_1 as source,
      CASE 
        WHEN b.node is not null THEN b.node || '_' || a.step_2
        ELSE 'other_' || a.step_2
      END as target,
      ${sqlParameters.computeMethod != ExploreComputeMethod.EVENT_CNT ? 'count(distinct a.user_pseudo_id)' : 'count(distinct a.event_id)' } as weight
    from data a left join data b 
      on a.user_pseudo_id = b.user_pseudo_id 
      ${joinSql}
      and a.step_2 = b.step_1
    where a.step_2 <= ${sqlParameters.maxStep ?? 10}
    group by 
      a.event_date,
      a.node || '_' || a.step_1,
      CASE 
        WHEN b.node is not null THEN b.node || '_' || a.step_2
        ELSE 'other_' || a.step_2
      END
    `;

  } else {
    midTableSql = `
      mid_table as (
        select 
        day::date as event_date,
        user_pseudo_id,
        event_id,
        event_timestamp,
        (
          select
              ep.value.string_value
            from
              base_data e,
              e.event_params ep
            where
              ep.key = '${sqlParameters.pathAnalysis!.nodeType}'
              and e.event_id = base.event_id
            limit
              1
        )::varchar as node
      from base_data base
      where node in (${ '\'' + sqlParameters.pathAnalysis!.nodes!.join('\',\'') + '\''})
      ),
    `;

    dataTableSql = `data_1 as (
      select 
        *,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ORDER BY event_timestamp asc) as step_1,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ORDER BY event_timestamp asc) + 1 as step_2
      from (
        select  
          event_date,
          user_pseudo_id,
          event_id,
          event_timestamp,
          node
        from mid_table
        ) t 
    ),
    data_2 as (
      select 
        a.event_date as a_event_date,
        a.node as a_node,
        a.user_pseudo_id as a_user_pseudo_id,
        a.event_id as a_event_id,
        b.event_date as b_event_date,
        b.node as b_node,
        b.user_pseudo_id as b_user_pseudo_id,
        b.event_id as b_event_id,
        b.event_timestamp as b_event_timestamp,
        a.event_timestamp as a_event_timestamp,
        a.step_1,
        a.step_2
      from data_1 a left join data_1 b 
      on a.user_pseudo_id = b.user_pseudo_id 
      and a.step_2 = b.step_1
    )
    ,timestamp_diff AS (
      SELECT *
      , case when (b_event_timestamp - a_event_timestamp < ${sqlParameters.pathAnalysis!.lagSeconds! * 1000} and b_event_timestamp - a_event_timestamp >0) then 0 else 1 end as group_start
      FROM
          data_2
     )
     ,grouped_data AS (
      SELECT
          *,
          SUM(group_start) over(order by a_event_timestamp ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW ) AS group_id
      FROM
          timestamp_diff
      )
    ,data as (
      select 
        a_event_date,
        a_node,
        a_user_pseudo_id,
        a_event_id,
        b_event_date,
        b_node,
        b_user_pseudo_id,
        b_event_id,
        ROW_NUMBER() OVER (PARTITION BY group_id, a_user_pseudo_id ORDER BY step_1,step_2 asc) as step_1,
        ROW_NUMBER() OVER (PARTITION BY group_id, a_user_pseudo_id ORDER BY step_1,step_2 asc) + 1 as step_2
      from grouped_data
    )
    select 
      a_event_date as event_date,
      a_node || '_' || step_1 as source,
      CASE 
        WHEN b_node is not null THEN b_node || '_' || step_2
        ELSE 'other_' || step_2
      END as target,
      ${sqlParameters.computeMethod != ExploreComputeMethod.EVENT_CNT ? 'count(distinct a_user_pseudo_id)' : 'count(distinct a_event_id)' } as weight
    from data
    where step_2 <= ${sqlParameters.maxStep ?? 10}
    group by 
      a_event_date,
      a_node || '_' || step_1,
      CASE 
        WHEN b_node is not null THEN b_node || '_' || step_2
        ELSE 'other_' || step_2
      END
    `;
  }

  const sql = `
  CREATE OR REPLACE VIEW ${schema}.${name} AS
    ${_buildBaseTableSqlForPathAnalysis(sqlParameters)}
    ${midTableSql}
    ${dataTableSql}
  `;

  return format(sql, {
    language: 'postgresql',
  });
}

export function buildRetentionAnalysisView(schema: string, name: string, sqlParameters: SQLParameters) : string {

  const eventNames: string[] = [];
  for (const e of sqlParameters.eventAndConditions!) {
    eventNames.push(e.eventName);
  }

  let eventConditionSqlOut = '';
  for (const [index, event] of eventNames.entries()) {
    const eventCondition = sqlParameters.eventAndConditions![index];
    let eventConditionSql = '';
    if (eventCondition.sqlCondition?.conditions !== undefined) {
      for (const [i, condition] of eventCondition.sqlCondition.conditions.entries()) {
        if (condition.category === 'user' || condition.category === 'event') {
          continue;
        }
        let category: string = `${condition.category}_`;
        if (condition.category === 'other') {
          category = '';
        }
        const conditionSql = buildSqlFromCondition(condition, category);
        eventConditionSql = eventConditionSql.concat(`
          ${i === 0 ? '' : (eventCondition.sqlCondition.conditionOperator ?? 'and')}  ${conditionSql}
        `);
      }
    }
    if (eventConditionSql !== '') {
      eventConditionSqlOut = eventConditionSqlOut.concat(`
      ${index === 0 ? ' ' : ' or ' } ( event_name = '${event}' and (${eventConditionSql}) )
      `);
    }
  }

  let dateList: string[] = [];
  if (sqlParameters.timeScopeType === ExploreTimeScopeType.FIXED) {
    dateList.push(...generateDateListWithoutStartData(new Date(sqlParameters.timeStart!), new Date(sqlParameters.timeEnd!)));
  } else {
    const lastN = getLastNDayNumber(sqlParameters.lastN!, sqlParameters.timeUnit!);
    for (let n = 1; n<=lastN; n++) {
      dateList.push(`
       (CURRENT_DATE - INTERVAL '${n} day') 
      `);
    }
  }

  let dateListSql = 'date_list as (';
  for (const [index, dt] of dateList.entries()) {
    if (index > 0 ) {
      dateListSql = dateListSql.concat(`
      union all
      `);
    }
    dateListSql = dateListSql.concat(`select ${dt}::date as event_date`);
  }
  dateListSql = dateListSql.concat(`
  ),
  `);

  let tableSql = '';
  let resultSql = 'result_table as (';

  for (const [index, pair] of sqlParameters.pairEventAndConditions!.entries()) {
    tableSql = tableSql.concat(
      `
      first_table_${index} as (
        select 
          event_date,
          event_name,
          user_pseudo_id
        from data join first_date on data.event_date = first_date.first_date
        where data.event_name = '${pair.startEvent.eventName}'
      ),
      second_table_${index} as (
        select 
          event_date,
          event_name,
          user_pseudo_id
        from data join first_date on data.event_date > first_date.first_date
        where data.event_name = '${pair.backEvent.eventName}'
      ),
      `,
    );

    if (index > 0 ) {
      resultSql = resultSql.concat(`
      union all
      `);
    }
    resultSql = resultSql.concat(`
    select 
      first_table_${index}.event_name || '_' || ${index} as grouping,
      first_table_${index}.event_date as start_event_date,
      first_table_${index}.user_pseudo_id as start_user_pseudo_id,
      date_list.event_date as event_date,
      second_table_${index}.user_pseudo_id as end_user_pseudo_id,
      second_table_${index}.event_date as end_event_date
    from first_table_${index} 
    join date_list on 1=1
    left join second_table_${index} on date_list.event_date = second_table_${index}.event_date and first_table_${index}.user_pseudo_id = second_table_${index}.user_pseudo_id
    `);
  }

  resultSql = resultSql.concat(`
  )`);

  const sql = `
  CREATE OR REPLACE VIEW ${schema}.${name} AS
    ${_buildBaseTableSql(eventNames, sqlParameters)}
    data as (
      select 
        event_date,
        event_name,
        user_pseudo_id
      from base_data 
      ${eventConditionSqlOut !== '' ? 'where '+ eventConditionSqlOut : '' }
    ),
    first_date as (
      select min(event_date) as first_date from data
    ), 
    ${dateListSql}
    ${tableSql}
    ${resultSql}
    select 
      grouping, 
      start_event_date, 
      event_date, 
      (count(distinct end_user_pseudo_id)::decimal / NULLIF(count(distinct start_user_pseudo_id), 0)):: decimal(20, 4)  as retention 
    from result_table 
    group by grouping, start_event_date, event_date
    order by grouping, event_date
  `;

  return format(sql, {
    language: 'postgresql',
  });
}

function generateDateListWithoutStartData(startDate: Date, endDate: Date): string[] {
  const dateList: string[] = [];
  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate <= endDate) {
    dateList.push(formatDateToYYYYMMDD(new Date(currentDate)) );
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateList;
}

function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `'${year.toString().trim()}-${month.trim()}-${day.trim()}'`;
}

function getNormalConditionSql(sqlCondition: SQLCondition | undefined) {
  let sql = '';
  if (sqlCondition) {
    for (const [_index, condition] of sqlCondition.conditions.entries()) {
      if ((condition.category === 'user' || condition.category === 'event')) {
        continue;
      }

      let category: string = `${condition.category}_`;
      if (condition.category === 'other') {
        category = '';
      }

      const conditionSql = buildSqlFromCondition(condition, category);
      sql = sql.concat(`
        ${sql === '' ? '' : sqlCondition.conditionOperator ?? 'and'} ${conditionSql}
      `);
    }
  }

  return sql;
}

function getNestPropertyConditionSql(sqlCondition: SQLCondition | undefined, propertyList: string[]): [string, string] {
  let conditionSql = '';
  let columnSql = '';
  if (sqlCondition) {
    for (const [_index, condition] of sqlCondition.conditions.entries()) {
      if (condition.category !== 'user' && condition.category !== 'event' ) {
        continue;
      }
      let prefix = 'event_';
      if (condition.category === 'user') {
        prefix= 'user_';
      }

      const singleConditionSql = buildSqlFromCondition(condition, prefix);
      conditionSql = conditionSql.concat(`
      ${ conditionSql !== '' ? (sqlCondition.conditionOperator ?? 'and') : '' } ${singleConditionSql}
      `);

      let valueType = '';
      if (condition.dataType === MetadataValueType.STRING) {
        valueType = 'string_value';
      } else if (condition.dataType === MetadataValueType.INTEGER) {
        valueType = 'int_value';
      } else if (condition.dataType === MetadataValueType.FLOAT) {
        valueType = 'float_value';
      } else if (condition.dataType === MetadataValueType.DOUBLE) {
        valueType = 'double_value';
      }

      if (!propertyList.includes(condition.property)) {
        propertyList.push(condition.property);
        if (condition.category == 'user') {
          columnSql += `(
            select
              up.value.${valueType}
            from
              tmp_data e,
              e.user_properties up
            where
              up.key = '${condition.property}'
              and e.event_id = base.event_id
            limit 1
          ) as ${prefix}${condition.property},
          `;

        } else if (condition.category == 'event') {
          columnSql += `(
            select
              ep.value.${valueType}
            from
              tmp_data e,
              e.event_params ep
            where
              ep.key = '${condition.property}'
              and e.event_id = base.event_id
            limit 1
          ) as ${prefix}${condition.property},
          `;
        }
      }
    }
  }
  return [conditionSql, columnSql];

}

function getLastNDayNumber(lastN: number, timeUnit: ExploreRelativeTimeUnit) : number {
  let lastNDayNumber = lastN;
  if (timeUnit === ExploreRelativeTimeUnit.WK) {
    lastNDayNumber = lastN * 7;
  } else if (timeUnit === ExploreRelativeTimeUnit.MM) {
    lastNDayNumber = lastN * 31;
  } else if (timeUnit === ExploreRelativeTimeUnit.Q) {
    lastNDayNumber = lastN * 31 * 3;
  }
  return lastNDayNumber;
}

function buildSqlFromCondition(condition: Condition, propertyPrefix?: string) : string | void {

  const prefix = propertyPrefix ?? '';
  switch (condition.dataType) {
    case MetadataValueType.STRING:
      return _buildSqlFromStringCondition(condition, prefix);
    case MetadataValueType.DOUBLE:
    case MetadataValueType.INTEGER:
      return _buildSqlFromNumberCondition(condition, prefix);
    default:
      logger.error(`unsupported condition ${JSON.stringify(condition)}`);
      throw new Error('Unsupported condition');
  }
}

function _buildSqlFromStringCondition(condition: Condition, prefix: string) : string | void {
  switch (condition.operator) {
    case ExploreAnalyticsOperators.EQUAL:
    case ExploreAnalyticsOperators.NOT_EQUAL:
    case ExploreAnalyticsOperators.GREATER_THAN:
    case ExploreAnalyticsOperators.GREATER_THAN_OR_EQUAL:
    case ExploreAnalyticsOperators.LESS_THAN:
    case ExploreAnalyticsOperators.LESS_THAN_OR_EQUAL:
      return `${prefix}${condition.property} ${condition.operator} '${condition.value[0]}'`;
    case ExploreAnalyticsOperators.IN:
      const values = '\'' + condition.value.join('\',\'') + '\'';
      return `${prefix}${condition.property} in (${values})`;
    case ExploreAnalyticsOperators.NOT_IN:
      const notValues = '\'' + condition.value.join('\',\'') + '\'';
      return `${prefix}${condition.property} not in (${notValues})`;
    case ExploreAnalyticsOperators.CONTAINS:
      return `${prefix}${condition.property} like '%${condition.value[0]}%'`;
    case ExploreAnalyticsOperators.NOT_CONTAINS:
      return `${prefix}${condition.property} not like '%${condition.value[0]}%'`;
    case ExploreAnalyticsOperators.NULL:
      return `${prefix}${condition.property} is null `;
    case ExploreAnalyticsOperators.NOT_NULL:
      return `${prefix}${condition.property} is not null `;
    default:
      logger.error(`unsupported condition ${JSON.stringify(condition)}`);
      throw new Error('Unsupported condition');
  }

}

function _buildSqlFromNumberCondition(condition: Condition, prefix: string) : string | void {
  switch (condition.operator) {
    case ExploreAnalyticsOperators.EQUAL:
    case ExploreAnalyticsOperators.NOT_EQUAL:
    case ExploreAnalyticsOperators.GREATER_THAN:
    case ExploreAnalyticsOperators.GREATER_THAN_OR_EQUAL:
    case ExploreAnalyticsOperators.LESS_THAN:
    case ExploreAnalyticsOperators.LESS_THAN_OR_EQUAL:
      return `${prefix}${condition.property} ${condition.operator} ${condition.value[0]}`;
    case ExploreAnalyticsOperators.IN:
      const values = condition.value.join(',');
      return `${prefix}${condition.property} in (${values})`;
    case ExploreAnalyticsOperators.NOT_IN:
      const notValues = condition.value.join(',');
      return `${prefix}${condition.property} not in (${notValues})`;
    case ExploreAnalyticsOperators.NULL:
      return `${prefix}${condition.property} is null `;
    case ExploreAnalyticsOperators.NOT_NULL:
      return `${prefix}${condition.property} is not null `;
    default:
      logger.error(`unsupported condition ${JSON.stringify(condition)}`);
      throw new Error('Unsupported condition');
  }

}
function _renderUserPseudoIdColumn(columns: string, computeMethod: ExploreComputeMethod, addSuffix: boolean): string {
  if (computeMethod === ExploreComputeMethod.USER_ID_CNT) {
    let pattern = /,user_pseudo_id/g;
    let suffix = '';
    if (addSuffix) {
      pattern = /,user_pseudo_id as user_pseudo_id####/g;
      suffix = '####';
    }
    return columns.replace(pattern, `,COALESCE(user_id, user_pseudo_id) as user_pseudo_id${suffix}`);
  }

  return columns;
}
