const { DB_HOST, DB_NAME, DB_PASS, DB_USER} = require('./constants');
const pgp = require('pg-promise')();
const db = pgp(`postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:5432/${DB_NAME}`);

const insertUser = async (display_name, hashedPassword, email) => {
    try {
        const newUser = await db.one(
            `INSERT INTO Users (display_name, password_hash, email) 
            VALUES ($1, $2, $3) 
            RETURNING id, display_name, email`,
            [display_name, hashedPassword, email]
        );

        return newUser;
    } catch (error) {
        return (error);
    }
}

const getUserByEmail = async (email) => {
    try {
        const user = await db.oneOrNone(`
            SELECT * FROM Users u
            WHERE u.email = $1
            `, [email]
        );

        return user;
    } catch (error) {
        return error;
    }
}


module.exports = { insertUser, getUserByEmail };
