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

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { CdkCustomResourceCallback, CdkCustomResourceResponse } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import mockfs from 'mock-fs';
import { handler } from '../../../../src/streaming-ingestion/lambdas/custom-resource/streaming-schemas';
import 'aws-sdk-client-mock-jest';
import { STREAMING_SCHEMA_SUFFIX } from '../../../../src/streaming-ingestion/private/constant';
import { getSinkStreamName } from '../../../../src/streaming-ingestion/private/utils';
import { schemaDefs } from '../../../../src/streaming-ingestion/redshift/sql-def';
import { getMockContext } from '../../../common/lambda-context';
import { basicCloudFormationEvent } from '../../../common/lambda-events';
import { loadSQLFromFS } from '../../../fs-utils';

describe('Custom resource - manage stream schema in Redshift', () => {

  const context = getMockContext();
  const callback: CdkCustomResourceCallback = async (_response) => {/** do nothing */};

  const s3Mock = mockClient(S3Client);
  const sfnMock = mockClient(SFNClient);

  const projectId = 'project1';
  const streamingRoleArn = 'arn:aws:iam::555555555555:role/redshift-streaming';
  const identifier = 'identifier1';
  const biUsername = 'bi_user_name';
  const basicEvent = {
    ...basicCloudFormationEvent,
    ResourceProperties: {
      ...basicCloudFormationEvent.ResourceProperties,
      ServiceToken: 'token-1',
      projectId,
      appIds: '',
      streamingRoleArn,
      schemaDefs: schemaDefs,
      identifier,
      biUsername,
      databaseName: projectId,
    },
  };

  beforeEach(async () => {
    s3Mock.reset();
    sfnMock.reset();

    const rootPath = __dirname + '/../../../../src/streaming-ingestion/redshift/sqls/';
    mockfs({
      ...loadSQLFromFS(schemaDefs, rootPath),
    });
  });

  afterEach(mockfs.restore);

  test('no appIds are given', async () => {
    const emptyAppIds = basicEvent;

    const resp = await handler(emptyAppIds, context, callback) as CdkCustomResourceResponse;
    expect(resp.Status).toEqual('SUCCESS');

    expect(s3Mock).toHaveReceivedCommandTimes(PutObjectCommand, 0);
    expect(sfnMock).toHaveReceivedCommandTimes(StartExecutionCommand, 0);
  });

  test('one app is registered', async () => {
    const appId = 'app1';
    const oneAppId = {
      ...basicEvent,
      ResourceProperties: {
        ...basicEvent.ResourceProperties,
        appIds: appId,
      },
    };
    const streamName = getSinkStreamName(projectId, appId, 'identifier1');

    s3Mock.on(PutObjectCommand).resolves({
    });
    sfnMock.on(StartExecutionCommand).resolves({
    });

    const resp = await handler(oneAppId, context, callback) as CdkCustomResourceResponse;
    expect(resp.Status).toEqual('SUCCESS');

    const streamSchemaName = `${appId}${STREAMING_SCHEMA_SUFFIX}`;
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(1, PutObjectCommand, {
      Body: `CREATE EXTERNAL SCHEMA IF NOT EXISTS ${streamSchemaName} FROM KINESIS IAM_ROLE '${streamingRoleArn}'`,
    });
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(2, PutObjectCommand, {
      Body: expect.stringContaining(`CREATE MATERIALIZED VIEW ${appId}.ods_events_streaming_mv`),
    });
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(2, PutObjectCommand, {
      Body: expect.stringContaining(`FROM ${streamSchemaName}.${streamName}`),
    });
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(3, PutObjectCommand, {
      Body: expect.stringContaining(`CREATE OR REPLACE VIEW ${appId}.ods_events_streaming_view as`),
    });
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(3, PutObjectCommand, {
      Body: expect.stringContaining(`from ${appId}.ods_events_streaming_mv;`),
    });
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(4, PutObjectCommand, {
      Body: expect.stringContaining(`GRANT SELECT ON ${appId}.ods_events_streaming_view TO ${biUsername};`),
    });
    expect(sfnMock).toHaveReceivedCommandTimes(StartExecutionCommand, 1);
    expect(sfnMock).toHaveReceivedNthCommandWith(1, StartExecutionCommand, {
      stateMachineArn: expect.any(String),
      name: expect.stringMatching(`^${appId}-`),
      input: expect.stringContaining('s3://'),
    },
    );
  });

  test('another app is registered', async ()=>{
    const oldAppId = 'app1';
    const newAppId = 'app2';
    const addNewAppId = {
      ...basicEvent,
      ResourceProperties: {
        ...basicEvent.ResourceProperties,
        appIds: [oldAppId, newAppId].join(','),
      },
    };
    const streamName = getSinkStreamName(projectId, newAppId, 'identifier1');

    s3Mock.on(PutObjectCommand).resolves({
    });
    sfnMock.on(StartExecutionCommand).resolves({
    });

    const resp = await handler(addNewAppId, context, callback) as CdkCustomResourceResponse;
    expect(resp.Status).toEqual('SUCCESS');

    expect(s3Mock).toHaveReceivedCommandTimes(PutObjectCommand, 8);
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(1, PutObjectCommand, {
      Body: `CREATE EXTERNAL SCHEMA IF NOT EXISTS ${oldAppId + STREAMING_SCHEMA_SUFFIX} FROM KINESIS IAM_ROLE '${streamingRoleArn}'`,
    });
    const streamSchemaName = `${newAppId}${STREAMING_SCHEMA_SUFFIX}`;
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(5, PutObjectCommand, {
      Body: `CREATE EXTERNAL SCHEMA IF NOT EXISTS ${streamSchemaName} FROM KINESIS IAM_ROLE '${streamingRoleArn}'`,
    });
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(6, PutObjectCommand, {
      Body: expect.stringContaining(`CREATE MATERIALIZED VIEW ${newAppId}.ods_events_streaming_mv`),
    });
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(6, PutObjectCommand, {
      Body: expect.stringContaining(`FROM ${streamSchemaName}.${streamName}`),
    });
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(7, PutObjectCommand, {
      Body: expect.stringContaining(`CREATE OR REPLACE VIEW ${newAppId}.ods_events_streaming_view as`),
    });
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(7, PutObjectCommand, {
      Body: expect.stringContaining(`from ${newAppId}.ods_events_streaming_mv;`),
    });
    expect(s3Mock).toHaveReceivedNthSpecificCommandWith(8, PutObjectCommand, {
      Body: expect.stringContaining(`GRANT SELECT ON ${newAppId}.ods_events_streaming_view TO ${biUsername};`),
    });
    expect(sfnMock).toHaveReceivedCommandTimes(StartExecutionCommand, 2);
  });
});