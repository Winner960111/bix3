const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateVerifyEmailInput(data) {
    let errors = {};

    data.token = !isEmpty(data.token) ? data.token : "";
    
    if (Validator.isEmpty(data.token)) {
        errors.token = "Token is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
