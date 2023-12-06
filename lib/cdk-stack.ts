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
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsList = new NodejsFunction(this, "getProductsListHandler", {
      // code: Code.fromAsset("lambdas"),
      handler: "handler",
      // runtime: Runtime,
      entry: path.join(__dirname, `/../lambdas/getProductsList.ts`),
    });

    const getProductsById = new NodejsFunction(this, "getProductsByIdHandler", {
      handler: "handler",
      entry: path.join(__dirname, `/../lambdas/getProductsById.ts`),
    });

    const api = new RestApi(this, "Endpoint");

    const products = api.root.addResource("products");
    products.addMethod("GET", new LambdaIntegration(getProductsList));

    const specificProduct = products.addResource("{productId}");
    specificProduct.addMethod("GET", new LambdaIntegration(getProductsById));

    // defaultCorsPreflightOptions: {
    //   allowOrigins: Cors.ALL_ORIGINS, // Enables CORS
    //   allowMethods: Cors.ALL_METHODS, // Allows all methods
    // }
  }
}
