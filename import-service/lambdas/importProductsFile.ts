import * as AWS from "aws-sdk"
import { eventType } from "../types"

const s3 = new AWS.S3()

export const handler = async (event: eventType): Promise<any> => {
    console.log("importProductsFile")

    const fileName = event.queryStringParameters?.name

    if (!fileName) {
        return { statusCode: 400, body: "Missing 'name' in query parameters" }
    }
    const s3Params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `uploaded/${fileName}`,
        Expires: 60,
        ContentType: "text/csv",
    }

    try {
        let url = await s3.getSignedUrlPromise("putObject", s3Params)
        console.log("logging url", url)
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, PUT",
            },
            body: JSON.stringify({ url }),
        }
    } catch (err) {
        console.log("S3 getSignedUrl Error", err)
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        }
    }
}
