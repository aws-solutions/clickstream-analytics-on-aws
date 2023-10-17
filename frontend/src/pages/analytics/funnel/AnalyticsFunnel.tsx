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
  Button,
  ColumnLayout,
  Container,
  Header,
  Input,
  Link,
  Popover,
  SegmentedControl,
  SegmentedControlProps,
  Select,
  SelectProps,
  SpaceBetween,
} from '@cloudscape-design/components';
import { DateRangePickerProps } from '@cloudscape-design/components/date-range-picker/interfaces';
import { previewFunnel } from 'apis/analytics';
import ExtendIcon from 'components/common/ExtendIcon';
import Loading from 'components/common/Loading';
import InfoTitle from 'components/common/title/InfoTitle';
import SectionTitle from 'components/common/title/SectionTitle';
import {
  CategoryItemType,
  DEFAULT_CONDITION_DATA,
  DEFAULT_EVENT_ITEM,
  IEventAnalyticsItem,
  INIT_SEGMENTATION_DATA,
  SegmentationFilterDataType,
} from 'components/eventselect/AnalyticsType';
import EventsSelect from 'components/eventselect/EventSelect';
import SegmentationFilter from 'components/eventselect/SegmentationFilter';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { COMMON_ALERT_TYPE } from 'ts/const';
import {
  ExploreComputeMethod,
  ExploreConversionIntervalType,
  ExploreRequestAction,
  ExploreGroupColumn,
  QuickSightChartType,
} from 'ts/explore-types';
import { alertMsg, defaultStr, generateStr } from 'ts/utils';
import {
  parametersConvertToCategoryItemType,
  validEventAnalyticsItem,
  getDateRange,
  getEventAndConditions,
  getDashboardCreateParameters,
  getIntervalInSeconds,
  getGlobalEventCondition,
  getLngFromLocalStorage,
} from '../analytics-utils';
import AttributeGroup from '../comps/AttributeGroup';
import ExploreDateRangePicker from '../comps/ExploreDateRangePicker';
import ExploreEmbedFrame from '../comps/ExploreEmbedFrame';
import SaveToDashboardModal from '../comps/SelectDashboardModal';

interface AnalyticsFunnelProps {
  loading: boolean;
  loadFunc: () => void;
  pipeline: IPipeline;
  metadataEvents: IMetadataEvent[];
  metadataEventParameters: IMetadataEventParameter[];
  metadataUserAttributes: IMetadataUserAttribute[];
  categoryEvents: CategoryItemType[];
  presetParameters: CategoryItemType[];
}

const AnalyticsFunnel: React.FC<AnalyticsFunnelProps> = (
  props: AnalyticsFunnelProps
) => {
  const { t } = useTranslation();
  const {
    loading,
    pipeline,
    metadataEvents,
    metadataUserAttributes,
    categoryEvents,
    presetParameters,
  } = props;
  const { appId } = useParams();
  const [loadingData, setLoadingData] = useState(loading);
  const [loadingChart, setLoadingChart] = useState(false);
  const [selectDashboardModalVisible, setSelectDashboardModalVisible] =
    useState(false);
  const [exploreEmbedUrl, setExploreEmbedUrl] = useState('');

  const defaultChartTypeOption = QuickSightChartType.FUNNEL;
  const chartTypeOptions: SegmentedControlProps.Option[] = [
    {
      id: QuickSightChartType.FUNNEL,
      iconSvg: <ExtendIcon icon="BsFilter" color="black" />,
    },
    {
      id: QuickSightChartType.BAR,
      iconSvg: <ExtendIcon icon="BsBarChartFill" color="black" />,
    },
  ];
  const [chartType, setChartType] = useState(defaultChartTypeOption);

  const defaultComputeMethodOption: SelectProps.Option = {
    value: ExploreComputeMethod.USER_ID_CNT,
    label: defaultStr(t('analytics:options.userNumber'), 'User number'),
  };

  const computeMethodOptions: SelectProps.Options = [
    defaultComputeMethodOption,
    {
      value: ExploreComputeMethod.EVENT_CNT,
      label: defaultStr(t('analytics:options.eventNumber'), 'Event number'),
    },
  ];

  const customWindowType = {
    value: ExploreConversionIntervalType.CUSTOMIZE,
    label: t('analytics:options.customWindow'),
  };

  const windowTypeOptions = [
    customWindowType,
    {
      value: ExploreConversionIntervalType.CURRENT_DAY,
      label: t('analytics:options.theDayWindow'),
    },
  ];

  const minuteWindowUnitOption = {
    value: 'minute',
    label: t('analytics:options.minuteWindowUnit'),
  };

  const windowUnitOptions = [
    { value: 'second', label: t('analytics:options.secondWindowUnit') },
    minuteWindowUnitOption,
    { value: 'hour', label: t('analytics:options.hourWindowUnit') },
    { value: 'day', label: t('analytics:options.dayWindowUnit') },
  ];

  const getEventParameters = (eventName?: string) => {
    const event = metadataEvents.find((item) => item.name === eventName);
    if (event) {
      return event.associatedParameters;
    }
    return [];
  };

  const [dateRangeValue, setDateRangeValue] =
    React.useState<DateRangePickerProps.Value>({
      type: 'relative',
      amount: 1,
      unit: 'month',
    });

  const [timeGranularity, setTimeGranularity] =
    React.useState<SelectProps.Option>({
      value: ExploreGroupColumn.DAY,
      label: t('analytics:options.dayTimeGranularity') ?? '',
    });
  const [selectedMetric, setSelectedMetric] =
    useState<SelectProps.Option | null>(defaultComputeMethodOption);

  const [windowValue, setWindowValue] = useState<string>('10');

  const [selectedWindowType, setSelectedWindowType] =
    useState<SelectProps.Option | null>(customWindowType);

  const [selectedWindowUnit, setSelectedWindowUnit] =
    useState<SelectProps.Option | null>(minuteWindowUnitOption);

  const [associateParameterChecked, setAssociateParameterChecked] =
    useState<boolean>(true);

  const [eventOptionData, setEventOptionData] = useState<IEventAnalyticsItem[]>(
    [
      {
        ...DEFAULT_EVENT_ITEM,
        isMultiSelect: false,
        enableChangeRelation: true,
      },
    ]
  );

  const [segmentationOptionData, setSegmentationOptionData] =
    useState<SegmentationFilterDataType>({
      ...INIT_SEGMENTATION_DATA,
      conditionOptions: presetParameters,
    });

  const [groupOption, setGroupOption] = useState<SelectProps.Option | null>(
    null
  );

  const getFunnelRequest = (
    action: ExploreRequestAction,
    dashboardId?: string,
    dashboardName?: string,
    sheetId?: string,
    sheetName?: string,
    chartTitle?: string,
    chartSubTitle?: string
  ) => {
    const funnelId = generateStr(6);
    const parameters = getDashboardCreateParameters(
      pipeline,
      window.location.origin
    );
    if (!parameters) {
      return;
    }
    const dateRangeParams = getDateRange(dateRangeValue);
    let saveParams = {};
    if (action === ExploreRequestAction.PUBLISH) {
      saveParams = {
        dashboardId: dashboardId,
        dashboardName: dashboardName,
        sheetId: sheetId,
        sheetName: sheetName,
        chartTitle: chartTitle,
        chartSubTitle: chartSubTitle,
      };
    }
    const body: IExploreRequest = {
      action: action,
      chartType: chartType,
      locale: getLngFromLocalStorage(),
      projectId: pipeline.projectId,
      pipelineId: pipeline.pipelineId,
      appId: appId ?? '',
      sheetName: `funnel_sheet_${funnelId}`,
      viewName: `funnel_view_${funnelId}`,
      dashboardCreateParameters: parameters,
      computeMethod: selectedMetric?.value ?? ExploreComputeMethod.USER_ID_CNT,
      specifyJoinColumn: associateParameterChecked,
      joinColumn: 'user_pseudo_id',
      conversionIntervalType:
        selectedWindowType?.value ?? ExploreConversionIntervalType.CURRENT_DAY,
      conversionIntervalInSeconds: getIntervalInSeconds(
        selectedWindowType,
        selectedWindowUnit,
        windowValue
      ),
      eventAndConditions: getEventAndConditions(eventOptionData),
      globalEventCondition: getGlobalEventCondition(segmentationOptionData),
      timeScopeType: dateRangeParams?.timeScopeType,
      groupColumn: timeGranularity.value,
      ...dateRangeParams,
      ...saveParams,
    };
    return body;
  };

  const clickPreview = async () => {
    if (
      eventOptionData.length === 0 ||
      !validEventAnalyticsItem(eventOptionData[0])
    ) {
      return;
    }
    try {
      const body = getFunnelRequest(ExploreRequestAction.PREVIEW);
      if (!body) {
        alertMsg(
          t('analytics:valid.funnelPipelineVersionError'),
          COMMON_ALERT_TYPE.Error as AlertType
        );
        return;
      }
      setExploreEmbedUrl('');
      setLoadingData(true);
      setLoadingChart(true);
      const { success, data }: ApiResponse<any> = await previewFunnel(body);
      setLoadingData(false);
      setLoadingChart(false);
      if (success && data.dashboardEmbedUrl) {
        setExploreEmbedUrl(data.dashboardEmbedUrl);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const resetConfig = async () => {
    setLoadingData(true);
    setSelectedMetric({
      value: ExploreComputeMethod.USER_ID_CNT,
      label: t('analytics:options.userNumber') ?? 'User number',
    });
    setSelectedWindowType(customWindowType);
    setSelectedWindowUnit({
      value: 'minute',
      label: t('analytics:options.minuteWindowUnit') ?? '',
    });
    setAssociateParameterChecked(true);
    setEventOptionData([
      {
        ...DEFAULT_EVENT_ITEM,
        isMultiSelect: false,
        enableChangeRelation: true,
      },
    ]);
    setSegmentationOptionData({
      ...INIT_SEGMENTATION_DATA,
      conditionOptions: presetParameters,
    });
    setDateRangeValue({
      type: 'relative',
      amount: 1,
      unit: 'month',
    });
    setTimeGranularity({
      value: ExploreGroupColumn.DAY,
      label: t('analytics:options.dayTimeGranularity') ?? '',
    });
    setExploreEmbedUrl('');
    setLoadingData(false);
  };

  const saveToDashboard = async (
    dashboardId: string,
    dashboardName: string,
    sheetId: string,
    sheetName: string,
    chartTitle: string,
    chartSubTitle: string
  ) => {
    if (
      eventOptionData.length === 0 ||
      !validEventAnalyticsItem(eventOptionData[0])
    ) {
      return;
    }
    try {
      const body = getFunnelRequest(
        ExploreRequestAction.PUBLISH,
        dashboardId,
        dashboardName,
        sheetId,
        sheetName,
        chartTitle,
        chartSubTitle
      );
      if (!body) {
        alertMsg(
          t('analytics:valid.funnelPipelineVersionError'),
          COMMON_ALERT_TYPE.Error as AlertType
        );
        return;
      }
      setLoadingData(true);
      const { success }: ApiResponse<any> = await previewFunnel(body);
      if (success) {
        setSelectDashboardModalVisible(false);
      }
    } catch (error) {
      console.log(error);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    setSegmentationOptionData({
      ...INIT_SEGMENTATION_DATA,
      conditionOptions: presetParameters,
    });
  }, [presetParameters]);

  useEffect(() => {
    clickPreview();
  }, [timeGranularity, dateRangeValue, chartType]);

  return (
    <>
      <SpaceBetween direction="vertical" size="l">
        <Container
          header={
            <Header
              variant="h2"
              info={
                <Popover
                  triggerType="custom"
                  content={t('analytics:information.funnelInfo')}
                >
                  <Link variant="info">{t('info')}</Link>
                </Popover>
              }
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    iconName="refresh"
                    onClick={resetConfig}
                    loading={loadingData}
                  >
                    {t('button.reset')}
                  </Button>
                  <Button
                    variant="primary"
                    loading={loadingData}
                    onClick={() => {
                      setSelectDashboardModalVisible(true);
                    }}
                  >
                    {t('button.saveToDashboard')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('analytics:explore.funnelAnalysis')}
            </Header>
          }
        >
          <div className="cs-analytics-config">
            <SpaceBetween direction="vertical" size="xs">
              <InfoTitle
                title={t('analytics:labels.metrics')}
                popoverDescription={t(
                  'analytics:information.funnelMetricsInfo'
                )}
              />
              <Select
                selectedOption={selectedMetric}
                options={computeMethodOptions}
                onChange={(event) => {
                  setSelectedMetric(event.detail.selectedOption);
                }}
              />
            </SpaceBetween>
          </div>
          <br />
          <ColumnLayout columns={2} variant="text-grid">
            <SpaceBetween direction="vertical" size="xs">
              <SectionTitle
                type="event"
                title={t('analytics:labels.funnelSteps')}
              />
              <div className="mt-10">
                <SpaceBetween direction="vertical" size="xs">
                  <InfoTitle
                    title={t('analytics:labels.window')}
                    popoverDescription={t(
                      'analytics:information.funnelWindowInfo'
                    )}
                  />
                  <div className="cs-analytics-window">
                    <div className="cs-analytics-window-type">
                      <Select
                        selectedOption={selectedWindowType}
                        options={windowTypeOptions}
                        onChange={(event) => {
                          setSelectedWindowType(event.detail.selectedOption);
                        }}
                      />
                    </div>
                    {selectedWindowType?.value === customWindowType?.value ? (
                      <>
                        <div className="cs-analytics-window-value">
                          <Input
                            type="number"
                            placeholder="10"
                            value={windowValue}
                            onChange={(event) => {
                              setWindowValue(event.detail.value);
                            }}
                          />
                        </div>
                        <div className="cs-analytics-window-unit">
                          <Select
                            selectedOption={selectedWindowUnit}
                            options={windowUnitOptions}
                            onChange={(event) => {
                              setSelectedWindowUnit(
                                event.detail.selectedOption
                              );
                            }}
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                </SpaceBetween>
                <br />
                <EventsSelect
                  data={eventOptionData}
                  eventOptionList={categoryEvents}
                  addEventButtonLabel={t('common:button.addFunnelStep')}
                  addNewEventAnalyticsItem={() => {
                    setEventOptionData((prev) => {
                      const preEventList = cloneDeep(prev);
                      return [
                        ...preEventList,
                        {
                          ...DEFAULT_EVENT_ITEM,
                          isMultiSelect: false,
                          enableChangeRelation: true,
                        },
                      ];
                    });
                  }}
                  removeEventItem={(index) => {
                    setEventOptionData((prev) => {
                      const dataObj = cloneDeep(prev);
                      return dataObj.filter((item, eIndex) => eIndex !== index);
                    });
                  }}
                  addNewConditionItem={(index: number) => {
                    setEventOptionData((prev) => {
                      const dataObj = cloneDeep(prev);
                      dataObj[index].conditionList.push(DEFAULT_CONDITION_DATA);
                      return dataObj;
                    });
                  }}
                  removeEventCondition={(eventIndex, conditionIndex) => {
                    setEventOptionData((prev) => {
                      const dataObj = cloneDeep(prev);
                      const newCondition = dataObj[
                        eventIndex
                      ].conditionList.filter((item, i) => i !== conditionIndex);
                      dataObj[eventIndex].conditionList = newCondition;
                      return dataObj;
                    });
                  }}
                  changeConditionCategoryOption={(
                    eventIndex,
                    conditionIndex,
                    category
                  ) => {
                    setEventOptionData((prev) => {
                      const dataObj = cloneDeep(prev);
                      dataObj[eventIndex].conditionList[
                        conditionIndex
                      ].conditionOption = category;
                      dataObj[eventIndex].conditionList[
                        conditionIndex
                      ].conditionValue = [];
                      return dataObj;
                    });
                  }}
                  changeConditionOperator={(
                    eventIndex,
                    conditionIndex,
                    operator
                  ) => {
                    setEventOptionData((prev) => {
                      const dataObj = cloneDeep(prev);
                      dataObj[eventIndex].conditionList[
                        conditionIndex
                      ].conditionOperator = operator;
                      return dataObj;
                    });
                  }}
                  changeConditionValue={(eventIndex, conditionIndex, value) => {
                    setEventOptionData((prev) => {
                      const dataObj = cloneDeep(prev);
                      dataObj[eventIndex].conditionList[
                        conditionIndex
                      ].conditionValue = value;
                      return dataObj;
                    });
                  }}
                  changeCurCalcMethodOption={(eventIndex, method) => {
                    setEventOptionData((prev) => {
                      const dataObj = cloneDeep(prev);
                      dataObj[eventIndex].calculateMethodOption = method;
                      return dataObj;
                    });
                  }}
                  changeCurCategoryOption={(eventIndex, category) => {
                    const eventName = category?.name;
                    const eventParameters = getEventParameters(eventName);
                    const parameterOption = parametersConvertToCategoryItemType(
                      metadataUserAttributes,
                      eventParameters
                    );
                    setEventOptionData((prev) => {
                      const dataObj = cloneDeep(prev);
                      dataObj[eventIndex].selectedEventOption = category;
                      dataObj[eventIndex].conditionOptions = parameterOption;
                      return dataObj;
                    });
                  }}
                  changeCurRelationShip={(eventIndex, relation) => {
                    setEventOptionData((prev) => {
                      const dataObj = cloneDeep(prev);
                      dataObj[eventIndex].conditionRelationShip = relation;
                      return dataObj;
                    });
                  }}
                />
              </div>
            </SpaceBetween>
            <SpaceBetween direction="vertical" size="xs">
              <SectionTitle type="filter" />
              <SegmentationFilter
                segmentationData={segmentationOptionData}
                addNewConditionItem={() => {
                  setSegmentationOptionData((prev) => {
                    const dataObj = cloneDeep(prev);
                    dataObj.data.push(DEFAULT_CONDITION_DATA);
                    return dataObj;
                  });
                }}
                removeEventCondition={(index) => {
                  setSegmentationOptionData((prev) => {
                    const dataObj = cloneDeep(prev);
                    const newCondition = dataObj.data.filter(
                      (item, i) => i !== index
                    );
                    dataObj.data = newCondition;
                    return dataObj;
                  });
                }}
                changeConditionCategoryOption={(index, category) => {
                  setSegmentationOptionData((prev) => {
                    const dataObj = cloneDeep(prev);
                    dataObj.data[index].conditionOption = category;
                    dataObj.data[index].conditionValue = [];
                    return dataObj;
                  });
                }}
                changeConditionOperator={(index, operator) => {
                  setSegmentationOptionData((prev) => {
                    const dataObj = cloneDeep(prev);
                    dataObj.data[index].conditionOperator = operator;
                    return dataObj;
                  });
                }}
                changeConditionValue={(index, value) => {
                  setSegmentationOptionData((prev) => {
                    const dataObj = cloneDeep(prev);
                    dataObj.data[index].conditionValue = value;
                    return dataObj;
                  });
                }}
                changeCurRelationShip={(relation) => {
                  setSegmentationOptionData((prev) => {
                    const dataObj = cloneDeep(prev);
                    dataObj.conditionRelationShip = relation;
                    return dataObj;
                  });
                }}
              />
              <br />
              <SectionTitle type="group" />
              <AttributeGroup
                presetParameters={presetParameters}
                groupOption={groupOption}
                setGroupOption={setGroupOption}
              />
            </SpaceBetween>
          </ColumnLayout>
          <br />
          <Button
            variant="primary"
            iconName="search"
            onClick={clickPreview}
            loading={loadingData}
          >
            {t('button.query')}
          </Button>
        </Container>
        <Container>
          <div className="cs-analytics-data-range">
            <ExploreDateRangePicker
              dateRangeValue={dateRangeValue}
              setDateRangeValue={setDateRangeValue}
              timeGranularity={timeGranularity}
              setTimeGranularity={setTimeGranularity}
            />
            <SegmentedControl
              selectedId={chartType}
              onChange={({ detail }) =>
                setChartType(detail.selectedId as QuickSightChartType)
              }
              options={chartTypeOptions}
            />
          </div>
          <br />
          {loadingChart ? (
            <Loading />
          ) : (
            <ExploreEmbedFrame
              embedType="dashboard"
              embedUrl={exploreEmbedUrl}
            />
          )}
        </Container>
      </SpaceBetween>
      <SaveToDashboardModal
        visible={selectDashboardModalVisible}
        disableClose={false}
        loading={loadingData}
        setModalVisible={setSelectDashboardModalVisible}
        save={saveToDashboard}
      />
    </>
  );
};

export default AnalyticsFunnel;
