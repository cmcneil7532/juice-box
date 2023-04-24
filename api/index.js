const express = require("express");
const apiRouter = express.Router();

const usersRouter = require("./users");
const postsRouter = require("./posts");
const tagsRouter = require("./tags");

apiRouter.use("/users", usersRouter); //When client hits path /user run our usersRouter Funtion
apiRouter.use("/posts", postsRouter);
apiRouter.use("/tags", tagsRouter);

module.exports = apiRouter;
