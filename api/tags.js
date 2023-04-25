const express = require("express");
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require("../db");

tagsRouter.use((req, res, next) => {
  console.log("GET request on post route");
  next();
});
tagsRouter.get("/", async (req, res) => {
  const tags = await getAllTags();
  res.send(tags);
});
tagsRouter.get("/:tagName/posts", async (req, res, next) => {
  const tagName = req.params.tagName;

  if (!tagName) {
    next({
      name: "Invalid no tags",
      message: "Please provide a tag name!",
    });
  }

  try {
    const allPosts = await getPostsByTagName(tagName);
    const posts = allPosts.filter((post) => {
      return post.active || (req.user && post.author.id === req.user.id);
    });
    res.send({ posts: posts });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = tagsRouter;
