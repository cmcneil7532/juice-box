const express = require("express");
const apiRouter = express.Router();

const usersRouter = require("./users");

apiRouter.use("/users", usersRouter); //When client hits path /user run our usersRouter Funtion

module.exports = apiRouter;
