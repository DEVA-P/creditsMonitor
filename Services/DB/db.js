const { createPool } = require("mysql");
const { checkPassword, genHash } = require("../../Utilities/password");
const session = require("express-session");
const mySqlStore = require("express-mysql-session")(session);
require("dotenv").config({ path: "../../Config/.env" });

const pool = createPool({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "courseDetails",
});

const sessionStore = new mySqlStore(
  {
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "courseDetails",
    clearExpired: true,
    checkExpirationInterval: 1000 * 60 * 10,
    expiration: 1000 * 60 * 30,
    createDatabaseTable: true,
  },
  pool
);

const login = (userName, password) => {
  return new Promise((resolve, reject) => {
    // This function is for user login
    pool.query(
      "select id,first_name,last_name, password,email,type from user_data where email = ?",
      [userName],
      async (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        if (results == null || results.length == 0) return reject("Invalid credentials");
        const match = await checkPassword(password, results[0]["password"]);
        if (match) {
          const user = {
            id: results[0]["id"],
            email: results[0]["email"],
            first_name: results[0]["first_name"],
            type: results[0]["type"],
            last_name: results[0]["last_name"],
          };
          // console.log("the user detials found over database are:",user);
          resolve(user);
        }
        reject("Invalid credentials");
      }
    );
  });
};

const findById = (id) => {
  // this function is used by passport
  return new Promise((resolve, reject) => {
    pool.query(
      `select id,first_name, user_data.email,type, rollno,sem,hasEnrolled from user_data left join 
          student on user_data.email = student.email where id = ?;`,
      [id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        } else if (results.length === 0) reject("No such user in the db");
        // let buffer = results[0].type;
        const user = {
          id: results[0]["id"],
          email: results[0]["email"],
          userName: results[0]["first_name"],
          type: results[0]["type"],
          sem: results[0]["sem"],
          rollno: results[0]["rollno"],
          enrolled: results[0]["hasEnrolled"],
        };
        resolve(user);
      }
    );
  });
};

const findByEmail = async (email) => {
  // this is to find the person by email
  return new Promise((resolve, reject) => {
    pool.query(
      "select email from user_data where email = ?;",
      [email],
      (err, results, field) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const findByRollNo = (rollno) => {
  // this is to find the student by roll no
  return new Promise((resolve, reject) => {
    pool.query(
      "select rollno,student.email,first_name,last_name,sem from student left join user_data on student.email = user_data.email where rollno= ?;",
      [rollno],
      (err, results, field) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const register = (
  email,
  password,
  first_name,
  last_name,
  dept,
  type,
  roll,
  sem
) => {
  // this is for adding a user to the db
  return new Promise(async (resolve, reject) => {
    try {
      password = await genHash(password);
    } catch (err) {
      console.log(err);
      reject(err);
    }
    if (sem === "") sem = 0;
    try {
      const result = await findByEmail(email);
      if (result.length > 0)
        resolve({
          isExists: true,
        });
    } catch (err) {
      console.log(err);
      reject(err);
    }
    pool.query(
      "CALL AddUser(?, ?, ?, ?, ?, ?, ?, ?);",
      [email, password, first_name, last_name, dept, type, roll, sem],
      (err, results, fields) => {
        if (err) {
          console.log("Error in db.js");
          reject(err);
        } else {
          const user = {
            first_name,
            email,
            last_name,
            isExists: false,
          };
          resolve(user);
        }
      }
    );
  });
};

const editCourse = (
  id,
  course_name,
  about,
  credits,
  fees,
  staff_type,
  count,
  sem,
  weeksDuration
) => {
  // this is for editing already existing course
  // console.log(id, course_name, about);
  return new Promise((resolve, reject) => {
    pool.query(
      `update courses_table set course_name = ?,about=?,credits=?,fees=?,staff_type=?,count=?,sem=?,duration=? where id = ?;`,
      [
        course_name,
        about,
        credits,
        fees,
        staff_type,
        count,
        sem,
        weeksDuration,
        id,
      ],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve("Updated the course");
      }
    );
  });
};

const addCourse = (
  course_name,
  course_id,
  about,
  credits,
  fees,
  staffEmail,
  staff_type,
  count,
  sem,
  weeksDuration
) => {
  // this is for adding a course to db
  return new Promise((resolve, reject) => {
    if (course_id === null || course_id === "") course_id = "NA";
    let isActive = 1;
    pool.query(
      `insert into courses_table
          (course_name,course_id,about,credits,fees,handling_staff_email,staff_type,count,currentCount,sem,duration,isActive, course_year) 
          values(?,?,?,?,?,?,?,?,?,?,?,?,year(curdate()));`,
      [
        course_name,
        course_id,
        about,
        credits,
        fees,
        staffEmail,
        staff_type === "0" ? 0 : 1,
        count,
        0,
        sem,
        weeksDuration,
        isActive,
      ],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve("course has been added");
      }
    );
  });
};

const findStaffByEmail = (email) => {
  // this is for finding the staff by email
  return new Promise((resolve, reject) => {
    pool.query(
      "select email from user_data where email = ? and type = 1;",
      [email],
      (err, results, field) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results.length);
      }
    );
  });
};

const findCourseCode = (code) => {
  // this is for finding the course code
  return new Promise((resolve, reject) => {
    pool.query(
      "select course_name,handling_staff_email,credits,sem,id from courses_table where course_id = ?",
      [code],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const getApprovedCourses = (sem) => {
  // this is for getting all the approved courses
  return new Promise((resolve, reject) => {
    pool.query(
      `select course_name, course_id, about, credits, (currentCount < count) as avail,
           fees, first_name, staff_type, sem, duration, count, currentCount from courses_table 
          left join user_data on handling_staff_email = email where course_id <> 'NA' and isactive = 1 and sem = ?;`,
      [sem],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const enrollStudent = (course_id, email, sem) => {
  // this is for enrolling the student in a course
  return new Promise((resolve, reject) => {
    let zero = 0;
    pool.query(
      "CALL enrollStudent(?,?,?);",
      [email, course_id, sem],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const checkStudentEnroll = (email, sem) => {
  // this is to check if a student is enrolled in a course
  return new Promise((resolve, reject) => {
    pool.query(
      "select id from student_enrollment_details where email = ? and sem = ?;",
      [email, sem],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const getCourseByCourseCode = (course_id) => {
  // this is to get the course by id
  return new Promise((resolve, reject) => {
    if (course_id === "" || course_id === null || course_id === "NA")
      reject("No such courses");
    pool.query(
      "select course_id from courses_table where course_id = ?;",
      [course_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const getCourseById = (course_id) => {
  // this is to get the course by id
  return new Promise((resolve, reject) => {
    if (
      course_id === "" ||
      course_id === " " ||
      course_id === null ||
      course_id === "NA"
    )
      reject("No such courses");
    pool.query(
      "select course_name,course_id,handling_staff_email as email from courses_table where id = ?;",
      [course_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const getEnrolledCoursesByEmail = (email) => {
  // this is to find all the courses a student has enrolled on in the past
  return new Promise((resolve, reject) => {
    pool.query(
      `select student_enrollment_details.sem,course_name,fees,handling_staff_email,course_id,
      courses_table.credits from student_enrollment_details 
      left join courses_table on student_enrollment_details.id = courses_table.id where email = ?;`,
      [email],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const getCoursesOfStaff = (email) => {
  // this is to get all the courses a staff has added to the credit system
  return new Promise((resolve, reject) => {
    pool.query(
      `select id,course_name, course_id, about, credits, fees, count, sem, duration, currentCount, isactive from courses_table 
          where handling_staff_email = ?;`,
      [email],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const getEnrolledStudentsInCourse = (course_id) => {
  // this is to get all the students enrolled in a course
  return new Promise((resolve, reject) => {
    pool.query(
      `select rollno, concat(first_name, ' ', last_name) as name, student_enrollment_details.credits_earned as credits, marks,student.sem, student_enrollment_details.email from student_enrollment_details 
      inner join student on student_enrollment_details.email = student.email 
      inner join user_data on student.email = user_data.email 
      inner join courses_table on courses_table.id = student_enrollment_details.id and courses_table.course_id = ?;`,
      [course_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const getAllActiveCourses = () => {
  // this is to get all the courses in this semester
  return new Promise((resolve, reject) => {
    pool.query(
      `select id,course_name, course_id, about, credits, isactive, sem from courses_table where isactive = 1 || isactive= -1;`,
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const getAllCourses = () => {
  // get all courses of all semesters
  return new Promise((resolve, reject) => {
    pool.query(
      `select course_name,course_id,about,credits,fees,handling_staff_email as staff, count,sem, duration, isActive, course_year from courses_table;`,
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const approveCourse = (id, course_code) => {
  // to approve a course
  return new Promise((resolve, reject) => {
    pool.query(
      `update courses_table set course_id = ? where id = ?;`,
      [course_code, parseInt(id)],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const getAllCompletedCoursescount = () => {
  // this is to get all the courses with isactive 0
  return new Promise((resolve, reject) => {
    pool.query(
      `select count(id) as count from courses_table where isactive = 0;`,
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const forgotPasswordEntry = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(`call FORGOTPASSWORD(?);`, [email], (err, results, fields) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      pool.query(
        `select stamp from forgetpassword where email = ?;`,
        [email],
        (err, results, fields) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(results);
        }
      );
    });
  });
};

const checkForgotPassword = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `select * from forgetPassword where email = ?;`,
      [email],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        if (results.length < 1) reject(results);
        resolve(results);
      }
    );
  });
};

const changePassword = (email, password) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `select * from forgetPassword where email = ?;`,
      [email],
      async (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        if (results.length < 1) {
          reject("You have not requested reset password");
        }
        password = await genHash(password);
        pool.query(
          `CALL CHANGEPASSWORD(?,?);`,
          [email, password],
          (err, results, fields) => {
            if (err) {
              console.log(err);
              reject(err);
            }
            resolve(results);
          }
        );
      }
    );
  });
};

const deleteExpiredForgotPasswordSession = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      `delete from forgetpassword where (timestampdiff(minute,stamp,current_timestamp) > 15);`,
      [],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve("Deleted");
      }
    );
  });
};

const getCreditsByEmail = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `select user_data.email, sum(credits_earned) as credits_earned,sum(credits) as credits from student_enrollment_details left join user_data on user_data.email = student_enrollment_details.email 
      left join courses_table on courses_table.id = student_enrollment_details.id where user_data.email = ? 
      group by user_data.email;`,
      [email],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        // console.log(results);
        resolve(results);
      }
    );
  });
};

const deleteCourseById = (course_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `delete from courses_table where id = ?;`,
      [course_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve("Successfully deleted the course from DB");
      }
    );
  });
};

const passStudent = (rollno, credits, course_id) => {
  return new Promise(async (resolve, reject) => {
    const results = await findByRollNo(rollno);
    if (results.length < 1) reject("No Student Found");
    pool.query(
      `update student_enrollment_details set credits_earned = ? where email = ? and id = ?;`,
      [credits, results[0].email, course_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve("Successfully passed all the students");
      }
    );
  });
};

const changeCourseStatus = (course_id, status) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `update courses_table set isactive = ? where course_id = ?;`,
      [status, course_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve("Changed the status of the code");
      }
    );
  });
};
const promoteStudentsSem = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      `update student set sem = sem+1, hasEnrolled=0 where sem<9;`,
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve("Promoted all students to Next Semester");
      }
    );
  });
};

const addmarks = (email, marks, course_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `update student_enrollment_details set marks = ? where email = ? and id = ?;`,
      [marks, email, course_id],
      (err, results, fields) => {
        // console.log("Results: ", results.affectedRows);
        if (results.affectedRows === 0) {
          reject("No rows updated");
        }
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve("Updated row");
      }
    );
  });
};

const findStudent = (student) => {
  // todo : to be implemented further
  return new Promise((resolve, reject) => {
    pool.query(
      `select student.email from student left join user_data on student.email = user_data.email where student.email like '%test%' or rollno like '%test%' or first_name like '%test%' or last_name like '%test%';`
    );
  });
};

const findStudentByEmail = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `
    select rollno,student.email,first_name,last_name,sem from student left join user_data on student.email = user_data.email where student.email = ?;
    `,
      [email],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const findEnrolledDetails = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `select course_name,course_id,courses_table.credits,marks,student_enrollment_details.sem, fees from 
      student_enrollment_details left join courses_table on student_enrollment_details.id = courses_table.id where email = ?;`,
      [email],
      (err, results, field) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const getCurrentSemEnrollmentDetails = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      `select rollno,student.sem,concat(first_name,' ',last_name) as name,coalesce(course_id,'-') as course_id,coalesce(course_name,'-') as course_name from student 
      left join user_data on student.email = user_data.email 
      left join student_enrollment_details on student.email = student_enrollment_details.email and student.sem = student_enrollment_details.sem 
      left join courses_table on student_enrollment_details.id = courses_table.id where student.sem < 9 order by student.sem,rollno;`,
      [],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

module.exports = {
  login,
  findById,
  register,
  addCourse,
  findByEmail,
  findByRollNo,
  findStaffByEmail,
  findCourseCode,
  getApprovedCourses,
  enrollStudent,
  checkStudentEnroll,
  getCourseByCourseCode,
  getEnrolledCoursesByEmail,
  getCoursesOfStaff,
  sessionStore,
  getEnrolledStudentsInCourse,
  getAllActiveCourses,
  getAllCourses,
  approveCourse,
  getAllCompletedCoursescount,
  editCourse,
  forgotPasswordEntry,
  changePassword,
  checkForgotPassword,
  getCreditsByEmail,
  deleteExpiredForgotPasswordSession,
  deleteCourseById,
  getCourseById,
  passStudent,
  changeCourseStatus,
  promoteStudentsSem,
  addmarks,
  findStudentByEmail,
  findEnrolledDetails,
  getCurrentSemEnrollmentDetails,
};
