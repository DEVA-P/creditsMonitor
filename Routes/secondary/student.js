const express = require("express");
const app = express.Router();
const {
  getEnrolledCoursesByEmail,
  getCreditsByEmail,
  findByRollNo,
  findStudentByEmail,
  findEnrolledDetails,
} = require("../../Services/DB/db");
const { mustBeLogged } = require("../../Services/Middleware/authMiddleware");
const {
  mustBeStudent,
  mustBeAdmin,
} = require("../../Services/Middleware/authorization");

app.route("/details").get(mustBeLogged, mustBeStudent, async (req, res) => {
  try {
    let user = await req.user;
    let results = await getEnrolledCoursesByEmail(user.email);
    // let totcredits = await getCreditsByEmail(user.email);
    const totcredits = results.reduce(
      (credits, course) => credits + course.credits,
      0
    );
    res.render("pages/student/creditsearned", {
      email: user.email,
      results: results,
      success: 1,
      totcredits,
    });
  } catch (err) {
    console.log(err);
    res.render("pages/student/creditsearned", {
      email: "",
      results: "",
      success: 0,
      err,
    });
  }
});

app
  .route("/studentdetail")
  .get(mustBeLogged, mustBeAdmin, async (req, res) => {
    let user = await req.user;
    res.render("pages/admin/findByEmail", { email: user.email, success: -1 });
  })
  .post(mustBeLogged, mustBeAdmin, async (req, res) => {
    // try {
    //   let user = await req.user;
    //   let results = await getEnrolledCoursesByEmail(req.body.email);
    //   let totcredits = await getCreditsByEmail(req.body.email);
    //   console.log(results);
    //   res.render("pages/admin/findByEmail", {
    //     email: user.email,
    //     results: results,
    //     success: 1,
    //     totcredits: totcredits[0].credits,
    //     stuemail : req.body.email
    //   });
    // } catch (err) {
    //   console.log(err);
    //   res.render("pages/admin/findByEmail", {
    //     email: "",
    //     results: "",
    //     success: 0,
    //     stuemail: req.body.email,
    //     err,
    //   });
    // }
  });

app.get(
  "/studentdetail/:student",
  mustBeLogged,
  mustBeAdmin,
  async (req, res) => {
    console.log("here");
    let student = req.params.student;
    let results;
    let user;
    try {
      user = await req.user;
      results = await findStudentByEmail(student);
      if (results.length === 0) {
        results = await findByRollNo(student);
        if (results.length === 0) {
          res.status(400);
          return res.render("pages/admin/findByEmail", {
            success: 0,
            email: user.email,
          });
        }
      }
      student = results[0];
      const courses = await findEnrolledDetails(student.email);
      let totcredits = courses.reduce((acc, course) => acc + course.credits, 0);
      return res.render("pages/admin/findByEmail", {
        success: 1,
        stuemail: student.email,
        sturollno: student.rollno,
        stufirstname: student.first_name,
        stulastname: student.last_name,
        stucursem: student.sem,
        totcredits,
        results: courses,
        email: user.email,
      });
    } catch (err) {
      console.log(err);
      return res.render("pages/admin/findByEmail", {
        success: 0,
        email: user.email,
      });
    }
  }
);

module.exports = app;
