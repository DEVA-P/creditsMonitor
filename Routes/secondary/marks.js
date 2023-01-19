const express = require("express");
const { findCourseCode, addmarks } = require("../../Services/DB/db");
const { mustBeLogged } = require("../../Services/Middleware/authMiddleware");
const { mustBeTeacher } = require("../../Services/Middleware/authorization");
const app = express.Router();
const path = require("path");

app.get(
  "/download/:course_code",
  mustBeLogged,
  mustBeTeacher,
  async (req, res) => {
    const courseId = req.params.course_code;
    // console.log(courseId);
    const user = await req.user;
    try {
      const course = await findCourseCode(courseId);
      if (course[0].handling_staff_email !== user.email)
        return res.redirect("/");
      const file = path.join(
        __dirname + "..",
        "..",
        "..",
        "sample_files",
        "test_marks.xlsx"
      );

      return res.download(file);
    } catch (err) {
      console.log(err);
      return res.redirect("/");
    }
  }
);

app.post("/upload", mustBeLogged, mustBeTeacher, async (req, res) => {
  const course_code = req.body.course_code;
  const user = await req.user;
  let course = {};
  try {
    course = await findCourseCode(course_code);
    if (course[0].handling_staff_email !== user.email)
      return res.json({
        msg: "You are not authorized",
      });
  } catch (err) {
    console.log(err);
    return res.json({
      msg: "Something went wrong!",
    });
  }

  // console.log(req.body);
  const students = req.body.students;
  let responses = [];
  course = course[0];
  Promise.allSettled(
    students.map((student) => addmarks(student.email, student.marks, course.id))
  )
    .then((resp) => {
      console.log(resp);
      responses.push(resp);
      res.status(200);
      return res.json({
        responses,
      });
    })
    .catch((err) => {
      // console.log(err);
      res.status(400);
      return res.json({
        msg: "Something went wrong!",
      });
    });
});

app.get("/:course_id", mustBeLogged, mustBeTeacher, async (req, res) => {
  const courseId = req.params.course_id;
  const user = await req.user;
  try {
    const course = await findCourseCode(courseId);
    if (course[0].handling_staff_email !== user.email) return res.redirect("/");

    return res.render("pages/teacher/addmarks", {
      email: user.email,
      course_id: courseId,
      course_name: course[0].course_name,
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }
});

module.exports = app;
