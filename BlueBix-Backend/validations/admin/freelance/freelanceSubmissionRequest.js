const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateFreelanceSubmissionInput(data,url='') {
    let errors = {};

    
    data.opening_id         = !isEmpty(data.opening_id) ? data.opening_id : "";
    data.freelancer_id        = !isEmpty(data.freelancer_id) ? data.freelancer_id : "";
    data.candidate_id        = !isEmpty(data.candidate_id) ? data.candidate_id : "";
    data.job_work_application_id        = !isEmpty(data.job_work_application_id ) ? data.job_work_application_id  : "";
    data.submission_status       = !isEmpty(data.submission_status ) ? data.submission_status  : "Submitted";

    if (Validator.isEmpty(data.opening_id)) {
        errors.opening_id = "Job Opening Id is required";
    }

    if (Validator.isEmpty(data.freelancer_id)) {
        errors.freelancer_id = "Freelance Id is required";
    }

    if (Validator.isEmpty(data.candidate_id)) {
        errors.candidate_id = "Candidate Id is required";
    }

    if (Validator.isEmpty(data.job_work_application_id )) {
        errors.job_work_application_id  = "Job work application Id is required";
    }

    if (Validator.isEmpty(data.submission_status )) {
        errors.submission_status = "Freelance submission status is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
