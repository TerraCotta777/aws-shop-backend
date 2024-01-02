import * as AWS from "aws-sdk";
import { handler } from "../../lambdas/getProductsList";

test("getProductsList handler", async () => {
  const { statusCode, body } = await handler();
  const product = JSON.parse(body);

  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const paramsProducts = {
    TableName: process.env.PRODUCTS_TABLE_NAME!,
  };
  const paramsStocks = {
      TableName: process.env.STOCKS_TABLE_NAME!,
  };

  const products = await dynamodb.scan(paramsProducts).promise();
  const stocks = await dynamodb.scan(paramsStocks).promise();

  const result = products.Items!.map((p) => {
      const stock = stocks.Items!.find((s) => s.productId === p.id);
      return { ...p, count: stock ? stock.count : 0 };
  });
  expect(statusCode).toEqual(200);
  expect(product).toEqual(result);
});
