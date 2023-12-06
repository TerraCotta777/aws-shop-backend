import { eventProduct } from "../types/product";

export const handler = async(event: eventProduct): Promise<any> => {
    const mockData = [
        { id: '1', name: 'Product1' },
        { id: '2', name: 'Product2' }
    ];
    const productId = event.pathParameters?.productId;
    const product = mockData.find(p => p.id === String(productId));

    if(!product) {
        return { statusCode: 404, body: 'Product not found' };
    }

    return { statusCode: 200, body: JSON.stringify(product) };
}