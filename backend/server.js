const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

const pgp = require('pg-promise')();
const db = pgp(`postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:5432/${DB_NAME}`);

const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Hello');
});

app.post('/auth/register', async (req, res) => {
    try {
        const saltRounds = 10;
        const { display_name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await db.one(
            'INSERT INTO Users (display_name, password_hash, email) VALUES ($1, $2, $3) RETURNING *',
            [display_name, hashedPassword, email]
        );
        res.status(201).json(newUser);
    } catch (error) {
        if (error.code == 23505) {
            if (error.constraint === 'users_email_key') {
                return res.status(400).json({ error: 'This email is already registered.' });
            }
        }
        res.status(500).json({ error: error.message });
    }
})

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.oneOrNone(`
            SELECT * FROM Users u
            WHERE u.email = $1
            `, [email]
        );
        console.log(user);

        if (user == null) {
            return res.status(404).json({ error: 'User not found'});
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (isMatch) {
            res.status(201).json({success: 'Matched user'})
            // return JWT or session ID
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});
