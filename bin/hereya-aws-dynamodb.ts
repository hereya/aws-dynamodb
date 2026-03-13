#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { HereyaAwsDynamodbStack } from '../lib/hereya-aws-dynamodb-stack';

const app = new cdk.App();
new HereyaAwsDynamodbStack(app, process.env.STACK_NAME!, {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  });
