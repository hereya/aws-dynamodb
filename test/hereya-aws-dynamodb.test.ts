import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { HereyaAwsDynamodbStack } from '../lib/hereya-aws-dynamodb-stack';

describe('HereyaAwsDynamodbStack', () => {

  afterEach(() => {
    delete process.env.namePrefix;
    delete process.env.autoDelete;
    delete process.env.partitionKeyName;
    delete process.env.sortKeyName;
  });

  test('DynamoDB Table created with default configuration', () => {
    const app = new cdk.App();
    const stack = new HereyaAwsDynamodbStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true,
      },
      TableName: 'app-teststack',
    });
  });

  test('DynamoDB Table created with sort key when sortKeyName is set', () => {
    process.env.sortKeyName = 'sk';
    const app = new cdk.App();
    const stack = new HereyaAwsDynamodbStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
      ],
    });
  });

  test('DynamoDB Table uses custom key names', () => {
    process.env.partitionKeyName = 'userId';
    process.env.sortKeyName = 'taskId';
    const app = new cdk.App();
    const stack = new HereyaAwsDynamodbStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'taskId', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'taskId', AttributeType: 'S' },
      ],
    });
  });

  test('Stack creates CloudFormation outputs', () => {
    const app = new cdk.App();
    const stack = new HereyaAwsDynamodbStack(app, 'TestStack');
    const template = Template.fromStack(stack);
    const json = template.toJSON();

    expect(json.Outputs).toHaveProperty('tableName');
    expect(json.Outputs).toHaveProperty('awsRegion');
    expect(json.Outputs).toHaveProperty('iamPolicyAwsDynamodb');
  });

  test('DynamoDB Table uses custom prefix', () => {
    process.env.namePrefix = 'tasks';
    const app = new cdk.App();
    const stack = new HereyaAwsDynamodbStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'tasks-teststack',
    });
  });

  test('DynamoDB Table respects autoDelete parameter', () => {
    process.env.autoDelete = 'true';
    const app = new cdk.App();
    const stack = new HereyaAwsDynamodbStack(app, 'TestStack');
    const template = Template.fromStack(stack);
    const json = template.toJSON();

    const table = Object.values(json.Resources).find(
      (r: any) => r.Type === 'AWS::DynamoDB::Table'
    ) as any;
    expect(table.DeletionPolicy).toBe('Delete');
  });

  test('DynamoDB Table retains by default', () => {
    const app = new cdk.App();
    const stack = new HereyaAwsDynamodbStack(app, 'TestStack');
    const template = Template.fromStack(stack);
    const json = template.toJSON();

    const table = Object.values(json.Resources).find(
      (r: any) => r.Type === 'AWS::DynamoDB::Table'
    ) as any;
    expect(table.DeletionPolicy).toBe('Retain');
  });
});
