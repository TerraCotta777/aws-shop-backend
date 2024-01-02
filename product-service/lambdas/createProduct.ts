import * as AWS from "aws-sdk"
import * as uuid from "uuid"

const dynamodb = new AWS.DynamoDB.DocumentClient()

export const handler = async (event: { body: string }): Promise<any> => {
    const body = JSON.parse(event.body)
    console.log("Create product with following arguments: ", body)

    if (
        !(
            "title" in body &&
            "description" in body &&
            "price" in body &&
            "count" in body
        ) ||
        !(
            typeof body.title === "string" &&
            typeof body.description === "string" &&
            typeof body.price === "number" &&
            typeof body.count === "number"
        )
    ) {
        return { statusCode: 400, body: "Request body is not valid" }
    }

    try {
        const productId = uuid.v4()
        const paramsProducts = {
            TableName: process.env.PRODUCTS_TABLE_NAME!,
            Item: {
                id: productId,
                title: body.title,
                description: body.description,
                price: body.price,
            },
        }
        const delParamsProducts = {
            TableName: process.env.PRODUCTS_TABLE_NAME!,
            Key: {
                id: productId,
            },
        }
        const paramsStocks = {
            TableName: process.env.STOCKS_TABLE_NAME!,
            Item: {
                product_id: productId,
                count: body.count,
            },
        }

        await dynamodb.put(paramsProducts).promise()
        const stocksResponse = await dynamodb.put(paramsStocks).promise()
        if (stocksResponse.$response.error) {
            await dynamodb.delete(delParamsProducts).promise()
        }

        return { statusCode: 200, body: JSON.stringify({ id: productId }) }
    } catch (err) {
        console.log(err)
        return { statusCode: 500, body: "Product create request failed" }
    }
}
