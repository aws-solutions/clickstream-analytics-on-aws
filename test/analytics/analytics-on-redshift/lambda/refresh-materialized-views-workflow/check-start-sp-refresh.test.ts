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

import { CLICKSTREAM_ACQUISITION_COUNTRY_NEW_USER_SP } from '@aws/clickstream-base-lib';
import { DescribeStatementCommand, ExecuteStatementCommand, GetStatementResultCommand, RedshiftDataClient, StatusString } from '@aws-sdk/client-redshift-data';
import { mockClient } from 'aws-sdk-client-mock';
import { handler, CheckStartRefreshSpEvent } from '../../../../../src/analytics/lambdas/refresh-materialized-views-workflow/check-start-sp-refresh';
import { RefreshWorkflowSteps } from '../../../../../src/analytics/private/constant';
import 'aws-sdk-client-mock-jest';


describe('Lambda - check next refresh task', () => {
  const redshiftDataMock = mockClient(RedshiftDataClient);

  let checkNextRefreshViewEvent: CheckStartRefreshSpEvent = {
    detail: {
      completeRefreshDate: '',
    },
    originalInput: {
      startRefreshViewNameOrSPName: '',
      latestJobTimestamp: '1710026295000',
      forceRefresh: '',
    },
    timezoneWithAppId: {
      appId: 'app1',
      timezone: 'Asia/Shanghai',
    },
  };

  beforeEach(() => {
    checkNextRefreshViewEvent = {
      detail: {
        completeRefreshDate: '',
      },
      originalInput: {
        startRefreshViewNameOrSPName: '',
        latestJobTimestamp: '1710026295000',
        forceRefresh: '',
      },
      timezoneWithAppId: {
        appId: 'app1',
        timezone: 'Asia/Shanghai',
      },
    };
    redshiftDataMock.reset();
  });

  test('forceRefresh is true and it is first time', async () => {
    checkNextRefreshViewEvent.originalInput.forceRefresh = 'true';
    checkNextRefreshViewEvent.originalInput.startRefreshViewNameOrSPName = CLICKSTREAM_ACQUISITION_COUNTRY_NEW_USER_SP;
    const resp = await handler(checkNextRefreshViewEvent);
    expect(resp).toEqual({
      detail: {
        nextStep: RefreshWorkflowSteps.REFRESH_SP_STEP,
        startRefreshViewNameOrSPName: CLICKSTREAM_ACQUISITION_COUNTRY_NEW_USER_SP,
        refreshDate: '2024-03-10',
        appId: checkNextRefreshViewEvent.timezoneWithAppId.appId,
        timezone: checkNextRefreshViewEvent.timezoneWithAppId.timezone,
        forceRefresh: checkNextRefreshViewEvent.originalInput.forceRefresh,
      },
    });
  });

  test('forceRefresh is true but there is no startRefreshViewNameOrSPName', async () => {
    checkNextRefreshViewEvent.originalInput.forceRefresh = 'true';
    await expect(handler(checkNextRefreshViewEvent)).rejects.toThrow('forceRefresh is true, but no completeRefreshView or startRefreshView found');
  });

  test('forceRefresh is true and it is the END', async () => {
    checkNextRefreshViewEvent.originalInput.forceRefresh = 'true';
    checkNextRefreshViewEvent.detail.completeRefreshDate = '2024-03-10';
    const resp = await handler(checkNextRefreshViewEvent);
    expect(resp).toEqual({
      detail: {
        nextStep: RefreshWorkflowSteps.END_STEP,
      },
    });
  });

  test('forceRefresh is true but startRefreshViewNameOrSPName is not the sp', async () => {
    checkNextRefreshViewEvent.originalInput.forceRefresh = 'true';
    checkNextRefreshViewEvent.originalInput.startRefreshViewNameOrSPName = 'no_user_m_max_view';
    const resp = await handler(checkNextRefreshViewEvent);
    expect(resp).toEqual({
      detail: {
        nextStep: RefreshWorkflowSteps.END_STEP,
      },
    });
  });

  test('forceRefresh is false and this is the first time to refresh sp', async () => {
    checkNextRefreshViewEvent.originalInput.forceRefresh = 'false';
    redshiftDataMock.on(DescribeStatementCommand).resolvesOnce({
      Status: StatusString.FINISHED,
    });
    const exeuteId = 'Id-1';
    redshiftDataMock.on(ExecuteStatementCommand).resolvesOnce({ Id: exeuteId });

    redshiftDataMock.on(GetStatementResultCommand).resolvesOnce({
      Records: [
        [{ stringValue: '2023-10-25' }],
      ],
    });

    const resp = await handler(checkNextRefreshViewEvent);
    expect(resp).toEqual({
      detail: {
        nextStep: RefreshWorkflowSteps.REFRESH_SP_STEP,
        refreshDate: '2024-03-10',
        appId: checkNextRefreshViewEvent.timezoneWithAppId.appId,
        timezone: checkNextRefreshViewEvent.timezoneWithAppId.timezone,
      },
    });
  });

  test('forceRefresh is false and this is first time, but this date has been refreshed', async () => {
    checkNextRefreshViewEvent.originalInput.forceRefresh = 'false';
    redshiftDataMock.on(DescribeStatementCommand).resolvesOnce({
      Status: StatusString.FINISHED,
    });
    const exeuteId = 'Id-1';
    redshiftDataMock.on(ExecuteStatementCommand).resolvesOnce({ Id: exeuteId });

    redshiftDataMock.on(GetStatementResultCommand).resolvesOnce({
      Records: [
        [{ stringValue: '2024-03-10' }],
      ],
    });

    const resp = await handler(checkNextRefreshViewEvent);
    expect(resp).toEqual({
      detail: {
        nextStep: RefreshWorkflowSteps.END_STEP,
      },
    });
  });

  test('forceRefresh is false and there is no next sp for the date, but there is earlier date need to be refreshed', async () => {
    checkNextRefreshViewEvent.originalInput.forceRefresh = 'false';
    checkNextRefreshViewEvent.detail.completeRefreshDate = '2024-03-10';
    const resp = await handler(checkNextRefreshViewEvent);
    expect(resp).toEqual({
      detail: {
        nextStep: RefreshWorkflowSteps.REFRESH_SP_STEP,
        refreshDate: '2024-03-09',
        appId: checkNextRefreshViewEvent.timezoneWithAppId.appId,
        timezone: checkNextRefreshViewEvent.timezoneWithAppId.timezone,
      },
    });
  });

  test('forceRefresh is false and there is no next sp for the date, and there is no earlier date need to be refreshed', async () => {
    checkNextRefreshViewEvent.originalInput.forceRefresh = 'false';
    checkNextRefreshViewEvent.detail.completeRefreshDate = '2024-03-08';
    const resp = await handler(checkNextRefreshViewEvent);
    expect(resp).toEqual({
      detail: {
        nextStep: RefreshWorkflowSteps.END_STEP,
      },
    });
  });
});