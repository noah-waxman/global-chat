const db = require("./db");

const insertMessage = async (userId, message_text) => {
  try {
    const message = await db.one(
      `
        INSERT INTO Messages (created_by, message_text)
        VALUES ($1, $2)
        RETURNING id
        `,
      [userId, message_text],
    );
    return message;
  } catch (error) {
    throw error;
  }
};

module.exports = { insertMessage };
