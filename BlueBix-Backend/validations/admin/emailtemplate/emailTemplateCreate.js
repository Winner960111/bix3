const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateEmailTemplateInput(data,url='') {
    let errors = {};

    
    data.user_id         = !isEmpty(data.user_id) ? data.user_id : "";
    data.email_type        = !isEmpty(data.email_type) ? data.email_type : "";
    data.content        = !isEmpty(data.content ) ? data.content  : "";

    if (Validator.isEmpty(data.user_id)) {
        errors.opening_id = "User Id is required";
    }

    if (Validator.isEmpty(data.email_type)) {
        errors.freelancer_id = "Email Type is required";
    }

    if (Validator.isEmpty(data.content)) {
        errors.candidate_id = "Email Content is required";
    }


    return {
        errors,
        isValid: isEmpty(errors)
    };
};
