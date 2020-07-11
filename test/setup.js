const axios = require('axios');
const server = require('../server');

before(async () => {
  axios.defaults.baseURL = `http://localhost:${process.env.PORT}`;
  const knex = await server.start();
  global.test = {
    knex,
    clear: async () => {
      await knex('match').del();
      await knex('elo').del();
      await knex('player').del();
      await knex('league').del();
    },
    axios: axios.create(),
  };
});
