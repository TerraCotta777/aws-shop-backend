import * as AWS from "aws-sdk"
import { eventSpecificProduct } from "../types/product"
import * as uuid from "uuid"

const dynamodb = new AWS.DynamoDB.DocumentClient()

export const handler = async (event: eventSpecificProduct): Promise<any> => {
    console.log("Get product with following id: ", event)
    const paramsProducts = {
        TableName: process.env.PRODUCTS_TABLE_NAME!,
    }

    const paramsStocks = {
        TableName: process.env.STOCKS_TABLE_NAME!,
    }

    const productId = event.pathParameters?.productId

    if (!uuid.validate(productId)) {
        return { statusCode: 404, body: "Product id is invalid" }
    }

    const products = await dynamodb.scan(paramsProducts).promise()
    const stocks = await dynamodb.scan(paramsStocks).promise()

    if (products.$response.error || stocks.$response.error) {
        return { statusCode: 500, body: "Product get request failed" }
    }

    const product = products.Items!.find((p) => p.id === productId)
    const stock = stocks.Items!.find((s) => s.productId === productId)

    if (!product) {
        return { statusCode: 404, body: "Product not found" }
    }
    const result = { ...product, count: stock?.count }

    return { statusCode: 200, body: JSON.stringify(result) }
}
