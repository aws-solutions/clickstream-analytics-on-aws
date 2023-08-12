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

import { v4 as uuidv4 } from 'uuid';
import { ApiFail, ApiSuccess } from '../common/types';
import { isEmpty } from '../common/utils';
import { IMetadataEvent, IMetadataEventParameter, IMetadataRelation, IMetadataUserAttribute } from '../model/metadata';
import { DynamoDbMetadataStore } from '../store/dynamodb/dynamodb-metadata-store';
import { MetadataStore } from '../store/metadata-store';

const metadataStore: MetadataStore = new DynamoDbMetadataStore();

export class MetadataEventServ {
  public async list(req: any, res: any, next: any) {
    try {
      const { projectId, appId, order } = req.query;
      const result = await metadataStore.listEvents(projectId, appId, order);
      return res.json(new ApiSuccess({
        totalCount: result.length,
        items: result,
      }));
    } catch (error) {
      next(error);
    }
  };

  public async add(req: any, res: any, next: any) {
    try {
      req.body.operator = res.get('X-Click-Stream-Operator');
      const event: IMetadataEvent = req.body;
      const name = await metadataStore.createEvent(event);
      return res.status(201).json(new ApiSuccess({ name }, 'Event created.'));
    } catch (error) {
      next(error);
    }
  };

  public async details(req: any, res: any, next: any) {
    try {
      const { name } = req.params;
      const { projectId, appId } = req.query;
      const results = await metadataStore.getEvent(projectId, appId, name);
      if (isEmpty(results)) {
        return res.status(404).json(new ApiFail('Event not found'));
      }
      const event = results.filter((r: any) => r.type === `#METADATA#${projectId}#${appId}#${name}`)[0] as IMetadataEvent;
      event.associatedParameters = results.filter((r: any) => r.type !== `#METADATA#${projectId}#${appId}#${name}`) as IMetadataRelation[];
      return res.json(new ApiSuccess(event));
    } catch (error) {
      next(error);
    }
  };

  public async update(req: any, res: any, next: any) {
    try {
      req.body.operator = res.get('X-Click-Stream-Operator');
      const event: IMetadataEvent = req.body as IMetadataEvent;
      const isEventExisted = await metadataStore.isEventExisted(event.projectId, event.appId, event.name);
      if (!isEventExisted) {
        return res.status(404).json(new ApiFail('Event not found'));
      }
      await metadataStore.updateEvent(event);
      return res.status(201).json(new ApiSuccess(null, 'Event updated.'));
    } catch (error) {
      next(error);
    }
  };

  public async delete(req: any, res: any, next: any) {
    try {
      const { name } = req.params;
      const { projectId, appId } = req.query;
      const operator = res.get('X-Click-Stream-Operator');
      const isEventExisted = await metadataStore.isEventExisted(projectId, appId, name);
      if (!isEventExisted) {
        return res.status(404).json(new ApiFail('Event not found'));
      }
      await metadataStore.deleteEvent(projectId, appId, name, operator);
      return res.json(new ApiSuccess(null, 'Event deleted.'));
    } catch (error) {
      next(error);
    }
  };

}

export class MetadataEventParameterServ {
  public async list(req: any, res: any, next: any) {
    try {
      const { projectId, appId, order } = req.query;
      const result = await metadataStore.listEventParameters(projectId, appId, order);
      return res.json(new ApiSuccess({
        totalCount: result.length,
        items: result,
      }));
    } catch (error) {
      next(error);
    }
  };

  public async add(req: any, res: any, next: any) {
    try {
      req.body.operator = res.get('X-Click-Stream-Operator');
      req.body.parameterId = uuidv4().replace(/-/g, '');
      const eventParameter: IMetadataEventParameter = req.body;
      const id = await metadataStore.createEventParameter(eventParameter);
      return res.status(201).json(new ApiSuccess({ id }, 'Event attribute created.'));
    } catch (error) {
      next(error);
    }
  };

  public async details(req: any, res: any, next: any) {
    try {
      const { id } = req.params;
      const { projectId, appId } = req.query;
      const results = await metadataStore.getEventParameter(projectId, appId, id);
      if (isEmpty(results)) {
        return res.status(404).json(new ApiFail('Event attribute not found'));
      }
      const parameter = results.filter((r: any) => r.prefix === `EVENT_PARAMETER#${projectId}#${appId}`)[0] as IMetadataEventParameter;
      parameter.associatedEvents = results.filter((r: any) => r.prefix === `RELATION#${projectId}#${appId}`) as IMetadataRelation[];
      return res.json(new ApiSuccess(parameter));
    } catch (error) {
      next(error);
    }
  };

  public async update(req: any, res: any, next: any) {
    try {
      req.body.operator = res.get('X-Click-Stream-Operator');
      const eventParameter: IMetadataEventParameter = req.body as IMetadataEventParameter;
      const isEventExisted = await metadataStore.isEventParameterExisted(eventParameter.projectId, eventParameter.appId, eventParameter.parameterId);
      if (!isEventExisted) {
        return res.status(404).json(new ApiFail('Event attribute not found'));
      }
      await metadataStore.updateEventParameter(eventParameter);
      return res.status(201).json(new ApiSuccess(null, 'Event attribute updated.'));
    } catch (error) {
      next(error);
    }
  };

  public async delete(req: any, res: any, next: any) {
    try {
      const { id } = req.params;
      const { projectId, appId } = req.query;
      const operator = res.get('X-Click-Stream-Operator');
      const isEventExisted = await metadataStore.isEventParameterExisted(projectId, appId, id);
      if (!isEventExisted) {
        return res.status(404).json(new ApiFail('Event attribute not found'));
      }
      await metadataStore.deleteEventParameter(projectId, appId, id, operator);
      return res.json(new ApiSuccess(null, 'Event attribute deleted.'));
    } catch (error) {
      next(error);
    }
  };

}

export class MetadataUserAttributeServ {
  public async list(req: any, res: any, next: any) {
    try {
      const { projectId, appId, order } = req.query;
      const result = await metadataStore.listUserAttributes(projectId, appId, order);
      return res.json(new ApiSuccess({
        totalCount: result.length,
        items: result,
      }));
    } catch (error) {
      next(error);
    }
  };

  public async add(req: any, res: any, next: any) {
    try {
      req.body.operator = res.get('X-Click-Stream-Operator');
      req.body.attributeId = uuidv4().replace(/-/g, '');
      const userAttribute: IMetadataUserAttribute = req.body;
      const id = await metadataStore.createUserAttribute(userAttribute);
      return res.status(201).json(new ApiSuccess({ id }, 'User attribute created.'));
    } catch (error) {
      next(error);
    }
  };

  public async details(req: any, res: any, next: any) {
    try {
      const { id } = req.params;
      const { projectId, appId } = req.query;
      const result = await metadataStore.getUserAttribute(projectId, appId, id);
      if (isEmpty(result)) {
        return res.status(404).json(new ApiFail('User attribute not found'));
      }
      return res.json(new ApiSuccess(result));
    } catch (error) {
      next(error);
    }
  };

  public async update(req: any, res: any, next: any) {
    try {
      req.body.operator = res.get('X-Click-Stream-Operator');
      const userAttribute: IMetadataUserAttribute = req.body as IMetadataUserAttribute;
      const isEventExisted = await metadataStore.isUserAttributeExisted(userAttribute.projectId, userAttribute.appId, userAttribute.attributeId);
      if (!isEventExisted) {
        return res.status(404).json(new ApiFail('User attribute not found'));
      }
      await metadataStore.updateUserAttribute(userAttribute);
      return res.status(201).json(new ApiSuccess(null, 'User attribute updated.'));
    } catch (error) {
      next(error);
    }
  };

  public async delete(req: any, res: any, next: any) {
    try {
      const { id } = req.params;
      const { projectId, appId } = req.query;
      const operator = res.get('X-Click-Stream-Operator');
      const isEventExisted = await metadataStore.isUserAttributeExisted(projectId, appId, id);
      if (!isEventExisted) {
        return res.status(404).json(new ApiFail('User attribute not found'));
      }
      await metadataStore.deleteUserAttribute(projectId, appId, id, operator);
      return res.json(new ApiSuccess(null, 'User attribute deleted.'));
    } catch (error) {
      next(error);
    }
  };

}