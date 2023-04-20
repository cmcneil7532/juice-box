const { client, getAllUsers, createUser } = require("./index");

async function dropTables() {
  try {
    console.log("Begin dropping table!");
    await client.query(`
        DROP TABLE IF EXISTS users;
        `);
    console.log("Finished dropping table!");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Creating table!");
    await client.query(`
    CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );
    `);
    console.log("Finished creating table!");
  } catch (error) {
    console.error(error);
  }
}

const createInitialUsers = async () => {
  try {
    const sandra = await createUser({
      username: "sandra",
      password: "2sandy4me",
    });
    const albert = await createUser({
      username: "albert",
      password: "bertie99",
    });
    const glamgal = await createUser({
      username: "glamgal",
      password: "2glam4me",
    });
  } catch (error) {
    console.error(error);
  }
};

async function rebuildDB() {
  try {
    client.connect();
    await dropTables();
    await createTables();
    await createInitialUsers();
  } catch (error) {
    console.error(error);
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");
    const users = await getAllUsers();
    console.log("getAllUsers: ", users);
    console.log("Finished database tests!");
  } catch (error) {
    console.error(error);
    throw error;
  }
}
rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
