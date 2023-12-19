import * as AWS from "aws-sdk"

const dynamodb = new AWS.DynamoDB.DocumentClient()

export const handler = async (): Promise<any> => {
    console.log("Get products list with no arguments.")
    const paramsProducts = {
        TableName: process.env.PRODUCTS_TABLE_NAME!,
    }

    const paramsStocks = {
        TableName: process.env.STOCKS_TABLE_NAME!,
    }

    const products = await dynamodb.scan(paramsProducts).promise()
    const stocks = await dynamodb.scan(paramsStocks).promise()

    if (products.$response.error || stocks.$response.error) {
        return { statusCode: 500, body: "Product get request failed" }
    }

    const result = products.Items!.map((p) => {
        const stock = stocks.Items!.find((s) => s.productId === p.id)
        return { ...p, count: stock?.count }
    })

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: JSON.stringify(result),
    }
}
