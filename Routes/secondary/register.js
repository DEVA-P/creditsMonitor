const express = require("express");
const app = express.Router();
const { mustNotBeLogged } = require("../../Services/Middleware/authMiddleware");
const { register, findByEmail, findByRollNo } = require("../../Services/DB/db");
const { signupSchema } = require("../../Services/Validation/schema");
const { isKonguEmail } = require("../../Services/Validation//functions");

app
  .route("/")
  .get(mustNotBeLogged, (req, res) => {
    res.render("pages/signup");
  })
  .post(mustNotBeLogged, async (req, res) => {
    const { email, password, first_name, last_name, dept, rollno, sem } =
      req.body;
    const type = req.body.optradio;
    let value = {};
    try {
      value = await signupSchema.validateAsync({
        email,
        password,
        first_name,
        last_name,
        dept,
        type,
        rollno,
        sem,
      });
    } catch (err) {
      res.status(401);
      console.log(err.details[0].message);
      return res.render("pages/signup", {
        msg: err.details[0].message,
        details: req.body,
      });
    }

    const isEduMail = isKonguEmail(email);
    if (!isEduMail) {
      res.status(401);
      return res.render("pages/signup", {
        msg: "Please enter your kongu edu mail id!",
        details: req.body,
      });
    }
    try {
      let results = await findByEmail(email);
      if (results.length !== 0) {
        res.status(401);
        return res.render("pages/signup", {
          msg: "Email already exists! Please enter another email",
        });
      }
      count = await findByRollNo(rollno);
      if (count.length !== 0) {
        res.status(401);
        return res.render("pages/signup", {
          msg: "RollNo already exists!",
        });
      }
    } catch (err) {
      return res.render("pages/signup", {
        msg: "There has been an error please try again!",
      });
    }
    let user = null;
    try {
      user = await register(
        email,
        password,
        first_name,
        last_name,
        dept,
        type,
        rollno,
        sem
      );
    } catch (err) {
      console.log(err);
      res.status(400);
      return res.render("pages/signup", {
        msg: err.sqlMessage,
      });
    }

    return res.render("pages/signup", {
      msg: "Successfully created account! Please login to work!",
      redirect: 1,
    });
  });

module.exports = app;
