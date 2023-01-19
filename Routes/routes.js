const express = require("express");
const app = express.Router();
const loginRoute = require("./secondary/login");
const registerRoute = require("./secondary/register");
const { mustBeLogged } = require("../Services/Middleware/authMiddleware");
const logoutRoute = require("./secondary/logout");
const course_proposal = require("./secondary/course_proposal");
const course = require("./secondary/course");
const enroll = require("./secondary/enroll");
const forgetPassword = require("./secondary/forget-password");
const resetPassword = require("./secondary/reset-password");
const student = require("./secondary/student");
const admin = require("./secondary/admin");
const marks = require("./secondary/marks");

const {
  getCoursesOfStaff,
  getAllCompletedCoursescount,
  getCreditsByEmail,
} = require("../Services/DB/db");

app.use("/resetpassword", resetPassword);
app.use("/login", loginRoute);
app.use("/signup", registerRoute);
app.use("/logout", logoutRoute);
app.use("/course_proposal", course_proposal);
app.use("/course", course);
app.use("/enroll", enroll);
app.use("/forgetpassword", forgetPassword);
app.use("/student", student);
app.use("/admin", admin);
app.use("/marks", marks);

app.get("/", mustBeLogged, async (req, res) => {
  const user = await req.user;
  if (user.type === 0) {
    const results = await getCreditsByEmail(user.email);
    const credits = 0;
    console.log(results[0]);
    res.render("pages/student/student_dashboard", {
      email: user.email,
      hasEnrolled: user.enrolled[0],
      totcredits: results[0] ? results[0].credits : credits,
    });
  } else if (user.type === 1) {
    const results = await getCreditsByEmail(user.email);
    const credits = 0;
    res.render("pages/teacher/teacher_dashboard", {
      email: user.email,
    });
  } else if (user.type === 2) {
    let results = await getAllCompletedCoursescount();
    res.render("pages/admin/admin", {
      email: user.email,
      count: results[0].count,
    });
  }
});

module.exports = app;
