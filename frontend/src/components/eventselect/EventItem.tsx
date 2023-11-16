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

import { Select, SelectProps } from '@cloudscape-design/components';
import classNames from 'classnames';
import ErrorText from 'components/common/ErrorText';
import { StateContext } from 'context/StateContext';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExploreComputeMethod } from 'ts/explore-types';
import { defaultStr } from 'ts/utils';
import { CategoryItemType, IAnalyticsItem } from './AnalyticsType';
import DropDownContainer from './DropDownContainer';

interface EventItemProps {
  type: 'event' | 'attribute';
  showMouseoverTitle?: boolean;
  placeholder: string | null;
  isMultiSelect?: boolean;
  hasTab?: boolean;
  categoryOption: IAnalyticsItem | null;
  calcMethodOption?: SelectProps.Option | null;
  changeCurCategoryOption: (category: SelectProps.Option | null) => void;
  changeCurCalcMethodOption?: (method: SelectProps.Option | null) => void;
  categories: CategoryItemType[];
  loading?: boolean;
  disabled?: boolean;
}

const EventItem: React.FC<EventItemProps> = (props: EventItemProps) => {
  const {
    type,
    showMouseoverTitle,
    placeholder,
    hasTab,
    isMultiSelect,
    categoryOption,
    calcMethodOption,
    changeCurCategoryOption,
    changeCurCalcMethodOption,
    categories,
    loading,
    disabled,
  } = props;
  const { t } = useTranslation();
  const state = useContext(StateContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [clickedOutside, setClickedOutside] = useState(false);
  const defaultComputeMethodOption: SelectProps.Option = {
    value: ExploreComputeMethod.USER_ID_CNT,
    label: t('analytics:options.userNumber') ?? 'User number',
  };

  const computeMethodOptions: SelectProps.Options = [
    defaultComputeMethodOption,
    {
      value: ExploreComputeMethod.EVENT_CNT,
      label: t('analytics:options.eventNumber') ?? 'Event number',
    },
  ];

  function useOutsideAlerter(ref: any) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowDropdown(false);
          setClickedOutside(true);
        } else {
          setClickedOutside(false);
        }
      }
      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref]);
  }
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  return (
    <div ref={wrapperRef} className="cs-dropdown-input">
      <div
        className={classNames({
          'dropdown-input-column': true,
          flex: isMultiSelect,
        })}
      >
        <div
          className="flex-1 cs-dropdown-event-input"
          onClick={() => setShowDropdown((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setShowDropdown((prev) => !prev);
            }
          }}
        >
          <Select
            onBlur={(e) => {
              e.stopPropagation();
              if (clickedOutside) {
                setShowDropdown(false);
              }
            }}
            placeholder={defaultStr(placeholder)}
            selectedOption={categoryOption}
            disabled={disabled}
          />
          {categoryOption?.label && showMouseoverTitle && (
            <div className="custom-popover">{categoryOption?.label}</div>
          )}
          {!showDropdown &&
            !categoryOption &&
            ((type === 'attribute' && state?.showAttributeError) ||
              (type === 'event' && state?.showEventError)) && (
              <ErrorText
                text={`${t('analytics:valid.please')}${placeholder}`}
              />
            )}
        </div>
        {isMultiSelect && (
          <div className="second-select-option" title={calcMethodOption?.label}>
            <Select
              selectedOption={calcMethodOption ?? null}
              onChange={(e) => {
                changeCurCalcMethodOption?.(e.detail.selectedOption);
              }}
              options={computeMethodOptions}
            />
          </div>
        )}
      </div>
      {showDropdown && (
        <DropDownContainer
          loading={loading}
          selectedItem={categoryOption}
          changeSelectItem={(item) => {
            changeCurCategoryOption(item);
            setShowDropdown(false);
          }}
          hasTab={hasTab}
          categories={categories}
        />
      )}
    </div>
  );
};

export default EventItem;
