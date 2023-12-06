import {handler} from '../lambdas/getProductsById';

test('getProductsById handler', async () => {
    const event = {
        pathParameters: {
            productId: '1',
        }
    };

    const {statusCode, body} = await handler(event);
    const product = JSON.parse(body);

    expect(statusCode).toEqual(200);
    expect(product).toEqual({
        id: '1',
        name: 'Product1'
    });
});