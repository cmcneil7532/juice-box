require("dotenv").config();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const express = require("express");
const usersRouter = express.Router();

const { getAllUsers, getUserByUsername } = require("../db");

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");
  next();
});

usersRouter.get("/", async (req, res) => {
  const users = await getAllUsers();
  res.send({
    users,
  });
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    // If no username or password is present in the login
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }
  try {
    const user = await getUserByUsername(username);

    if (user && user.password === password) {
      //Check do we get a returned user and does the user's password match what they typed in the login form to the one in the database
      const token = jwt.sign(user, JWT_SECRET);
      res.send({
        messgae: "You're logged in",
        token: token,
      });
    } else {
      //If no user or the password on the database doesnt match what they typed send error handler message
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
module.exports = usersRouter;
