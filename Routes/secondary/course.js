const express = require("express");
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
const {
  getApprovedCourses,
  getCoursesOfStaff,
  findCourseCode,
  getEnrolledStudentsInCourse,
  getEnrolledCoursesByEmail,
  getAllActiveCourses,
  getAllCourses,
  approveCourse,
  editCourse,
  deleteCourseById,
  getCourseById,
  passStudent,
  changeCourseStatus,
} = require("../../Services/DB/db");
const { mustBeLogged } = require("../../Services/Middleware/authMiddleware");
const {
  mustBeStudent,
  mustBeTeacher,
  mustBeAdmin,
  mustBeCourseAdmin,
} = require("../../Services/Middleware/authorization");
const { courseSchema } = require("../../Services/Validation/schema");
const app = express.Router();

app.route("/student").get(mustBeLogged, mustBeStudent, async (req, res) => {
  let courses = [];
  const user = await req.user;
  try {
    courses = await getApprovedCourses(user.sem);
    return res.json({ courses });
  } catch (err) {
    res.status(400);
    res.json({
      msg: "There has been an error please try later!",
    });
  }
});

app
  .route("/teacher")
  .get(mustBeLogged, mustBeTeacher, async (req, res) => {
    let courses = [];
    const user = await req.user;
    try {
      courses = await getCoursesOfStaff(user.email);
      res.status(200);
      res.json({ courses });
    } catch (err) {
      res.status(400);
      res.json({
        msg: "There has been an error please try later!",
      });
    }
  })
  .put(mustBeLogged, mustBeTeacher, async (req, res) => {
    const user = await req.user;
    let value = req.body;
    try {
      courses = await getCoursesOfStaff(user.email);
      if (courses.length < 1) {
        res.status(400);
        return res.json({
          msg: "You are not allowed to change the course",
        });
      }
    } catch (err) {
      console.log("Error: " + err);
      res.status(400);
      return res.json({
        msg: "Something went wrong, please try again!",
      });
    }
    value.weeksDuration = parseInt(value.weeksDuration);
    try {
      value = await courseSchema.validateAsync(value);
    } catch (err) {
      console.log("Error: " + err);
      res.status(400);
      return res.json({
        msg: err.details[0].message,
      });
    }

    try {
      const results = await editCourse(
        value.id,
        value.course_name,
        value.about,
        value.credits,
        value.fees,
        value.staffType,
        value.count,
        value.sem,
        value.weeksDuration
      );

      res.status(200);
      res.json({
        msg: "Successfully updated the course",
      });
    } catch (err) {
      console.log("Error: " + err);
      res.status(400);
      return res.json({
        msg: "Something went wrong, please try again!",
      });
    }
  });

app.route("/admin").get(mustBeLogged, mustBeAdmin, async (req, res) => {
  let courses = [];
  try {
    courses = await getAllActiveCourses();
    res.status(200);
    res.json({ courses });
  } catch (err) {
    res.status(400);
    res.json({
      msg: "There has an error please try later!",
    });
  }
});

app
  .route("/all")
  .get(mustBeLogged, mustBeAdmin, async (req, res) => {
    try {
      let user = await req.user;
      res.render("pages/admin/adminview", {
        email: user.email,
      });
    } catch (err) {
      res.status(400);
      res.json({
        msg: "There has been an error please try again!",
      });
    }
  })
  .post(mustBeLogged, mustBeAdmin, async (req, res) => {
    try {
      const courses = await getAllCourses();
      res.json({ courses });
    } catch (err) {
      res.status(400);
      res.json({
        msg: "There has been an error",
      });
    }
  });

app
  .route("/detail/:course_id")
  .get(mustBeLogged, mustBeTeacher, async (req, res) => {
    const user = await req.user;
    const course_id = req.params.course_id;
    try {
      let results = await findCourseCode(course_id);
      if (results[0].handling_staff_email === user.email)
        res.render("pages/teacher/coursestudent", {
          email: user.email,
          course_id: course_id,
          course_name: results[0].course_name,
        });
      else res.redirect("/");
    } catch (err) {
      res.status(400);
      res.json({ msg: "There has been an error please try Later!" });
    }
  })
  .post(mustBeLogged, mustBeTeacher, async (req, res) => {
    const user = await req.user;
    const course_id = req.params.course_id;
    try {
      let results = await findCourseCode(course_id);
      if (
        results.length > 0 &&
        results[0].handling_staff_email === user.email
      ) {
        results = await getEnrolledStudentsInCourse(course_id);
        res.status(200);
        res.json({ results });
      } else res.redirect("/");
    } catch (err) {
      console.log(err);
      res.status(400);
      res.json({ msg: "There has been an error please try Later!" });
    }
  });

app.post("/approve/:id", mustBeLogged, mustBeAdmin, async (req, res) => {
  const course_code = req.body.course_id;
  try {
    let results = await findCourseCode(course_code);
    if (results.length > 0) {
      res.status(400);
      return res.json({
        msg: "This course code already exists, please enter a unique id",
      });
    }
  } catch (e) {
    console.log("Error:" + e);
    res.status(400);
    res.json({
      msg: e,
    });
  }
  try {
    results = await approveCourse(req.params.id, course_code);
    results = await findCourseCode(course_code);
    res.status(200);
    // todo: send email to the respective teacher
    let info = await transporter.sendMail({
      to: results[0].handling_staff_email,
      from: "STUDENTS CREDIT MONITOR ADMIN",
      subject: "COURSE ACCEPTANCE CONFIRMATION",
      html: `
      <h3></h3><br>
      <h1> Your course ${results[0].course_name} is Successfully accepted with ${course_code}</h1>
      <h3>Visit CREDITS MORNITOR for furthur information`,
    });
    res.json({
      msg: "Successfully approved the course",
    });
  } catch (e) {
    console.log("Error: " + e);
    res.status(400);
    res.json({
      msg: e,
    });
  }
});

app
  .route("/admin/detail/:course_id")
  .get(mustBeLogged, mustBeAdmin, async (req, res) => {
    const user = await req.user;
    const course_id = req.params.course_id;
    try {
      let results = await findCourseCode(course_id);
      res.render("pages/admin/coursestudent-admin", {
        email: user.email,
        staffEmail: results[0].handling_staff_email,
        course_id: course_id,
        course_name: results[0].course_name,
      });
    } catch (err) {
      res.status(400);
      res.json({ msg: "There has been an error please try Later!" });
    }
  })
  .post(mustBeLogged, mustBeAdmin, async (req, res) => {
    const course_id = req.params.course_id;
    try {
      let results = await findCourseCode(course_id);
      results = await getEnrolledStudentsInCourse(course_id);
      res.status(200);
      res.json({ results });
    } catch (err) {
      console.log(err);
      res.status(400);
      res.json({ msg: "There has been an error please try Later!" });
    }
  });

app.post("/reject", mustBeLogged, mustBeAdmin, async (req, res) => {
  const id = req.body.id;
  if (id === "" || id === " ") {
    res.status(400);
    return res.json({
      msg: "Please try again!",
    });
  }
  let results = {};
  try {
    results = await getCourseById(id);
    await deleteCourseById(id);
  } catch (err) {
    res.status(400);
    return res.json({
      msg: "Unable to delete course please try again",
    });
  }
  try {
    let info = await transporter.sendMail({
      to: results[0].email,
      from: "STUDENTS CREDIT MONITOR ADMIN",
      subject: "COURSE REJECTED",
      html: `
      <h3></h3><br>
      <h1> Your course ${results[0].course_name} is rejected with by the admin. Contact the admin for more information</h1>`,
    });
    return res.json({
      msg: "The course has been rejected and the staff was notified",
    });
  } catch (err) {
    console.log(err);
    res.status(400);
    return res.json({
      msg: "Unable to send mail",
    });
  }
});

app.post(
  "/pass",
  mustBeLogged,
  mustBeTeacher,
  mustBeCourseAdmin,
  async (req, res) => {
    const user = await req.user;
    const course_id = req.body.course_code;
    let results = {};
    try {
      results = await findCourseCode(course_id);
    } catch (err) {
      res.status(400);
      return res.json({ msg: "There has been an error please try Later!" });
    }
    const students = req.body.students;
    Promise.allSettled(
      students.map((student) =>
        passStudent(student, results[0].credits, results[0].id)
      )
    )
      .then((resp) => {
        res.status(200);
        return res.json({
          msg: "Successfully passed all the students",
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(400);
        return res.json({
          msg: "Something went wrong!",
        });
      });
  }
);

app.post(
  "/fail",
  mustBeLogged,
  mustBeTeacher,
  mustBeCourseAdmin,
  async (req, res) => {
    const course_id = req.body.course_code;
    let results = {};
    try {
      results = await findCourseCode(course_id);
    } catch (err) {
      console.log(err);
      res.status(400);
      return res.json({
        msg: "Something went wrong!",
      });
    }
    const students = req.body.students;
    Promise.all(
      students.map(async (student) => passStudent(student, 0, results[0].id))
    )
      .then((resp) => {
        res.status(200);
        return res.json({
          msg: "Successfully failed all the students",
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(400);
        return res.json({
          msg: "Something went wrong!",
        });
      });
  }
);

app.get(
  "/finish/:course_code",
  mustBeLogged,
  mustBeTeacher,
  async (req, res) => {
    const course_code = req.params.course_code;
    try {
      const results = await changeCourseStatus(
        course_code.substring(1, course_code.length),
        -1
      );
      res.status(200);
      return res.json({
        msg: "Successfully finished the course",
      });
    } catch (err) {
      console.log(err);
      res.status(400);
      return res.json({
        msg: "Something went wrong!",
      });
    }
  }
);

module.exports = app;
