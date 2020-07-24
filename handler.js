const awsServerlessExpress = require('aws-serverless-express');
const app = require('./server');

exports.handler = async (event, context) => {
  const server = awsServerlessExpress.createServer(await app.start({ noListen: true }));
  context.callbackWaitsForEmptyEventLoop = false;
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};
