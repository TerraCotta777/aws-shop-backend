import * as cdk from "aws-cdk-lib"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Bucket, EventType } from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"
import * as iam from "aws-cdk-lib/aws-iam"
import path = require("path")
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway"

export class Backend_Import_Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const s3Arn = "arn:aws:s3:::import-service-terracotta"
        const bucket = Bucket.fromBucketArn(
            this,
            "import-service-terracotta",
            s3Arn
        )

        const lambdaRole = new iam.Role(this, "ImportProductsLambdaRole", {
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        })

        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    "s3:PutObject",
                    "s3:GetObject",
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                ],
                resources: [bucket.arnForObjects("*"), 'arn:aws:logs:*:*:*'],
            })
        )

        const importProductsFile = new NodejsFunction(
            this,
            "importProductsFileHandler",
            {
                handler: "handler",
                entry: path.join(
                    __dirname,
                    "/../lambdas/importProductsFile.ts"
                ),
                environment: {
                    BUCKET_NAME: bucket.bucketName,
                },
                role: lambdaRole,
            }
        )

        const importFileParser = new NodejsFunction(this, "importFileParser", {
            handler: "handler",
            entry: path.join(__dirname, "/../lambdas/importFileParser.ts"),
            role: lambdaRole,
        })

        bucket.addEventNotification(
            EventType.OBJECT_CREATED,
            new cdk.aws_s3_notifications.LambdaDestination(importFileParser),
            { prefix: "uploaded/" }
        )

        const api = new RestApi(this, "ImportApi")

        const importProducts = api.root.addResource("import")
        importProducts.addMethod(
            "GET",
            new LambdaIntegration(importProductsFile)
        )
    }
}
