const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  getAllPosts,
  getPostsByUser,
  getUserById,
  createTags,
  getPostById,
  addTagsToPost,
  updatePost,
  getPostsByTagName,
  getAllTags,
} = require("./index");

async function dropTables() {
  try {
    console.log("Begin dropping table!");

    await client.query(`
    DROP TABLE IF EXISTS post_tags;
    `);
    await client.query(`
    DROP TABLE IF EXISTS tags;
    `);
    await client.query(`
    DROP TABLE IF EXISTS posts;
    `);
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

    await client.query(`
      CREATE TABLE posts(
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
        );
        `);
    await client.query(`
      CREATE TABLE tags(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
            );
            `);
    await client.query(`
      CREATE TABLE post_tags(
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id),
        UNIQUE("postId", "tagId")
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

const createInitialPosts = async () => {
  try {
    const [sandra, albert, glamgal, christian] = await getAllUsers();

    await createPost({
      authorId: sandra.id, //Refernce our author id with users id and push those posts to the user
      title: "Sandra Post",
      content: "this is my first post",
      tags: ["#happy", "#youcandoanything"],
    });
    await createPost({
      authorId: christian.id,
      title: "Christian Post",
      content: "this is my first post",
      tags: ["#happy", "#worst-day-ever"],
    });
    await createPost({
      authorId: albert.id,
      title: "Albert Post",
      content: "this is my first post",
      tags: ["#happy", "#youcandoanything", "#canmandoeverything"],
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
    await createInitialPosts();
  } catch (error) {
    console.error(error);
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");
    // const users = await getAllUsers();
    // console.log("getAllUsers: ", users);
    // console.log("Creating tags");
    // const createdTags = await createTags(["#tag", "#othertag", "#onemoretag"]);
    // console.log(createdTags);
    // console.log("Finished Creating tags");

    // console.log("Calling getPostsByTagName with #happy");
    // const postsWithHappy = await getPostsByTagName("#happy");
    // console.log("Result:", postsWithHappy);
    // console.log("Grab all tags");
    // await getAllTags();
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
