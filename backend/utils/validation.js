const Joi = require("joi");

const signupSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
  role: Joi.string().valid("patient", "medical").required(),
  licenseId: Joi.when("role", {
    is: "medical",
    then: Joi.string().min(5).max(50).required().label("Medical License ID"),
    otherwise: Joi.forbidden(),
  }),
});

module.exports = {
  signupSchema,
};
