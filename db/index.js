const { Client } = require("pg"); // import pg module

//Supply the database name and location of the database

const client = new Client("postgres://localhost:5432/juicebox-dev");

const getAllUsers = async () => {
  const { rows } = await client.query("SELECT * FROM users;");
  return rows;
};

module.exports = { client, getAllUsers };
