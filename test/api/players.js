const should = require('should/as-function');

describe.only('Player API', () => {
  describe('POST /players', () => {
    before(async () => global.test.clear());

    it('should create a player', async () => {
      const body = { name: 'DougFromParis' };
      const request = await global.test.axios.post('/players', { name: 'DougFromParis' });
      should(request.data).have.property('id');
      should(request.data).have.property('name', body.name);
      should(request).have.property('status', 200);
      const players = await global.test.knex('player').select('*');
      should(players).be.an.Array()
        .with.lengthOf(1);
    });

    describe('when player with same name case insensitive exists', () => {
      it('should throw an error', async () => {
        await global.test.axios.post('/players', { name: 'DougfromParis' })
          .then(() => {
            throw new Error('Unexpected promise resolution');
          })
          .catch((err) => {
            should(err.response).have.property('status', 403);
          });
      });
    });
  });

  describe('GET /players/:playerId', () => {
    before(async () => global.test.clear());

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

    const player = { id: 'foobar', name: 'kalak@gmail.com' };
    before(async () => global.test.knex('player').insert(player));

    it('should get a player', async () => {
      const request = await global.test.axios.get(`/players/${player.id}`);
      should(request).have.property('status', 200);
      should(request.data).have.property('id', player.id);
      should(request.data).have.property('name', player.name);
      should(request.data).not.have.property('password');
    });
  });

  describe('PUT /players/:playerId', () => {
    before(async () => global.test.clear());
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

    const player = { id: 'foobar', name: 'kalak@gmail.com' };
    before(async () => global.test
      .knex('player')
      .insert(player));
    it('should update player', async () => {
      const request = await global.test.axios.put(`/players/${player.id}`, { name: 'foo@rft.com' });
      should(request).have.property('status', 200);
      should(request.data).have.property('id');
      should(request.data).have.property('name', 'foo@rft.com');
      should(request.data).not.have.property('password');
    });
  });
});
