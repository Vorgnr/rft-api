const server = require('../server');
const axios = require('axios');

before(async () => {
  axios.defaults.baseURL = 'http://localhost:' + process.env.PORT;
  global.test = {
    knex: await server.start(),
    axios: axios.create()
  }
});

after(() => {
  server.stop();
})