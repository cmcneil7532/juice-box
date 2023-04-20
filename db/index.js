const { Client } = require("pg"); // import pg module

//Supply the database name and location of the database

const client = new Client("postgres://localhost:5432/juicebox-dev");

const getAllUsers = async () => {
  const { rows } = await client.query("SELECT * FROM users;"); //grab all users from the users database
  return rows;
};

const createUser = async ({ username, password, name, location }) => {
  try {
    const { rows } = await client.query(
      `
            INSERT INTO users(username, password, name, location)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `,
      [username, password, name, location]
    );
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
async function updateUser(id, fields = {}) {
  //fields are are the sections that we want to change

  //Build the set string
  const keys = Object.keys(fields);
  const setString = keys
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    //we want to find a pet by id
    //change what i want to
    // return the update
    const {
      rows: [user],
    } = await client.query(
      `
      UPDATE users
      SET ${setString}
      WHERE id =${id}
      RETURNING *;
      `,
      Object.values(fields)
    );
    return user;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { client, getAllUsers, createUser, updateUser };
