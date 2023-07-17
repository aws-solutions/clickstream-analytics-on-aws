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

import { Database, DataFormat, Table } from '@aws-cdk/aws-glue-alpha';
import { Schema } from '@aws-cdk/aws-glue-alpha/lib/schema';
import { IBucket, Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { getSinkTableLocationPrefix } from './utils-common';
import { PARTITION_APP } from '../../common/constant';

interface Props {
  readonly sourceS3Bucket: IBucket;
  readonly sourceS3Prefix: string;
  readonly sinkS3Bucket: IBucket;
  readonly sinkS3Prefix: string;
}

export class GlueUtil {

  public static newInstance(scope: Construct, props: Props) {
    return new this(scope, props);
  }

  private readonly props: Props;
  private readonly scope: Construct;

  private constructor(scope: Construct, props: Props) {
    this.props = props;
    this.scope = scope;
  }

  public createDatabase(name: string) {
    return new Database(this.scope, 'GlueDatabase', {
      databaseName: name,
    });
  }

  public createSourceTable(glueDatabase: Database, tableName: string) {
    return new Table(this.scope, 'SourceTable', {
      database: glueDatabase,
      description: 'ClickStream data pipeline source table',
      tableName,
      partitionKeys: [{
        name: 'year',
        comment: 'Partition (0)',
        type: Schema.STRING,
      }, {
        name: 'month',
        comment: 'Partition (1)',
        type: Schema.STRING,
      }, {
        name: 'day',
        comment: 'Partition (2)',
        type: Schema.STRING,
      }, {
        name: 'hour',
        comment: 'Partition (3)',
        type: Schema.STRING,
      }],
      columns: [{
        name: 'date',
        type: Schema.STRING,
      }, {
        name: 'data',
        type: Schema.STRING,
      }, {
        name: 'ip',
        type: Schema.STRING,
      }, {
        name: 'source_type',
        type: Schema.STRING,
      }, {
        name: 'rid',
        type: Schema.STRING,
      }, {
        name: 'ua',
        type: Schema.STRING,
      }, {
        name: 'm',
        type: Schema.STRING,
      }, {
        name: 'uri',
        type: Schema.STRING,
      }, {
        name: 'platform',
        type: Schema.STRING,
      }, {
        name: 'path',
        type: Schema.STRING,
      }, {
        name: 'appId',
        type: Schema.STRING,
      }, {
        name: 'compression',
        type: Schema.STRING,
      }, {
        name: 'ingest_time',
        type: Schema.BIG_INT,
      }],
      compressed: false,
      dataFormat: DataFormat.JSON,
      bucket: Bucket.fromBucketName(this.scope, 'SourceBucket', this.props.sourceS3Bucket.bucketName),
      s3Prefix: `${this.props.sourceS3Prefix}`,
    });
  }

  public createSinkTable(glueDatabase: Database, projectId: string, tableName: string) {
    return new Table(this.scope, 'SinkTable', {
      database: glueDatabase,
      description: 'ClickStream data pipeline sink table',
      tableName,
      partitionKeys: [{
        name: PARTITION_APP,
        comment: 'Partition (0)',
        type: Schema.STRING,
      }, {
        name: 'partition_year',
        comment: 'Partition (1)',
        type: Schema.STRING,
      }, {
        name: 'partition_month',
        comment: 'Partition (2)',
        type: Schema.STRING,
      }, {
        name: 'partition_day',
        comment: 'Partition (3)',
        type: Schema.STRING,
      }],
      columns: [
        {
          name: 'app_info',
          type: Schema.struct([
            {
              name: 'app_id',
              type: Schema.STRING,
            },
            {
              name: 'id',
              type: Schema.STRING,
            },
            {
              name: 'install_source',
              type: Schema.STRING,
            },
            {
              name: 'version',
              type: Schema.STRING,
            },
          ],
          ),
        },
        {
          name: 'device',
          type: Schema.struct([
            {
              name: 'mobile_brand_name',
              type: Schema.STRING,
            },
            {
              name: 'mobile_model_name',
              type: Schema.STRING,
            },
            {
              name: 'manufacturer',
              type: Schema.STRING,
            },
            {
              name: 'screen_width',
              type: Schema.BIG_INT,
            },
            {
              name: 'screen_height',
              type: Schema.BIG_INT,
            },
            {
              name: 'carrier',
              type: Schema.STRING,
            },
            {
              name: 'network_type',
              type: Schema.STRING,
            },
            {
              name: 'operating_system_version',
              type: Schema.STRING,
            },
            {
              name: 'operating_system',
              type: Schema.STRING,
            },
            {
              name: 'ua_browser',
              type: Schema.STRING,
            },
            {
              name: 'ua_browser_version',
              type: Schema.STRING,
            },
            {
              name: 'ua_os',
              type: Schema.STRING,
            },
            {
              name: 'ua_os_version',
              type: Schema.STRING,
            },
            {
              name: 'ua_device',
              type: Schema.STRING,
            },
            {
              name: 'ua_device_category',
              type: Schema.STRING,
            },
            {
              name: 'system_language',
              type: Schema.STRING,
            },
            {
              name: 'time_zone_offset_seconds',
              type: Schema.BIG_INT,
            },
            {
              name: 'vendor_id',
              type: Schema.STRING,
            },
            {
              name: 'advertising_id',
              type: Schema.STRING,
            },
            {
              name: 'host_name',
              type: Schema.STRING,
            },
          ],
          ),
        },
        {
          name: 'ecommerce',
          type: Schema.struct([
            {
              name: 'total_item_quantity',
              type: Schema.BIG_INT,
            },
            {
              name: 'purchase_revenue_in_usd',
              type: Schema.DOUBLE,
            },
            {
              name: 'purchase_revenue',
              type: Schema.DOUBLE,
            },
            {
              name: 'refund_value_in_usd',
              type: Schema.DOUBLE,
            },
            {
              name: 'refund_value',
              type: Schema.DOUBLE,
            },
            {
              name: 'shipping_value_in_usd',
              type: Schema.DOUBLE,
            },
            {
              name: 'shipping_value',
              type: Schema.DOUBLE,
            },
            {
              name: 'tax_value_in_usd',
              type: Schema.DOUBLE,
            },
            {
              name: 'tax_value',
              type: Schema.DOUBLE,
            },
            {
              name: 'transaction_id',
              type: Schema.STRING,
            },
            {
              name: 'unique_items',
              type: Schema.BIG_INT,
            },
          ]),
        },
        {
          name: 'event_bundle_sequence_id',
          type: Schema.BIG_INT,
        },
        {
          name: 'event_date',
          type: Schema.DATE,
        },
        {
          name: 'event_dimensions',
          type: Schema.array(
            Schema.struct([
              {
                name: 'key',
                type: Schema.STRING,
              },
              {
                name: 'value',
                type: Schema.struct([
                  {
                    name: 'double_value',
                    type: Schema.DOUBLE,
                  },
                  {
                    name: 'float_value',
                    type: Schema.FLOAT,
                  },
                  {
                    name: 'int_value',
                    type: Schema.BIG_INT,
                  },
                  {
                    name: 'string_value',
                    type: Schema.STRING,
                  },
                ]),
              },
            ]),
          ),
        },
        {
          name: 'event_id',
          type: Schema.STRING,
        },
        {
          name: 'event_name',
          type: Schema.STRING,
        },
        {
          name: 'event_params',
          type: Schema.array(
            Schema.struct([
              {
                name: 'key',
                type: Schema.STRING,
              },
              {
                name: 'value',
                type: Schema.struct([
                  {
                    name: 'double_value',
                    type: Schema.DOUBLE,
                  },
                  {
                    name: 'float_value',
                    type: Schema.FLOAT,
                  },
                  {
                    name: 'int_value',
                    type: Schema.BIG_INT,
                  },
                  {
                    name: 'string_value',
                    type: Schema.STRING,
                  },
                ]),
              },
            ]),
          ),
        },
        {
          name: 'event_previous_timestamp',
          type: Schema.BIG_INT,
        },
        {
          name: 'event_server_timestamp_offset',
          type: Schema.BIG_INT,
        },
        {
          name: 'event_timestamp',
          type: Schema.BIG_INT,
        },
        {
          name: 'event_value_in_usd',
          type: Schema.FLOAT,
        },
        {
          name: 'geo',
          type: Schema.struct([
            {
              name: 'city',
              type: Schema.STRING,
            },
            {
              name: 'continent',
              type: Schema.STRING,
            },
            {
              name: 'country',
              type: Schema.STRING,
            },
            {
              name: 'metro',
              type: Schema.STRING,
            },
            {
              name: 'region',
              type: Schema.STRING,
            },
            {
              name: 'sub_continent',
              type: Schema.STRING,
            },
            {
              name: 'locale',
              type: Schema.STRING,
            },
          ]),
        },
        {
          name: 'ingest_timestamp',
          type: Schema.BIG_INT,
        },
        {
          name: 'items',
          type: Schema.struct([
            {
              name: 'item_id',
              type: Schema.STRING,
            },
            {
              name: 'item_name',
              type: Schema.STRING,
            },
            {
              name: 'item_brand',
              type: Schema.STRING,
            },
            {
              name: 'item_variant',
              type: Schema.STRING,
            },
            {
              name: 'item_category',
              type: Schema.STRING,
            },
            {
              name: 'item_category2',
              type: Schema.STRING,
            },
            {
              name: 'item_category3',
              type: Schema.STRING,
            },
            {
              name: 'item_category4',
              type: Schema.STRING,
            },
            {
              name: 'item_category5',
              type: Schema.STRING,
            },
            {
              name: 'price_in_usd',
              type: Schema.DOUBLE,
            },
            {
              name: 'price',
              type: Schema.DOUBLE,
            },
            {
              name: 'quantity',
              type: Schema.BIG_INT,
            },
            {
              name: 'item_revenue_in_usd',
              type: Schema.DOUBLE,
            },
            {
              name: 'item_revenue',
              type: Schema.DOUBLE,
            },
            {
              name: 'item_refund_in_usd',
              type: Schema.DOUBLE,
            },
            {
              name: 'item_refund',
              type: Schema.DOUBLE,
            },
            {
              name: 'coupon',
              type: Schema.STRING,
            },
            {
              name: 'affiliation',
              type: Schema.STRING,
            },
            {
              name: 'location_id',
              type: Schema.STRING,
            },
            {
              name: 'item_list_id',
              type: Schema.STRING,
            },
            {
              name: 'item_list_name',
              type: Schema.STRING,
            },
            {
              name: 'item_list_index',
              type: Schema.STRING,
            },
            {
              name: 'promotion_id',
              type: Schema.STRING,
            },
            {
              name: 'promotion_name',
              type: Schema.STRING,
            },
            {
              name: 'creative_name',
              type: Schema.STRING,
            },
            {
              name: 'creative_slot',
              type: Schema.STRING,
            },
          ]),
        },
        {
          name: 'platform',
          type: Schema.STRING,
        },
        {
          name: 'privacy_info',
          type: Schema.struct([
            {
              name: 'ads_storage',
              type: Schema.STRING,
            },
            {
              name: 'analytics_storage',
              type: Schema.STRING,
            },
            {
              name: 'uses_transient_token',
              type: Schema.STRING,
            },
          ]),
        },
        {
          name: 'project_id',
          type: Schema.STRING,
        },
        {
          name: 'traffic_source',
          type: Schema.struct([
            {
              name: 'medium',
              type: Schema.STRING,
            },
            {
              name: 'name',
              type: Schema.STRING,
            },
            {
              name: 'source',
              type: Schema.STRING,
            },
          ]),
        },
        {
          name: 'user_first_touch_timestamp',
          type: Schema.BIG_INT,
        },
        {
          name: 'user_id',
          type: Schema.STRING,
        },
        {
          name: 'user_ltv',
          type: Schema.struct([
            {
              name: 'revenue',
              type: Schema.DOUBLE,
            },
            {
              name: 'currency',
              type: Schema.STRING,
            },
          ]),
        },
        {
          name: 'user_properties',
          type: Schema.array(
            Schema.struct([
              {
                name: 'key',
                type: Schema.STRING,
              },
              {
                name: 'value',
                type: Schema.struct([
                  {
                    name: 'double_value',
                    type: Schema.DOUBLE,
                  },
                  {
                    name: 'float_value',
                    type: Schema.FLOAT,
                  },
                  {
                    name: 'int_value',
                    type: Schema.BIG_INT,
                  },
                  {
                    name: 'string_value',
                    type: Schema.STRING,
                  },
                  {
                    name: 'set_timestamp_micros',
                    type: Schema.BIG_INT,
                  },
                ]),
              },
            ]),
          ),
        },
        {
          name: 'user_pseudo_id',
          type: Schema.STRING,
        },
      ],
      compressed: false,
      dataFormat: DataFormat.PARQUET,

      bucket: Bucket.fromBucketName(this.scope, 'SinkBucket', this.props.sinkS3Bucket.bucketName),
      s3Prefix: getSinkTableLocationPrefix(this.props.sinkS3Prefix, projectId, tableName),
    });
  }

}