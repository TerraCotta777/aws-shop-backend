import { eventSpecificProduct } from "../types/product"
import * as AWS from "aws-sdk"
import * as uuid from "uuid"

const dynamodb = new AWS.DynamoDB.DocumentClient()

export const handler = async (event: eventSpecificProduct): Promise<any> => {
    console.log("Delete product with following arguments: ", event)
    const productId = event.pathParameters?.productId
    console.log(productId)
    if (!uuid.validate(productId)) {
        return { statusCode: 400, body: "Id is not valid" }
    }
    const delParamsProducts = {
        TableName: process.env.PRODUCTS_TABLE_NAME!,
        Key: {
            id: productId,
        },
    }
    const delParamsStocks = {
        TableName: process.env.STOCKS_TABLE_NAME!,
        Key: {
            productId: productId,
        },
    }

    const productsResponse = await dynamodb.delete(delParamsProducts).promise()
    const stocksResponse = await dynamodb.delete(delParamsStocks).promise()

    if (productsResponse.$response.error || stocksResponse.$response.error) {
        return { statusCode: 500, body: "Product delete request failed" }
    }

    return { statusCode: 200, body: JSON.stringify({ id: productId }) }
}
