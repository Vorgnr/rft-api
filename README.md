# RFT API

## Prerequisites

* node v14+

## Setup

` npm i `
` touch config.js `
` touch .env `

### Database

```
docker run --name rft_mariadb -p 3306:3306 -p 33060:33060 -e MYSQL_ROOT_PASSWORD=password -d mariadb:latest
docker exec -i rft_mariadb sh -c 'exec mysql -uroot -p"password"' < PATH/to/schema.sql
```