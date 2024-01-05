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
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  Link,
  Modal,
  SpaceBetween,
} from '@cloudscape-design/components';
import { retryPipeline, upgradePipeline } from 'apis/pipeline';
import PipelineStatus from 'components/pipeline/PipelineStatus';
import moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  COMMON_ALERT_TYPE,
  EPipelineStatus,
  SDK_LIST,
  TIME_FORMAT,
} from 'ts/const';
import { buildS3Link, buildVPCLink } from 'ts/url';
import { alertMsg, defaultStr } from 'ts/utils';

interface BasicInfoProps {
  pipelineInfo?: IPipeline;
  loadingRefresh: boolean;
  reloadPipeline: (refresh: string) => void;
}

const BasicInfo: React.FC<BasicInfoProps> = (props: BasicInfoProps) => {
  const { t } = useTranslation();
  const { pipelineInfo, loadingRefresh, reloadPipeline } = props;
  const [loadingRetry, setLoadingRetry] = useState(false);
  const [disableRetry, setDisableRetry] = useState(false);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);
  const [disableUpgrade, setDisableUpgrade] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const checkStackRollbackFailed = () => {
    const stackDetails = pipelineInfo?.stackDetails ?? [];
    for (const detail of stackDetails) {
      if (detail.stackStatus?.endsWith('_ROLLBACK_FAILED')) {
        return false;
      }
    }
    return true;
  };

  const startRetryPipeline = async () => {
    if (!checkStackRollbackFailed()) {
      alertMsg(
        t('pipeline:valid.stackRollbackFailed'),
        COMMON_ALERT_TYPE.Error as AlertType
      );
      return;
    }
    setLoadingRetry(true);
    try {
      const resData: ApiResponse<null> = await retryPipeline({
        pid: defaultStr(pipelineInfo?.projectId),
        id: defaultStr(pipelineInfo?.pipelineId),
      });
      setLoadingRetry(false);
      if (resData.success) {
        setDisableRetry(true);
        reloadPipeline('false');
      }
    } catch (error) {
      setLoadingRetry(false);
    }
  };

  const startUpgradePipeline = async () => {
    setLoadingUpgrade(true);
    try {
      const resData: ApiResponse<null> = await upgradePipeline({
        pid: defaultStr(pipelineInfo?.projectId),
        id: defaultStr(pipelineInfo?.pipelineId),
      });
      setLoadingUpgrade(false);
      if (resData.success) {
        setDisableUpgrade(true);
        reloadPipeline('false');
        setShowUpgradeModal(false);
      }
    } catch (error) {
      setLoadingUpgrade(false);
    }
  };

  return (
    <>
      <Modal
        onDismiss={() => setShowUpgradeModal(false)}
        visible={showUpgradeModal}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                onClick={() => {
                  setShowUpgradeModal(false);
                }}
                variant="link"
              >
                {t('button.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  startUpgradePipeline();
                }}
                loading={loadingUpgrade}
              >
                {t('button.confirm')}
              </Button>
            </SpaceBetween>
          </Box>
        }
        header={t('pipeline:upgrade.title')}
      >
        {t('pipeline:upgrade.tip')} <br />
        <b>{pipelineInfo?.templateInfo?.solutionVersion}</b>
      </Modal>
      <Container
        header={
          <Header
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <Button
                  iconName="refresh"
                  loading={loadingRefresh}
                  onClick={(e) => {
                    let refresh = 'false';
                    if (
                      e.detail.altKey ||
                      e.detail.ctrlKey ||
                      e.detail.metaKey ||
                      e.detail.shiftKey
                    ) {
                      refresh = 'force';
                    }
                    reloadPipeline(refresh);
                  }}
                />
                {(pipelineInfo?.statusType === EPipelineStatus.Failed ||
                  pipelineInfo?.statusType === EPipelineStatus.Warning) && (
                  <Button
                    iconName="redo"
                    disabled={disableRetry}
                    loading={loadingRetry}
                    onClick={() => {
                      startRetryPipeline();
                    }}
                  >
                    {t('button.retry')}
                  </Button>
                )}
                {(pipelineInfo?.statusType === EPipelineStatus.Active ||
                  pipelineInfo?.statusType === EPipelineStatus.Failed ||
                  pipelineInfo?.statusType === EPipelineStatus.Warning) && (
                  <Button
                    href={`/project/${pipelineInfo.projectId}/pipeline/${pipelineInfo.pipelineId}/update`}
                    iconName="edit"
                    variant="primary"
                  >
                    {t('button.edit')}
                  </Button>
                )}
                {pipelineInfo?.statusType === EPipelineStatus.Active && (
                  <Button
                    iconName="upload-download"
                    disabled={
                      disableUpgrade || pipelineInfo?.templateInfo?.isLatest
                    }
                    onClick={() => {
                      setShowUpgradeModal(true);
                    }}
                  >
                    {t('button.upgrade')}
                  </Button>
                )}
              </SpaceBetween>
            }
            variant="h2"
          >
            {t('pipeline:basic')}
          </Header>
        }
      >
        <ColumnLayout columns={4} variant="text-grid">
          <SpaceBetween direction="vertical" size="l">
            <div>
              <Box variant="awsui-key-label">
                {t('pipeline:detail.pipelineID')}
              </Box>
              <div>{pipelineInfo?.pipelineId}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">
                {t('pipeline:detail.version')}
              </Box>
              <div>
                {defaultStr(pipelineInfo?.templateInfo?.pipelineVersion, '-')}
              </div>
            </div>
          </SpaceBetween>

          <SpaceBetween direction="vertical" size="l">
            <div>
              <Box variant="awsui-key-label">{t('pipeline:detail.region')}</Box>
              <div>{pipelineInfo?.region}</div>
            </div>

            <div>
              <Box variant="awsui-key-label">{t('pipeline:detail.sdk')}</Box>
              <div>
                {SDK_LIST.find(
                  (element) => element.value === pipelineInfo?.dataCollectionSDK
                )?.label ??
                  pipelineInfo?.dataCollectionSDK ??
                  '-'}
              </div>
            </div>
          </SpaceBetween>

          <SpaceBetween direction="vertical" size="l">
            <div>
              <Box variant="awsui-key-label">{t('pipeline:detail.vpc')}</Box>
              <Link
                external
                href={buildVPCLink(
                  defaultStr(pipelineInfo?.region),
                  defaultStr(pipelineInfo?.network.vpcId)
                )}
              >
                {pipelineInfo?.network.vpcId}
              </Link>
            </div>
            <div>
              <Box variant="awsui-key-label">
                {t('pipeline:detail.s3Bucket')}
              </Box>
              <Link
                external
                href={buildS3Link(
                  defaultStr(pipelineInfo?.region),
                  defaultStr(pipelineInfo?.bucket.name),
                  `clickstream/${pipelineInfo?.projectId}/data/`
                )}
              >
                {pipelineInfo?.bucket.name}
              </Link>
            </div>
          </SpaceBetween>

          <SpaceBetween direction="vertical" size="l">
            <div>
              <Box variant="awsui-key-label">{t('pipeline:status')}</Box>
              <div>
                <PipelineStatus
                  pipelineId={pipelineInfo?.pipelineId}
                  projectId={pipelineInfo?.projectId}
                  status={pipelineInfo?.statusType}
                  updatePipelineStatus={(status) => {
                    reloadPipeline('false');
                  }}
                />
              </div>
            </div>

            {pipelineInfo?.pipelineId && (
              <div>
                <Box variant="awsui-key-label">
                  {t('pipeline:detail.creationTime')}
                </Box>
                <div>{moment(pipelineInfo?.createAt).format(TIME_FORMAT)}</div>
              </div>
            )}
            {pipelineInfo?.pipelineId && pipelineInfo?.updateAt && (
              <div>
                <Box variant="awsui-key-label">
                  {t('pipeline:detail.updateTime')}
                </Box>
                <div>
                  {moment(parseInt(pipelineInfo.updateAt.toString())).format(
                    TIME_FORMAT
                  )}
                </div>
              </div>
            )}
          </SpaceBetween>
        </ColumnLayout>
      </Container>
    </>
  );
};

export default BasicInfo;
