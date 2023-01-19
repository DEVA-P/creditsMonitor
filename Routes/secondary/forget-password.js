const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { findByEmail, forgotPasswordEntry } = require("../../Services/DB/db");
const { genHash } = require("../../Utilities/password");

router.get("/", async function (req, res) {
  res.render("pages/forgetPassword");
});

router.post("/", async function (req, res) {
  const email = req.body.email;
  // check whether the email exists
  try {
    const results = await findByEmail(email);
    if (results.length < 1) {
      res.status(401);
      return res.json({
        msg: "The given email id does not exist",
      });
    }
  } catch (err) {
    res.status(400);
    return res.json({
      msg: "Something went wrong, please try again",
    });
  }

  // create a jwt and use it for url encoding, as well as insert the record into db for checking if the user requested
  // forgot password

  // const token = jwt.sign(
  //   {
  //     email,
  //   },
  //   process.env.JWT_SECRET,
  //   {
  //     expiresIn: "15m",
  //   }
  // ); // jwt created
  let token = {};
  try {
    const results = await forgotPasswordEntry(email);
    token = jwt.sign(
      {
        email,
        time: String(results[0].stamp),
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const link = process.env.LINK + "/resetpassword/" + token;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "CREDIT COURSE MONITOR ADMIN",
      to: [email, process.env.MAIL_ID],
      subject: "PASSWORD RESET",
      html: `<h3>You have requested CREDITS MONITOR to Generate Link for Password Reset</h3><br>
          <h1><a href="${link}">Reset Password</a>.</h1>
          <h4>This link is only valid for 15 minutes</h4>`,
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log("Error sending message: " + err);
        // res.send("error in sending email " + err);
        return res.json({
          msg: "Error in sending mail",
        });
      } else {
        console.log("Message sent succesfully.");
        res.status(200);
        return res.json({
          msg: "Please check your email id to change the password",
        });
      }
    });
  } catch (err) {
    console.log("Error: " + err);
    res.status(400);
    return res.json({
      msg: "Something went wrong please try again",
    });
  }
});

module.exports = router;