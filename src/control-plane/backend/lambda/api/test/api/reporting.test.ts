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

import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import {
  CreateAnalysisCommand,
  CreateDashboardCommand,
  DeleteAnalysisCommand,
  DeleteDashboardCommand,
  DeleteDataSetCommand,
  DescribeDashboardDefinitionCommand,
  ListAnalysesCommand,
  ListDashboardsCommand,
  ListDataSetsCommand,
  QuickSightClient,
  UpdateAnalysisCommand,
  UpdateDashboardCommand,
  UpdateDashboardPublishedVersionCommand,
  GenerateEmbedUrlForRegisteredUserCommand,
  ThrottlingException,
  CreateDataSetCommand,
  ResizeOption,
  SheetContentType,
  DescribeDashboardCommand,
  ResourceStatus,
  DescribeAnalysisCommand,
} from '@aws-sdk/client-quicksight';
import { BatchExecuteStatementCommand, DescribeStatementCommand, RedshiftDataClient, StatusString } from '@aws-sdk/client-redshift-data';
import { AssumeRoleCommand, STSClient, STSServiceException } from '@aws-sdk/client-sts';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import request from 'supertest';
import { MOCK_TOKEN, tokenMock } from './ddb-mock';
import { clickStreamTableName } from '../../common/constants';
import { ConditionCategory, ExploreLocales, ExplorePathNodeType, ExplorePathSessionDef, MetadataPlatform, MetadataValueType, QuickSightChartType } from '../../common/explore-types';
import { app, server } from '../../index';
import 'aws-sdk-client-mock-jest';
import { EventAndCondition, PairEventAndCondition, SQLCondition } from '../../service/quicksight/sql-builder';

jest.mock('@aws-sdk/credential-providers');
const ddbMock = mockClient(DynamoDBDocumentClient);
const cloudFormationMock = mockClient(CloudFormationClient);
const quickSightMock = mockClient(QuickSightClient);
const stsClientMock = mockClient(STSClient);
const redshiftClientMock = mockClient(RedshiftDataClient);

const dashboardDef =
  {
    DataSetIdentifierDeclarations: [],
    Sheets: [
      {
        SheetId: 'f43cdc10-0f41-4ad1-bd42-deb0f6dbeb64',
        Name: 'sheet1',
        FilterControls: [],
        Visuals: [],
        Layouts: [
          {
            Configuration: {
              GridLayout: {
                Elements: [],
                CanvasSizeOptions: {
                  ScreenCanvasSizeOptions: {
                    ResizeOption: ResizeOption.FIXED,
                    OptimizedViewPortWidth: '1600px',
                  },
                },
              },
            },
          },
        ],
        ContentType: SheetContentType.INTERACTIVE,
      },
    ],
    CalculatedFields: [],
    ParameterDeclarations: [],
    FilterGroups: [],
    AnalysisDefaults: {
      DefaultNewSheetConfiguration: {
        InteractiveLayoutConfiguration: {
          Grid: {
            CanvasSizeOptions: {
              ScreenCanvasSizeOptions: {
                ResizeOption: ResizeOption.FIXED,
                OptimizedViewPortWidth: '1600px',
              },
            },
          },
        },
        SheetContentType: SheetContentType.INTERACTIVE,
      },
    },
  };

describe('reporting test', () => {
  beforeEach(() => {
    ddbMock.reset();
    cloudFormationMock.reset();
    quickSightMock.reset();
    redshiftClientMock.reset();
    stsClientMock.reset();
    tokenMock(ddbMock, false);
  });

  it('funnel bar visual - preview', async () => {
    tokenMock(ddbMock, false);
    stsClientMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: '1111',
        SecretAccessKey: '22222',
        SessionToken: '33333',
        Expiration: new Date(),
      },
    });

    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(CreateAnalysisCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysisaaaaaaaa',
    });
    quickSightMock.on(CreateDashboardCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      VersionArn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa/1',
    });
    quickSightMock.on(GenerateEmbedUrlForRegisteredUserCommand).resolves({
      EmbedUrl: 'https://quicksight.aws.amazon.com/embed/4ui7xyvq73/studies/4a05631e-cbe6-477c-915d-1704aec9f101?isauthcode=true&identityprovider=quicksight&code=4a05631e-cbe6-477c-915d-1704aec9f101',
    });
    quickSightMock.on(DescribeDashboardCommand).resolvesOnce({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_IN_PROGRESS,
        },
      },
    }).resolves({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_SUCCESSFUL,
        },
      },
    });

    const res = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        chartType: QuickSightChartType.BAR,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.dashboardArn).toEqual('arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa');
    expect(res.body.data.dashboardName).toEqual('_tmp_testview0002');
    expect(res.body.data.analysisArn).toEqual('arn:aws:quicksight:us-east-1:11111111:analysis/analysisaaaaaaaa');
    expect(res.body.data.analysisName).toEqual('_tmp_testview0002');
    expect(res.body.data.analysisId).toBeDefined();
    expect(res.body.data.dashboardId).toBeDefined();
    expect(res.body.data.visualIds).toBeDefined();
    expect(res.body.data.visualIds.length).toEqual(2);
    expect(res.body.data.dashboardEmbedUrl).toEqual('https://quicksight.aws.amazon.com/embed/4ui7xyvq73/studies/4a05631e-cbe6-477c-915d-1704aec9f101?isauthcode=true&identityprovider=quicksight&code=4a05631e-cbe6-477c-915d-1704aec9f101');
    expect(quickSightMock).toHaveReceivedCommandTimes(DescribeDashboardCommand, 2);
  });

  it('funnel visual - preview', async () => {
    tokenMock(ddbMock, false);
    stsClientMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: '1111',
        SecretAccessKey: '22222',
        SessionToken: '33333',
        Expiration: new Date(),
      },
    });

    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(CreateAnalysisCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysisaaaaaaaa',
    });
    quickSightMock.on(CreateDashboardCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      VersionArn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa/1',
    });
    quickSightMock.on(GenerateEmbedUrlForRegisteredUserCommand).resolves({
      EmbedUrl: 'https://quicksight.aws.amazon.com/embed/4ui7xyvq73/studies/4a05631e-cbe6-477c-915d-1704aec9f101?isauthcode=true&identityprovider=quicksight&code=4a05631e-cbe6-477c-915d-1704aec9f101',
    });
    quickSightMock.on(DescribeDashboardCommand).resolvesOnce({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_IN_PROGRESS,
        },
      },
    }).resolves({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_SUCCESSFUL,
        },
      },
    });

    const res = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        locale: ExploreLocales.ZH_CN,
        chartType: QuickSightChartType.FUNNEL,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.dashboardArn).toEqual('arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa');
    expect(res.body.data.dashboardName).toEqual('_tmp_testview0002');
    expect(res.body.data.analysisArn).toEqual('arn:aws:quicksight:us-east-1:11111111:analysis/analysisaaaaaaaa');
    expect(res.body.data.analysisName).toEqual('_tmp_testview0002');
    expect(res.body.data.analysisId).toBeDefined();
    expect(res.body.data.dashboardId).toBeDefined();
    expect(res.body.data.visualIds).toBeDefined();
    expect(res.body.data.visualIds.length).toEqual(2);
    expect(res.body.data.dashboardEmbedUrl).toEqual('https://quicksight.aws.amazon.com/embed/4ui7xyvq73/studies/4a05631e-cbe6-477c-915d-1704aec9f101?isauthcode=true&identityprovider=quicksight&code=4a05631e-cbe6-477c-915d-1704aec9f101');
    expect(quickSightMock).toHaveReceivedCommandTimes(DescribeDashboardCommand, 2);
    expect(quickSightMock).toHaveReceivedCommandTimes(GenerateEmbedUrlForRegisteredUserCommand, 1);
  });

  it('funnel visual - preview - resources create failed', async () => {
    tokenMock(ddbMock, false);
    stsClientMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: '1111',
        SecretAccessKey: '22222',
        SessionToken: '33333',
        Expiration: new Date(),
      },
    });

    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(CreateAnalysisCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysisaaaaaaaa',
    });
    quickSightMock.on(CreateDashboardCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      VersionArn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa/1',
    });
    quickSightMock.on(GenerateEmbedUrlForRegisteredUserCommand).resolves({
      EmbedUrl: 'https://quicksight.aws.amazon.com/embed/4ui7xyvq73/studies/4a05631e-cbe6-477c-915d-1704aec9f101?isauthcode=true&identityprovider=quicksight&code=4a05631e-cbe6-477c-915d-1704aec9f101',
    });
    quickSightMock.on(DescribeDashboardCommand).resolvesOnce({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_IN_PROGRESS,
        },
      },
    }).resolves({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_FAILED,
        },
      },
    });

    const res = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        locale: ExploreLocales.ZH_CN,
        chartType: QuickSightChartType.FUNNEL,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toEqual(false);
    expect(quickSightMock).toHaveReceivedCommandTimes(DescribeDashboardCommand, 2);
    expect(quickSightMock).toHaveReceivedCommandTimes(GenerateEmbedUrlForRegisteredUserCommand, 0);
  });

  it('funnel visual - publish', async () => {
    tokenMock(ddbMock, false);
    stsClientMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: '1111',
        SecretAccessKey: '22222',
        SessionToken: '33333',
        Expiration: new Date(),
      },
    });

    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(DescribeDashboardDefinitionCommand).resolves({
      Definition: dashboardDef,
    });

    quickSightMock.on(UpdateAnalysisCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysis-aaaaaaaa',
    });

    quickSightMock.on(UpdateDashboardCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      VersionArn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa/1',
    });

    quickSightMock.on(UpdateDashboardPublishedVersionCommand).resolves({
      DashboardId: 'dashboard-aaaaaaaa',
    });

    const res = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PUBLISH',
        locale: ExploreLocales.ZH_CN,
        chartTitle: 'test-title',
        chartSubTitle: 'test-subtitle',
        chartType: QuickSightChartType.FUNNEL,
        viewName: 'testview00022',
        projectId: 'project01_wvzh',
        pipelineId: '87ea3d080cc34bb398275a27f4e8b113',
        appId: 'app1',
        sheetId: 'a410f75d-48d7-4699-83b8-283fce0f8f31',
        analysisId: 'analysis4e448d67-7c0d-4251-9f0f-45dc2c8dcb09',
        analysisName: 'analysis-aaaa',
        dashboardId: 'dashboard-37933899-0bb6-4e89-bced-cd8b17d3c160',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'FIXED',
        timeStart: new Date('2023-06-30'),
        timeEnd: new Date('2023-08-30'),
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.dashboardArn).toEqual('arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa');
    expect(res.body.data.analysisArn).toEqual('arn:aws:quicksight:us-east-1:11111111:analysis/analysis-aaaaaaaa');
    expect(res.body.data.analysisId).toBeDefined();
    expect(res.body.data.visualIds).toBeDefined();
    expect(res.body.data.dashboardVersion).toBeDefined();
    expect(res.body.data.dashboardEmbedUrl).toEqual('');
    expect(res.body.data.visualIds.length).toEqual(2);
    expect(quickSightMock).toHaveReceivedCommandTimes(DescribeAnalysisCommand, 0);
  });

  it('funnel visual - XSS check', async () => {
    tokenMock(ddbMock, false);
    const res = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        locale: ExploreLocales.ZH_CN,
        chartType: QuickSightChartType.FUNNEL,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: '<script>alert(1)</script>',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toEqual('Parameter verification failed.');
  });

  it('event visual - preview', async () => {
    tokenMock(ddbMock, false);
    stsClientMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: '1111',
        SecretAccessKey: '22222',
        SessionToken: '33333',
        Expiration: new Date(),
      },
    });

    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(CreateAnalysisCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysisaaaaaaaa',
    });
    quickSightMock.on(CreateDashboardCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      VersionArn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa/1',
    });
    quickSightMock.on(GenerateEmbedUrlForRegisteredUserCommand).resolves({
      EmbedUrl: 'https://quicksight.aws.amazon.com/embed/4ui7xyvq73/studies/4a05631e-cbe6-477c-915d-1704aec9f101?isauthcode=true&identityprovider=quicksight&code=4a05631e-cbe6-477c-915d-1704aec9f101',
    });
    quickSightMock.on(DescribeDashboardCommand).resolvesOnce({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_IN_PROGRESS,
        },
      },
    }).resolves({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_SUCCESSFUL,
        },
      },
    });

    const res = await request(app)
      .post('/api/reporting/event')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        locale: ExploreLocales.ZH_CN,
        chartType: QuickSightChartType.LINE,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.dashboardArn).toEqual('arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa');
    expect(res.body.data.dashboardName).toEqual('_tmp_testview0002');
    expect(res.body.data.analysisArn).toEqual('arn:aws:quicksight:us-east-1:11111111:analysis/analysisaaaaaaaa');
    expect(res.body.data.analysisName).toEqual('_tmp_testview0002');
    expect(res.body.data.analysisId).toBeDefined();
    expect(res.body.data.dashboardId).toBeDefined();
    expect(res.body.data.visualIds).toBeDefined();
    expect(res.body.data.visualIds.length).toEqual(2);
    expect(res.body.data.dashboardEmbedUrl).toEqual('https://quicksight.aws.amazon.com/embed/4ui7xyvq73/studies/4a05631e-cbe6-477c-915d-1704aec9f101?isauthcode=true&identityprovider=quicksight&code=4a05631e-cbe6-477c-915d-1704aec9f101');
    expect(quickSightMock).toHaveReceivedCommandTimes(DescribeDashboardCommand, 2);
  });

  it('event visual - preview - twice request with group condition', async () => {
    tokenMock(ddbMock, false);
    stsClientMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: '1111',
        SecretAccessKey: '22222',
        SessionToken: '33333',
        Expiration: new Date(),
      },
    });

    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(CreateDataSetCommand).callsFake(input => {
      expect(
        input.PhysicalTableMap.PhyTable1.CustomSql.Columns.length === 4,
      ).toBeTruthy();
    });
    quickSightMock.on(CreateAnalysisCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysisaaaaaaaa',
    });
    quickSightMock.on(CreateDashboardCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      VersionArn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa/1',
    });
    quickSightMock.on(GenerateEmbedUrlForRegisteredUserCommand).resolves({
      EmbedUrl: 'https://quicksight.aws.amazon.com/embed/4ui7xyvq73/studies/4a05631e-cbe6-477c-915d-1704aec9f101?isauthcode=true&identityprovider=quicksight&code=4a05631e-cbe6-477c-915d-1704aec9f101',
    });
    quickSightMock.on(DescribeDashboardCommand).resolvesOnce({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_IN_PROGRESS,
        },
      },
    }).resolves({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_SUCCESSFUL,
        },
      },
    });

    ddbMock.on(GetCommand, {
      TableName: clickStreamTableName,
      Key: {
        id: MOCK_TOKEN,
        type: 'REQUESTID',
      },
    }, true).resolves({});

    const requestBody = {
      action: 'PREVIEW',
      locale: ExploreLocales.ZH_CN,
      chartType: QuickSightChartType.LINE,
      viewName: 'testview0002',
      projectId: 'project01_wvzh',
      pipelineId: 'pipeline-1111111',
      appId: 'app1',
      sheetName: 'sheet99',
      computeMethod: 'USER_CNT',
      specifyJoinColumn: true,
      joinColumn: 'user_pseudo_id',
      conversionIntervalType: 'CUSTOMIZE',
      conversionIntervalInSeconds: 7200,
      eventAndConditions: [{
        eventName: 'add_button_click',
      },
      {
        eventName: 'note_share',
      },
      {
        eventName: 'note_export',
      }],
      timeScopeType: 'RELATIVE',
      lastN: 4,
      timeUnit: 'WK',
      groupColumn: 'week',
      groupCondition: {
        category: ConditionCategory.EVENT,
        property: 'platform',
        dataType: MetadataValueType.STRING,
      },
      dashboardCreateParameters: {
        region: 'us-east-1',
        allowDomain: 'https://example.com',
        quickSight: {
          principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
          dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
          redshiftUser: 'test_redshift_user',
        },
        redshift: {
          dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
          newServerless: {
            workgroupName: 'clickstream-project01-wvzh',
          },
        },
      },
    };
    const res = await request(app)
      .post('/api/reporting/event')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send(requestBody);
    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toEqual(true);

    const res2 = await request(app)
      .post('/api/reporting/event')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send(requestBody);
    expect(res2.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res2.statusCode).toBe(201);
    expect(res2.body.success).toEqual(true);
    expect(quickSightMock).toHaveReceivedNthSpecificCommandWith(2, CreateDataSetCommand, {});
    expect(quickSightMock).toHaveReceivedCommandTimes(DescribeDashboardCommand, 3);
  });

  it('event visual - publish', async () => {
    tokenMock(ddbMock, false);
    stsClientMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: '1111',
        SecretAccessKey: '22222',
        SessionToken: '33333',
        Expiration: new Date(),
      },
    });

    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(DescribeDashboardDefinitionCommand).resolves({
      Definition: dashboardDef,
    });

    quickSightMock.on(UpdateAnalysisCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysis-aaaaaaaa',
    });

    quickSightMock.on(UpdateDashboardCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      VersionArn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa/1',
    });

    quickSightMock.on(UpdateDashboardPublishedVersionCommand).resolves({
      DashboardId: 'dashboard-aaaaaaaa',
    });

    const res = await request(app)
      .post('/api/reporting/event')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PUBLISH',
        locale: ExploreLocales.EN_US,
        chartTitle: 'test-title',
        chartSubTitle: 'test-subtitle',
        chartType: QuickSightChartType.LINE,
        viewName: 'testview00022',
        projectId: 'project01_wvzh',
        pipelineId: '87ea3d080cc34bb398275a27f4e8b113',
        appId: 'app1',
        sheetName: 'sheet99',
        sheetId: 'a410f75d-48d7-4699-83b8-283fce0f8f31',
        analysisId: 'analysis4e448d67-7c0d-4251-9f0f-45dc2c8dcb09',
        analysisName: 'analysis-testview0004',
        dashboardId: 'dashboard-37933899-0bb6-4e89-bced-cd8b17d3c160',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'FIXED',
        timeStart: new Date('2023-06-30'),
        timeEnd: new Date('2023-08-30'),
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.dashboardArn).toEqual('arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa');
    expect(res.body.data.analysisArn).toEqual('arn:aws:quicksight:us-east-1:11111111:analysis/analysis-aaaaaaaa');
    expect(res.body.data.analysisName).toEqual('analysis-testview0004');
    expect(res.body.data.analysisId).toBeDefined();
    expect(res.body.data.visualIds).toBeDefined();
    expect(res.body.data.visualIds.length).toEqual(2);
    expect(quickSightMock).toHaveReceivedCommandTimes(DescribeAnalysisCommand, 0);
  });

  it('path visual - preview', async () => {
    tokenMock(ddbMock, false);
    stsClientMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: '1111',
        SecretAccessKey: '22222',
        SessionToken: '33333',
        Expiration: new Date(),
      },
    });

    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(CreateAnalysisCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysisaaaaaaaa',
    });
    quickSightMock.on(CreateDashboardCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      VersionArn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa/1',
    });
    quickSightMock.on(GenerateEmbedUrlForRegisteredUserCommand).resolves({
      EmbedUrl: 'https://quicksight.aws.amazon.com/embed/4ui7xyvq73/studies/4a05631e-cbe6-477c-915d-1704aec9f101?isauthcode=true&identityprovider=quicksight&code=4a05631e-cbe6-477c-915d-1704aec9f101',
    });
    quickSightMock.on(DescribeDashboardCommand).resolvesOnce({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_IN_PROGRESS,
        },
      },
    }).resolves({
      Dashboard: {
        Version: {
          Status: ResourceStatus.CREATION_SUCCESSFUL,
        },
      },
    });

    const res = await request(app)
      .post('/api/reporting/path')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        viewName: 'testview0002',
        chartType: QuickSightChartType.SANKEY,
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
        pathAnalysis: {
          sessionType: ExplorePathSessionDef.SESSION,
          nodeType: ExplorePathNodeType.EVENT,
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.dashboardArn).toEqual('arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa');
    expect(res.body.data.dashboardName).toEqual('_tmp_testview0002');
    expect(res.body.data.analysisArn).toEqual('arn:aws:quicksight:us-east-1:11111111:analysis/analysisaaaaaaaa');
    expect(res.body.data.analysisName).toEqual('_tmp_testview0002');
    expect(res.body.data.analysisId).toBeDefined();
    expect(res.body.data.dashboardId).toBeDefined();
    expect(res.body.data.visualIds).toBeDefined();
    expect(res.body.data.visualIds.length).toEqual(1);
    expect(res.body.data.dashboardEmbedUrl).toEqual('https://quicksight.aws.amazon.com/embed/4ui7xyvq73/studies/4a05631e-cbe6-477c-915d-1704aec9f101?isauthcode=true&identityprovider=quicksight&code=4a05631e-cbe6-477c-915d-1704aec9f101');
    expect(quickSightMock).toHaveReceivedCommandTimes(DescribeDashboardCommand, 2);
  });

  it('path visual - publish', async () => {
    tokenMock(ddbMock, false);
    stsClientMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: '1111',
        SecretAccessKey: '22222',
        SessionToken: '33333',
        Expiration: new Date(),
      },
    });

    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(DescribeDashboardDefinitionCommand).resolves({
      Definition: dashboardDef,
      Name: 'dashboard-test',
    });

    quickSightMock.on(UpdateAnalysisCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysis-aaaaaaaa',
    });

    quickSightMock.on(UpdateDashboardCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      VersionArn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa/1',
    });

    quickSightMock.on(UpdateDashboardPublishedVersionCommand).resolves({
      DashboardId: 'dashboard-aaaaaaaa',
    });

    quickSightMock.on(DescribeAnalysisCommand).resolves({
      Analysis: {
        Name: 'test-analysis',
      },
    });

    const res = await request(app)
      .post('/api/reporting/path')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PUBLISH',
        locale: ExploreLocales.EN_US,
        chartTitle: 'test-title',
        chartType: QuickSightChartType.SANKEY,
        chartSubTitle: 'test-subtitle',
        viewName: 'testview0002',
        sheetId: 'a410f75d-48d7-4699-83b8-283fce0f8f31',
        dashboardId: 'dashboard-37933899-0bb6-4e89-bced-cd8b17d3c160',
        analysisId: 'analysis4e448d67-7c0d-4251-9f0f-45dc2c8dcb09',
        analysisName: 'analysis-testview0004',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
        pathAnalysis: {
          platform: MetadataPlatform.ANDROID,
          sessionType: ExplorePathSessionDef.SESSION,
          nodeType: ExplorePathNodeType.SCREEN_NAME,
          nodes: ['NotepadActivity', 'NotepadExportActivity', 'NotepadShareActivity', 'NotepadPrintActivity'],
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.dashboardArn).toEqual('arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa');
    expect(res.body.data.analysisArn).toEqual('arn:aws:quicksight:us-east-1:11111111:analysis/analysis-aaaaaaaa');
    expect(res.body.data.analysisId).toBeDefined();
    expect(res.body.data.dashboardId).toBeDefined();
    expect(res.body.data.visualIds).toBeDefined();
    expect(res.body.data.visualIds.length).toEqual(1);
    expect(quickSightMock).toHaveReceivedCommandTimes(DescribeAnalysisCommand, 0);

  });

  it('retention visual - publish', async () => {
    tokenMock(ddbMock, false);
    stsClientMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: '1111',
        SecretAccessKey: '22222',
        SessionToken: '33333',
        Expiration: new Date(),
      },
    });

    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(DescribeDashboardDefinitionCommand).resolves({
      Definition: dashboardDef,
      Name: 'dashboard-test',
    });

    quickSightMock.on(UpdateAnalysisCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysis-aaaaaaaa',
    });

    quickSightMock.on(UpdateDashboardCommand).resolves({
      Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      VersionArn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa/1',
    });

    quickSightMock.on(UpdateDashboardPublishedVersionCommand).resolves({
      DashboardId: 'dashboard-aaaaaaaa',
    });
    quickSightMock.on(DescribeAnalysisCommand).resolves({
      Analysis: {
        Name: 'test-analysis',
      },
    });

    const res = await request(app)
      .post('/api/reporting/retention')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PUBLISH',
        locale: ExploreLocales.EN_US,
        chartTitle: 'test-title',
        chartSubTitle: 'test-subtitle',
        chartType: QuickSightChartType.LINE,
        viewName: 'testview0002',
        sheetId: 'a410f75d-48d7-4699-83b8-283fce0f8f31',
        dashboardId: 'dashboard-37933899-0bb6-4e89-bced-cd8b17d3c160',
        analysisId: 'analysis4e448d67-7c0d-4251-9f0f-45dc2c8dcb09',
        analysisName: 'analysis-aaaa',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
        pairEventAndConditions: [
          {
            startEvent: {
              eventName: 'add_button_click',
            },
            backEvent: {
              eventName: 'note_share',
            },
          },
          {
            startEvent: {
              eventName: 'add_button_click',
            },
            backEvent: {
              eventName: 'note_export',
            },
          },
        ],
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.dashboardArn).toEqual('arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa');
    expect(res.body.data.analysisArn).toEqual('arn:aws:quicksight:us-east-1:11111111:analysis/analysis-aaaaaaaa');
    expect(res.body.data.analysisId).toBeDefined();
    expect(res.body.data.dashboardId).toBeDefined();
    expect(res.body.data.visualIds).toBeDefined();
    expect(res.body.data.visualIds.length).toEqual(2);
    expect(quickSightMock).toHaveReceivedCommandTimes(DescribeAnalysisCommand, 0);

  });

  it('warmup - STSServiceException', async () => {
    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(ListDashboardsCommand).resolves({
      DashboardSummaryList: [{
        Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      }],
    });

    const mockFromTemporaryCredentials = fromTemporaryCredentials as jest.MockedFunction<any>;
    mockFromTemporaryCredentials.mockImplementation(() => {
      throw new STSServiceException({
        $fault: 'client',
        $metadata: {
          httpStatusCode: 403,
          requestId: 'f70ba724-8fb9-4ec1-a1ae-244ba7de5afd',
          extendedRequestId: undefined,
          cfId: undefined,
          attempts: 1,
          totalRetryDelay: 0,
        },
        name: 'AccessDenied',
      });
    });
    const res = await request(app)
      .post('/api/reporting/warmup')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        projectId: 'project01_wvzh',
        appId: 'app1',
        dashboardCreateParameters: {
          region: 'us-east-1',
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(mockFromTemporaryCredentials.mock.calls.length).toEqual(1);
    expect(mockFromTemporaryCredentials.mock.calls[0][0]).toEqual({ params: { RoleArn: 'arn:aws:iam::11111111:role/test_api_role' } });
    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toEqual('Warmup redshift serverless with request parameter error.');

  });

  it('warmup', async () => {
    redshiftClientMock.on(BatchExecuteStatementCommand).resolves({
    });
    redshiftClientMock.on(DescribeStatementCommand).resolves({
      Status: StatusString.FINISHED,
    });

    quickSightMock.on(ListDashboardsCommand).resolves({
      DashboardSummaryList: [{
        Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
      }],
    });

    const mockFromTemporaryCredentials = fromTemporaryCredentials as jest.MockedFunction<any>;
    mockFromTemporaryCredentials.mockReturnValue({
      accessKeyId: '1111',
      secretAccessKey: '22222',
      sessionToken: '33333',
    });

    const res = await request(app)
      .post('/api/reporting/warmup')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        projectId: 'project01_wvzh',
        appId: 'app1',
        dashboardCreateParameters: {
          region: 'us-east-1',
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(mockFromTemporaryCredentials.mock.calls.length).toEqual(1);
    expect(mockFromTemporaryCredentials.mock.calls[0][0]).toEqual({ params: { RoleArn: 'arn:aws:iam::11111111:role/test_api_role' } });
    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toEqual('OK');

  });

  it('clean - ThrottlingException', async () => {

    quickSightMock.on(ListDashboardsCommand).resolves({
      DashboardSummaryList: [{
        Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
        Name: '_tmp_aaaaaaa',
        CreatedTime: new Date((new Date()).getTime() - 80*60*1000),
        DashboardId: 'dashboard-aaaaaaaa',
      }],
    });

    quickSightMock.on(DeleteDashboardCommand).resolves({
      Status: 200,
      DashboardId: 'dashboard-aaaaaaaa',
    });

    quickSightMock.on(ListAnalysesCommand).resolves({
      AnalysisSummaryList: [{
        Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysis-aaaaaaaa',
        Name: '_tmp_aaaaaaa',
        CreatedTime: new Date((new Date()).getTime() - 80*60*1000),
        AnalysisId: 'analysis_aaaaaaa',
      }],
    });

    quickSightMock.on(DeleteAnalysisCommand).resolves({
      Status: 200,
      AnalysisId: 'analysis-aaaaaaaa',
    });

    quickSightMock.on(ListDataSetsCommand).resolves({
      DataSetSummaries: [{
        Arn: 'arn:aws:quicksight:us-east-1:11111111:dataset/dataset-aaaaaaaa',
        Name: '_tmp_aaaaaaa',
        CreatedTime: new Date((new Date()).getTime() - 80*60*1000),
        DataSetId: 'dataset_aaaaaaa',
      }],
    });

    quickSightMock.on(DeleteDataSetCommand).rejectsOnce( new ThrottlingException({
      message: 'Rate exceeded',
      $metadata: {},
    }));

    const res = await request(app)
      .post('/api/reporting/clean')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        region: 'us-east-1',
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);

  });

  it('clean', async () => {

    quickSightMock.on(ListDashboardsCommand).resolves({
      DashboardSummaryList: [{
        Arn: 'arn:aws:quicksight:us-east-1:11111111:dashboard/dashboard-aaaaaaaa',
        Name: '_tmp_aaaaaaa',
        CreatedTime: new Date((new Date()).getTime() - 80*60*1000),
        DashboardId: '_tmp_dashboard-aaaaaaaa',
      }],
    });

    quickSightMock.on(DeleteDashboardCommand).resolves({
      Status: 200,
      DashboardId: '_tmp_dashboard-aaaaaaaa',
    });

    quickSightMock.on(ListAnalysesCommand).resolves({
      AnalysisSummaryList: [
        {
          Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysis-aaaaaaaa',
          Name: '_tmp_aaaaaaa',
          CreatedTime: new Date((new Date()).getTime() - 80*60*1000),
          AnalysisId: '_tmp_analysis_aaaaaaa',
          Status: ResourceStatus.UPDATE_SUCCESSFUL,
        },
        {
          Arn: 'arn:aws:quicksight:us-east-1:11111111:analysis/analysis-bbbbbb',
          Name: '_tmp_bbbbbb',
          CreatedTime: new Date((new Date()).getTime() - 80*60*1000),
          AnalysisId: '_tmp_analysis_bbbbbb',
          Status: ResourceStatus.DELETED,
        },
      ],
    });

    quickSightMock.on(DeleteAnalysisCommand).resolves({
      Status: 200,
      AnalysisId: '_tmp_analysis-aaaaaaaa',
    });

    quickSightMock.on(ListDataSetsCommand).resolves({
      DataSetSummaries: [{
        Arn: 'arn:aws:quicksight:us-east-1:11111111:dataset/dataset-aaaaaaaa',
        Name: '_tmp_aaaaaaa',
        CreatedTime: new Date((new Date()).getTime() - 80*60*1000),
        DataSetId: '_tmp_dataset_aaaaaaa',
      }],
    });

    quickSightMock.on(DeleteDataSetCommand).resolves({
      Status: 200,
      DataSetId: '_tmp_dataset-aaaaaaaa',
    });

    const res = await request(app)
      .post('/api/reporting/clean')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        region: 'us-east-1',
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.deletedDashBoards[0]).toEqual('_tmp_dashboard-aaaaaaaa');
    expect(res.body.data.deletedAnalyses[0]).toEqual('_tmp_analysis-aaaaaaaa');
    expect(res.body.data.deletedDatasets[0]).toEqual('_tmp_dataset-aaaaaaaa');
    expect(quickSightMock).toHaveReceivedCommandTimes(DeleteDashboardCommand, 1);
    expect(quickSightMock).toHaveReceivedCommandTimes(DeleteAnalysisCommand, 1);
    expect(quickSightMock).toHaveReceivedCommandTimes(DeleteDataSetCommand, 1);

  });

  it('common parameter check - invalid parameter', async () => {
    const res = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        chartType: QuickSightChartType.BAR,
        viewName: 'testview0002',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });

  it('common parameter check - fixed timeScope', async () => {
    const res = await request(app)
      .post('/api/reporting/event')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        chartType: QuickSightChartType.FUNNEL,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'FIXED',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });

  it('common parameter check - relative timeScope', async () => {
    const res = await request(app)
      .post('/api/reporting/event')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        chartType: QuickSightChartType.FUNNEL,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });

  it('common parameter check - limit conditions', async () => {
    const funnelBody = {
      action: 'PREVIEW',
      chartType: QuickSightChartType.BAR,
      viewName: 'testview0002',
      projectId: 'project01_wvzh',
      pipelineId: 'pipeline-1111111',
      appId: 'app1',
      sheetName: 'sheet99',
      computeMethod: 'USER_CNT',
      specifyJoinColumn: true,
      joinColumn: 'user_pseudo_id',
      conversionIntervalType: 'CUSTOMIZE',
      conversionIntervalInSeconds: 7200,
      eventAndConditions: [
        {
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        },
      ],
      timeScopeType: 'RELATIVE',
      lastN: 4,
      timeUnit: 'WK',
      groupColumn: 'week',
      dashboardCreateParameters: {
        region: 'us-east-1',
        allowDomain: 'https://example.com',
        quickSight: {
          principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
          dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
          redshiftUser: 'test_redshift_user',
        },
        redshift: {
          dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
          newServerless: {
            workgroupName: 'clickstream-project01-wvzh',
          },
        },
      },
    };

    const eventAndConditions: EventAndCondition[] = [];

    const globalEventConditions: SQLCondition = {
      conditions: [],
      conditionOperator: 'and',
    };

    const pairEventAndConditions: PairEventAndCondition[] = [];

    for (let i = 0; i < 11; i++) {
      eventAndConditions.push({
        eventName: `event${i}`,
      });
      globalEventConditions.conditions.push({
        category: ConditionCategory.OTHER,
        property: `atrri${i}`,
        operator: '=',
        value: ['Android'],
        dataType: MetadataValueType.STRING,
      });
      pairEventAndConditions.push({
        startEvent: {
          eventName: `eventStart${i}`,
        },
        backEvent: {
          eventName: `eventEnd${i}`,
        },
      });
    }

    ddbMock.on(GetCommand, {
      TableName: clickStreamTableName,
      Key: {
        id: MOCK_TOKEN,
        type: 'REQUESTID',
      },
    }, true).resolves({});

    const res1 = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        ...funnelBody,
        eventAndConditions: eventAndConditions,
      });
    console.log({
      ...funnelBody,
      eventAndConditions: eventAndConditions,
    });

    expect(res1.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res1.statusCode).toBe(400);
    expect(res1.body.message).toBe('The maximum number of event conditions is 10.');

    const res2 = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        ...funnelBody,
        globalEventCondition: globalEventConditions,
      });

    expect(res2.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res2.statusCode).toBe(400);
    expect(res2.body.message).toBe('The maximum number of global filter conditions is 10.');

    const res3 = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        ...funnelBody,
        pairEventAndConditions: pairEventAndConditions,
      });

    expect(res3.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res3.statusCode).toBe(400);
    expect(res3.body.message).toBe('The maximum number of pair event conditions is 5.');

  });

  it('funnel analysis - relative timeScope', async () => {
    const res = await request(app)
      .post('/api/reporting/event')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        chartType: QuickSightChartType.FUNNEL,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });

  it('common parameter check - missing chart title', async () => {
    const res = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PUBLISH',
        chartType: QuickSightChartType.BAR,
        sheetId: 'a410f75d-48d7-4699-83b8-283fce0f8f31',
        dashboardId: 'dashboard-37933899-0bb6-4e89-bced-cd8b17d3c160',
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });

  it('funnel analysis parameter check - unsupported chart type', async () => {
    const res = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        chartType: QuickSightChartType.LINE,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });

  it('funnel analysis parameter check - joinColumn', async () => {
    const res = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        chartType: QuickSightChartType.FUNNEL,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });

  it('funnel analysis parameter check - eventAndConditions', async () => {
    const res = await request(app)
      .post('/api/reporting/funnel')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        chartType: QuickSightChartType.FUNNEL,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });

  it('event analysis parameter check -invalid request action', async () => {
    const res = await request(app)
      .post('/api/reporting/event')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'SAVE',
        locale: ExploreLocales.ZH_CN,
        chartType: QuickSightChartType.BAR,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });

  it('event analysis parameter check - unsupported chart type', async () => {
    const res = await request(app)
      .post('/api/reporting/event')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        locale: ExploreLocales.ZH_CN,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });


  it('path analysis parameter check - pathAnalysis', async () => {
    const res = await request(app)
      .post('/api/reporting/path')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        viewName: 'testview0002',
        chartType: QuickSightChartType.SANKEY,
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);
  });

  it('path analysis parameter check - lagSeconds', async () => {
    const res = await request(app)
      .post('/api/reporting/path')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        viewName: 'testview0002',
        chartType: QuickSightChartType.SANKEY,
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
        pathAnalysis: {
          sessionType: ExplorePathSessionDef.CUSTOMIZE,
          nodeType: ExplorePathNodeType.EVENT,
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);
  });

  it('path analysis parameter check - nodes', async () => {
    const res = await request(app)
      .post('/api/reporting/path')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        viewName: 'testview0002',
        chartType: QuickSightChartType.SANKEY,
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
        pathAnalysis: {
          sessionType: ExplorePathSessionDef.SESSION,
          nodeType: ExplorePathNodeType.PAGE_TITLE,
          platform: 'Android',
          nodes: [],
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);
  });

  it('path analysis parameter check - chart type', async () => {
    const res = await request(app)
      .post('/api/reporting/path')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        viewName: 'testview0002',
        chartType: QuickSightChartType.LINE,
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
        pathAnalysis: {
          sessionType: ExplorePathSessionDef.SESSION,
          nodeType: ExplorePathNodeType.EVENT,
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);
  });

  it('path analysis parameter check - chart type', async () => {
    const res = await request(app)
      .post('/api/reporting/path')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PREVIEW',
        viewName: 'testview0002',
        chartType: QuickSightChartType.LINE,
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
        pathAnalysis: {
          sessionType: ExplorePathSessionDef.SESSION,
          nodeType: ExplorePathNodeType.PAGE_TITLE,
          nodes: ['NotepadActivity', 'NotepadExportActivity', 'NotepadShareActivity', 'NotepadPrintActivity'],
        },
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);
  });

  it('retention analysis parameter check - pairEventAndConditions', async () => {
    const res = await request(app)
      .post('/api/reporting/retention')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PUBLISH',
        locale: ExploreLocales.EN_US,
        chartTitle: 'test-title',
        chartSubTitle: 'test-subtitle',
        chartType: QuickSightChartType.LINE,
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        sheetId: 'a410f75d-48d7-4699-83b8-283fce0f8f31',
        dashboardId: 'dashboard-37933899-0bb6-4e89-bced-cd8b17d3c160',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
        pairEventAndConditions: [
        ],
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });

  it('retention analysis parameter check - unsupported chart type', async () => {
    const res = await request(app)
      .post('/api/reporting/retention')
      .set('X-Click-Stream-Request-Id', MOCK_TOKEN)
      .send({
        action: 'PUBLISH',
        locale: ExploreLocales.EN_US,
        chartTitle: 'test-title',
        chartSubTitle: 'test-subtitle',
        chartType: QuickSightChartType.FUNNEL,
        sheetId: 'a410f75d-48d7-4699-83b8-283fce0f8f31',
        dashboardId: 'dashboard-37933899-0bb6-4e89-bced-cd8b17d3c160',
        viewName: 'testview0002',
        projectId: 'project01_wvzh',
        pipelineId: 'pipeline-1111111',
        appId: 'app1',
        sheetName: 'sheet99',
        computeMethod: 'USER_CNT',
        specifyJoinColumn: true,
        joinColumn: 'user_pseudo_id',
        conversionIntervalType: 'CUSTOMIZE',
        conversionIntervalInSeconds: 7200,
        eventAndConditions: [{
          eventName: 'add_button_click',
        },
        {
          eventName: 'note_share',
        },
        {
          eventName: 'note_export',
        }],
        timeScopeType: 'RELATIVE',
        lastN: 4,
        timeUnit: 'WK',
        groupColumn: 'week',
        dashboardCreateParameters: {
          region: 'us-east-1',
          allowDomain: 'https://example.com',
          quickSight: {
            principal: 'arn:aws:quicksight:us-east-1:11111:user/default/testuser',
            dataSourceArn: 'arn:aws:quicksight:us-east-1:11111111:datasource/clickstream_datasource_aaaaaaa',
            redshiftUser: 'test_redshift_user',
          },
          redshift: {
            dataApiRole: 'arn:aws:iam::11111111:role/test_api_role',
            newServerless: {
              workgroupName: 'clickstream-project01-wvzh',
            },
          },
        },
        pairEventAndConditions: [
          {
            startEvent: {
              eventName: 'add_button_click',
            },
            backEvent: {
              eventName: 'note_share',
            },
          },
          {
            startEvent: {
              eventName: 'add_button_click',
            },
            backEvent: {
              eventName: 'note_export',
            },
          },
        ],
      });

    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.statusCode).toBe(400);

  });


  afterAll((done) => {
    server.close();
    done();
  });
});