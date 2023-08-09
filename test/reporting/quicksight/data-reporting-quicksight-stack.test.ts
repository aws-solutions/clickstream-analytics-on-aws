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

import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { OUTPUT_REPORTING_QUICKSIGHT_DASHBOARDS, OUTPUT_REPORTING_QUICKSIGHT_DATA_SOURCE_ARN } from '../../../src/common/constant';
import { DataReportingQuickSightStack } from '../../../src/data-reporting-quicksight-stack';

describe('DataReportingQuickSightStack parameter test', () => {
  const app = new App();
  const testId = 'test-1';
  const stack = new DataReportingQuickSightStack(app, testId+'-data-analytics-quicksight-stack', {});
  const template = Template.fromStack(stack);

  beforeEach(() => {
  });

  test('Has Dashboards output', () => {
    template.hasOutput(OUTPUT_REPORTING_QUICKSIGHT_DASHBOARDS, {});
  });

  test('Has Dashboards output', () => {
    template.hasOutput(OUTPUT_REPORTING_QUICKSIGHT_DATA_SOURCE_ARN, {});
  });

  test('Should has Parameter quickSightUserParam', () => {
    template.hasParameter('QuickSightUserParam', {
      Type: 'String',
    });
  });

  test('Should has Parameter quickSightNamespaceParam', () => {
    template.hasParameter('QuickSightNamespaceParam', {
      Type: 'String',
    });
  });

  test('Should has Parameter QuickSightVpcConnectionSGParam', () => {
    template.hasParameter('QuickSightVpcConnectionSGParam', {});
  });

  test('Should has Parameter QuickSightVpcConnectionSubnetParam', () => {
    template.hasParameter('QuickSightVpcConnectionSubnetParam', {});
  });

  test('Should has Parameter QuickSightPrincipalParam', () => {
    template.hasParameter('QuickSightPrincipalParam', {
      Type: 'String',
    });
  });

  test('Should has Parameter redshiftEndpointParam', () => {
    template.hasParameter('RedshiftEndpointParam', {
      Type: 'String',
    });
  });

  test('Should has Parameter redshiftDBParam', () => {
    template.hasParameter('RedshiftDBParam', {
      Type: 'String',
    });
  });

  test('Should has Parameter redshiftPortParam', () => {
    template.hasParameter('RedshiftPortParam', {
      Type: 'Number',
    });
  });

  test('QuickSightUserParam pattern', () => {
    const param = template.toJSON().Parameters.QuickSightUserParam;
    const pattern = param.AllowedPattern;
    const regex = new RegExp(`${pattern}`);
    const validValues = [
      'abc-123',
      'abc_456',
      'Abc_456_def',
      '1abcd',
      '123345',
      'test@example.com',
      'Admin/test',
      'test-test',
      'test-ABC@example.com',
    ];

    for (const v of validValues) {
      expect(v).toMatch(regex);
    }

    const invalidValues = [
      'test;123',
      'test#',
      'a',
    ];
    for (const v of invalidValues) {
      expect(v).not.toMatch(regex);
    }
  });

  test('QuickSightNamespaceParam pattern', () => {
    const param = template.toJSON().Parameters.QuickSightNamespaceParam;
    const pattern = param.AllowedPattern;
    const regex = new RegExp(`${pattern}`);
    const validValues = [
      'abcde',
      'ABC1234',
      'default',
    ];

    for (const v of validValues) {
      expect(v).toMatch(regex);
    }

    const invalidValues = [
      '_abcedf',
      '-jklsks',
      'abc$rt',
      '123',
      'abc',
    ];
    for (const v of invalidValues) {
      expect(v).not.toMatch(regex);
    }
  });

  test('QuickSightVpcConnectionSubnetParam pattern', () => {
    const param = template.toJSON().Parameters.QuickSightVpcConnectionSubnetParam;
    const pattern = param.AllowedPattern;
    const regex = new RegExp(`${pattern}`);
    const validValues = [
      'subnet-06e3a4689f1025e5b,subnet-06e3a4689f1025eab',
      'subnet-aaaaaaaa,subnet-bbbbbbb,subnet-ccccccc,',

    ];

    for (const v of validValues) {
      expect(v).toMatch(regex);
    }

    const invalidValues = [
      'Subnet-06e3a4689f1025e5b',
      'subnet-06e3a4689f1025e5b,  subnet-06e3a4689f102fff',
      'xxxxxx-06e3a4689f1025e5b,yyyyy-06e3a4689f1025e5b',
      'subnet-06E3a4689f1025e5b',
      'subnet-1231aacc',
      'subnet-cccc',
    ];
    for (const v of invalidValues) {
      expect(v).not.toMatch(regex);
    }
  });

  test('QuickSightVpcConnectionSGParam pattern', () => {
    const param = template.toJSON().Parameters.QuickSightVpcConnectionSGParam;
    const pattern = param.AllowedPattern;
    const regex = new RegExp(`${pattern}`);
    const validValues = [
      'sg-0757849a2a9eebc4c,sg-11111aaaaaaaaa',
      'sg-0757849a2a9eebc4c,sg-11111aaaaaaaaa,sg-11111bbbbbbbb',
      'sg-0757849a2a9eebc4c',
      'sg-12345678',
    ];

    for (const v of validValues) {
      for ( const t of v.split(',')) {
        expect(t).toMatch(regex);
      }
    }

    const invalidValues = [
      'sg-0757849a2a9eebc4c,  sg-11111aaaaaaaaa',
      'xxxxxx-0757849a2a9eebc4c',
      'subnet-0757849a2a9Eebc4c',
    ];
    for (const v of invalidValues) {
      expect(v).not.toMatch(regex);
    }
  });

  test('RedshiftDBParam pattern', () => {
    const param = template.toJSON().Parameters.RedshiftDBParam;
    const pattern = param.AllowedPattern;
    const regex = new RegExp(`${pattern}`);
    const validValues = [
      'abc',
      'aaa12',
      'abc_ef',
    ];

    for (const v of validValues) {
      expect(v).toMatch(regex);
    }

    const invalidValues = [
      'ACde',
      'bCde',
      'abc-ef',
      'abc$rt',
      '123',
    ];
    for (const v of invalidValues) {
      expect(v).not.toMatch(regex);
    }
  });

  test('RedShiftDBSchemaParam pattern', () => {
    const param = template.toJSON().Parameters.RedShiftDBSchemaParam;
    const pattern = param.AllowedPattern;
    const regex = new RegExp(`${pattern}`);
    const validValues = [
      '',
      'abc',
      'abcd,efgh',
      'aaa12',
      'abc_ef',
      'ACde',
    ];

    for (const v of validValues) {
      expect(v).toMatch(regex);
    }

    const invalidValues = [
      'abc-ef',
      'abc$rt',
      '123',
    ];
    for (const v of invalidValues) {
      expect(v).not.toMatch(regex);
    }
  });

  test('RedshiftEndpointParam pattern', () => {
    const param = template.toJSON().Parameters.RedshiftEndpointParam;
    const pattern = param.AllowedPattern;
    const regex = new RegExp(`${pattern}`);
    const validValues = [
      'abc.com',
      'test.abc.com',
      '123.test.abc.com',
      '123.test-v1.abc.com',
      'test_v1.abc.com',
      'a123#~&%.test-2.a_bc.com',
      'a.b.c.d.e.f.com',
    ];

    for (const v of validValues) {
      expect(v).toMatch(regex);
    }

    const invalidValues = [
      '',
      'a',
      'abc.example_test',
      'abc.c',
      'abc^.com',
    ];
    for (const v of invalidValues) {
      expect(v).not.toMatch(regex);
    }
  });

});

describe('DataReportingQuickSightStack resource test', () => {
  const app = new App();
  const testId = 'test-2';
  const stack = new DataReportingQuickSightStack(app, testId+'-data-analytics-quicksight-stack', {});
  const template = Template.fromStack(stack);

  template.resourcePropertiesCountIs('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: [
        {
          Action: [
            'logs:CreateLogStream',
            'logs:PutLogEvents',
            'logs:CreateLogGroup',
          ],
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':logs:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                ':log-group:/aws/lambda/*',
              ],
            ],
          },
        },
        {
          Action: [
            'quicksight:DescribeDataSource',
            'quicksight:PassDataSource',
          ],
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':quicksight:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                ':datasource/clickstream_datasource_*',
              ],
            ],
          },
        },
        {
          Action: 'quicksight:DescribeTemplate',
          Effect: 'Allow',
          Resource: [
            {
              'Fn::Join': [
                '',
                [
                  'arn:',
                  {
                    Ref: 'AWS::Partition',
                  },
                  ':quicksight:',
                  {
                    Ref: 'AWS::Region',
                  },
                  ':',
                  {
                    Ref: 'AWS::AccountId',
                  },
                  ':template/clickstream_template_*',
                ],
              ],
            },
            {
              'Fn::GetAtt': [
                'ClickstreamTemplateDef',
                'Arn',
              ],
            },
          ],
        },
        {
          Action: [
            'quicksight:DescribeDataSet',
            'quicksight:DeleteDataSet',
            'quicksight:CreateDataSet',
            'quicksight:UpdateDataSet',
            'quicksight:PassDataSet',
            'quicksight:PassDataSource',
          ],
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':quicksight:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                ':dataset/clickstream_dataset_*',
              ],
            ],
          },
        },
        {
          Action: [
            'quicksight:DescribeAnalysis',
            'quicksight:DeleteAnalysis',
            'quicksight:CreateAnalysis',
            'quicksight:UpdateAnalysis',
          ],
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':quicksight:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                ':analysis/clickstream_analysis_*',
              ],
            ],
          },
        },
        {
          Action: [
            'quicksight:DescribeDashboard',
            'quicksight:DeleteDashboard',
            'quicksight:CreateDashboard',
            'quicksight:UpdateDashboard',
          ],
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':quicksight:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                ':dashboard/clickstream_dashboard_*',
              ],
            ],
          },
        },
      ],
      Version: '2012-10-17',
    },
    PolicyName: 'QuicksightCustomResourceLambdaRoleDefaultPolicyA0EB8B03',
    Roles: [
      {
        Ref: 'QuicksightCustomResourceLambdaRole58092032',
      },
    ],
  }, 1);

  template.resourcePropertiesCountIs('AWS::Lambda::Function', {
    Code: Match.anyValue(),
    Role: {
      'Fn::GetAtt': [
        Match.stringLikeRegexp('QuicksightCustomResourceLambdaRole[0-9]+'),
        'Arn',
      ],
    },
    Environment: {
      Variables: {
        POWERTOOLS_SERVICE_NAME: 'ClickStreamAnalyticsOnAWS',
        POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
        POWERTOOLS_LOGGER_LOG_EVENT: 'true',
        LOG_LEVEL: 'WARN',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
    },
    Handler: 'index.handler',
    MemorySize: 256,
    Timeout: 900,
  }, 1);

  template.resourcePropertiesCountIs('AWS::QuickSight::VPCConnection', {
    AwsAccountId: {
      Ref: 'AWS::AccountId',
    },
    RoleArn: {
      'Fn::GetAtt': [
        'VPCConnectionCreateRoleC12A5544',
        'Arn',
      ],
    },
    SecurityGroupIds: {
      Ref: 'QuickSightVpcConnectionSGParam',
    },
    SubnetIds: {
      'Fn::Split': [
        ',',
        {
          Ref: 'QuickSightVpcConnectionSubnetParam',
        },
      ],
    },
  }, 1);

  template.resourcePropertiesCountIs('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'quicksight.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    Description: 'IAM role use to create QuickSight VPC connection.',
  }, 1);

  template.resourcePropertiesCountIs('AWS::Lambda::Function', {
    Code: Match.anyValue(),
    Role: {
      'Fn::GetAtt': [
        Match.stringLikeRegexp('QuicksightCustomResourceProviderframeworkonEventServiceRole[A-Z0-9]+'),
        'Arn',
      ],
    },
    Environment: {
      Variables: {
        USER_ON_EVENT_FUNCTION_ARN: {
          'Fn::GetAtt': [
            Match.stringLikeRegexp('QuicksightCustomResourceLambda[A-Z0-9]+'),
            'Arn',
          ],
        },
      },
    },
    Handler: 'framework.onEvent',
    Timeout: 900,
  }, 1);

  template.resourcePropertiesCountIs('Custom::LogRetention', {
    ServiceToken: {
      'Fn::GetAtt': [
        Match.stringLikeRegexp('LogRetention[a-zA-Z0-9]+'),
        'Arn',
      ],
    },
    LogGroupName: {
      'Fn::Join': [
        '',
        [
          '/aws/lambda/',
          {
            Ref: Match.stringLikeRegexp('QuicksightCustomResourceLambda[a-zA-Z0-9]+'),
          },
        ],
      ],
    },
    RetentionInDays: 7,
  }, 1);

  template.resourcePropertiesCountIs('AWS::QuickSight::Template', {
    AwsAccountId: {
      Ref: 'AWS::AccountId',
    },
    TemplateId: {
      'Fn::Join': [
        '',
        [
          'clickstream_template_',
          {
            Ref: 'RedshiftDBParam',
          },
          '_',
          {
            'Fn::Select': [
              0,
              {
                'Fn::Split': [
                  '-',
                  {
                    'Fn::Select': [
                      2,
                      {
                        'Fn::Split': [
                          '/',
                          {
                            Ref: 'AWS::StackId',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      ],
    },
    Definition: {
      'Fn::If': [
        'useTemplateArnCondition',
        {
          Ref: 'AWS::NoValue',
        },
        Match.anyValue(),
      ],
    },
    Permissions: [
      {
        Actions: [
          'quicksight:UpdateTemplatePermissions',
          'quicksight:DescribeTemplatePermissions',
          'quicksight:DescribeTemplate',
          'quicksight:DeleteTemplate',
          'quicksight:UpdateTemplate',
        ],
        Principal: {
          Ref: 'QuickSightPrincipalParam',
        },
      },
    ],
    SourceEntity: {
      'Fn::If': [
        'useTemplateArnCondition',
        {
          SourceTemplate: {
            Arn: {
              Ref: 'QuickSightTemplateArnParam',
            },
          },
        },
        {
          Ref: 'AWS::NoValue',
        },
      ],
    },
  }, 1);


  template.resourcePropertiesCountIs('AWS::QuickSight::DataSource', {
    AwsAccountId: {
      Ref: 'AWS::AccountId',
    },
    Credentials: {
      CredentialPair: {
        Password: {
          'Fn::Join': [
            '',
            [
              '{{resolve:secretsmanager:arn:',
              {
                Ref: 'AWS::Partition',
              },
              ':secretsmanager:',
              {
                Ref: 'AWS::Region',
              },
              ':',
              {
                Ref: 'AWS::AccountId',
              },
              ':secret:',
              {
                Ref: 'RedshiftParameterKeyParam',
              },
              ':SecretString:password::}}',
            ],
          ],
        },
        Username: {
          'Fn::Join': [
            '',
            [
              '{{resolve:secretsmanager:arn:',
              {
                Ref: 'AWS::Partition',
              },
              ':secretsmanager:',
              {
                Ref: 'AWS::Region',
              },
              ':',
              {
                Ref: 'AWS::AccountId',
              },
              ':secret:',
              {
                Ref: 'RedshiftParameterKeyParam',
              },
              ':SecretString:username::}}',
            ],
          ],
        },
      },
    },
    DataSourceId: {
      'Fn::Join': [
        '',
        [
          'clickstream_datasource_',
          {
            Ref: 'RedshiftDBParam',
          },
          '_',
          {
            'Fn::Select': [
              0,
              {
                'Fn::Split': [
                  '-',
                  {
                    'Fn::Select': [
                      2,
                      {
                        'Fn::Split': [
                          '/',
                          {
                            Ref: 'AWS::StackId',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      ],
    },
    DataSourceParameters: {
      RedshiftParameters: {
        Database: {
          Ref: 'RedshiftDBParam',
        },
        Host: {
          Ref: 'RedshiftEndpointParam',
        },
        Port: {
          Ref: 'RedshiftPortParam',
        },
      },
    },
    Name: {
      'Fn::Join': [
        '',
        [
          'Clickstream DataSource ',
          {
            Ref: 'RedshiftDBParam',
          },
        ],
      ],
    },
    Permissions: [
      {
        Actions: [
          'quicksight:UpdateDataSourcePermissions',
          'quicksight:DescribeDataSourcePermissions',
          'quicksight:PassDataSource',
          'quicksight:DescribeDataSource',
          'quicksight:DeleteDataSource',
          'quicksight:UpdateDataSource',
        ],
        Principal: {
          Ref: 'QuickSightPrincipalParam',
        },
      },
    ],
    Type: 'REDSHIFT',
    VpcConnectionProperties: {
      VpcConnectionArn: {
        'Fn::GetAtt': [
          'ClickstreamVPCConnectionResource',
          'Arn',
        ],
      },
    },
  }, 1);

  template.resourcePropertiesCountIs('AWS::CloudFormation::CustomResource',
    {
      ServiceToken: {
        'Fn::GetAtt': [
          'QuicksightCustomResourceProviderframeworkonEvent9676AE66',
          'Arn',
        ],
      },
      awsAccountId: {
        Ref: 'AWS::AccountId',
      },
      awsRegion: {
        Ref: 'AWS::Region',
      },
      awsPartition: {
        Ref: 'AWS::Partition',
      },
      quickSightNamespace: {
        Ref: 'QuickSightNamespaceParam',
      },
      quickSightUser: {
        Ref: 'QuickSightUserParam',
      },
      quickSightPrincipalArn: {
        Ref: 'QuickSightPrincipalParam',
      },
      schemas: {
        Ref: 'RedShiftDBSchemaParam',
      },
      dashboardDefProps: {
        analysisName: 'Clickstream Analysis',
        dashboardName: 'Clickstream Dashboard',
        templateArn: {
          'Fn::GetAtt': [
            'ClickstreamTemplateDef',
            'Arn',
          ],
        },
        dataSourceArn: {
          'Fn::GetAtt': [
            'ClickstreamDataSource',
            'Arn',
          ],
        },
        databaseName: {
          Ref: 'RedshiftDBParam',
        },
        dataSets: [
          {
            name: '',
            tableName: 'clickstream_user_dim_view',
            importMode: 'DIRECT_QUERY',
            columns: [
              {
                Name: 'user_pseudo_id',
                Type: 'STRING',
              },
              {
                Name: 'user_id',
                Type: 'STRING',
              },
              {
                Name: 'first_visit_date',
                Type: 'DATETIME',
              },
              {
                Name: 'first_visit_install_source',
                Type: 'STRING',
              },
              {
                Name: 'first_visit_device_language',
                Type: 'STRING',
              },
              {
                Name: 'first_platform',
                Type: 'STRING',
              },
              {
                Name: 'first_visit_country',
                Type: 'STRING',
              },
              {
                Name: 'first_visit_city',
                Type: 'STRING',
              },
              {
                Name: 'first_traffic_source_source',
                Type: 'STRING',
              },
              {
                Name: 'first_traffic_source_medium',
                Type: 'STRING',
              },
              {
                Name: 'first_traffic_source_name',
                Type: 'STRING',
              },
              {
                Name: 'is_registered',
                Type: 'STRING',
              },
            ],
            customSql: 'SELECT * FROM {{schema}}.clickstream_user_dim_view',
            columnGroups: [
              {
                geoSpatialColumnGroupName: 'geo',
                geoSpatialColumnGroupColumns: [
                  'first_visit_country',
                  'first_visit_city',
                ],
              },
            ],
            projectedColumns: [
              'user_pseudo_id',
              'user_id',
              'first_visit_date',
              'first_visit_install_source',
              'first_visit_device_language',
              'first_platform',
              'first_visit_country',
              'first_visit_city',
              'first_traffic_source_source',
              'first_traffic_source_medium',
              'first_traffic_source_name',
              'is_registered',
            ],
            tagColumnOperations: [
              {
                columnName: 'first_visit_city',
                columnGeographicRoles: [
                  'CITY',
                ],
              },
              {
                columnName: 'first_visit_country',
                columnGeographicRoles: [
                  'COUNTRY',
                ],
              },
            ],
          },
          {
            name: '',
            tableName: 'clickstream_retention_view',
            importMode: 'DIRECT_QUERY',
            customSql: 'SELECT * FROM {{schema}}.clickstream_retention_view',
            columns: [
              {
                Name: 'first_date',
                Type: 'DATETIME',
              },
              {
                Name: 'day_diff',
                Type: 'INTEGER',
              },
              {
                Name: 'returned_user_count',
                Type: 'INTEGER',
              },
              {
                Name: 'total_users',
                Type: 'INTEGER',
              },
            ],
            projectedColumns: [
              'first_date',
              'day_diff',
              'returned_user_count',
              'total_users',
            ],
          },
          {
            name: '',
            tableName: 'clickstream_session_view',
            importMode: 'DIRECT_QUERY',
            customSql: 'SELECT * FROM {{schema}}.clickstream_session_view',
            columns: [
              {
                Name: 'session_id',
                Type: 'STRING',
              },
              {
                Name: 'user_pseudo_id',
                Type: 'STRING',
              },
              {
                Name: 'platform',
                Type: 'STRING',
              },
              {
                Name: 'session_duration',
                Type: 'INTEGER',
              },
              {
                Name: 'session_views',
                Type: 'INTEGER',
              },
              {
                Name: 'engaged_session',
                Type: 'INTEGER',
              },
              {
                Name: 'bounced_session',
                Type: 'INTEGER',
              },
              {
                Name: 'session_start_timestamp',
                Type: 'INTEGER',
              },
              {
                Name: 'session_engagement_time',
                Type: 'INTEGER',
              },
              {
                Name: 'session_date',
                Type: 'DATETIME',
              },
              {
                Name: 'session_date_hour',
                Type: 'DATETIME',
              },
              {
                Name: 'entry_view',
                Type: 'STRING',
              },
              {
                Name: 'exit_view',
                Type: 'STRING',
              },
            ],
            projectedColumns: [
              'session_id',
              'user_pseudo_id',
              'platform',
              'session_duration',
              'session_views',
              'engaged_session',
              'bounced_session',
              'session_start_timestamp',
              'session_engagement_time',
              'session_date',
              'session_date_hour',
              'entry_view',
              'exit_view',
            ],
          },
          {
            name: '',
            tableName: 'clickstream_user_attr_view',
            importMode: 'DIRECT_QUERY',
            customSql: 'SELECT * FROM {{schema}}.clickstream_user_attr_view',
            columns: [
              {
                Name: 'user_pseudo_id',
                Type: 'STRING',
              },
              {
                Name: 'user_id',
                Type: 'STRING',
              },
              {
                Name: 'custom_attr_key',
                Type: 'STRING',
              },
              {
                Name: 'custom_attr_value',
                Type: 'STRING',
              },
            ],
            projectedColumns: [
              'user_pseudo_id',
              'user_id',
              'custom_attr_key',
              'custom_attr_value',
            ],
          },
          {
            name: '',
            tableName: 'clickstream_ods_events_view',
            importMode: 'DIRECT_QUERY',
            customSql: 'SELECT * FROM {{schema}}.clickstream_ods_events_rt_view',
            columns: [
              {
                Name: 'event_date',
                Type: 'DATETIME',
              },
              {
                Name: 'event_name',
                Type: 'STRING',
              },
              {
                Name: 'event_id',
                Type: 'STRING',
              },
              {
                Name: 'event_bundle_sequence_id',
                Type: 'INTEGER',
              },
              {
                Name: 'event_previous_timestamp',
                Type: 'INTEGER',
              },
              {
                Name: 'event_server_timestamp_offset',
                Type: 'INTEGER',
              },
              {
                Name: 'event_timestamp',
                Type: 'INTEGER',
              },
              {
                Name: 'ingest_timestamp',
                Type: 'INTEGER',
              },
              {
                Name: 'event_value_in_usd',
                Type: 'DECIMAL',
              },
              {
                Name: 'app_info_app_id',
                Type: 'STRING',
              },
              {
                Name: 'app_info_package_id',
                Type: 'STRING',
              },
              {
                Name: 'app_info_install_source',
                Type: 'STRING',
              },
              {
                Name: 'app_info_version',
                Type: 'STRING',
              },
              {
                Name: 'device_mobile_brand_name',
                Type: 'STRING',
              },
              {
                Name: 'device_mobile_model_name',
                Type: 'STRING',
              },
              {
                Name: 'device_manufacturer',
                Type: 'STRING',
              },
              {
                Name: 'device_screen_width',
                Type: 'INTEGER',
              },
              {
                Name: 'device_screen_height',
                Type: 'INTEGER',
              },
              {
                Name: 'device_carrier',
                Type: 'STRING',
              },
              {
                Name: 'device_network_type',
                Type: 'STRING',
              },
              {
                Name: 'device_operating_system',
                Type: 'STRING',
              },
              {
                Name: 'device_operating_system_version',
                Type: 'STRING',
              },
              {
                Name: 'ua_browser',
                Type: 'STRING',
              },
              {
                Name: 'ua_browser_version',
                Type: 'STRING',
              },
              {
                Name: 'ua_os',
                Type: 'STRING',
              },
              {
                Name: 'ua_os_version',
                Type: 'STRING',
              },
              {
                Name: 'ua_device',
                Type: 'STRING',
              },
              {
                Name: 'ua_device_category',
                Type: 'STRING',
              },
              {
                Name: 'device_system_language',
                Type: 'STRING',
              },
              {
                Name: 'device_time_zone_offset_seconds',
                Type: 'INTEGER',
              },
              {
                Name: 'geo_continent',
                Type: 'STRING',
              },
              {
                Name: 'geo_country',
                Type: 'STRING',
              },
              {
                Name: 'geo_city',
                Type: 'STRING',
              },
              {
                Name: 'geo_metro',
                Type: 'STRING',
              },
              {
                Name: 'geo_region',
                Type: 'STRING',
              },
              {
                Name: 'geo_sub_continent',
                Type: 'STRING',
              },
              {
                Name: 'geo_locale',
                Type: 'STRING',
              },
              {
                Name: 'platform',
                Type: 'STRING',
              },
              {
                Name: 'project_id',
                Type: 'STRING',
              },
              {
                Name: 'traffic_source_name',
                Type: 'STRING',
              },
              {
                Name: 'traffic_source_medium',
                Type: 'STRING',
              },
              {
                Name: 'traffic_source_source',
                Type: 'STRING',
              },
              {
                Name: 'user_first_touch_timestamp',
                Type: 'INTEGER',
              },
              {
                Name: 'user_id',
                Type: 'STRING',
              },
              {
                Name: 'user_pseudo_id',
                Type: 'STRING',
              },
            ],
            tagColumnOperations: [
              {
                columnName: 'geo_country',
                columnGeographicRoles: [
                  'COUNTRY',
                ],
              },
              {
                columnName: 'geo_city',
                columnGeographicRoles: [
                  'CITY',
                ],
              },
              {
                columnName: 'geo_region',
                columnGeographicRoles: [
                  'STATE',
                ],
              },
            ],
            projectedColumns: [
              'event_date',
              'event_name',
              'event_id',
              'event_bundle_sequence_id',
              'event_previous_timestamp',
              'event_server_timestamp_offset',
              'event_timestamp',
              'ingest_timestamp',
              'event_value_in_usd',
              'app_info_app_id',
              'app_info_package_id',
              'app_info_install_source',
              'app_info_version',
              'device_mobile_brand_name',
              'device_mobile_model_name',
              'device_manufacturer',
              'device_screen_width',
              'device_screen_height',
              'device_carrier',
              'device_network_type',
              'device_operating_system',
              'device_operating_system_version',
              'ua_browser',
              'ua_browser_version',
              'ua_os',
              'ua_os_version',
              'ua_device',
              'ua_device_category',
              'device_system_language',
              'device_time_zone_offset_seconds',
              'geo_continent',
              'geo_country',
              'geo_city',
              'geo_metro',
              'geo_region',
              'geo_sub_continent',
              'geo_locale',
              'platform',
              'project_id',
              'traffic_source_name',
              'traffic_source_medium',
              'traffic_source_source',
              'user_first_touch_timestamp',
              'user_id',
              'user_pseudo_id',
            ],
          },
          {
            name: '',
            tableName: 'clickstream_device_view',
            importMode: 'DIRECT_QUERY',
            customSql: 'SELECT * FROM {{schema}}.clickstream_device_view',
            columns: [
              {
                Name: 'device_id',
                Type: 'STRING',
              },
              {
                Name: 'event_date',
                Type: 'DATETIME',
              },
              {
                Name: 'mobile_brand_name',
                Type: 'STRING',
              },
              {
                Name: 'mobile_model_name',
                Type: 'STRING',
              },
              {
                Name: 'manufacturer',
                Type: 'STRING',
              },
              {
                Name: 'screen_width',
                Type: 'INTEGER',
              },
              {
                Name: 'screen_height',
                Type: 'INTEGER',
              },
              {
                Name: 'carrier',
                Type: 'STRING',
              },
              {
                Name: 'network_type',
                Type: 'STRING',
              },
              {
                Name: 'operating_system',
                Type: 'STRING',
              },
              {
                Name: 'operating_system_version',
                Type: 'STRING',
              },
              {
                Name: 'ua_browser',
                Type: 'STRING',
              },
              {
                Name: 'ua_browser_version',
                Type: 'STRING',
              },
              {
                Name: 'ua_os',
                Type: 'STRING',
              },
              {
                Name: 'ua_os_version',
                Type: 'STRING',
              },
              {
                Name: 'ua_device',
                Type: 'STRING',
              },
              {
                Name: 'ua_device_category',
                Type: 'STRING',
              },
              {
                Name: 'system_language',
                Type: 'STRING',
              },
              {
                Name: 'time_zone_offset_seconds',
                Type: 'INTEGER',
              },
              {
                Name: 'advertising_id',
                Type: 'STRING',
              },
              {
                Name: 'user_pseudo_id',
                Type: 'STRING',
              },
              {
                Name: 'user_id',
                Type: 'STRING',
              },
              {
                Name: 'usage_num',
                Type: 'INTEGER',
              },
            ],
            projectedColumns: [
              'device_id',
              'event_date',
              'mobile_brand_name',
              'mobile_model_name',
              'manufacturer',
              'screen_width',
              'screen_height',
              'carrier',
              'network_type',
              'operating_system',
              'operating_system_version',
              'ua_browser',
              'ua_browser_version',
              'ua_os',
              'ua_os_version',
              'ua_device',
              'ua_device_category',
              'system_language',
              'time_zone_offset_seconds',
              'advertising_id',
              'user_pseudo_id',
              'user_id',
              'usage_num',
            ],
          },
          {
            name: '',
            tableName: 'clickstream_ods_events_parameter_view',
            importMode: 'DIRECT_QUERY',
            customSql: 'SELECT * FROM {{schema}}.clickstream_ods_events_parameter_rt_view ',
            columns: [
              {
                Name: 'event_id',
                Type: 'STRING',
              },
              {
                Name: 'event_name',
                Type: 'STRING',
              },
              {
                Name: 'event_date',
                Type: 'DATETIME',
              },
              {
                Name: 'event_parameter_key',
                Type: 'STRING',
              },
              {
                Name: 'event_parameter_value',
                Type: 'STRING',
              },
            ],
            projectedColumns: [
              'event_id',
              'event_name',
              'event_date',
              'event_parameter_key',
              'event_parameter_value',
            ],
          },
          {
            name: '',
            tableName: 'clickstream_lifecycle_daily_view',
            importMode: 'DIRECT_QUERY',
            customSql: 'SELECT * FROM {{schema}}.clickstream_lifecycle_daily_view',
            columns: [
              {
                Name: 'time_period',
                Type: 'DATETIME',
              },
              {
                Name: 'this_day_value',
                Type: 'STRING',
              },
              {
                Name: 'sum',
                Type: 'INTEGER',
              },
            ],
            projectedColumns: [
              'time_period',
              'this_day_value',
              'sum',
            ],
          },
          {
            name: '',
            tableName: 'clickstream_lifecycle_weekly_view',
            importMode: 'DIRECT_QUERY',
            customSql: 'SELECT * FROM {{schema}}.clickstream_lifecycle_weekly_view',
            columns: [
              {
                Name: 'time_period',
                Type: 'DATETIME',
              },
              {
                Name: 'this_week_value',
                Type: 'STRING',
              },
              {
                Name: 'sum',
                Type: 'INTEGER',
              },
            ],
            projectedColumns: [
              'time_period',
              'this_week_value',
              'sum',
            ],
          },
          {
            name: '',
            tableName: 'clickstream_path_view',
            importMode: 'DIRECT_QUERY',
            customSql: 'SELECT * FROM {{schema}}.clickstream_path_view',
            columns: [
              {
                Name: 'user_pseudo_id',
                Type: 'STRING',
              },
              {
                Name: 'event_date',
                Type: 'DATETIME',
              },
              {
                Name: 'event_id',
                Type: 'STRING',
              },
              {
                Name: 'event_name',
                Type: 'STRING',
              },
              {
                Name: 'event_timestamp',
                Type: 'INTEGER',
              },
              {
                Name: 'platform',
                Type: 'STRING',
              },
              {
                Name: 'session_id',
                Type: 'STRING',
              },
              {
                Name: 'current_screen',
                Type: 'STRING',
              },
              {
                Name: 'event_rank',
                Type: 'INTEGER',
              },
              {
                Name: 'previous_event',
                Type: 'STRING',
              },
              {
                Name: 'next_event',
                Type: 'STRING',
              },
              {
                Name: 'previous_screen',
                Type: 'STRING',
              },
              {
                Name: 'next_screen',
                Type: 'STRING',
              },
            ],
            projectedColumns: [
              'user_pseudo_id',
              'event_date',
              'event_id',
              'event_name',
              'event_timestamp',
              'platform',
              'session_id',
              'current_screen',
              'event_rank',
              'previous_event',
              'next_event',
              'previous_screen',
              'next_screen',
            ],
          },
        ],

      },
    }, 1);

});