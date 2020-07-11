const axios = require('axios');
const server = require('../server');

before(async () => {
  axios.defaults.baseURL = `http://localhost:${process.env.PORT}`;
  global.test = {
    knex: await server.start(),
    axios: axios.create(),
  };
});
