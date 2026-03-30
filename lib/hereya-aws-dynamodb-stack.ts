import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class HereyaAwsDynamodbStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const tablePrefix = process.env.namePrefix || 'app';
    const autoDelete = process.env.autoDelete === 'true';
    const partitionKeyName = process.env.partitionKeyName || 'pk';
    const sortKeyName = process.env.sortKeyName;

    const tableName = `${tablePrefix}-${this.stackName}`.toLowerCase();

    const tableProps: dynamodb.TableProps = {
      tableName,
      partitionKey: {
        name: partitionKeyName,
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: autoDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
    };

    if (sortKeyName) {
      (tableProps as any).sortKey = {
        name: sortKeyName,
        type: dynamodb.AttributeType.STRING,
      };
    }

    const table = new dynamodb.Table(this, 'HereyaDynamodbTable', tableProps);

    const policyDocument = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'dynamodb:GetItem',
            'dynamodb:BatchGetItem',
            'dynamodb:PutItem',
            'dynamodb:BatchWriteItem',
            'dynamodb:UpdateItem',
            'dynamodb:DeleteItem',
            'dynamodb:Query',
            'dynamodb:Scan',
          ],
          resources: [
            table.tableArn,
            `${table.tableArn}/index/*`,
          ],
        }),
      ],
    });

    new cdk.CfnOutput(this, 'tableName', {
      value: table.tableName,
      description: 'The name of the DynamoDB table',
    });

    new cdk.CfnOutput(this, 'awsRegion', {
      value: this.region,
      description: 'The AWS region',
    });

    new cdk.CfnOutput(this, 'iamPolicyAwsDynamodb', {
      value: JSON.stringify(policyDocument.toJSON()),
      description: 'IAM policy document for DynamoDB table permissions',
    });
  }
}
