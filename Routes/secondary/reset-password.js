const express = require("express");
const {
  checkForgotPassword,
  changePassword,
  deleteExpiredForgotPasswordSession,
} = require("../../Services/DB/db");
const router = express.Router();
const { mustNotBeLogged } = require("../../Services/Middleware/authMiddleware");
const jwt = require("jsonwebtoken");

router.get("/:jwt", mustNotBeLogged, async function (req, res) {
  let decodedToken = "";
  let token = "";
  try {
    token = req.params.jwt;
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // verify the token
  } catch (err) {
    // delete the entry in db
    // console.log("Error: " + err);
    await deleteExpiredForgotPasswordSession();
    res.status(401);
    return res.redirect("/login");
  }

  try {
    await deleteExpiredForgotPasswordSession();
    const results = await checkForgotPassword(decodedToken.email);
    let time = String(results[0].stamp);
    if (String(results[0].stamp) !== decodedToken.time)
      return res.redirect("/login");
    res.render("pages/resetPassword.ejs", {
      email: decodedToken.email,
      key: token,
    });
    // check the db entry
  } catch (err) {
    console.log("Error:" + err);
    res.redirect("/login");
  }
});

router.post("/:jwt", mustNotBeLogged, async function (req, res) {
  const password = req.body.password;
  let email = "";
  let token = {};
  try {
    token = req.params.jwt;
    token = jwt.verify(token, process.env.JWT_SECRET);
    email = token.email;
  } catch (err) {
    await deleteExpiredForgotPasswordSession();
    console.log("Error1 :" + err);
    res.status(401);
    return res.json({
      msg: "You taken has expired!",
    });
  }

  // now check in db for the entry
  try {
    await deleteExpiredForgotPasswordSession();
    let results = await checkForgotPassword(email);
    if (results.length < 1 || String(results[0].stamp) !== token.time) {
      res.status(401);
      return res.json({
        msg: "You are not authorized",
      });
    }
    results = await changePassword(email, password);
    return res.json({
      msg: "Password reset successfully",
    });
  } catch (err) {
    console.log("Error2 :" + err);
    res.status(400);
    return res.json({
      msg: "You are not authorized",
    });
  }
});

module.exports = router;
