const express = require("express");
const {
  checkStudentEnroll,
  enrollStudent,
  getCourseByCourseCode,
  getEnrolledCoursesByEmail,
} = require("../../Services/DB/db");
const { mustBeLogged } = require("../../Services/Middleware/authMiddleware");
const { mustBeStudent } = require("../../Services/Middleware/authorization");
const app = express.Router();
const nodemailer = require("nodemailer");

//for mail
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PASSWORD,
  },
});
//for mail

app.get("/", mustBeLogged, mustBeStudent, async (req, res) => {
  try {
    let user = await req.user;
    let results = await getEnrolledCoursesByEmail(user.email);
    return res.json({
      msg: results,
    });
  } catch (err) {
    res.status(422);
    res.json({
      msg: "There has been an error. Please try again!",
    });
  }
});

app.post("/", mustBeLogged, mustBeStudent, async (req, res) => {
  const { course_id } = req.body;
  const user = await req.user;
  try {
    let results = await checkStudentEnroll(user.email, user.sem);
    if (results.length !== 0) {
      res.status(400);
      return res.json({
        msg: "You have already been enrolled in a course for this sem!",
      });
    }
    results = await getCourseByCourseCode(course_id);
    if (results.length === 0) {
      res.status(400);
      return res.json({
        msg: "There are no such courses. Please enter a valid course",
      });
    }
    res.status(200);
    console.log("successfully enrolled to course");
    res.json({
      msg: "Successfully enrolled on the course",
    });
    results = await enrollStudent(course_id, user.email, user.sem);
    console.log(user);
    let info = await transporter.sendMail({
      from: "STUDENTS CREDIT MONITOR ADMIN",
      to: user.email,
      subject: "COURSE ENROLLMENT CONFIRMATION",
      html: `<h1>Hello ${user.userName},</h1><br>
            <h1> YOU HAVE SUCCESSFULLY ENROLLED TO THE COURSE ID - ${course_id} FOR THE CURRENT SEMESTER ${user.sem}....</h1>
            <h3>Visit CREDITS MORNITOR for furthur information`,
    });
  } catch (err) {
    res.status(422);
    return res.json({
      msg: "There has been an error please try again",
    });
  }
});

module.exports = app;
