import * as AWS from "aws-sdk"
import { eventType } from "aws-sdk/clients/health"
import csv from "csv-parser"

const s3 = new AWS.S3()

export const handler = async (event: any) => {
    console.log("importFileParser")

    for (const record of event.Records) {
        const s3Stream = s3
            .getObject({
                Bucket: record.s3.bucket.name,
                Key: record.s3.object.key,
            })
            .createReadStream()

        await new Promise((resolve, reject) => {
            s3Stream
                .pipe(csv())
                .on("data", (data) => {
                    console.log("Data: ", data)
                })
                .on("end", () => {
                    console.log(`Parsing complete: ${record.s3.object.key}`)
                })
                .on("error", reject)
        })
    }
}
