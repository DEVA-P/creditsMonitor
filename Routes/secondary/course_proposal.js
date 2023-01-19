const express = require("express");
const { addCourse, findCourseCode } = require("../../Services/DB/db");
const { mustBeLogged } = require("../../Services/Middleware/authMiddleware");
const { mustBeTeacher } = require("../../Services/Middleware/authorization");
const { courseSchema } = require("../../Services/Validation/schema");
const app = express.Router();

app
  .route("/")
  .get(mustBeLogged, mustBeTeacher, (req, res) => {
    res.render("pages/teacher/course_proposal");
  })
  .post(mustBeLogged, mustBeTeacher, async (req, res) => {
    let value = req.body;
    value.course_id = "NA";
    try {
      value = await courseSchema.validateAsync(value);
    } catch (err) {
      res.status(400);
      console.log("Err:" + err.details[0].message);
      return res.json({ msg: err.details[0].message });
    }
    try {
      let user = await req.user;
      let results = await findCourseCode(value.course_id);
      if (results.length > 0 && value.course_id !== "NA") {
        res.status(400);
        return res.json({ msg: "The given course code already exists!" });
      }
      let result = await addCourse(
        value.course_name,
        value.course_id,
        value.about,
        value.credits,
        value.fees,
        user.email,
        value.staffType,
        value.count,
        value.sem,
        value.weeksDuration
      );
      return res.json({
        msg: result,
      });
    } catch (err) {
      res.status(422);
      return res.json({ msg: err.sqlMessage });
    }
  });

module.exports = app;
