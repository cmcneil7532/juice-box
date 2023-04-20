const { Client } = require("pg"); // import pg module

//Supply the database name and location of the database

const client = new Client("postgres://localhost:5432/juicebox-dev");

const getAllUsers = async () => {
  const { rows } = await client.query("SELECT * FROM users;"); //grab all users from the users database
  return rows;
};

const createUser = async ({ username, password }) => {
  try {
    const { rows } = await client.query(
      `
            INSERT INTO users(username, password)
            VALUES ($1, $2)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `,
      [username, password]
    );
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
module.exports = { client, getAllUsers, createUser };
