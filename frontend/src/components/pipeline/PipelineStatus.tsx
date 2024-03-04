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

import { PipelineStatusDetail, PipelineStatusType } from '@aws/clickstream-base-lib';
import {
  Link,
  Popover,
  SpaceBetween,
  Spinner,
  StatusIndicator,
  StatusIndicatorProps,
} from '@cloudscape-design/components';
import { getPipelineDetail } from 'apis/pipeline';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CLOUDFORMATION_STATUS_MAP } from 'ts/const';
import { buildCloudFormationStackLink } from 'ts/url';
import { defaultStr } from 'ts/utils';
import { IExtPipeline } from 'types/pipeline';

const CHECK_TIME_INTERVAL = 5000;

interface PipelineStatusProps {
  projectId?: string;
  pipelineId?: string;
  status?: string;
  updatePipelineStatus?: (status: PipelineStatusType) => void;
}
const PipelineStatus: React.FC<PipelineStatusProps> = (
  props: PipelineStatusProps
) => {
  const { status, projectId, updatePipelineStatus } = props;
  const { t } = useTranslation();
  let intervalId: any = 0;
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState(status);
  const [pipelineRegion, setPipelineRegion] = useState('');
  const [pipelineTemplateVersion, setPipelineTemplateVersion] = useState('');
  const [stackStatusList, setStackStatusList] = useState<PipelineStatusDetail[]>([]);
  const [displayStatus, setDisplayStatus] = useState('');
  const [indicatorType, setIndicatorType] =
    useState<StatusIndicatorProps.Type>('loading');
  useEffect(() => {
    let tmpDisplayStatus = '';
    let tmpIndicatorType: StatusIndicatorProps.Type;
    if (
      updatedStatus === PipelineStatusType.CREATING ||
      updatedStatus === PipelineStatusType.UPDATING ||
      updatedStatus === PipelineStatusType.DELETING
    ) {
      tmpIndicatorType = 'loading';
      if (updatedStatus === PipelineStatusType.CREATING) {
        tmpDisplayStatus = 'status.creating';
      }
      if (updatedStatus === PipelineStatusType.UPDATING) {
        tmpDisplayStatus = 'status.updating';
      }
      if (updatedStatus === PipelineStatusType.DELETING) {
        tmpDisplayStatus = 'status.deleting';
      }
    } else if (updatedStatus === PipelineStatusType.FAILED) {
      tmpIndicatorType = 'error';
      tmpDisplayStatus = 'status.failed';
    } else if (updatedStatus === PipelineStatusType.ACTIVE) {
      tmpIndicatorType = 'success';
      tmpDisplayStatus = 'status.active';
    } else if (updatedStatus === PipelineStatusType.WARNING) {
      tmpIndicatorType = 'warning';
      tmpDisplayStatus = 'status.warning';
    } else if (updatedStatus === PipelineStatusType.DELETED) {
      tmpIndicatorType = 'stopped';
      tmpDisplayStatus = 'status.deleted';
    } else {
      tmpIndicatorType = 'pending';
      tmpDisplayStatus = 'status.pending';
    }
    setDisplayStatus(tmpDisplayStatus);
    setIndicatorType(tmpIndicatorType);
  }, [updatedStatus]);

  const checkStatus = async (isRefresh?: boolean) => {
    if (!isRefresh) {
      setLoadingStatus(true);
    }
    try {
      const { success, data }: ApiResponse<IExtPipeline> =
        await getPipelineDetail({
          projectId: defaultStr(projectId),
        });
      if (success) {
        setUpdatedStatus(data.statusType);
        setPipelineRegion(data.region);
        setPipelineTemplateVersion(data.templateVersion ?? '');
        setStackStatusList(data.stackDetails ?? []);
        if (
          data.statusType === PipelineStatusType.ACTIVE ||
          data.statusType === PipelineStatusType.FAILED ||
          data.statusType === PipelineStatusType.WARNING
        ) {
          window.clearInterval(intervalId);
          // update pipeline status
          updatePipelineStatus?.(data.statusType);
        }
        setLoadingStatus(false);
      }
    } catch (error) {
      setLoadingStatus(false);
      window.clearInterval(intervalId);
    }
  };

  useEffect(() => {
    intervalId = setInterval(() => {
      checkStatus(true);
    }, CHECK_TIME_INTERVAL);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    checkStatus();
    if (status) {
      setUpdatedStatus(status);
    }
  }, [status]);

  const getStackStatusIndicatorType = (
    stackVersion: string,
    stackStatus: string
  ) => {
    let stackIndicatorType: StatusIndicatorProps.Type;
    if (
      pipelineTemplateVersion !== '' &&
      pipelineTemplateVersion !== stackVersion &&
      updatedStatus !== PipelineStatusType.CREATING &&
      updatedStatus !== PipelineStatusType.UPDATING &&
      updatedStatus !== PipelineStatusType.DELETING
    ) {
      stackIndicatorType = 'warning';
    } else {
      stackIndicatorType = CLOUDFORMATION_STATUS_MAP[stackStatus] ?? 'pending';
    }
    return stackIndicatorType;
  };

  return (
    <Popover
      dismissButton={false}
      position="right"
      size="large"
      triggerType="custom"
      content={
        loadingStatus ? (
          <Spinner />
        ) : (
          <SpaceBetween direction="vertical" size="xs">
            {stackStatusList.map((element) => {
              return (
                <div className="flex flex-1" key={element.stackType}>
                  <StatusIndicator
                    type={getStackStatusIndicatorType(
                      element.stackTemplateVersion,
                      defaultStr(element.stackStatus)
                    )}
                  >
                    <b>{element.stackType}</b>(
                    {element.stackStatus ?? t('status.pending')})
                    {element.stackStatus && (
                      <span className="ml-5">
                        <Link
                          external
                          href={buildCloudFormationStackLink(
                            pipelineRegion,
                            element.stackName
                          )}
                        >
                          {t('pipeline:detail.stackDetails')}
                        </Link>
                      </span>
                    )}
                  </StatusIndicator>
                </div>
              );
            })}
          </SpaceBetween>
        )
      }
    >
      <StatusIndicator type={indicatorType}>
        <span className="stack-status">{t(displayStatus)}</span>
      </StatusIndicator>
    </Popover>
  );
};

export default PipelineStatus;
