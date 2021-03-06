const should = require('should/as-function');

describe('League API', () => {
  describe('POST /leagues', () => {
    before(async () => global.test.clear());

    describe('when league is not correct', () => {
      it('should return a 400 error', async () => {
        const body = { name: 'RFT One' };
        await global.test.axios.post('/leagues', body)
          .then(() => {
            throw new Error('Unexpected promise resolution');
          })
          .catch((err) => {
            should(err.response).have.property('status', 400);
          });
      });
    });
    it('should create a league', async () => {
      const body = { name: 'RFT One', rank_treshold: 1000 };
      const request = await global.test.axios.post('/leagues', body);
      should(request.data).have.property('id');
      should(request.data).have.property('name', body.name);
      should(request).have.property('status', 200);
      const leagues = await global.test.knex('league').select('*');
      should(leagues).be.an.Array()
        .with.lengthOf(1);
    });
  });

  describe('GET /leagues/:leagueId', () => {
    before(async () => global.test.clear());

    describe('when league does not exist', () => {
      it('should return a 404 error', async () => {
        await global.test.axios.get('/leagues/bla')
          .then(() => {
            throw new Error('Unexpected promise resolution');
          })
          .catch((err) => {
            should(err.response).have.property('status', 404);
          });
      });
    });

    const league = { id: 'foobar', name: 'Alfa League' };
    before(async () => global.test
      .knex('league')
      .insert(league));

    it('should get a league', async () => {
      const request = await global.test.axios.get(`/leagues/${league.id}`);
      should(request).have.property('status', 200);
      should(request.data).have.property('id', league.id);
      should(request.data).have.property('name', league.name);
    });
  });

  describe('PUT /leagues/:leagueId', () => {
    before(async () => global.test.clear());
    describe('when league doest not exist', () => {
      it('should return a 404 error', async () => {
        await global.test.axios.put('/leagues/bla', {})
          .then(() => {
            throw new Error('Unexpected promise resolution');
          })
          .catch((err) => {
            should(err.response).have.property('status', 404);
          });
      });
    });

    const league = { id: 'foobar', name: 'Alfa V2 League' };
    before(async () => global.test
      .knex('league')
      .insert(league));
    it('should update league', async () => {
      const request = await global.test.axios.put(`/leagues/${league.id}`, { name: 'Alfa v3' });
      should(request).have.property('status', 200);
      should(request.data).have.property('id');
      should(request.data).have.property('name', 'Alfa v3');
    });
  });
});
