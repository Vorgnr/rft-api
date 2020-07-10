const should = require('should/as-function');

describe('Player API', () => {
  before(async () => {
    await global.test.knex('player').del()
  });
  describe('POST /players', () => {
    it('should create a player', async function () {
      const body = { email: 'foo@rft.com' };
      const request = await global.test.axios.post('/players', { email: 'foo@rft.com' });
      should(request.data).have.property('id')
      should(request.data).have.property('email', body.email)
      const players = await global.test.knex('player').select('*');
      should(players).be.an.Array()
        .with.lengthOf(1);
    });
  });
});
