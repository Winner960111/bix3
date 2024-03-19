const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateRecruiterSubmissionInput(data,url='') {
    let errors = {};

    data.candidate_id        = !isEmpty(data.candidate_id) ? data.candidate_id : "";
    data.company_id         = !isEmpty(data.company_id) ? data.company_id : "";
    data.recruiter_id      = !isEmpty(data.recruiter_id) ? data.recruiter_id : "";
    data.opening_id             = !isEmpty(data.opening_id) ? data.opening_id : "";
    data.submission_status             = !isEmpty(data.submission_status) ? data.submission_status : "";

    if (Validator.isEmpty(data.candidate_id)) {
        errors.candidate_id = "candidate Id is required";
    }

    if (Validator.isEmpty(data.company_id)) {
        errors.company_id = "company Id required";
    }

    if (Validator.isEmpty(data.recruiter_id)) {
        errors.recruiter_id = "recruiter Id required";
    }

    if (Validator.isEmpty(data.opening_id)) {
        errors.opening_id = "opening Id required";
    }

    if (Validator.isEmpty(data.submission_status)) {
        errors.submission_status = "submission Status required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
