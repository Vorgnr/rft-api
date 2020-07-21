const csv = require('csv-parser');
const fs = require('fs');
const isValid = require('date-fns/isValid');
const nameCorrection = require('./player-name-errors');

const results = [];
let playerMatch = [];

fs.createReadStream(`${__dirname}/resultPC.csv`)
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
        const [, day, month, hours, minutes] = m;
        const completedAt = new Date(2020, Number.parseInt(month, 10) - 1, Number.parseInt(day, 10), Number.parseInt(hours, 10), Number.parseInt(minutes || 0, 10));
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
        return {
          player1,
          player2,
          player1score,
          player2score,
          completedAt,
          winner,
          loser,
        };
      }, {});

    const data = JSON.stringify(playerMatch);
    fs.writeFileSync(`${__dirname}/out/matchesPC.json`, data);
  });

const players = [];
fs.createReadStream(`${__dirname}/playersPC.csv`)
  .pipe(csv())
  .on('data', (data) => {
    if (data.Joueur !== '-' && data.Joueur.indexOf('Palier') === -1) {
      players.push(data);
    }
  })
  .on('end', () => {
    const cleanPlayers = players
      .map((p) => ({ name: p.Joueur }));

    const data = JSON.stringify(cleanPlayers);
    fs.writeFileSync(`${__dirname}/out/playersPC.json`, data);
  });
