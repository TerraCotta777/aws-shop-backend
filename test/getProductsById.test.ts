import * as uuid from 'uuid';
import {handler} from '../lambdas/getProductsById';

test('getProductsById handler', async () => {
    const event = {
        pathParameters: {
            productId: uuid.NIL,
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