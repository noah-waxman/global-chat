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

module.exports = { insertMessage, getMessageById };
