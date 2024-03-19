const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateForgotPasswordInput(data) {
    let errors = {};

    data.token = !isEmpty(data.token) ? data.token : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.confirm_password = !isEmpty(data.confirm_password) ? data.confirm_password : "";
    
    if (Validator.isEmpty(data.token)) {
        errors.token = "Token is required";
    }


    if (!Validator.isLength(data.password, { min: 6 })) {
        errors.password = "Password must be at least 6 characters";
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = "Password is required";
    }

    if (!Validator.equals(data.password, data.confirm_password)) {
        errors.confirm_password = "Password did not match";
    }

    if (Validator.isEmpty(data.confirm_password)) {
        errors.confirm_password = "Confirm Password is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
