/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const axios = require('axios');
const format = require('date-fns/format');
const isValid = require('date-fns/isValid');
const server = require('../server');
const playersPC = require('./out/playersPC.json');
const playersPS4 = require('./out/playersPS4.json');
const missingPlayers = require('./out/missingPlayers.json');
const matches = require('./out/matchesPC.json');
const matchesPS4 = require('./out/matchesPS4.json');
const cleanedDirty = require('./out/dirtyPCMatch.json');
const cleanedDirtyPS4 = require('./out/dirtyPS4Match.json');
const correctionNames = require('./player-name-errors');

axios.defaults.baseURL = `http://localhost:${process.env.PORT}`;

const createDefaultLeagues = async (knex) => {
  await knex('elo').del();
  await knex('match').del();
  await knex('player').del();
  await knex('league').del();
  await knex('league').insert({
    id: 'PC',
    name: 'PC',
    starting_elo: 2000,
    winning_base_elo: 700,
    losing_base_elo: 700,
    ragequit_penalty: 500,
    rank_treshold: 1000,
    rank_diff_ratio: 100,
  });
  await knex('league').insert({
    id: 'PS4',
    name: 'PS4',
    starting_elo: 2000,
    winning_base_elo: 700,
    losing_base_elo: 700,
    ragequit_penalty: 500,
    rank_treshold: 1000,
    rank_diff_ratio: 100,
  });
};

const insertPlayers = async (allPlayers, ax, knex) => {
  await knex('player').del();
  const { uniq, duplicated } = allPlayers.reduce((acc, p) => {
    if (acc.index.indexOf(p.name) === -1) {
      acc.index.push(p.name);
      acc.uniq.push(p);
    } else {
      acc.duplicated.push(p.name);
    }
    return acc;
  }, { duplicated: [], index: [], uniq: [] });
  const result = await Promise.all(
    uniq.map((p) => ax.post('/players', { name: p.name, is_frozen: p.is_frozen || 0 })),
  ).catch((err) => {
    console.log('err', err);
  });

  console.log('duplicated player skiped', duplicated.length);
  console.log('Player created', result.length, ' / ', allPlayers.length);

  return result;
};

const findPlayer = async (name, knex) => {
  const lower = name.toLowerCase();
  const search = correctionNames[lower] || lower;
  const players1 = await knex('player').whereRaw('lower(name) like ?', [search]);
  if (players1.length > 1) {
    console.log('Multiple players found with name ', search);
  }
  const player = players1[0];
  if (!player) {
    console.log(`Player with name ${name} not found`);
  }
  return player;
};

const insertMatch = async (matches, knex, ax) => {
  await knex('elo').del();
  await knex('match').del();
  console.log(matches.length, 'matches ...');
  const sortedMatches = matches.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
  let i = 0;
  try {
    for (const m of sortedMatches) {
      const player1 = await findPlayer(m.player1, knex);
      const player2 = await findPlayer(m.player2, knex);
      let player1_score = Number.parseInt(m.player1score, 10);
      if (Number.isNaN(player1_score)) {
        player1_score = null;
      }
      let player2_score = Number.parseInt(m.player2score, 10);
      if (Number.isNaN(player1_score)) {
        player2_score = null;
      }
      const body = {
        player1_id: player1.id,
        player1_score,
        player2_id: player2.id,
        player2_score,
        league_id: m.league_id,
        player1_ragequit: m.player1ragequit,
        player2_ragequit: m.player2ragequit,
        player1_forfeit: m.player1_forfeit,
        player2_forfeit: m.player2_forfeit,
        ft: 10,
      };
      const request = await ax.post('/matches', body)
        .catch((err) => {
          console.log(err.response.data, body);
          throw err;
        });

      const { id } = request.data;
      const d = new Date(m.completedAt);
      if (!isValid(d)) {
        console.log('date is not valid', m);
      } else {
        await knex('match').where({ id }).update({ completed_at: format(new Date(m.completedAt), 'yyyy-MM-dd HH:mm:ss') });
        await ax.put(`/matches/${id}/moderate`)
          .catch((err) => {
            console.log(err);
          });
      }

      i += 1;
      console.log('done ', i, '/', matches.length);
    }
  } catch (err) {
    console.log('Zrer', err);
  }
};

const main = async () => {
  const axiosInstance = axios.create();
  const knex = await server.start({ isTest: true });
  await createDefaultLeagues(knex);

  const allPlayers = missingPlayers
    .concat(playersPS4)
    .concat(playersPC);

  await insertPlayers(allPlayers, axiosInstance, knex);
  const allMatches = matches
    .concat(matchesPS4)
    .concat(cleanedDirty)
    .concat(cleanedDirtyPS4)
    .filter((m) => !m.dirty);
  await insertMatch(allMatches, knex, axiosInstance);
  process.exit(0);
};

main();
