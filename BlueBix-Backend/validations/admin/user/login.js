const Validator = require("validator");
const isEmpty = require('../../is-empty');
const niv = require('../../niv');
const { commonResponse } = require("../../../helper");
const config = require("../../../config");

exports.validateLoginInput = function (data) {

  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.profile = !isEmpty(data.profile) ? data.profile : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  if (Validator.isEmpty(data.profile)) {
    errors.profile = "Profile is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

exports.validateLogin = async function (req, res) {
  const v = new niv.Validator(req.body, {
    email: 'required|email',
    password: 'required',
    // profile: `required|in:${config.roles.join()}`,
  });

  // niv.addCustomMessages(message);

  const matched = await v.check();
  if (!matched) {
    const errors = commonResponse.validateResp(v.errors)
    return { ...{ status: false }, ...{ errors: errors } }
    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
  } else {
    return { status: true }
  }

}