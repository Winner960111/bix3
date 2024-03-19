

const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateCandidateCareerDetailInput(data) {
    let errors = {};

    data.role = !isEmpty(data.role) ? data.role : "";
    data.desired_job_type = !isEmpty(data.desired_job_type) ? data.desired_job_type : "";
    // data.desired_employment_type = !isEmpty(data.desired_employment_type) ? data.desired_employment_type : "";
    data.desired_shift = !isEmpty(data.desired_shift) ? data.desired_shift : "";

    var alpha_name_pattern = /^[a-zA-Z"/" "\s]+$/;

    if (!isEmpty(data.role)) {

        if (!data.role.match(alpha_name_pattern)) {
            errors.role = "Enter Role in Characters";
        }

    }

    if (!isEmpty(data.desired_job_type)) {

        if (!data.desired_job_type.match(alpha_name_pattern)) {
            errors.desired_job_type = "Enter Desired Job Type in Characters";
        }

    }

    // if (!isEmpty(data.desired_employment_type)) {

    //     if (!data.desired_employment_type.match(alpha_name_pattern)) {
    //         errors.desired_employment_type = "Enter Desired Employment Type in Characters";
    //     }

    // }

    if (!isEmpty(data.desired_shift)) {

        if (!data.desired_shift.match(alpha_name_pattern)) {
            errors.desired_shift = "Enter Desired Shift in Characters";
        }

    }


    return {
        errors,
        isValid: isEmpty(errors)
    };
};
