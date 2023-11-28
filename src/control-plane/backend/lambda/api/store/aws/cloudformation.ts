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

import { Category, CloudFormationClient, DescribeStacksCommand, ListTypesCommand, StackStatus, TypeSummary, paginateListTypes } from '@aws-sdk/client-cloudformation';
import { aws_sdk_client_common_config } from '../../common/sdk-client-config-ln';
import { PipelineStackType, PipelineStatusDetail } from '../../common/types';
import { getVersionFromTags } from '../../common/utils';

export const describeStack = async (region: string, stackName: string) => {
  try {
    const cloudFormationClient = new CloudFormationClient({
      ...aws_sdk_client_common_config,
      region,
    });
    const params: DescribeStacksCommand = new DescribeStacksCommand({
      StackName: stackName,
    });
    const result = await cloudFormationClient.send(params);
    if (result.Stacks) {
      return result.Stacks[0];
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
};

export const getStacksDetailsByNames = async (region: string, stackNames: string[]) => {
  try {
    const stackDetails: PipelineStatusDetail[] = [];
    for (let stackName of stackNames) {
      const stack = await describeStack(region, stackName);
      stackDetails.push({
        stackName: stackName,
        stackType: stackName.split('-')[1] as PipelineStackType,
        stackStatus: stack?.StackStatus as StackStatus,
        stackStatusReason: stack?.StackStatusReason ?? '',
        stackTemplateVersion: getVersionFromTags(stack?.Tags),
        outputs: stack?.Outputs ?? [],
      });
    }
    return stackDetails;
  } catch (error) {
    return [];
  }
};

export const listAWSResourceTypes = async (region: string, typeNamePrefix: string) => {
  try {
    const cloudFormationClient = new CloudFormationClient({
      ...aws_sdk_client_common_config,
      region,
    });
    const records: TypeSummary[] = [];
    for await (const page of paginateListTypes({ client: cloudFormationClient }, {
      Visibility: 'PUBLIC',
      Filters: {
        TypeNamePrefix: typeNamePrefix,
        Category: Category.AWS_TYPES,
      },
    })) {
      records.push(...page.TypeSummaries as TypeSummary[]);
    }
    return records;
  } catch (error) {
    return [];
  }
};
