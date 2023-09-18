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
  DateRangePicker,
  DateRangePickerProps,
  Select,
  SelectProps,
} from '@cloudscape-design/components';
import i18n from 'i18n';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExploreGroupColumn } from 'ts/explore-types';

interface IExploreDateRangePickerProps {
  dateRangeValue: DateRangePickerProps.Value | null;
  timeGranularity: SelectProps.Option;
  setDateRangeValue: (value: DateRangePickerProps.Value) => void;
  setTimeGranularity: (value: SelectProps.Option) => void;
  onChange: () => void;
}

const ExploreDateRangePicker: React.FC<IExploreDateRangePickerProps> = (
  props: IExploreDateRangePickerProps
) => {
  const {
    dateRangeValue,
    timeGranularity,
    setDateRangeValue,
    setTimeGranularity,
    onChange,
  } = props;
  const { t } = useTranslation();

  const relativeOptions: ReadonlyArray<DateRangePickerProps.RelativeOption> = [
    {
      key: 'previous-1-day',
      amount: 1,
      unit: 'day',
      type: 'relative',
    },
    {
      key: 'previous-1-week',
      amount: 1,
      unit: 'week',
      type: 'relative',
    },
    {
      key: 'previous-2-week',
      amount: 2,
      unit: 'week',
      type: 'relative',
    },
    {
      key: 'previous-1-month',
      amount: 1,
      unit: 'month',
      type: 'relative',
    },
    {
      key: 'previous-3-months',
      amount: 3,
      unit: 'month',
      type: 'relative',
    },
    {
      key: 'previous-6-months',
      amount: 6,
      unit: 'month',
      type: 'relative',
    },
    {
      key: 'previous-1-year',
      amount: 1,
      unit: 'year',
      type: 'relative',
    },
  ];

  const defaultTimeGranularityOption: SelectProps.Option = {
    value: ExploreGroupColumn.DAY,
    label: t('analytics:options.dayTimeGranularity') ?? '',
  };

  const timeGranularityOptions: SelectProps.Options = [
    {
      value: ExploreGroupColumn.HOUR,
      label: t('analytics:options.hourTimeGranularity') ?? '',
    },
    defaultTimeGranularityOption,
    {
      value: ExploreGroupColumn.WEEK,
      label: t('analytics:options.weekTimeGranularity') ?? '',
    },
    {
      value: ExploreGroupColumn.MONTH,
      label: t('analytics:options.monthTimeGranularity') ?? '',
    },
  ];

  const isValidRange = (
    range: DateRangePickerProps.Value | null
  ): DateRangePickerProps.ValidationResult => {
    if (range?.type === 'absolute') {
      const [startDateWithoutTime] = range.startDate.split('T');
      const [endDateWithoutTime] = range.endDate.split('T');
      if (!startDateWithoutTime || !endDateWithoutTime) {
        return {
          valid: false,
          errorMessage: t('analytics:valid.dateRangeIncomplete'),
        };
      }
      if (
        new Date(range.startDate).getTime() -
          new Date(range.endDate).getTime() >
        0
      ) {
        return {
          valid: false,
          errorMessage: t('analytics:valid.dateRangeInvalid'),
        };
      }
    }
    return { valid: true };
  };

  return (
    <div className="cs-analytics-data-range">
      <Select
        selectedOption={timeGranularity}
        options={timeGranularityOptions}
        onChange={(event) => {
          setTimeGranularity(event.detail.selectedOption);
          onChange();
        }}
      />
      <DateRangePicker
        onChange={({ detail }) => {
          console.log('date range picker changed', detail);
          setDateRangeValue(detail.value as DateRangePickerProps.Value);
          onChange();
        }}
        value={dateRangeValue ?? null}
        dateOnly
        relativeOptions={relativeOptions}
        isValidRange={isValidRange}
        i18nStrings={{
          relativeModeTitle: t('analytics:dateRange.relativeModeTitle') ?? '',
          absoluteModeTitle: t('analytics:dateRange.absoluteModeTitle') ?? '',
          relativeRangeSelectionHeading:
            t('analytics:dateRange.relativeRangeSelectionHeading') ?? '',
          cancelButtonLabel: t('analytics:dateRange.cancelButtonLabel') ?? '',
          applyButtonLabel: t('analytics:dateRange.applyButtonLabel') ?? '',
          clearButtonLabel: t('analytics:dateRange.clearButtonLabel') ?? '',
          customRelativeRangeOptionLabel:
            t('analytics:dateRange.customRelativeRangeOptionLabel') ?? '',
          formatRelativeRange: (value: DateRangePickerProps.RelativeValue) => {
            return `${t('analytics:dateRange.formatRelativeRangeLabel')} ${
              value.amount
            } ${i18n.t(`analytics:dateRange.${value.unit}`)}`;
          },
        }}
      />
    </div>
  );
};

export default ExploreDateRangePicker;
