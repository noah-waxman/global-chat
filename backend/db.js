const { DB_HOST, DB_NAME, DB_PASS, DB_USER } = require("./constants");
const pgp = require("pg-promise")();

const db = pgp(`postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:5432/${DB_NAME}`);

module.exports = db;
module.exports.pgp = pgp;
