const NodeGeocoder = require('node-geocoder');
const dotenv = require('dotenv');

dotenv.config({ path: '../config/config.env' });

const options = {
  provider: process.env.GEOCODER_PROVIDER || 'mapquest',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY || 'WnFTkJOiAA0Fc1bBlN0dhPl3s23cXwRN',
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
