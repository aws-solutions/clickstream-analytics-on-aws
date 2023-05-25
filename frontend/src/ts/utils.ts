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

import { SelectProps } from '@cloudscape-design/components';
import { ExecutionType } from './const';

export const generateStr = (length: number) => {
  let randomString = '';
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    randomString += letters[randomIndex];
  }
  return randomString;
};

export const alertMsg = (alertTxt: string, alertType: AlertType) => {
  const patchEvent = new CustomEvent('showAlertMsg', {
    detail: {
      alertTxt,
      alertType,
    },
  });
  window.dispatchEvent(patchEvent);
};

export const validateEmails = (emails: string) => {
  const emailArray = emails.split(',');
  const regex = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
  for (let i = 0; i < emailArray.length; i++) {
    const email = emailArray[i].trim();
    if (!regex.test(email)) {
      return false;
    }
  }
  return true;
};

export const validateProjectId = (projectId: string) => {
  const regex = /^[a-z_][a-z0-9_]{0,126}$/;
  if (!regex.test(projectId)) {
    return false;
  }
  return true;
};

export const validateAppId = (appId: string) => {
  const regex = /^[a-zA-Z][a-zA-Z0-9_]{0,126}$/;
  if (!regex.test(appId)) {
    return false;
  }
  return true;
};

export const generateFileDownloadLink = (fileContent: string): string => {
  // Create Blob url
  const blob = new Blob([fileContent], { type: 'text/plain' });
  // create URL Object
  const url = URL.createObjectURL(blob);
  return url;
};

export const generateCronDateRange = (
  type: string | undefined,
  fixedValue: number,
  cronExp: string,
  unit: SelectProps.Option | null,
  attr: 'processing' | 'upsert' | 'dataload'
) => {
  let DEFAULT_VALUE = `rate(1 hour)`;
  if (attr === 'upsert') {
    DEFAULT_VALUE = `rate(1 day)`;
  }
  if (attr === 'dataload') {
    DEFAULT_VALUE = `rate(5 minutes)`;
  }
  if (type === ExecutionType.FIXED_RATE) {
    if (fixedValue && fixedValue > 0) {
      if (unit?.value === 'hour') {
        return `rate(${fixedValue} ${fixedValue > 1 ? 'hours' : 'hour'})`;
      } else if (unit?.value === 'minute') {
        return `rate(${fixedValue} ${fixedValue > 1 ? 'minutes' : 'minute'})`;
      } else if (unit?.value === 'day') {
        return `rate(${fixedValue} ${fixedValue > 1 ? 'days' : 'day'})`;
      } else {
        return DEFAULT_VALUE;
      }
    } else {
      return DEFAULT_VALUE;
    }
  } else if (type === ExecutionType.CRON_EXPRESS) {
    if (cronExp) {
      return `cron(${cronExp})`;
    } else {
      return DEFAULT_VALUE;
    }
  } else {
    return DEFAULT_VALUE;
  }
};

export const generateRedshiftInterval = (value?: number, unit?: string) => {
  if (value) {
    if (unit === 'month') {
      return value * 60 * 24 * 30;
    }
    if (unit === 'day') {
      return value * 60 * 24;
    }
    return value;
  } else {
    return 6 * 60 * 24 * 30;
  }
};

export const extractAccountIdFromArn = (arn: string) => {
  const regex = /^arn:aws.*:redshift-serverless:[^:]+:([0-9]{12}):/;
  const matchResult = arn.match(regex);
  return matchResult ? matchResult[1] : '';
};

export const extractRegionFromCloudWatchArn = (arn: string) => {
  const regex = /^arn:aws.*:cloudwatch:(\w{2}-\w{1,10}-\d):[0-9]{12}:/;
  const matchResult = arn.match(regex);
  return matchResult ? matchResult[1] : '';
};
