require("dotenv").config();
const { JWT_SECRET } = process.env;
const jwt = require("jsonwebtoken");
const express = require("express");
const { createUser } = require("../db");
const bcrypt = require("bcrypt");

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
    const user = await getUserByUsername(username); //Import a function that will take username from the input field in our frontend grab the users info
    const hashedPassword = user.password;
    const match = await bcrypt.compare(password, hashedPassword);

    if (user && match) {
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

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body; //frow our register form grab these values
  console.log(username, password);
  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      //if the user registers with a user already in the database throw this message
      next({
        name: "User already exist",
        message: "A user by that username already exists.",
      });
    }
    const user = await createUser({
      //Create a user and put in our database
      username,
      password,
      name,
      location,
    });
    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, {
      expiresIn: "1w",
    });
    res.send({
      message: "Thank you for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
});
module.exports = usersRouter;
