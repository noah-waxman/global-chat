const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const pgSession = require("connect-pg-simple")(session);
const cors = require('cors');
const { DB_HOST, DB_NAME, DB_PASS, DB_USER} = require('./constants');
const users = require('./users');
const app = express();
const port = 3000;

app.use(express.json()); 

// app.use(cors({
//     // Replace with your exact frontend URL (no trailing slash)
//     origin: 'http://localhost:5173', 
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(
    session({
        store: new pgSession({
            conObject: {
                host: DB_HOST,
                database: DB_NAME,
                user: DB_USER,
                password: DB_PASS
            },

            createTableIfMissing: true
        }),

        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            path: '/',
            httpOnly: true,
            secure: false,
            maxAge: 3600000
        }
    })
);

app.get('/', (req, res) => {
    res.send('Hello');
});

app.post('/auth/register', async (req, res, next) => {
    try {
        const saltRounds = 10;
        const { display_name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await users.insertUser(display_name, hashedPassword, email);

        req.session.regenerate(function (err) {
            if (err) {
                return next(err);
            }
            req.session.userId = newUser.id;
            req.session.save(function (err) {
                if (err) {
                    return next(err);
                }
                return res.status(201).json(newUser);
            });
        });
    } catch (error) {
        if (error.code == 23505) {
            if (error.constraint === 'users_email_key') {
                return res.status(400).json({ error: 'This email is already registered.' });
            }
        }
        return next(error);
    }
})

app.post('/auth/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await users.getUserByEmail(email);

        if (user == null) {
            return res.status(404).json({ error: 'User not found'});
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (isMatch) {
            req.session.regenerate(function (err) {
                if (err) {
                    return next(err);
                }
                req.session.userId = user.id;

                req.session.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    return res.status(201).json({success: 'Matched user'});
                });
            });
        }
    } catch (error) {
        return next(error);
    }
})

app.use((err, req, res, next) => {
    console.error("Server Error:", err.message); 
    
    return res.status(500).json({ 
        error: "Something went wrong on our server. Please try again later." 
    });
});

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});
