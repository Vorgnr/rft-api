const csv = require('csv-parser');
const fs = require('fs');
const isValid = require('date-fns/isValid');
const nameCorrection = require('./player-name-errors');

const results = [];
let playerMatch = [];
const duplicatedDate = {};

fs.createReadStream(`${__dirname}/in/resultPC.csv`)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    playerMatch = results
      .map((r) => ({ item: r.Interaction.split(' win vs '), row: r }))
      .map(({ item, row }) => {
        const len = item.length;
        const rowDate = row['Date et Heure'];
        const winner = row['Points Winner'];
        const loser = row['Points Loser'];

        const m = rowDate.match(/\w+\s(\d{1,2})\/(\d{1,2})\/2020\sà\s(\d{1,2})h(\d*)/);
        if (!m) {
          return {
            dirty: true,
            row,
          };
        }
        const [, day, month, hours, strMinutes] = m;
        const minutes = Number.parseInt(strMinutes || 0, 10);
        let completedAt = new Date(2020, Number.parseInt(month, 10) - 1, Number.parseInt(day, 10), Number.parseInt(hours, 10), minutes);
        if (!isValid(completedAt)) {
          return {
            dirty: true,
            row,
          };
        }

        if (len !== 2) {
          return {
            dirty: true,
            row,
          };
        }
        let [player1, right] = item;
        const match = right.match(/([\w\s]+) (\d{1,2})-(\d{1,2})/);
        if (!match) {
          return {
            dirty: true,
            row,
          };
        }
        if (match.length !== 4) {
          return {
            dirty: true,
            row,
          };
        }
        let [, player2, player1score, player2score] = match;
        if (nameCorrection[player1.toLowerCase()]) {
          player1 = nameCorrection[player1.toLowerCase()];
        }
        if (nameCorrection[player2.toLowerCase()]) {
          player2 = nameCorrection[player2.toLowerCase()];
        }

        if (!duplicatedDate[completedAt]) {
          duplicatedDate[completedAt] = {};
        }

        if (!duplicatedDate[completedAt][player1]) {
          duplicatedDate[completedAt][player1] = 0;
        }
        duplicatedDate[completedAt][player1] += 1;

        if (!duplicatedDate[completedAt][player2]) {
          duplicatedDate[completedAt][player2] = 0;
        }
        duplicatedDate[completedAt][player2] += 1;

        if (duplicatedDate[completedAt][player1] > 1 || duplicatedDate[completedAt][player2] > 1) {
          completedAt = new Date(completedAt.getTime() - 1000 * 60);
        }

        let player1ragequit = false;
        let player2ragequit = false;
        if (row.Interaction.indexOf('(RQ') > -1) {
          if (Number.parseInt(player1score, 10) > Number.parseInt(player2score, 10)) {
            player2ragequit = true;
          } else {
            player1ragequit = true;
          }
        }

        return {
          player1,
          player2,
          player1score,
          player2score,
          player1ragequit,
          player2ragequit,
          completedAt,
          winner,
          loser,
          league_id: 'PC',
        };
      }, {});

    const data = JSON.stringify(playerMatch);
    fs.writeFileSync(`${__dirname}/out/matchesPC.json`, data);
  });

const players = [];
fs.createReadStream(`${__dirname}/in/playersPC.csv`)
  .pipe(csv())
  .on('data', (data) => {
    if (data.Joueur !== '-' && data.Joueur.indexOf('Palier') === -1) {
      players.push(data);
    }
  })
  .on('end', () => {
    const cleanPlayers = players
      .map((p) => {
        let name = p.Joueur;

        if (nameCorrection[name.toLowerCase()]) {
          name = nameCorrection[name.toLowerCase()];
        }
        return { name };
      });

    const data = JSON.stringify(cleanPlayers);
    fs.writeFileSync(`${__dirname}/out/playersPC.json`, data);
  });
