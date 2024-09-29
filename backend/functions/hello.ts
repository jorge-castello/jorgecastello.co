export const handler = async (event: any) => {
  console.log('Hello from Lambda!');
  return {
    statusCode: 200,
    body: 'Hello from Lambda!',
  };
};
