const express = require("express");
const jwt = require("jsonwebtoken");
const usersRouter = require("./users");
const postsRouter = require("./posts");
const tagsRouter = require("./tags");
const { JWT_SECRET } = process.env;
const { getUserById } = require("../db");

const apiRouter = express.Router();

apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    // if no Auth header was found will be handled in our error handler
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length); // grab the token

    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

apiRouter.use("/users", usersRouter); //When client hits path /user run our usersRouter Funtion
apiRouter.use("/posts", postsRouter);
apiRouter.use("/tags", tagsRouter);

apiRouter.use((error, req, res, next) => {
  res.send({
    name: error.name,
    error: error.message,
  });
});

module.exports = apiRouter;
