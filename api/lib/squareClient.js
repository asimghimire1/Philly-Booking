require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { SquareClient, SquareEnvironment } = require('square');

const environment = process.env.SQUARE_ENVIRONMENT === 'production'
  ? SquareEnvironment.Production
  : SquareEnvironment.Sandbox;

const client = new SquareClient({
  environment,
  token: process.env.SQUARE_ACCESS_TOKEN,
});

module.exports = client;
