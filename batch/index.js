const csv = require('csv-parser');
const fs = require('fs');
const nameCorrection = require('./player-name-errors');

const results = [];
let playerMatch = [];
let playerMatchName;

fs.createReadStream(`${__dirname}/resultPC.csv`)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // 'Ricochet win vs The Nicest Guy v2 10-1'
    playerMatch = results
      .map((r) => r.Interaction.split(' win vs '))
      .map((item) => {
        const len = item.length;
        if (len !== 2) {
          return {
            dirty: true,
            item,
          };
        }
        let [player1, right] = item;
        const match = right.match(/([\w\s]+) (\d{1,2})-(\d{1,2})/);
        if (!match) {
          return {
            dirty: true,
            item,
          };
        }
        if (match.length !== 4) {
          return {
            dirty: true,
            item,
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
        };
      }, {});

    const data = JSON.stringify(playerMatch);
    fs.writeFileSync(`${__dirname}/out/matchesPC.json`, data);

    playerMatchName = playerMatch
      .filter((m) => !m.dirty)
      .reduce((acc, m) => {
        if (acc.indexOf(m.player1) === -1) {
          acc.push(m.player1);
        }
        if (acc.indexOf(m.player2) === -1) {
          acc.push(m.player2);
        }
        return acc;
      }, []);
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
