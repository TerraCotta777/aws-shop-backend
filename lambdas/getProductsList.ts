import { APIGatewayEvent } from "aws-lambda";

export const handler = async(event: {}): Promise<any> => {
    const mockData = [
       {
           id: '1',
           name: 'Product1'
       },
       {
           id: '2',
           name: 'Product2'
       }
   ];
   return {
       statusCode: 200,
       headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
       },
       body: JSON.stringify(mockData)
   };
}