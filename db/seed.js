const { client, getAllUsers, createUser, updateUser } = require("./index");

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
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
    );
    `);
    console.log("Finished creating table!");
  } catch (error) {
    console.error(error);
  }
}

const createInitialUsers = async () => {
  try {
    console.log("Starting to create users...");
    await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "Just Sandra",
      location: " Ain't tellin",
      active: true,
    });
    await createUser({
      username: "albert",
      password: "bertie99",
      name: "Al Bert",
      location: "Sidney, Australia",
      active: true,
    });
    await createUser({
      username: "glamgal",
      password: "soglam",
      name: "Joshua",
      location: "Upper East Side",
      active: true,
    });
    await createUser({
      username: "chris",
      password: "123",
      name: "Christian",
      location: "Ashburn",
    });
    console.log("Finished creating users!");
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

    console.log("Calling updateUser on users[0]");

    const updatedUser = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log(updatedUser);
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
