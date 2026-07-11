const db = require("./db");

const insertUser = async (display_name, hashedPassword, email) => {
  try {
    const newUser = await db.one(
      `INSERT INTO Users (display_name, password_hash, email) 
            VALUES ($1, $2, $3) 
            RETURNING id, display_name, email`,
      [display_name, hashedPassword, email],
    );

    return newUser;
  } catch (error) {
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await db.oneOrNone(
      `
            SELECT * FROM Users u
            WHERE u.email = $1
            RETURNING id, display_name, email
            `,
      [email],
    );

    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = { insertUser, getUserByEmail };
