# RFT API
## API

### Players
- [x] **POST** `/players/`
- [x] **GET** `/players/:playerId`
- [x] **GET** `/players`
- [x] **PUT** `/players/:playerId`

### Leagues
- [x] **POST** `/leagues/`
- [x] **GET** `/leagues/:leagueId`
- [x] **GET** `/leagues`
- [x] **PUT** `/leagues/:leagueId`

### Matches
- [x] **POST** `/matches/`
- [x] **GET** `/matches/:matchId`
- [x] **PUT** `/matches/:matchId`

### Elo
- [x] **GET** `/elos`

#### Logique Elo

- [x] Dés que le score atteint le FT -> Match complété
- [x] Calcul des points
- [x] Prise en comptes des ragequit

## Setup
* node v14+

` npm i `
` touch config.js `

config.js
```js
module.exports = {
  database: {
    development: {
      host: 'localhost',
      port: '3306',
      user: 'rft',
      password: '******',
      database: 'rftdb',
    },
    test: {
      host: 'localhost',
      port: '3306',
      user: 'rft',
      password: '******',
      database: 'rftdb',
    },
  },
};
```

` touch .env `

.env
```
PORT=3000
NODE_ENV=development
```

#### logs
` export DEBUG=rft:* `

### Database

```
docker run --name rft_mariadb -p 3306:3306 -p 33060:33060 -e MYSQL_ROOT_PASSWORD=password TZ=Europe/Paris -d mariadb:latest
docker exec -i rft_mariadb sh -c 'exec mysql -uroot -p"password"' < PATH/to/schema.sql
```

### Scripts

* `npm start`
* `npm t`