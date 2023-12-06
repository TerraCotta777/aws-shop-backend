import { handler } from "../lambdas/getProductsList";

test("getProductsList handler", async () => {
  const { statusCode, body } = await handler({});
  const product = JSON.parse(body);

  expect(statusCode).toEqual(200);
  expect(product).toEqual([
    {
      id: "1",
      name: "Product1",
    },
    {
      id: "2",
      name: "Product2",
    },
  ]);
});
