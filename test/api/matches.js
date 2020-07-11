const should = require('should/as-function');

describe('Match API', () => {
  describe('POST /matches', () => {
    before(async () => global.test.clear());
    it('should create a match', async () => {
      await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
      await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
      await global.test.knex('league').insert({ id: 'ISL', name: 'International Superstar League' });
      const body = {
        player1_id: 'Knee',
        player2_id: 'Qudans',
        league_id: 'ISL',
      };
      const request = await global.test.axios.post('/matches', body);
      should(request).have.property('status', 200);
      const matches = await global.test.knex('match').select('*');
      should(matches).be.an.Array()
        .with.lengthOf(1);
    });
  });

  describe('GET /matches/:matchId', () => {
    before(async () => global.test.clear());

    describe('when match does not exist', () => {
      it('should return a 404 error', async () => {
        await global.test.axios.get('/matches/bla')
          .then(() => {
            throw new Error('Unexpected promise resolution');
          })
          .catch((err) => {
            should(err.response).have.property('status', 404);
          });
      });
    });

    it('should get a match', async () => {
      await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
      await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
      await global.test.knex('league').insert({ id: 'ISL', name: 'International Superstar League' });
      await global.test.knex('match').insert({
        id: 'nicematch',
        player1_id: 'Knee',
        player2_id: 'Qudans',
        league_id: 'ISL',
      });

      const request = await global.test.axios.get('/matches/nicematch');
      should(request).have.property('status', 200);
      should(request.data).have.property('id', 'nicematch');
      should(request.data).have.property('player1_id', 'Knee');
      should(request.data).have.property('player2_id', 'Qudans');
    });
  });

  describe('PUT /matches/:matchId', () => {
    before(async () => global.test.clear());
    describe('when match doest not exist', () => {
      it('should return a 404 error', async () => {
        await global.test.axios.put('/matches/bla', {})
          .then(() => {
            throw new Error('Unexpected promise resolution');
          })
          .catch((err) => {
            should(err.response).have.property('status', 404);
          });
      });
    });

    it('should update match', async () => {
      await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
      await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
      await global.test.knex('league').insert({ id: 'ISL', name: 'International Superstar League' });
      await global.test.knex('match').insert({
        id: 'nicematch',
        player1_id: 'Knee',
        player2_id: 'Qudans',
        league_id: 'ISL',
      });
      const request = await global.test.axios.put('/matches/nicematch', { player1_score: 10, player2_score: 6 });
      should(request).have.property('status', 200);
      should(request.data).have.property('id');
      should(request.data).have.property('player1_score', 10);
      should(request.data).have.property('player2_score', 6);
    });
  });
});
