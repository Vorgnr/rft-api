const should = require('should/as-function');

describe('Player API', () => {
  describe('POST /players', () => {
    before(async () => global.test.clear());

    it('should create a player', async () => {
      const body = { name: 'DougFromParis' };
      const request = await global.test.axios.post('/players', body);
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
            should(err.response).have.property('status', 400);
          });
      });
    });

    describe('when payload contains password', () => {
      before(async () => global.test.clear());
      it('should hash password and create player', async () => {
        const body = {
          name: 'DougFromParis2',
          password: 'my-very-strong-password-123x',
        };
        const request = await global.test.axios.post('/players', body);
        should(request.data).have.property('id');
        should(request.data).have.property('name', body.name);
        should(request.data).not.have.property('password');
        should(request).have.property('status', 200);
        const players = await global.test.knex('player').select('*');
        should(players).be.an.Array()
          .with.lengthOf(1);
        should(players[0].password).not.equals(body.password);
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

  describe('GET /players', () => {
    before(async () => global.test.clear());

    describe('when there is no player', () => {
      it('should list players', async () => {
        const request = await global.test.axios.get('/players');
        should(request).have.property('status', 200);
        should(request.data).be.an.Array()
          .with.lengthOf(0);
      });
    });

    describe('when there are players', () => {
      before(async () => {
        await global.test.knex('league').insert({
          id: 'PC',
          name: 'PC',
          rank_treshold: 1000,
          winning_base_elo: 700,
          losing_base_elo: 700,
          starting_elo: 2000,
          rank_diff_ratio: 100,
        });
        await global.test.knex('league').insert({ id: 'PS4', name: 'PS4' });
        await global.test.knex('league').insert({ id: 'O', name: 'O', is_active: false });
        await global.test.knex('player').insert({ id: 'Knee', name: 'Knee', main_character: 'bryan' });
        await global.test.knex('player').insert({ id: 'DFT', name: 'DFT', main_character: 'steve' });
        await global.test.knex('player').insert({ id: 'Arslan', name: 'Arslan', main_character: 'kazumi' });
        await global.test.knex('player').insert({ id: 'SuperAkouma', name: 'SuperAkouma', main_character: 'akuma' });
        await global.test.knex('elo').insert({
          id: '1', player_id: 'Knee', league_id: 'PC', value: 1,
        });
        await global.test.knex('elo').insert({
          id: '5', player_id: 'Knee', league_id: 'PS4', value: 3,
        });
        await global.test.knex('elo').insert({
          id: '4', player_id: 'Knee', league_id: 'O', value: 4,
        });
        await global.test.knex('elo').insert({
          id: '2', player_id: 'DFT', league_id: 'PC', value: 2,
        });
        await global.test.knex('elo').insert({
          id: '3', player_id: 'Arslan', league_id: 'PC', value: 3,
        });
      });
      it('should list players', async () => {
        const request = await global.test.axios.get('/players?leagueId=PC&withElo=1');
        should(request).have.property('status', 200);
        should(request.data).be.an.Array()
          .with.lengthOf(4);
        should(request.data[0]).not.have.property('password');
      });
    });
  });
});
