const express = require("express");
const { getAllPosts } = require("../db");
const { requireUser } = require("./utils");

const postsRouter = express.Router();

postsRouter.use("/", requireUser, async (req, res, next) => {
  res.send({ message: "under construction" });
});

postsRouter.get("/", async (req, res) => {
  const posts = await getAllPosts();
  res.send({
    posts,
  });
});
module.exports = postsRouter;
