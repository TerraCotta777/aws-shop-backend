import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  Cors,
  LambdaIntegration,
  LambdaRestApi,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import path = require("path");
import { AttributeType, Table, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { Product } from "aws-cdk-lib/aws-servicecatalog";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const productsArn = 'arn:aws:dynamodb:ap-northeast-2:997174727861:table/products';
    const stocksArn = 'arn:aws:dynamodb:ap-northeast-2:997174727861:table/stocks';

    const productsTable = Table.fromTableArn(this, 'products', productsArn);
    const stocksTable = Table.fromTableArn(this, 'stocks', stocksArn);
    
    const productsDB = {
      PRODUCTS_TABLE_NAME: productsTable.tableName,
      STOCKS_TABLE_NAME: stocksTable.tableName,
    };
    
    const deleteRole = new iam.Role(this, 'deleteLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    
    deleteRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'dynamodb:DeleteItem'
        ],
        resources: [productsTable.tableArn, stocksTable.tableArn]
      })
    );

    deleteRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents'
      ],
      resources: ['arn:aws:logs:*:*:*']
    }));

    const getProductsList = new NodejsFunction(this, "getProductsListHandler", {
      handler: "handler",
      entry: path.join(__dirname, `/../lambdas/getProductsList.ts`),
      environment: productsDB,
    });

    const getProductsById = new NodejsFunction(this, "getProductsByIdHandler", {
      handler: "handler",
      entry: path.join(__dirname, `/../lambdas/getProductsById.ts`),
      environment: productsDB,
    });

    const createProduct = new NodejsFunction(this, "createProductHandler", {
      handler: "handler",
      entry: path.join(__dirname, `/../lambdas/createProduct.ts`),
      environment: productsDB,
      role: deleteRole
    });

    const deleteProduct = new NodejsFunction(this, "deleteProductHandler", {
      handler: "handler",
      entry: path.join(__dirname, `/../lambdas/deleteProduct.ts`),
      environment: productsDB,
      role: deleteRole
    });

    productsTable.grantReadData(getProductsList)
    productsTable.grantReadData(getProductsById)
    stocksTable.grantReadData(getProductsList)
    stocksTable.grantReadData(getProductsById)
    productsTable.grantWriteData(createProduct)
    stocksTable.grantWriteData(createProduct)
    productsTable.grantFullAccess(deleteProduct)

    const api = new RestApi(this, "Endpoint");

    const products = api.root.addResource("products");
    products.addMethod("GET", new LambdaIntegration(getProductsList));

    const specificProduct = products.addResource("{productId}");
    specificProduct.addMethod("GET", new LambdaIntegration(getProductsById));

    products.addMethod("POST", new LambdaIntegration(createProduct));

    specificProduct.addMethod("DELETE", new LambdaIntegration(deleteProduct));

    // defaultCorsPreflightOptions: {
    //   allowOrigins: Cors.ALL_ORIGINS, // Enables CORS
    //   allowMethods: Cors.ALL_METHODS, // Allows all methods
    // }
  }
}
