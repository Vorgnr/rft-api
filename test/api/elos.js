const should = require('should/as-function');

describe('Elo API', () => {
  before(async () => global.test.clear());
  describe('GET /elos', () => {
    before(async () => {
      await Promise.all([
        global.test.knex('league').insert({ id: '1' }),
        global.test.knex('player').insert({ id: 'dft' }),
        global.test.knex('player').insert({ id: 'kwiss' }),
        global.test.knex('player').insert({ id: 'lilMajin' }),
      ]);
      await Promise.all([
        global.test.knex('elo').insert({
          id: '1', player_id: 'dft', league_id: '1', value: 2000,
        }),
        global.test.knex('elo').insert({
          id: '1', player_id: 'kwiss', league_id: '1', value: 2000,
        }),
        global.test.knex('elo').insert({
          id: '1', player_id: 'lilMajin', league_id: '1', value: 2000,
        }),
      ]);
    });

    describe('with no perPage query', () => {
      it('should list all elos', async () => {
        const request = await global.test.axios.get('/elos');
        should(request).have.property('status', 200);
        should(request.data).be.an.Array()
          .with.lengthOf(3);
      });
    });
    describe('with perPage query', () => {
      it('should list elos', async () => {
        const perPage = 2;
        const request = await global.test.axios.get(`/elos?perPage=${perPage}`);
        should(request).have.property('status', 200);
        should(request.data).be.an.Array()
          .with.lengthOf(perPage);
      });

      describe('with page query', () => {
        it('should list elos', async () => {
          const perPage = 1;
          const page = 2;
          const orderBy = 'player_id';
          const request = await global.test.axios.get(`/elos?perPage=${perPage}&page=${page}&orderBy=${orderBy}`);
          should(request).have.property('status', 200);
          should(request.data).be.an.Array()
            .with.lengthOf(1);
          should(request.data[0]).have.property('player_id', 'kwiss');
        });
      });
    });
  });
});
