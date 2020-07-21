const should = require('should/as-function');

describe('Match API', () => {
  describe('POST /matches', () => {
    before(async () => global.test.clear());
    it('should create a match', async () => {
      await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
      await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
      await global.test.knex('league').insert({
        id: 'ISL',
        name: 'International Superstar League',
        rank_treshold: 1000,
        winning_base_elo: 700,
        losing_base_elo: 700,
        starting_elo: 0,
        rank_diff_ratio: 100,
      });
      const body = {
        player1_id: 'Knee',
        player2_id: 'Qudans',
        league_id: 'ISL',
        ft: 10,
      };
      const request = await global.test.axios.post('/matches', body);
      should(request).have.property('status', 200);
      const matches = await global.test.knex('match').select('*');
      should(matches).be.an.Array()
        .with.lengthOf(1);
    });

    describe('when match is completed', () => {
      it('should create a match', async () => {
        const body = {
          player1_id: 'Knee',
          player2_id: 'Qudans',
          league_id: 'ISL',
          ft: 10,
          player1_score: 10,
          player2_score: 1,
        };
        const request = await global.test.axios.post('/matches', body);
        should(request).have.property('status', 200);
        should(request.data).have.property('completed_at').which.is.not.null();
        should(request.data).have.property('player1_score', 10);
        should(request.data).have.property('player2_score', 1);
        const matches = await global.test.knex('match').where({ id: request.data.id });
        should(matches).be.an.Array().with.lengthOf(1);
        const match = matches[0];
        should(match).have.property('player1_elo').which.is.null();
        should(match).have.property('player2_elo').which.is.null();
        should(match).have.property('player1_ragequit', 0);
        should(match).have.property('player2_ragequit', 0);
        should(match).have.property('player1_forfeit', 0);
        should(match).have.property('player2_forfeit', 0);
        const elop1 = await global.test.knex('elo').where({ league_id: 'ISL', player_id: 'Knee' });
        should(elop1).be.an.Array().with.lengthOf(0);
        const elop2 = await global.test.knex('elo').where({ league_id: 'ISL', player_id: 'Qudans' });
        should(elop2).be.an.Array().with.lengthOf(0);
      });
    });

    describe('when ft is not correct', () => {
      it('should return a 400 error', async () => {
        const body = {
          player1_id: 'Knee',
          player2_id: 'Qudans',
          league_id: 'ISL',
          ft: 0,
        };
        await global.test.axios.post('/matches', body)
          .then(() => {
            throw new Error('Unexpected promise resolution');
          })
          .catch((err) => {
            should(err.response).have.property('status', 400);
          });
      });
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
        ft: 10,
      });

      const request = await global.test.axios.get('/matches/nicematch');
      should(request).have.property('status', 200);
      should(request.data).have.property('id', 'nicematch');
      should(request.data).have.property('player1_id', 'Knee');
      should(request.data).have.property('player2_id', 'Qudans');
    });
  });

  describe('PUT /matches/:matchId', () => {
    before(async () => {
      await global.test.clear();
      await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
      await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
      await global.test.knex('league').insert({
        id: 'ISL',
        name: 'International Superstar League',
        winning_base_elo: 700,
        losing_base_elo: 700,
        rank_treshold: 1000,
        starting_elo: 2000,
        rank_diff_ratio: 100,
      });
    });
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

    describe('when match is completed', () => {
      it('should update match', async () => {
        await global.test.knex('match').insert({
          id: 'nicematch',
          player1_id: 'Knee',
          player2_id: 'Qudans',
          league_id: 'ISL',
          ft: 10,
        });
        const request = await global.test.axios.put('/matches/nicematch', { player1_score: 10, player2_score: 6 });
        should(request).have.property('status', 200);
        should(request.data).have.property('id');
        should(request.data).have.property('completed_at').which.is.not.null();
        should(request.data).have.property('player1_score', 10);
        should(request.data).have.property('player1_elo', null);
        should(request.data).have.property('player2_score', 6);
        should(request.data).have.property('player2_elo', null);
      });

      it('should not write Elo', async () => {
        const kneeElo = await global.test.knex('elo')
          .where({ player_id: 'Knee', league_id: 'ISL' });

        should(kneeElo).be.an.Array().with.lengthOf(0);

        const qudansElo = await global.test.knex('elo')
          .where({ player_id: 'Qudans', league_id: 'ISL' });

        should(qudansElo).be.an.Array().with.lengthOf(0);
      });
    });

    describe('when match is not completed', () => {
      it('should update match', async () => {
        await global.test.knex('match').insert({
          id: '2',
          player1_id: 'Knee',
          player2_id: 'Qudans',
          league_id: 'ISL',
          ft: 10,
        });
        const request = await global.test.axios.put('/matches/2', { player1_score: 6, player2_score: 6 });
        should(request).have.property('status', 200);
        should(request.data).have.property('id');
        should(request.data).have.property('completed_at', null);
        should(request.data).have.property('player1_score', 6);
        should(request.data).have.property('player1_elo', null);
        should(request.data).have.property('player2_score', 6);
        should(request.data).have.property('player2_elo', null);
      });
    });
  });

  describe.only('PUT /:matchId/moderate', () => {
    before(async () => global.test.clear());
    describe('when match does not exist', () => {
      it('should return a 404 error', async () => {
        await global.test.axios.put('/matches/bla/moderate')
          .then(() => {
            throw new Error('Unexpected promise resolution');
          })
          .catch((err) => {
            should(err.response).have.property('status', 404);
          });
      });
    });

    describe('when match does exist', () => {
      describe('when match is not completed', () => {
        it('should return a 400 error', async () => {
          await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
          await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
          await global.test.knex('league').insert({ id: 'ISL', name: 'International Superstar League' });
          await global.test.knex('match').insert({
            id: 'nicematch',
            player1_id: 'Knee',
            player2_id: 'Qudans',
            league_id: 'ISL',
            ft: 10,
          });
          await global.test.axios.put('/matches/nicematch/moderate', { player1_score: 6, player2_score: 6 })
            .then(() => {
              throw new Error('Unexpected promise resolution');
            })
            .catch((err) => {
              should(err.response).have.property('status', 400);
            });
        });
      });

      describe('when match is completed', () => {
        before(async () => {
          await global.test.clear();
          await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
          await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
          await global.test.knex('league').insert({
            id: 'ISL2',
            name: 'International Superstar League',
            rank_treshold: 1000,
            winning_base_elo: 700,
            losing_base_elo: 700,
            starting_elo: 2000,
            rank_diff_ratio: 100,
            ragequit_penalty: 500,
          });
        });
        it('should moderate match', async () => {
          const body = {
            league_id: 'ISL2',
            player1_id: 'Knee',
            player2_id: 'Qudans',
            player1_score: 10,
            player2_score: 2,
            ft: 10,
          };
          const r = await global.test.axios.post('/matches', body);
          const request = await global.test.axios.put(`/matches/${r.data.id}/moderate`);

          should(request).have.property('status', 200);
          should(request.data).have.property('moderated_at').which.is.not.null();
          should(request.data).have.property('player1_elo', 233);
          should(request.data).have.property('player1_previous_elo', 2000);
          should(request.data).have.property('player2_elo', -233);
          should(request.data).have.property('player2_previous_elo', 2000);
          const kneeElo = await global.test.knex('elo')
            .where({ player_id: 'Knee', league_id: 'ISL2' });

          should(kneeElo).be.an.Array().with.lengthOf(1);
          should(kneeElo[0]).have.property('value', 2233);

          const qudansElo = await global.test.knex('elo')
            .where({ player_id: 'Qudans', league_id: 'ISL2' });

          should(qudansElo).be.an.Array().with.lengthOf(1);
          should(qudansElo[0]).have.property('value', 1767);
        });

        describe('when player 1 is forfeit', () => {
          before(async () => {
            await global.test.clear();
            await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
            await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
            await global.test.knex('league').insert({
              id: 'ISL2',
              name: 'International Superstar League',
              rank_treshold: 1000,
              winning_base_elo: 700,
              losing_base_elo: 700,
              starting_elo: 2000,
              rank_diff_ratio: 100,
              ragequit_penalty: 500,
            });
          });

          it('should moderate', async () => {
            const body = {
              league_id: 'ISL2',
              player1_id: 'Knee',
              player2_id: 'Qudans',
              player1_forfeit: true,
              player1_score: 10,
              player2_score: 2,
              ft: 10,
            };
            const r = await global.test.axios.post('/matches', body);
            const request = await global.test.axios.put(`/matches/${r.data.id}/moderate`);

            should(request).have.property('status', 200);
            should(request.data).have.property('moderated_at').which.is.not.null();
            should(request.data).have.property('player1_elo', -233);
            should(request.data).have.property('player1_previous_elo', 2000);
            should(request.data).have.property('player2_elo', 0);
            should(request.data).have.property('player2_previous_elo', 2000);
            const kneeElo = await global.test.knex('elo')
              .where({ player_id: 'Knee', league_id: 'ISL2' });

            should(kneeElo).be.an.Array().with.lengthOf(1);
            should(kneeElo[0]).have.property('value', 1767);

            const qudansElo = await global.test.knex('elo')
              .where({ player_id: 'Qudans', league_id: 'ISL2' });

            should(qudansElo).be.an.Array().with.lengthOf(1);
            should(qudansElo[0]).have.property('value', 2000);
          });
        });

        describe('when player 2 is forfeit', () => {
          before(async () => {
            await global.test.clear();
            await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
            await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
            await global.test.knex('league').insert({
              id: 'ISL2',
              name: 'International Superstar League',
              rank_treshold: 1000,
              winning_base_elo: 700,
              losing_base_elo: 700,
              starting_elo: 2000,
              rank_diff_ratio: 100,
              ragequit_penalty: 500,
            });
          });

          it('should moderate', async () => {
            const body = {
              league_id: 'ISL2',
              player1_id: 'Knee',
              player2_id: 'Qudans',
              player2_forfeit: true,
              player1_score: 10,
              player2_score: 2,
              ft: 10,
            };
            const r = await global.test.axios.post('/matches', body);
            const request = await global.test.axios.put(`/matches/${r.data.id}/moderate`);

            should(request).have.property('status', 200);
            should(request.data).have.property('moderated_at').which.is.not.null();
            should(request.data).have.property('player2_elo', -233);
            should(request.data).have.property('player1_previous_elo', 2000);
            should(request.data).have.property('player1_elo', 0);
            should(request.data).have.property('player2_previous_elo', 2000);
            const kneeElo = await global.test.knex('elo')
              .where({ player_id: 'Knee', league_id: 'ISL2' });

            should(kneeElo).be.an.Array().with.lengthOf(1);
            should(kneeElo[0]).have.property('value', 2000);

            const qudansElo = await global.test.knex('elo')
              .where({ player_id: 'Qudans', league_id: 'ISL2' });

            should(qudansElo).be.an.Array().with.lengthOf(1);
            should(qudansElo[0]).have.property('value', 1767);
          });
        });

        describe('when player 1 ragequited', () => {
          before(async () => {
            await global.test.clear();
            await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
            await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
            await global.test.knex('league').insert({
              id: 'ISL2',
              name: 'International Superstar League',
              rank_treshold: 1000,
              winning_base_elo: 700,
              losing_base_elo: 700,
              starting_elo: 2000,
              rank_diff_ratio: 100,
              ragequit_penalty: 500,
            });
          });

          it('should moderate', async () => {
            const body = {
              league_id: 'ISL2',
              player1_id: 'Knee',
              player2_id: 'Qudans',
              player1_ragequit: true,
              player1_score: 10,
              player2_score: 2,
              ft: 10,
            };
            const r = await global.test.axios.post('/matches', body);
            const request = await global.test.axios.put(`/matches/${r.data.id}/moderate`);

            should(request).have.property('status', 200);
            should(request.data).have.property('moderated_at').which.is.not.null();
            should(request.data).have.property('player2_elo', 233);
            should(request.data).have.property('player1_previous_elo', 2000);
            should(request.data).have.property('player1_elo', -733);
            should(request.data).have.property('player2_previous_elo', 2000);
            const kneeElo = await global.test.knex('elo')
              .where({ player_id: 'Knee', league_id: 'ISL2' });

            should(kneeElo).be.an.Array().with.lengthOf(1);
            should(kneeElo[0]).have.property('value', 1267);

            const qudansElo = await global.test.knex('elo')
              .where({ player_id: 'Qudans', league_id: 'ISL2' });

            should(qudansElo).be.an.Array().with.lengthOf(1);
            should(qudansElo[0]).have.property('value', 2233);
          });
        });

        describe('when player 2 ragequited', () => {
          before(async () => {
            await global.test.clear();
            await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
            await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
            await global.test.knex('league').insert({
              id: 'ISL2',
              name: 'International Superstar League',
              rank_treshold: 1000,
              winning_base_elo: 700,
              losing_base_elo: 700,
              starting_elo: 2000,
              rank_diff_ratio: 100,
              ragequit_penalty: 500,
            });
          });

          it('should moderate', async () => {
            const body = {
              league_id: 'ISL2',
              player1_id: 'Knee',
              player2_id: 'Qudans',
              player2_ragequit: true,
              player1_score: 10,
              player2_score: 2,
              ft: 10,
            };
            const r = await global.test.axios.post('/matches', body);
            const request = await global.test.axios.put(`/matches/${r.data.id}/moderate`);

            should(request).have.property('status', 200);
            should(request.data).have.property('moderated_at').which.is.not.null();
            should(request.data).have.property('player2_elo', -733);
            should(request.data).have.property('player1_previous_elo', 2000);
            should(request.data).have.property('player1_elo', 233);
            should(request.data).have.property('player2_previous_elo', 2000);
            const kneeElo = await global.test.knex('elo')
              .where({ player_id: 'Knee', league_id: 'ISL2' });

            should(kneeElo).be.an.Array().with.lengthOf(1);
            should(kneeElo[0]).have.property('value', 2233);

            const qudansElo = await global.test.knex('elo')
              .where({ player_id: 'Qudans', league_id: 'ISL2' });

            should(qudansElo).be.an.Array().with.lengthOf(1);
            should(qudansElo[0]).have.property('value', 1267);
          });
        });

        describe('when both player are rank 0', () => {
          before(async () => {
            await global.test.clear();
            await global.test.knex('player').insert({ id: 'Knee', name: 'Knee' });
            await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans' });
            await global.test.knex('league').insert({
              id: 'ISL2',
              name: 'International Superstar League',
              rank_treshold: 1000,
              winning_base_elo: 700,
              losing_base_elo: 700,
              starting_elo: 0,
              rank_diff_ratio: 100,
              ragequit_penalty: 500,
            });
          });

          it('should moderate', async () => {
            const body = {
              league_id: 'ISL2',
              player1_id: 'Knee',
              player2_id: 'Qudans',
              player1_score: 10,
              player2_score: 2,
              ft: 10,
            };
            const r = await global.test.axios.post('/matches', body);
            const request = await global.test.axios.put(`/matches/${r.data.id}/moderate`);

            should(request).have.property('status', 200);
            should(request.data).have.property('moderated_at').which.is.not.null();
            should(request.data).have.property('player2_elo', -700);
            should(request.data).have.property('player1_previous_elo', 0);
            should(request.data).have.property('player1_elo', 700);
            should(request.data).have.property('player2_previous_elo', 0);
            const kneeElo = await global.test.knex('elo')
              .where({ player_id: 'Knee', league_id: 'ISL2' });

            should(kneeElo).be.an.Array().with.lengthOf(1);
            should(kneeElo[0]).have.property('value', 700);

            const qudansElo = await global.test.knex('elo')
              .where({ player_id: 'Qudans', league_id: 'ISL2' });

            should(qudansElo).be.an.Array().with.lengthOf(1);
            should(qudansElo[0]).have.property('value', 0);
          });
        });
      });
    });
  });

  describe('GET /matches', () => {
    describe('when there is no matches', () => {
      before(async () => {
        await global.test.clear();
      });
      it('should return empty array', async () => {
        const request = await global.test.axios.get('/matches');
        should(request.data).be.an.Array()
          .with.lengthOf(0);
      });
    });

    describe('when there is matches', () => {
      before(async () => {
        await global.test.clear();
        await global.test.knex('player').insert({ id: 'Knee', name: 'Knee', main_character: 'bryan' });
        await global.test.knex('player').insert({ id: 'Qudans', name: 'Qudans', main_character: 'deviljin' });
        await global.test.knex('league').insert({
          id: 'ISL',
          name: 'International Superstar League',
          winning_base_elo: 700,
          losing_base_elo: 700,
          rank_treshold: 1000,
          starting_elo: 2000,
          rank_diff_ratio: 100,
        });
        await global.test.knex('match').insert({
          id: '1',
          player1_id: 'Knee',
          player2_id: 'Qudans',
          league_id: 'ISL',
          ft: 10,
        });
        await global.test.knex('match').insert({
          id: '2',
          player1_id: 'Knee',
          player2_id: 'Qudans',
          league_id: 'ISL',
          ft: 10,
        });
        await global.test.knex('match').insert({
          id: '3',
          player1_id: 'Knee',
          player2_id: 'Qudans',
          league_id: 'ISL',
          ft: 10,
        });
      });

      it('should return empty array', async () => {
        const request = await global.test.axios.get('/matches');
        should(request.data).be.an.Array()
          .with.lengthOf(3);
      });
    });
  });
});
