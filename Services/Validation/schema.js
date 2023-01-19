const Joi = require("joi");

const signupSchema = Joi.object().keys({
  first_name: Joi.string().min(3).max(30).required(),
  last_name: Joi.string(),
  email: Joi.string()
    .email({ tlds: { allow: ["edu"] } })
    .required(),
  password: Joi.string().min(9).max(64).required(),
  dept: Joi.string().required(),
  type: Joi.number().min(0).max(2).required(),
  rollno: Joi.string().min(8).max(8).allow(""),
  sem: Joi.number().integer().min(1).max(8).allow(""),
});

const courseSchema = Joi.object().keys({
  id: Joi.number(),
  course_name: Joi.string().required(),
  course_id: Joi.string().allow("").default("NA"),
  about: Joi.string().required(),
  credits: Joi.number().integer().min(0).max(3).required(),
  fees: Joi.number().min(0).required(),
  // staffEmail: Joi.string().email({tlds:{allow:['edu']}}).required(),
  sem: Joi.number().integer().min(1).max(8).required(),
  weeksDuration: Joi.number().min(1).required(),
  count: Joi.number().required(),
  staffType: Joi.number().min(0).max(1),
});

module.exports = { signupSchema, courseSchema };
