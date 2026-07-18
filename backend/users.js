const db = require("./db");

const insertUser = async (
  display_name,
  hashedPassword,
  email,
  roleName = "peasant",
) => {
  try {
    const newUser = await db.tx(async (t) => {
      const user = await t.one(
        `INSERT INTO Users (display_name, password_hash, email) 
            VALUES ($1, $2, $3) 
            RETURNING id, display_name, email`,
        [display_name, hashedPassword, email],
      );

      const role = await t.one(`SELECT id FROM Roles WHERE name = $1`, [
        roleName,
      ]);

      await t.none(
        `INSERT INTO User_Roles (user_id, role_id) VALUES ($1, $2)`,
        [user.id, role.id],
      );

      return { ...user, roles: [roleName] };
    });

    return newUser;
  } catch (error) {
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await db.oneOrNone(
      `
      SELECT u.*,
        COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
      FROM Users u
      LEFT JOIN User_Roles ur ON ur.user_id = u.id
      LEFT JOIN Roles r ON r.id = ur.role_id
      WHERE u.email = $1
      GROUP BY u.id
      `,
      [email],
    );

    return user;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    return db.oneOrNone(
      `
      SELECT u.id, u.display_name, u.email,
        COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
      FROM Users u
      LEFT JOIN User_Roles ur ON ur.user_id = u.id
      LEFT JOIN Roles r ON r.id = ur.role_id
      WHERE u.id = $1
      GROUP BY u.id
      `,
      [id],
    );
  } catch (error) {
    throw error;
  }
};

module.exports = { insertUser, getUserByEmail, getUserById };
