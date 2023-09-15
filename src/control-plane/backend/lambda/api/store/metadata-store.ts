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

import { IMetadataDisplay, IMetadataEvent, IMetadataEventParameter, IMetadataUserAttribute } from '../model/metadata';

export interface MetadataStore {
  createEvent: (event: IMetadataEvent) => Promise<string>;
  getEvent: (projectId: string, appId: string, eventName: string) => Promise<any>;
  listEvents: (projectId: string, appId: string, order: string) => Promise<IMetadataEvent[]>;
  deleteEvent: (projectId: string, appId: string, eventName: string, operator: string) => Promise<void>;
  isEventExisted: (projectId: string, appId: string, eventName: string) => Promise<boolean>;

  createEventParameter: (eventParameter: IMetadataEventParameter) => Promise<string>;
  getEventParameter: (projectId: string, appId: string, parameterName: string) => Promise<IMetadataEventParameter[]>;
  listEventParameters: (projectId: string, appId: string, order: string, source?: string) => Promise<IMetadataEventParameter[]>;
  deleteEventParameter: (projectId: string, appId: string, eventParameterName: string, operator: string) => Promise<void>;
  isEventParameterExisted: (projectId: string, appId: string, eventParameterName: string) => Promise<boolean>;

  createUserAttribute: (userAttribute: IMetadataUserAttribute) => Promise<string>;
  getUserAttribute: (projectId: string, appId: string, userAttributeName: string) => Promise<IMetadataUserAttribute[]>;
  listUserAttributes: (projectId: string, appId: string, order: string) => Promise<IMetadataUserAttribute[]>;
  deleteUserAttribute: (projectId: string, appId: string, userAttributeName: string, operator: string) => Promise<void>;
  isUserAttributeExisted: (projectId: string, appId: string, userAttributeName: string) => Promise<boolean>;

  getDisplay: (projectId: string, appId: string) => Promise<IMetadataDisplay[]>;
  updateDisplay: (id: string, projectId: string, appId: string, description: string, displayName: string) => Promise<void>;
}
