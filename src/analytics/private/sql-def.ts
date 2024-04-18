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

import {
  CLICKSTREAM_ACQUISITION_COUNTRY_NEW_USER,
  CLICKSTREAM_ACQUISITION_COUNTRY_NEW_USER_SP,
  CLICKSTREAM_ACQUISITION_DAY_TRAFFIC_SOURCE_USER,
  CLICKSTREAM_ACQUISITION_DAY_TRAFFIC_SOURCE_USER_SP,
  CLICKSTREAM_ACQUISITION_DAY_USER_ACQUISITION,
  CLICKSTREAM_ACQUISITION_DAY_USER_ACQUISITION_SP,
  CLICKSTREAM_ACQUISITION_DAY_USER_VIEW_CNT_MV,
  CLICKSTREAM_ACQUISITION_INTRA_DAY,
  CLICKSTREAM_ACQUISITION_INTRA_DAY_SP,
  CLICKSTREAM_DEVICE_CRASH_RATE,
  CLICKSTREAM_DEVICE_CRASH_RATE_SP,
  CLICKSTREAM_DEVICE_USER_DEVICE,
  CLICKSTREAM_DEVICE_USER_DEVICE_SP,
  CLICKSTREAM_ENGAGEMENT_DAY_USER_VIEW,
  CLICKSTREAM_ENGAGEMENT_DAY_USER_VIEW_SP,
  CLICKSTREAM_ENGAGEMENT_ENTRANCE,
  CLICKSTREAM_ENGAGEMENT_ENTRANCE_SP,
  CLICKSTREAM_ENGAGEMENT_EVENT_NAME,
  CLICKSTREAM_ENGAGEMENT_EVENT_NAME_SP,
  CLICKSTREAM_ENGAGEMENT_EXIT,
  CLICKSTREAM_ENGAGEMENT_EXIT_SP,
  CLICKSTREAM_ENGAGEMENT_KPI,
  CLICKSTREAM_ENGAGEMENT_KPI_SP,
  CLICKSTREAM_ENGAGEMENT_PAGE_SCREEN_VIEW,
  CLICKSTREAM_ENGAGEMENT_PAGE_SCREEN_VIEW_DETAIL,
  CLICKSTREAM_ENGAGEMENT_PAGE_SCREEN_VIEW_DETAIL_SP,
  CLICKSTREAM_ENGAGEMENT_PAGE_SCREEN_VIEW_SP,
  CLICKSTREAM_EVENT_VIEW_NAME,
  CLICKSTREAM_LIFECYCLE_VIEW_NAME,
  CLICKSTREAM_LIFECYCLE_WEEKLY_VIEW_NAME,
  CLICKSTREAM_RETENTION_BASE_VIEW_NAME,
  CLICKSTREAM_RETENTION_DAU_WAU, CLICKSTREAM_RETENTION_DAU_WAU_SP,
  CLICKSTREAM_RETENTION_EVENT_OVERTIME,
  CLICKSTREAM_RETENTION_EVENT_OVERTIME_SP,
  CLICKSTREAM_RETENTION_USER_NEW_RETURN,
  CLICKSTREAM_RETENTION_USER_NEW_RETURN_SP,
  CLICKSTREAM_RETENTION_VIEW_NAME,

} from '@aws/clickstream-base-lib';
import { SQLDef, SQLViewDef } from './model';

export const reportingViewsDef: SQLViewDef[] = [
  {
    viewName: CLICKSTREAM_EVENT_VIEW_NAME,
    type: 'mv',
    scheduleRefresh: 'true',
  },
  {
    viewName: CLICKSTREAM_ACQUISITION_COUNTRY_NEW_USER,
  },
  {
    viewName: CLICKSTREAM_ACQUISITION_INTRA_DAY,
  },
  {
    viewName: CLICKSTREAM_ACQUISITION_DAY_TRAFFIC_SOURCE_USER,
  },
  {
    viewName: CLICKSTREAM_ACQUISITION_DAY_USER_ACQUISITION,
  },
  {
    viewName: CLICKSTREAM_ACQUISITION_DAY_USER_VIEW_CNT_MV,
    type: 'mv',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_DAY_USER_VIEW,
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_ENTRANCE,
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_EVENT_NAME,
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_EXIT,
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_KPI,
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_PAGE_SCREEN_VIEW,
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_PAGE_SCREEN_VIEW_DETAIL,
  },
  {
    viewName: CLICKSTREAM_RETENTION_DAU_WAU,
  },
  {
    viewName: CLICKSTREAM_RETENTION_EVENT_OVERTIME,
  },
  {
    viewName: CLICKSTREAM_RETENTION_USER_NEW_RETURN,
  },
  {
    viewName: CLICKSTREAM_DEVICE_CRASH_RATE,
  },
  {
    viewName: CLICKSTREAM_DEVICE_USER_DEVICE,
  },
  {
    viewName: CLICKSTREAM_ACQUISITION_COUNTRY_NEW_USER,
    spName: CLICKSTREAM_ACQUISITION_COUNTRY_NEW_USER_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_ACQUISITION_DAY_TRAFFIC_SOURCE_USER,
    spName: CLICKSTREAM_ACQUISITION_DAY_TRAFFIC_SOURCE_USER_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_ACQUISITION_DAY_USER_ACQUISITION,
    spName: CLICKSTREAM_ACQUISITION_DAY_USER_ACQUISITION_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_ACQUISITION_INTRA_DAY,
    spName: CLICKSTREAM_ACQUISITION_INTRA_DAY_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_DAY_USER_VIEW,
    spName: CLICKSTREAM_ENGAGEMENT_DAY_USER_VIEW_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_ENTRANCE,
    spName: CLICKSTREAM_ENGAGEMENT_ENTRANCE_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_EXIT,
    spName: CLICKSTREAM_ENGAGEMENT_EXIT_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_KPI,
    spName: CLICKSTREAM_ENGAGEMENT_KPI_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_PAGE_SCREEN_VIEW_DETAIL,
    spName: CLICKSTREAM_ENGAGEMENT_PAGE_SCREEN_VIEW_DETAIL_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_PAGE_SCREEN_VIEW,
    spName: CLICKSTREAM_ENGAGEMENT_PAGE_SCREEN_VIEW_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_ENGAGEMENT_EVENT_NAME,
    spName: CLICKSTREAM_ENGAGEMENT_EVENT_NAME_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_RETENTION_DAU_WAU,
    spName: CLICKSTREAM_RETENTION_DAU_WAU_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_RETENTION_EVENT_OVERTIME,
    spName: CLICKSTREAM_RETENTION_EVENT_OVERTIME_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_RETENTION_USER_NEW_RETURN,
    spName: CLICKSTREAM_RETENTION_USER_NEW_RETURN_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_DEVICE_CRASH_RATE,
    spName: CLICKSTREAM_DEVICE_CRASH_RATE_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_DEVICE_USER_DEVICE,
    spName: CLICKSTREAM_DEVICE_USER_DEVICE_SP,
    type: 'sp',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_LIFECYCLE_VIEW_NAME,
    type: 'mv',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_LIFECYCLE_WEEKLY_VIEW_NAME,
  },
  {
    viewName: CLICKSTREAM_RETENTION_BASE_VIEW_NAME,
    type: 'mv',
    scheduleRefresh: 'true',
    timezoneSensitive: 'true',
  },
  {
    viewName: CLICKSTREAM_RETENTION_VIEW_NAME,
  },

];

// keep order
export const schemaDefs: SQLDef[] = [
  {
    sqlFile: 'clickstream-log.sql',
  },
  {
    sqlFile: 'refresh-mv-sp-status.sql',
  },
  {
    sqlFile: 'sp-clickstream-log.sql',
  },
  {
    sqlFile: 'sp-clickstream-log-non-atomic.sql',
  },
  {
    sqlFile: 'grant-permissions-to-bi-user-1.sql',
  },
  {
    sqlFile: 'grant-permissions-to-bi-user-2.sql',
  },
  {
    sqlFile: 'sp-scan-metadata.sql',
  },
  {
    sqlFile: 'sp-clear-expired-data.sql',
  },
  {
    sqlFile: 'event-v2.sql',
  },
  {
    sqlFile: 'item-v2.sql',
  },
  {
    sqlFile: 'session.sql',
  },
  {
    sqlFile: 'user-v2.sql',
  },
  {
    sqlFile: 'user-m-max-view.sql',
    type: 'mv',
    scheduleRefresh: 'true',
  },
  {
    sqlFile: 'user-m-view-v2.sql',
    type: 'mv',
    scheduleRefresh: 'true',
  },
  {
    sqlFile: 'session-m-max-view.sql',
    type: 'mv',
    scheduleRefresh: 'true',
  },
  {
    sqlFile: 'session-m-view.sql',
    type: 'mv',
    scheduleRefresh: 'true',
  },
  {
    sqlFile: 'fn-combine-json-list.sql',
  },
  {
    sqlFile: 'fn-parse-utm-from-url.sql',
  },
  {
    sqlFile: 'fn-rm-object-props.sql',
  },
  {
    sqlFile: 'fn-transform-event-custom-props.sql',
  },
  {
    sqlFile: 'fn-transform-user-custom-props.sql',
  },
  {
    sqlFile: 'sp-migrate-event-to-v2.sql',
  },
  {
    sqlFile: 'sp-migrate-item-to-v2.sql',
  },
  {
    sqlFile: 'sp-migrate-user-to-v2.sql',
  },
  {
    sqlFile: 'sp-migrate-session-to-v2.sql',
  },
  {
    sqlFile: 'sp-migrate-data-to-v2.sql',
  },
  {
    sqlFile: 'segment-user.sql',
  },
  {
    sqlFile: 'sp-user-segment.sql',
  },
];
