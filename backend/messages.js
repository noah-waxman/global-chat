const db = require("./db");

const insertMessage = async (userId, messageText) => {
  try {
    return await db.one(
      `INSERT INTO Messages (created_by, message_text)
       VALUES ($1, $2)
       RETURNING id, created_at, created_by, message_text`,
      [userId, messageText],
    );
  } catch (error) {
    throw error;
  }
};

const getMessageById = async (id) => {
  try {
    return await db.oneOrNone(`SELECT * FROM Messages WHERE id = $1`, [id]);
  } catch (error) {
    throw error;
  }
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// Returns messages older than `before` (cursor), newest-first, capped to `limit`.
// Pass no `before` to get the most recent page.
const getMessages = async (limit = DEFAULT_LIMIT, before = null) => {
  const safeLimit = Math.min(
    Math.max(1, Number(limit) || DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  try {
    if (before) {
      return await db.any(
        `SELECT m.id, m.created_at, m.created_by, m.message_text,
                u.display_name
         FROM Messages m
         JOIN Users u ON u.id = m.created_by
         WHERE m.id < $1
         ORDER BY m.id DESC
         LIMIT $2`,
        [before, safeLimit],
      );
    }
    return await db.any(
      `SELECT m.id, m.created_at, m.created_by, m.message_text,
              u.display_name
       FROM Messages m
       JOIN Users u ON u.id = m.created_by
       ORDER BY m.id DESC
       LIMIT $1`,
      [safeLimit],
    );
  } catch (error) {
    throw error;
  }
};

module.exports = { insertMessage, getMessageById, getMessages };
