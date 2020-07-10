# RFT API

## Prerequisites

* node v14+

## Setup

` npm i `
` touch config.js `

```js
module.exports = {
  database: {
    development: {
      host: 'localhost',
      port: '3306',
      user: 'rft',
      password: '******',
      database: 'rft_mariadb',
    },
    test: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: '******',
      database: 'rftdb',
    },
  },
};
```

` touch .env `

```
PORT=3000
NODE_ENV=development
```

### Database

```
docker run --name rft_mariadb -p 3306:3306 -p 33060:33060 -e MYSQL_ROOT_PASSWORD=password -d mariadb:latest
docker exec -i rft_mariadb sh -c 'exec mysql -uroot -p"password"' < PATH/to/schema.sql
```