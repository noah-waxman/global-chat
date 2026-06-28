const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME
} = process.env;

const pgp = require('pg-promise')();
const db = pgp(`postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:5432/${DB_NAME}`);

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello');
});

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});
