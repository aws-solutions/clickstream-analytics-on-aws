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
import { ConditionCategory, ExploreComputeMethod, ExploreConversionIntervalType, ExploreGroupColumn, ExploreLocales, ExplorePathNodeType, ExplorePathSessionDef, ExploreRelativeTimeUnit, ExploreTimeScopeType, MetadataPlatform, MetadataValueType } from '../../common/explore-types';
import { logger } from '../../common/powertools';

export interface Condition {
  readonly category: ConditionCategory;
  readonly property: string;
  readonly operator: string;
  readonly value: any[];
  readonly dataType: MetadataValueType;
}

export interface EventAndCondition {
  readonly eventName: string;
  readonly sqlCondition?: SQLCondition;
  readonly retentionJoinColumn?: RetentionJoinColumn;
  readonly computeMethod?: ExploreComputeMethod;
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

export interface RetentionJoinColumn {
  readonly category: ConditionCategory;
  readonly property: string;
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
  readonly locale?: ExploreLocales;
}

export const builtInEvents = [
  '_session_start',
  '_session_stop',
  '_screen_view',
  '_app_exception',
  '_app_update',
  '_first_open',
  '_os_update',
  '_user_engagement',
  '_profile_set',
  '_page_view',
  '_app_start',
  '_scroll',
  '_search',
  '_click',
  '_clickstream_error',
  '_mp_share',
  '_mp_favorite',
  '_app_end',
];

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
,device.viewport_height:: bigint as device_viewport_height
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
,device_viewport_height as device_viewport_height####
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

function _buildCommonPartSql(eventNames: string[], sqlParameters: SQLParameters, isEventPathSQL: boolean = false) : string {
  let eventDateSQL = '';
  if (sqlParameters.timeScopeType === ExploreTimeScopeType.FIXED) {
    eventDateSQL = eventDateSQL.concat(`event_date >= '${sqlParameters.timeStart}'  and event_date <= '${sqlParameters.timeEnd}'`);
  } else {
    const nDayNumber = getLastNDayNumber(sqlParameters.lastN!, sqlParameters.timeUnit!);
    eventDateSQL = eventDateSQL.concat(`event_date >= DATEADD(day, -${nDayNumber}, CURRENT_DATE) and event_date <= CURRENT_DATE`);
  }

  let globalConditionSql = getNormalConditionSql(sqlParameters.globalEventCondition);
  globalConditionSql = globalConditionSql !== '' ? `and (${globalConditionSql}) ` : '';

  const eventNameInClause = `and event_name in ('${eventNames.join('\',\'')}')`;
  const eventNameClause = eventNames.length > 0 ? eventNameInClause : '';
  return `with tmp_data as (
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
    ${ isEventPathSQL ? 'and event_name not in (\'' + builtInEvents.filter(event => !eventNames.includes(event)).join('\',\'') + '\')' : eventNameClause }
    ${globalConditionSql}
  ),
  `;
}

function _buildBaseSql(eventNames: string[], sqlParameters: SQLParameters, isEventPathSQL: boolean = false) : string {

  const propertyList: string[] = [];

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
    ${_buildCommonPartSql(eventNames, sqlParameters, isEventPathSQL)}
    tmp_base_data as (
      select 
      *
      ${columnSql}
      from tmp_data base 
    ),
  `;

  if (isEventPathSQL && conditionSql !== '' ) {
    conditionSql = conditionSql + ` or (event_name not in ('${eventNames.join('\',\'')}'))`;
  }

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

function _buildNodePathAnalysisBaseSql(sqlParameters: SQLParameters) : string {

  let eventDateSQL = '';
  if (sqlParameters.timeScopeType === ExploreTimeScopeType.FIXED) {
    eventDateSQL = eventDateSQL.concat(`event_date >= '${sqlParameters.timeStart}'  and event_date <= '${sqlParameters.timeEnd}'`);
  } else {
    const nDayNumber = getLastNDayNumber(sqlParameters.lastN!, sqlParameters.timeUnit!);
    eventDateSQL = eventDateSQL.concat(`event_date >= DATEADD(day, -${nDayNumber}, CURRENT_DATE) and event_date <= CURRENT_DATE`);
  }

  let globalConditionSql = getNormalConditionSql(sqlParameters.globalEventCondition);
  globalConditionSql = globalConditionSql !== '' ? `and (${globalConditionSql}) ` : '';

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
      ${globalConditionSql}
    ),
  `;

  return sql;
}

function _buildFunnelBaseSql(eventNames: string[], sqlParameters: SQLParameters) : string {

  let sql = _buildBaseSql(eventNames, sqlParameters);
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

  let sql = _buildCommonPartSql(eventNames, sqlParameters);
  const buildResult = _buildEventCondition(eventNames, sqlParameters, sql);
  sql = buildResult.sql;

  let joinTableSQL = '';
  for (const [index, _item] of eventNames.entries()) {

    let unionSql = '';
    if (index > 0) {
      unionSql = 'union all';
    }
    let idSql = '';
    if (buildResult.computedMethodList[index] === ExploreComputeMethod.EVENT_CNT) {
      idSql = `, table_${index}.event_id_${index} as x_id`;
    } else {
      idSql = `, table_${index}.user_pseudo_id_${index} as x_id`;
    }
    joinTableSQL = joinTableSQL.concat(`
    ${unionSql}
    select 
      table_${index}.month
    , table_${index}.week
    , table_${index}.day
    , table_${index}.hour
    , table_${index}.event_name_${index} as event_name
    , table_${index}.event_timestamp_${index} as event_timestamp
    ${idSql}
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

function _buildEventCondition(eventNames: string[], sqlParameters: SQLParameters, baseSQL: string) {
  let sql = baseSQL;
  const computedMethodList: ExploreComputeMethod[] = [];
  for (const [index, event] of eventNames.entries()) {
    computedMethodList.push(sqlParameters.eventAndConditions![index].computeMethod ?? ExploreComputeMethod.EVENT_CNT);
    const eventCondition = sqlParameters.eventAndConditions![index];
    let eventConditionSql = _buildEventConditionSQL(eventCondition);

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
        ${tableColumns}
      from tmp_data base
      where event_name = '${event}'
      ${eventConditionSql}
    ),
    `);
  }
  return { sql, computedMethodList };
}

function _buildEventConditionSQL(eventCondition: EventAndCondition) {
  let eventConditionSql = '';
  if (eventCondition.sqlCondition !== undefined) {
    for (const condition of eventCondition.sqlCondition.conditions) {
      if (condition.category === ConditionCategory.USER || condition.category === ConditionCategory.EVENT) {
        continue;
      }

      let category: string = `${condition.category}_`;
      if (condition.category === ConditionCategory.OTHER) {
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
  return eventConditionSql;
}

function _buildRetentionConditionSql(eventName: string, sqlCondition: SQLCondition | undefined): string[] {

  let conditionSql = '';
  let columnSql = '';
  if (sqlCondition) {
    const propertyList: string[] = [];
    const eventNameAndSQLCondition: EventNameAndSQLConditions = {
      eventName: eventName,
      normalConditionSql: getNormalConditionSql(sqlCondition),
      nestSqlPair: getNestPropertyConditionSql(sqlCondition, propertyList),
    };

    let normalConditionSql = eventNameAndSQLCondition.normalConditionSql;
    if (normalConditionSql !== '') {
      normalConditionSql = `and (${normalConditionSql}) `;
    }

    let nestSqlPair0 = eventNameAndSQLCondition.nestSqlPair[0];

    if (nestSqlPair0 !== '') {
      nestSqlPair0 = `and (${nestSqlPair0}) `;
    }

    conditionSql = `
      ( event_name = '${eventNameAndSQLCondition.eventName}' ${normalConditionSql} ${nestSqlPair0} )
    `;

    columnSql = `
    ${eventNameAndSQLCondition.nestSqlPair[1]}
    `;
  } else {
    conditionSql = `
      ( event_name = '${eventName}' )
    `;
  }

  return [conditionSql, columnSql];
}

export function buildFunnelTableView(sqlParameters: SQLParameters) : string {

  let eventNames = _getEventsNameFromConditions(sqlParameters.eventAndConditions!);
  let sql = _buildFunnelBaseSql(eventNames, sqlParameters);

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

  return format(sql, {
    language: 'postgresql',
  });
};

export function buildFunnelView(sqlParameters: SQLParameters) : string {

  let resultSql = '';
  const eventNames = _getEventsNameFromConditions(sqlParameters.eventAndConditions!);

  let index = 0;
  let prefix = 'u';
  if (sqlParameters.computeMethod === ExploreComputeMethod.EVENT_CNT) {
    prefix = 'e';
  }

  let baseSQL = _buildFunnelBaseSql(eventNames, sqlParameters);
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

  let sql = `
   ${baseSQL}
   ${resultSql}
   `;
  return format(sql, {
    language: 'postgresql',
  });
}

export function buildEventAnalysisView(sqlParameters: SQLParameters) : string {

  let resultSql = '';
  const eventNames = _getEventsNameFromConditions(sqlParameters.eventAndConditions!);

  let baseSQL = _buildEventAnalysisBaseSql(eventNames, sqlParameters);
  resultSql = resultSql.concat(`
      select 
        day::date as event_date, 
        event_name, 
        x_id as count
      from join_table 
      where x_id is not null
      group by
      day, event_name, x_id
  `);

  let sql = `
   ${baseSQL}
   ${resultSql}
   `;
  return format(sql, {
    language: 'postgresql',
  });
}

export function buildEventPathAnalysisView(sqlParameters: SQLParameters) : string {

  const eventNames = _getEventsNameFromConditions(sqlParameters.eventAndConditions!);
  const [eventNameHasCondition, eventConditionSqlOut] = _getEventConditionSQL(sqlParameters.eventAndConditions!);

  let midTableSql = '';
  let dataTableSql = '';
  if (sqlParameters.pathAnalysis?.sessionType === ExplorePathSessionDef.SESSION ) {
    midTableSql = `
      mid_table as (
        select 
        day::date as event_date,
        CASE
          WHEN event_name in ('${eventNames.join('\',\'')}')  THEN event_name 
          ELSE 'other'
        END as event_name,
        user_pseudo_id,
        event_id,
        event_timestamp,
        (
          select
              max(ep.value.string_value)::varchar
            from
              base_data e,
              e.event_params ep
            where
              ep.key = '_session_id'
              and e.event_id = base.event_id
        ) as session_id
      from base_data base
      ${eventConditionSqlOut !== '' ? 'where '+ eventConditionSqlOut + ` or event_name not in (${eventNameHasCondition})` : '' }
      ),
    `;

    dataTableSql = `data as (
      select 
        *,
        ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY event_timestamp asc) as step_1,
        ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY event_timestamp asc) + 1 as step_2
      from mid_table 
    ),
    step_table_1 as (
      select 
      data.user_pseudo_id user_pseudo_id,
      data.session_id session_id,
      min(step_1) min_step
      from data
      where event_name in ('${eventNames.join('\',\'')}')
      group by user_pseudo_id, session_id
    ),
    step_table_2 as (
      select 
      data.*
      from data join step_table_1 on data.user_pseudo_id = step_table_1.user_pseudo_id and data.session_id = step_table_1.session_id and data.step_1 >= step_table_1.min_step
    ),
    data_final as (
      select
        event_date,
        event_name,
        user_pseudo_id,
        event_id,
        event_timestamp,
        session_id,
        ROW_NUMBER() OVER (
          PARTITION BY
            session_id
          ORDER BY
            step_1 asc, step_2
        ) as step_1,
        ROW_NUMBER() OVER (
          PARTITION BY
            session_id
          ORDER BY
            step_1 asc, step_2
        ) + 1 as step_2
      from
        step_table_2
    )
    select 
      a.event_name || '_' || a.step_1 as source,
      CASE
        WHEN b.event_name is not null THEN b.event_name || '_' || a.step_2
        ELSE 'lost'
      END as target,
      ${sqlParameters.computeMethod != ExploreComputeMethod.EVENT_CNT ? 'a.user_pseudo_id' : 'a.event_id' } as x_id
    from data_final a left join data_final b 
      on a.step_2 = b.step_1 
      and a.session_id = b.session_id
      and a.user_pseudo_id = b.user_pseudo_id
    where a.step_2 <= ${sqlParameters.maxStep ?? 10}
    `;

  } else {
    midTableSql = `
      mid_table as (
        select 
        CASE
          WHEN event_name in ('${eventNames.join('\',\'')}')  THEN event_name 
          ELSE 'other'
        END as event_name,
        user_pseudo_id,
        event_id,
        event_timestamp
      from base_data base
      ${eventConditionSqlOut !== '' ? 'where '+ eventConditionSqlOut + ` or event_name not in (${eventNameHasCondition})` : '' }
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
        a.event_name,
        a.user_pseudo_id,
        a.event_id,
        a.event_timestamp,
        case when (b.event_timestamp - a.event_timestamp < ${sqlParameters.pathAnalysis!.lagSeconds! * 1000} and b.event_timestamp - a.event_timestamp >=0) then 0 else 1 end as group_start
      from data_1 a left join data_1 b 
        on a.user_pseudo_id = b.user_pseudo_id 
        and a.step_2 = b.step_1
    )
     ,data_3 AS (
      SELECT
          *,
          SUM(group_start) over(order by user_pseudo_id, event_timestamp ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW ) AS group_id
      FROM
        data_2
      )
    ,data as (
      select 
        event_name,
        user_pseudo_id,
        event_id,
        event_timestamp,
        group_id,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id, group_id ORDER BY event_timestamp asc) as step_1,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id, group_id ORDER BY event_timestamp asc) + 1 as step_2
      from data_3
    ),
    step_table_1 as (
      select
        data.user_pseudo_id user_pseudo_id,
        group_id,
        min(step_1) min_step
      from
        data
      where
        event_name in ('${eventNames.join('\',\'')}')
      group by
        user_pseudo_id,
        group_id
    ),
    step_table_2 as (
      select
        data.*
      from
        data
        join step_table_1 on data.user_pseudo_id = step_table_1.user_pseudo_id and data.group_id = step_table_1.group_id
        and data.step_1 >= step_table_1.min_step
    ),
    data_final as (
      select
        event_name,
        user_pseudo_id,
        event_id,
        group_id,
        ROW_NUMBER() OVER (
          PARTITION BY
            user_pseudo_id,
            group_id
          ORDER BY
            step_1 asc,
            step_2
        ) as step_1,
        ROW_NUMBER() OVER (
          PARTITION BY
            user_pseudo_id,
            group_id
          ORDER BY
            step_1 asc,
            step_2
        ) + 1 as step_2
      from
        step_table_2
    )
    select 
      a.event_name || '_' || a.step_1 as source,
      CASE
        WHEN b.event_name is not null THEN b.event_name || '_' || a.step_2
        ELSE 'lost'
      END as target,
      ${sqlParameters.computeMethod != ExploreComputeMethod.EVENT_CNT ? 'a.user_pseudo_id' : 'a.event_id' } as x_id
    from data_final a left join data_final b 
      on a.step_2 = b.step_1 
      and a.group_id = b.group_id 
      and a.user_pseudo_id = b.user_pseudo_id
    where a.step_2 <= ${sqlParameters.maxStep ?? 10}
    `;
  }

  const sql = `
    ${_buildBaseSql(eventNames, sqlParameters, true)}
    ${midTableSql}
    ${dataTableSql}
  `;
  return format(sql, {
    language: 'postgresql',
  });
}

export function buildNodePathAnalysisView(sqlParameters: SQLParameters) : string {

  let midTableSql = '';
  let dataTableSql = '';

  if (sqlParameters.pathAnalysis!.sessionType === ExplorePathSessionDef.SESSION ) {
    midTableSql = `
      mid_table as (
        select 
        event_name,
        user_pseudo_id,
        event_id,
        event_timestamp,
        (
          select
              max(ep.value.string_value)::varchar
            from
              base_data e,
              e.event_params ep
            where
              ep.key = '_session_id'
              and e.event_id = base.event_id
        ) as session_id,
        (
          select
              max(ep.value.string_value)::varchar
            from
              base_data e,
              e.event_params ep
            where
              ep.key = '${sqlParameters.pathAnalysis!.nodeType}'
              and e.event_id = base.event_id
        ) as node
      from base_data base
      ),
      data as (
        select
        event_name,
        user_pseudo_id,
        event_id,
        event_timestamp,
        session_id,
        case 
          when node in ('${sqlParameters.pathAnalysis?.nodes?.join('\',\'')}') then node 
          else 'other'
        end as node,
        ROW_NUMBER() OVER (
          PARTITION BY
            user_pseudo_id,
            session_id
          ORDER BY
            event_timestamp asc
        ) as step_1,
        ROW_NUMBER() OVER (
          PARTITION BY
            user_pseudo_id,
            session_id
          ORDER BY
            event_timestamp asc
        ) + 1 as step_2
        from
          mid_table
      ),
    `;
    dataTableSql = `step_table_1 as (
      select
        user_pseudo_id,
        session_id,
        min(step_1) min_step
      from
        data
      where
        node in ('${sqlParameters.pathAnalysis?.nodes?.join('\',\'')}')
      group by
        user_pseudo_id,
        session_id
    ),
    step_table_2 as (
      select
        data.*
      from data
      join step_table_1 on data.user_pseudo_id = step_table_1.user_pseudo_id
      and data.session_id = step_table_1.session_id
      and data.step_1 >= step_table_1.min_step
    ),
    data_final as (
      select        
        event_name,
        user_pseudo_id,
        event_id,
        event_timestamp,
        session_id,
        node,
        ROW_NUMBER() OVER (
          PARTITION BY
            user_pseudo_id,
            session_id
          ORDER BY
            step_1 asc,
            step_2
        ) as step_1,
        ROW_NUMBER() OVER (
          PARTITION BY
            user_pseudo_id,
            session_id
          ORDER BY
            step_1 asc,
            step_2
        ) + 1 as step_2
      from
        step_table_2
    )
    select 
      a.node || '_' || a.step_1 as source,
      CASE 
        WHEN b.node is not null THEN b.node || '_' || a.step_2
        ELSE 'lost'
      END as target,
      ${sqlParameters.computeMethod != ExploreComputeMethod.EVENT_CNT ? 'a.user_pseudo_id' : 'a.event_id' } as x_id
    from data_final a left join data_final b 
      on a.user_pseudo_id = b.user_pseudo_id 
      and a.session_id = b.session_id
      and a.step_2 = b.step_1
    where a.step_2 <= ${sqlParameters.maxStep ?? 10}
    `;

  } else {
    midTableSql = `
      mid_table as (
        select 
        user_pseudo_id,
        event_id,
        event_timestamp,
        (
          select
              max(ep.value.string_value)::varchar
            from
              base_data e,
              e.event_params ep
            where
              ep.key = '${sqlParameters.pathAnalysis!.nodeType}'
              and e.event_id = base.event_id
        )::varchar as node
      from base_data base
      ),
    `;

    dataTableSql = `data_1 as (
      select 
        user_pseudo_id,
        event_id,
        event_timestamp,
        case 
          when node in ('${sqlParameters.pathAnalysis?.nodes?.join('\',\'')}') then node 
          else 'other'
        end as node,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ORDER BY event_timestamp asc) as step_1,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ORDER BY event_timestamp asc) + 1 as step_2
      from mid_table
    ),
    data_2 as (
      select 
        a.node,
        a.user_pseudo_id,
        a.event_id,
        a.event_timestamp,
        case
          when (
            b.event_timestamp - a.event_timestamp < 3600000
            and b.event_timestamp - a.event_timestamp >= 0
          ) then 0
          else 1
        end as group_start
      from data_1 a left join data_1 b 
      on a.user_pseudo_id = b.user_pseudo_id 
      and a.step_2 = b.step_1
    )
     ,data_3 AS (
      select
          *,
          SUM(group_start) over (
            order by
              user_pseudo_id,
              event_timestamp ROWS BETWEEN UNBOUNDED PRECEDING
              AND CURRENT ROW
          ) AS group_id
      from
        data_2
      )
    ,data as (
      select 
        node,
        user_pseudo_id,
        event_id,
        event_timestamp,
        group_id,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id, group_id ORDER BY event_timestamp asc) as step_1,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id, group_id ORDER BY event_timestamp asc) + 1 as step_2
      from data_3
    ),
    step_table_1 as (
      select
        data.user_pseudo_id user_pseudo_id,
        group_id,
        min(step_1) min_step
      from
        data
      where
        node in ('${sqlParameters.pathAnalysis?.nodes?.join('\',\'')}')
      group by
        user_pseudo_id,
        group_id
    ),
    step_table_2 as (
      select
        data.*
      from
        data
        join step_table_1 on data.user_pseudo_id = step_table_1.user_pseudo_id
        and data.group_id = step_table_1.group_id
        and data.step_1 >= step_table_1.min_step
    ),
    data_final as (
      select
        node,
        user_pseudo_id,
        event_id,
        group_id,
        ROW_NUMBER() OVER (
          PARTITION BY
            user_pseudo_id,
            group_id
          ORDER BY
            step_1 asc,
            step_2
        ) as step_1,
        ROW_NUMBER() OVER (
          PARTITION BY
            user_pseudo_id,
            group_id
          ORDER BY
            step_1 asc,
            step_2
        ) + 1 as step_2
      from
        step_table_2
    )
    select 
      a.node || '_' || a.step_1 as source,
      CASE 
        WHEN b.node is not null THEN b.node || '_' || a.step_2
        ELSE 'lost'
      END as target,
      ${sqlParameters.computeMethod != ExploreComputeMethod.EVENT_CNT ? 'a.user_pseudo_id' : 'a.event_id' } as x_id
    from data_final a left join data_final b 
      on a.user_pseudo_id = b.user_pseudo_id 
      and a.group_id = b.group_id
      and a.step_2 = b.step_1
    where a.step_2 <= ${sqlParameters.maxStep ?? 10}
    `;
  }

  const sql = `
    ${_buildNodePathAnalysisBaseSql(sqlParameters)}
    ${midTableSql}
    ${dataTableSql}
  `;

  return format(sql, {
    language: 'postgresql',
  });
}

export function buildRetentionAnalysisView(sqlParameters: SQLParameters) : string {

  const dateListSql = _buildDateListSQL(sqlParameters);
  const { nestColumnSql, tableSql, resultSql } = _buildSQLs(sqlParameters);


  const sql = `
    ${_buildCommonPartSql(_getRetentionAnalysisViewEventNames(sqlParameters), sqlParameters)}
    first_date as (
      select min(event_date) as first_date from tmp_data
    ), 
    mid_table as (
      select 
        ${nestColumnSql}
        * 
      from tmp_data as base
    ),
    ${dateListSql}
    ${tableSql}
    result_table as (${resultSql})
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

function _buildSQLs(sqlParameters: SQLParameters) {
  let tableSql = '';
  let resultSql = '';

  const nestColumnSql = _buildNestColumnSQL(sqlParameters);

  for (const [index, pair] of sqlParameters.pairEventAndConditions!.entries()) {

    const [startConditionSql, _startColumnSql] = _buildRetentionConditionSql(pair.startEvent.eventName, pair.startEvent.sqlCondition);
    const [backConditionSql, _backColumnSql] = _buildRetentionConditionSql(pair.backEvent.eventName, pair.backEvent.sqlCondition);

    let { joinColLeft, joinColRight, joinSql } = _buildJoinSQL(pair, index);

    tableSql = tableSql.concat(
      `
      first_table_${index} as (
        select 
          event_date,
          event_name,
          ${joinColLeft}
          user_pseudo_id
        from mid_table join first_date on mid_table.event_date = first_date.first_date
        ${startConditionSql !== '' ? 'where ' + startConditionSql : ''}
      ),
      second_table_${index} as (
        select 
          event_date,
          event_name,
          ${joinColRight}
          user_pseudo_id
        from mid_table join first_date on mid_table.event_date > first_date.first_date
        ${backConditionSql !== '' ? 'where ' + backConditionSql : ''}
      ),
      `,
    );

    if (index > 0) {
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
    left join second_table_${index} on date_list.event_date = second_table_${index}.event_date 
    and first_table_${index}.user_pseudo_id = second_table_${index}.user_pseudo_id
    ${joinSql}
    `);
  }
  return { nestColumnSql, tableSql, resultSql };
}

function _buildJoinSQL(pair: PairEventAndCondition, index: number) {
  let joinSql = '';
  let joinColLeft = '';
  let joinColRight = '';
  if (pair.startEvent.retentionJoinColumn && pair.backEvent.retentionJoinColumn) {
    const prefix1 = pair.startEvent.retentionJoinColumn.category === ConditionCategory.OTHER ? '' : pair.startEvent.retentionJoinColumn.category;
    const prefix2 = pair.backEvent.retentionJoinColumn.category === ConditionCategory.OTHER ? '' : pair.backEvent.retentionJoinColumn.category;

    joinColLeft = `${prefix1}_${pair.startEvent.retentionJoinColumn.property},`;
    joinColRight = `${prefix2}_${pair.backEvent.retentionJoinColumn.property},`;

    joinSql = `and first_table_${index}.${prefix1}_${pair.startEvent.retentionJoinColumn.property} = second_table_${index}.${prefix2}_${pair.backEvent.retentionJoinColumn.property}`;
  }
  return { joinColLeft, joinColRight, joinSql };
}

function _buildNestColumnSQL(sqlParameters: SQLParameters) {
  let nestColumnSql = '';
  const propertyList: string[] = [];
  for (const [_index, pair] of sqlParameters.pairEventAndConditions!.entries()) {
    nestColumnSql += getNestPropertyList(pair.startEvent.sqlCondition, propertyList);
    nestColumnSql += getNestPropertyList(pair.backEvent.sqlCondition, propertyList);
  }
  return nestColumnSql;
}

function _buildDateListSQL(sqlParameters: SQLParameters) {
  let dateList: string[] = [];
  if (sqlParameters.timeScopeType === ExploreTimeScopeType.FIXED) {
    dateList.push(...generateDateListWithoutStartData(new Date(sqlParameters.timeStart!), new Date(sqlParameters.timeEnd!)));
  } else {
    const lastN = getLastNDayNumber(sqlParameters.lastN!, sqlParameters.timeUnit!);
    for (let n = 1; n <= lastN; n++) {
      dateList.push(`
       (CURRENT_DATE - INTERVAL '${n} day') 
      `);
    }
  }

  let dateListSql = 'date_list as (';
  for (const [index, dt] of dateList.entries()) {
    if (index > 0) {
      dateListSql = dateListSql.concat(`
      union all
      `);
    }
    dateListSql = dateListSql.concat(`select ${dt}::date as event_date`);
  }
  dateListSql = dateListSql.concat(`
  ),
  `);
  return dateListSql;
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
      if (condition.category === ConditionCategory.USER || condition.category === ConditionCategory.EVENT) {
        continue;
      }

      let category: string = `${condition.category}_`;
      if (condition.category === ConditionCategory.OTHER) {
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

function getValueType(dataType: MetadataValueType) {
  let valueType = '';
  if (dataType === MetadataValueType.STRING) {
    valueType = 'string_value';
  } else if (dataType === MetadataValueType.INTEGER) {
    valueType = 'int_value';
  } else if (dataType === MetadataValueType.FLOAT) {
    valueType = 'float_value';
  } else if (dataType === MetadataValueType.DOUBLE) {
    valueType = 'double_value';
  }
  return valueType;
}

function getNestPropertyConditionSql(sqlCondition: SQLCondition | undefined, propertyList: string[]): [string, string] {
  let conditionSql = '';
  let columnSql = '';
  if (sqlCondition) {
    for (const [_index, condition] of sqlCondition.conditions.entries()) {
      if (condition.category != ConditionCategory.USER && condition.category != ConditionCategory.EVENT) {
        continue;
      }
      let prefix = 'event_';
      if (condition.category === ConditionCategory.USER) {
        prefix= 'user_';
      }

      const singleConditionSql = buildSqlFromCondition(condition, prefix);
      conditionSql = conditionSql.concat(`
      ${ conditionSql !== '' ? (sqlCondition.conditionOperator ?? 'and') : '' } ${singleConditionSql}
      `);

      columnSql = _buildColumnSQL(condition, propertyList, prefix, columnSql);
    }
  }
  return [conditionSql, columnSql];
}

function getNestPropertyList(sqlCondition: SQLCondition | undefined, propertyList: string[]): string {
  let columnSql = '';
  if (sqlCondition) {
    for (const [_index, condition] of sqlCondition.conditions.entries()) {
      if (condition.category != ConditionCategory.USER && condition.category != ConditionCategory.EVENT) {
        continue;
      }
      let prefix = 'event_';
      if (condition.category === ConditionCategory.USER) {
        prefix= 'user_';
      }

      columnSql = _buildColumnSQL(condition, propertyList, prefix, columnSql);
    }
  }

  return columnSql;
}

function _buildColumnSQL(condition: Condition, propertyList: string[], prefix: string, columnSql: string) {
  const valueType = getValueType(condition.dataType);

  if (!propertyList.includes(prefix + condition.property)) {
    propertyList.push(prefix + condition.property);
    if (condition.category == ConditionCategory.USER) {
      columnSql += `(
            select
              max(up.value.${valueType})
            from
              tmp_data e,
              e.user_properties up
            where
              up.key = '${condition.property}'
              and e.event_id = base.event_id
          ) as ${prefix}${condition.property},
          `;

    } else if (condition.category == ConditionCategory.EVENT) {
      columnSql += `(
            select
              max(ep.value.${valueType})
            from
              tmp_data e,
              e.event_params ep
            where
              ep.key = '${condition.property}'
              and e.event_id = base.event_id
          ) as ${prefix}${condition.property},
          `;
    }
  }
  return columnSql;
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

function _getEventsNameFromConditions(eventAndConditions: EventAndCondition[]) {
  const eventNames: string[] = [];
  for (const e of eventAndConditions) {
    eventNames.push(e.eventName);
  }
  return eventNames;
}

function _getEventConditionSQL(eventAndConditions: EventAndCondition[]): string[] {

  const eventNames = _getEventsNameFromConditions(eventAndConditions);
  let eventConditionSqlOut = '';
  const eventNameHasCondition: string[] = [];
  for (const [index, event] of eventNames.entries()) {
    const eventCondition = eventAndConditions[index];
    eventConditionSqlOut = _buildEventCondition2(eventCondition, eventConditionSqlOut, index, event, eventNameHasCondition);
  }
  return [`'${eventNameHasCondition.join('\',\'')}'`, eventConditionSqlOut];
}

function _buildEventCondition2(eventCondition: EventAndCondition, eventConditionSqlOut: string,
  index: number, event: string, eventNameHasCondition: string[]) {
  let eventConditionSql = '';
  if (eventCondition.sqlCondition?.conditions !== undefined) {
    for (const [i, condition] of eventCondition.sqlCondition.conditions.entries()) {
      if (condition.category === ConditionCategory.USER || condition.category === ConditionCategory.EVENT) {
        continue;
      }

      eventConditionSql = _buildEventCondition3(condition, eventConditionSql, i, eventCondition);
    }
  }
  if (eventConditionSql !== '') {
    eventConditionSqlOut = eventConditionSqlOut.concat(`
      ${index === 0 ? ' ' : ' or '} ( event_name = '${event}' and (${eventConditionSql}) )
      `);
    eventNameHasCondition.push(event);
  }
  return eventConditionSqlOut;
}

function _buildEventCondition3(condition: Condition, eventConditionSql: string, i: number, eventCondition: EventAndCondition) {
  let category: string = `${condition.category}_`;
  if (condition.category === ConditionCategory.OTHER) {
    category = '';
  }
  const conditionSql = buildSqlFromCondition(condition, category);
  eventConditionSql = eventConditionSql.concat(`
          ${i === 0 ? '' : (eventCondition.sqlCondition!.conditionOperator ?? 'and')}  ${conditionSql}
        `);
  return eventConditionSql;
}

function _getRetentionAnalysisViewEventNames(sqlParameters: SQLParameters) : string[] {

  const eventNames: string[] = [];

  for (const pair of sqlParameters.pairEventAndConditions!) {
    eventNames.push(pair.startEvent.eventName);
    eventNames.push(pair.backEvent.eventName);
  }

  return [...new Set(eventNames)];
}