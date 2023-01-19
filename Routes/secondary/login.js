const express = require("express");
const app = express.Router();
const { mustNotBeLogged } = require("../../Services/Middleware/authMiddleware");
const passport = require("passport");

app
  .route("/")
  .get(mustNotBeLogged, (req, res) => {
    res.render("pages/login");
  })
  .post(mustNotBeLogged, passport.authenticate("local"), async (req, res) => {
    const user = await req.user;
    let ret = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      type: user.type,
    };
    res.json(ret);
  });

module.exports = app;
