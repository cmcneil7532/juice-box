function requireUser(req, user, next) {
  //Check if there is a user logged in
  if (!req.user) {
    next({
      name: "MissingUserError",
      message: "You must be logged in to perform this action",
    });
  }
  next();
}

module.exports = { requireUser };
