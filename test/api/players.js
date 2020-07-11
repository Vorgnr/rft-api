const should = require('should/as-function');

describe('Player API', () => {
  describe('POST /players', () => {
    before(async () => global.test.knex('player').del());
    it('should create a player', async () => {
      const body = { email: 'foo@rft.com' };
      const request = await global.test.axios.post('/players', { email: 'foo@rft.com' });
      should(request.data).have.property('id');
      should(request.data).have.property('email', body.email);
      should(request).have.property('status', 200);
      const players = await global.test.knex('player').select('*');
      should(players).be.an.Array()
        .with.lengthOf(1);
    });
  });

  describe('GET /players/:playerId', () => {
    before(async () => global.test.knex('player').del());

    describe('when player does not exist', () => {
      it('should return a 404 error', async () => {
        await global.test.axios.get('/players/bla')
          .then(() => {
            throw new Error('Unexpected promise resolution');
          })
          .catch((err) => {
            should(err.response).have.property('status', 404);
          });
      });
    });

    const player = { id: 'foobar', email: 'kalak@gmail.com' };
    before(async () => global.test
      .knex('player')
      .insert(player));

    it('should get a player', async () => {
      const request = await global.test.axios.get(`/players/${player.id}`);
      should(request).have.property('status', 200);
      should(request.data).have.property('id', player.id);
      should(request.data).have.property('email', player.email);
      should(request.data).not.have.property('password');
    });
  });

  describe('PUT /players/:playerId', () => {
    before(async () => global.test.knex('player').del());
    describe('when player doest not exist', () => {
      it('should return a 404 error', async () => {
        await global.test.axios.put('/players/bla', {})
          .then(() => {
            throw new Error('Unexpected promise resolution');
          })
          .catch((err) => {
            should(err.response).have.property('status', 404);
          });
      });
    });

    const player = { id: 'foobar', email: 'kalak@gmail.com' };
    before(async () => global.test
      .knex('player')
      .insert(player));
    it('should update player', async () => {
      const request = await global.test.axios.put(`/players/${player.id}`, { email: 'foo@rft.com' });
      should(request).have.property('status', 200);
      should(request.data).have.property('id');
      should(request.data).have.property('email', 'foo@rft.com');
      should(request.data).not.have.property('password');
    });
  });
});
