const { findCourseCode } = require("../DB/db");

const mustBeTeacher = async (req, res, next) => {
  const user = await req.user;
  if (user.type === 1) next();
  else {
    if (req.method === "GET") {
      res.status(403);
      res.redirect("/");
    } else if (req.method === "POST") {
      res.status(403);
      res.json({
        msg: "Not authorized",
      });
    }
  }
};

const mustBeStudent = async (req, res, next) => {
  const user = await req.user;
  if (user.type === 0) next();
  else {
    if (req.method === "GET") {
      res.status(403);
      res.redirect("/");
    } else if (req.method === "POST") {
      res.status(403);
      res.json({
        msg: "Not authorized",
      });
    }
  }
};

const mustBeAdmin = async (req, res, next) => {
  const user = await req.user;
  if (user.type === 2) next();
  else {
    if (req.method === "GET") {
      res.status(403);
      res.redirect("/");
    } else if (req.method === "POST") {
      res.status(403);
      res.json({
        msg: "Not authorized",
      });
    }
  }
};

const mustBeCourseAdmin = async (req, res, next) => {
  const user = await req.user;
  const course_id = req.body.course_code || req.params.course_code;
  console.log(course_id);
  try {
    const results = await findCourseCode(course_id);
    console.log(results);
    if (results[0].handling_staff_email !== user.email) res.redirect("/");
    else next();
  } catch (err) {
    console.log(err);
    // res.status(400);
    // return res.json({ msg: "There has been an error please try Later!" });
    res.redirect("/");
  }
};

module.exports = {
  mustBeTeacher,
  mustBeStudent,
  mustBeAdmin,
  mustBeCourseAdmin,
};
