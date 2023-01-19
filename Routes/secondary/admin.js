const express = require("express");
const app = express.Router();
const { mustBeLogged } = require("../../Services/Middleware/authMiddleware");
const { mustBeAdmin } = require("../../Services/Middleware/authorization");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const credentials = require("../../Config/credits.json");
const {
  register,
  promoteStudentsSem,
  changeCourseStatus,
  getCurrentSemEnrollmentDetails,
} = require("../../Services/DB/db");
const { signupSchema } = require("../../Services/Validation/schema");
const nodemailer = require("nodemailer");

app
  .route("/adduser")
  .get(mustBeLogged, mustBeAdmin, async (req, res) => {
    try {
      let user = await req.user;
      res.render("pages/admin/adduserbyadmin", {
        email: user.email,
      });
    } catch (err) {
      console.log(err);
      res.render("pages/admin/adduserbyadmin", {
        email: "",
        err,
      });
    }
  })
  .post(mustBeLogged, mustBeAdmin, async (req, res) => {
    const type = req.body.type;
    if (type > 2) {
      res.status(401);
      return res.json({
        msg: "Invalid operation",
      });
    }
    try {
      const docs = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
      await docs.useServiceAccountAuth(credentials);
      await docs.loadInfo();
      const studentSheet = docs.sheetsByIndex[0];
      const teacherSheet = docs.sheetsByIndex[1];
      const adminSheet = docs.sheetsByIndex[2];
      const users = [];
      if (type === 0) {
        const studentRows = await studentSheet.getRows();
        studentRows.forEach((studentRow) => {
          let student = {
            email: studentRow["EMAIL"],
            rollno: studentRow["ROLL NO"],
            firstName: studentRow["FIRST NAME"],
            lastName: studentRow["LAST NAME"],
            sem: studentRow["SEM"],
            dob: studentRow["DOB"],
          };
          users.push(student);
        });
      } else if (type === 1) {
        const teacherRows = await teacherSheet.getRows();
        teacherRows.forEach((studentRow) => {
          let teacher = {
            email: studentRow["EMAIL"],
            rollno: "",
            firstName: studentRow["FIRST_NAME"],
            lastName: studentRow["LAST_NAME"],
            sem: "",
            dob: studentRow["DOB"],
          };
          users.push(teacher);
        });
      } else if (type === 2) {
        const adminRows = await adminSheet.getRows();
        adminRows.forEach((studentRow) => {
          let admin = {
            email: studentRow["EMAIL"],
            firstName: studentRow["FIRST_NAME"],
            lastName: studentRow["LAST_NAME"],
            dob: studentRow["DOB"],
            rollno: "",
            sem: "",
          };
          users.push(admin);
        });
      }
      Promise.allSettled(
        users.map(async (user) => {
          let value;
          try {
            value = await signupSchema.validateAsync({
              first_name: user.firstName,
              last_name: user.lastName,
              email: user.email,
              password: user.dob,
              dept: "1",
              type: type,
              rollno: user.rollno,
              sem: user.sem,
            });
          } catch (err) {
            console.log(err);
            return;
          }
          return register(
            value.email,
            value.password,
            value.first_name,
            value.last_name,
            value.dept,
            value.type,
            value.rollno,
            value.sem
          );
        })
      ).then((resp) => {
        // console.log(resp);
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASSWORD,
          },
        });
        let students = resp.map((student) => {
          if (!student.value.isExists && student.status === "fulfilled")
            return student.value.email;
          else return "";
        });
        if (students.length === 0) {
          res.status(400);
          return res.json({
            msg: "All users already exist",
          });
        }
        students = students.filter((student) => student);
        const mailOptions = {
          from: "CREDIT COURSE MONITOR ADMIN",
          to: students,
          subject: "STUDENT REGISTRATION",
          html: `<h3>You have been Enrolled into the CREDITS MORNITOR</h3><br>
                <h4>Your username is edu Mail</h4>
                <h4>Your DOB is Your password</h4>`,
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
        // res.status(200);
        // console.log("Successfully registered all the students");
        // return res.json({
        //   msg: "Successfully registered all the students",
        // });
      });
      // .then((resp) => {
      //     console.log(resp);
      //     res.status(200);
      //     console.log("Successfully registered all the students");
      //     return res.json({
      //       msg: "Successfully registered all the students",
      //     });
      //   })
      // .catch((err) => {
      //     console.log(err);
      //     res.status(400);
      //     return res.json({
      //       msg: "Something went wrong",
      //     });
      //   });
    } catch (err) {
      console.log(err);
      res.status(400);
      return res.json({
        msg: "Something went wrong please try again",
      });
    }
  });

app.post("/inactivate", mustBeLogged, mustBeAdmin, async (req, res) => {
  const course_code = req.body.course_code;
  try {
    const results = await changeCourseStatus(course_code, 0);
    return res.json({
      msg: "Successfully inactivated the course",
    });
  } catch (err) {
    console.log(err);
    res.status(400);
    return res.json({
      msg: "Something went wrong!",
    });
  }
});

app
  .route("/promotestudents")
  .get(mustBeLogged, mustBeAdmin, async (req, res) => {
    try {
      let user = await req.user;
      // let findNoIncomplete = await
      let results = await promoteStudentsSem();
      // res.send(results);
      return res.json({
        msg: "Promoted Students",
      });
    } catch (err) {
      console.log(err);
      res.render("pages/admin/admin", {
        email: user.email,
        err,
      });
    }
  });

app.route("/enrollment").get(mustBeLogged, mustBeAdmin, async (req, res) => {
  // res.render("") some page
  try {
    const user = await req.user;
    const results = await getCurrentSemEnrollmentDetails();
    return res.render("pages/admin/activeStudentsDetail", {
      email: user.email,
      students: results,
    });
  } catch (error) {
    res.redirect("/");
  }
});
// .post(mustBeLogged, mustBeAdmin, async (req, res) => {
//   const n = req.body.count;
//   try {

//     return res.json({
//       student: results[0],
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400);
//     return res.json({
//       msg: "Something went wrong",
//     });
//   }
// });

module.exports = app;
