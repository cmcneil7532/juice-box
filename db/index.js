const { Client } = require("pg"); // import pg module
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { DATABASE_URL } = process.env;
//Supply the database name and location of the database
const connectionString =
  DATABASE_URL || "postgres://localhost:5432/juicebox-dev";

const client = new Client({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

//Grab all
const getAllUsers = async () => {
  const { rows } = await client.query("SELECT * FROM users;"); //grab all users from the users database
  return rows;
};
async function getAllPosts() {
  try {
    const { rows: postIds } = await client.query(`
        SELECT id FROM posts
        `);

    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );

    return posts;
  } catch (error) {
    console.error(error);
  }
}
async function getAllTags() {
  try {
    const { rows } = await client.query(`
    SELECT * FROM tags
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

const createUser = async ({ username, password, name, location }) => {
  const hashPassword = await bcrypt.hash(password, saltRounds); //Begin to hashpassword

  try {
    const { rows } = await client.query(
      `
            INSERT INTO users(username, password, name, location)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `,
      [username, hashPassword, name, location]
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

async function createPost({ authorId, title, content, tags = [] }) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
        INSERT INTO posts("authorId", title, content)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
      [authorId, title, content]
    );

    const tagList = await createTags(tags);

    return await addTagsToPost(post.id, tagList);
  } catch (error) {
    console.error(error);
  }
}
async function updatePost(id, fields = {}) {
  const keys = Object.keys(fields);

  const setString = keys
    .map((key, index) => `"${key}"=$${index + 1}`) //create string
    .join(", ");

  if (setString.length === 0) {
    return;
  }
  try {
    const {
      row: [user],
    } = await client.query(
      `
        UPDATE posts
        SET ${setString}
        WHERE id = ${id}
        RETURNING *
        `,
      Object.values(fields)
    );
    return user;
  } catch (error) {
    console.error(error);
  }
}
async function getPostsByUser(userId) {
  try {
    const { rows: postIds } = await client.query(`
    SELECT * FROM posts
    WHERE "authorId" = ${userId}
    `);

    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );
    return posts;
  } catch (error) {
    console.error(error);
  }
}

async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(`
    SELECT * FROM users
    WHERE id = ${userId}
    `);

    if (user.length === 0) {
      return null;
    }
    delete user.password;
    user.posts = await getPostsByUser(userId);
    return user;
  } catch (error) {
    console.error(error);
  }
}

async function createTags(tagList) {
  if (tagList.length === 0) {
    return;
  }
  const insertValues = tagList
    .map((tag, index) => `$${index + 1}`)
    .join("), (");

  const selectedValues = tagList
    .map((tag, index) => `$${index + 1}`)
    .join(", ");

  try {
    await client.query(
      `
    INSERT INTO tags(name)
    VALUES (${insertValues})
    ON CONFLICT (name) DO NOTHING;
    `,
      tagList
    );

    const { rows } = await client.query(
      `
    SELECT * FROM tags
    WHERE name
    IN (${selectedValues});
    `,
      tagList
    );

    return rows;
  } catch (error) {
    console.error(error);
  }
}
async function createPostTag(postId, tagId) {
  try {
    await client.query(
      `
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      ON CONFLICT ("postId", "tagId") DO NOTHING;
        `,
      [postId, tagId]
    );
  } catch (error) {
    console.error(error);
  }
}
async function addTagsToPost(postId, tagList) {
  try {
    const createPostTagPromises = tagList.map((tag) =>
      createPostTag(postId, tag.id)
    );

    await Promise.all(createPostTagPromises);

    return await getPostById(postId);
  } catch (error) {
    throw error;
  }
}

async function getPostById(postId) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      SELECT *
      FROM posts
      WHERE id=$1;
    `,
      [postId]
    );
    if (!post) {
      throw {
        name: "PostNotFoundError",
        message: "Could not find a post with that postId",
      };
    }
    const { rows: tags } = await client.query(
      `
      SELECT tags.*
      FROM tags
      JOIN post_tags ON tags.id=post_tags."tagId"
      WHERE post_tags."postId"=$1;
    `,
      [postId]
    );

    const {
      rows: [author],
    } = await client.query(
      `
      SELECT id, username, name, location
      FROM users
      WHERE id=$1;
    `,
      [post.authorId]
    );

    post.tags = tags;
    post.author = author;

    delete post.authorId;

    return post;
  } catch (error) {
    throw error;
  }
}
async function updatePost(postId, fields = {}) {
  const { tags } = fields;

  delete fields.tags;

  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length > 0) {
    await client.query(
      `
      UPDATE posts
      SET ${setString}
      WHERE id = ${postId}
      RETURNING *;
      `,
      Object.values(fields)
    );
  }
  if (tags === undefined) {
    return await getPostById(postId);
  }

  const tagList = await createTags(tags);
  const tagListIdString = tagList.map((tag) => `${tag.id}`).join(", ");
  await client.query(
    `
      DELETE FROM post_tags
      WHERE "tagId"
      NOT IN (${tagListIdString})
      AND "postId"=$1;
    `,
    [postId]
  );
  await addTagsToPost(postId, tagList);

  return await getPostById(postId);
}
async function getPostsByTagName(tagName) {
  try {
    const { rows: postIds } = await client.query(
      `
  SELECT posts.id
  FROM posts
  JOIN post_tags ON posts.id=post_tags."postId"
  JOIN tags ON tags.id=post_tags."tagId"
  WHERE tags.name=$1;
  `,
      [tagName]
    );

    return await Promise.all(postIds.map((post) => getPostById(post.id)));
  } catch (error) {}
}

async function getUserByUsername(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1;
    `,
      [username]
    );

    return user;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById,
  createTags,
  addTagsToPost,
  getPostById,
  updatePost,
  getPostsByTagName,
  getAllTags,
  getUserByUsername,
};
