const express = require("express");
const tagsRouter = express.Router();
const { getAllTags } = require("../db");

tagsRouter.use((req, res, next) => {
  console.log("GET request on post route");
  next();
});
tagsRouter.use("/", async (req, res) => {
  const tags = await getAllTags();
  res.send(tags);
});

module.exports = tagsRouter;
