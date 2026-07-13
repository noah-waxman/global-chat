const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const cors = require("cors");
const db = require("./db");
const users = require("./users");
const messages = require("./messages");
const app = express();

const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Define session middleware here
const sessionMiddleware = session({
  store: new pgSession({
    pool: db.$pool,
    createTableIfMissing: false,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: "/",
    httpOnly: true,
    secure: false,
    maxAge: 3600000,
  },
});

// Attach session middleware to Express
app.use(sessionMiddleware);

io.engine.use(sessionMiddleware);

app.get("/", (req, res) => {
  res.send("Hello");
});

io.on("connection", (socket) => {
  const session = socket.request.session;

  console.log(session);

  if (!session || !session.user) {
    console.error("Unauthenticated socket tried to connect.");
    return socket.disconnect(true);
  }

  console.log(`Authenticated user connected: ${session.user.displayName}`);

  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
  });

  // Handle user disconnects
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.post("/auth/register", async (req, res, next) => {
  try {
    const saltRounds = 10;
    const { displayName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await users.insertUser(displayName, hashedPassword, email);

    if (!newUser || !newUser.id) {
      return res.status(400).json({ error: "Error during user creation" });
    }

    req.session.regenerate(function (err) {
      if (err) {
        return next(err);
      }

      req.session.user = {
        id: newUser.id,
        displayName: newUser.display_name,
        email: newUser.email,
      };

      req.session.save(function (err) {
        if (err) {
          return next(err);
        }
        return res.status(201).json(req.session.user);
      });
    });
  } catch (error) {
    if (error.constraint === "users_email_key") {
      return res
        .status(400)
        .json({ error: "This email is already registered." });
    }
    return next(error);
  }
});

app.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await users.getUserByEmail(email);

    if (!user || !user.id) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    req.session.regenerate((err) => {
      if (err) {
        return next(err);
      }

      req.session.user = {
        id: user.id,
        displayName: user.display_name,
        email: user.email,
      };

      req.session.save((err) => {
        if (err) {
          return next(err);
        }

        return res.status(200).json(req.session.user);
      });
    });
  } catch (error) {
    next(error);
  }
});

app.post("/messages", async (req, res, next) => {
  try {
    const { message_text } = req.body;

    if (!req.session || !req.session.user) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    const message = await messages.insertMessage(
      req.session.user.id,
      message_text,
    );

    return res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

app.get("/auth/me", (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({
      isAuthenticated: true,
      user: req.session.user,
    });
  }

  return res.status(401).json({
    isAuthenticated: false,
    message: "User is not authenticated",
  });
});

app.get("/health", async (req, res) => {
  try {
    await db.one("SELECT 1");
    res.status(200).json({ status: "OK", db: "connected" });
  } catch (error) {
    console.error("Health check DB error:", error.message);
    res.status(503).json({ status: "ERROR", db: "disconnected" });
  }
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  return res.status(500).json({
    error: "Something went wrong on our server. Please try again later.",
  });
});

module.exports = { app, server };
