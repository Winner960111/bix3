const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateRegisterInput(data,url='') {
    let errors = {};

    data.freelance_id        = !isEmpty(data.freelance_id) ? data.freelance_id : "";
    data.opening_id         = !isEmpty(data.opening_id) ? data.opening_id : "";
    data.bdm_id      = !isEmpty(data.bdm_id) ? data.bdm_id : "";
    data.job_work_status           = !isEmpty(data.job_work_status) ? data.job_work_status : "";
    data.status       = !isEmpty(data.status) ? data.status : "Active";

    if (Validator.isEmpty(data.freelance_id)) {
        errors.freelance_id = "Freelance Id is required";
    }

    if (Validator.isEmpty(data.opening_id)) {
        errors.opening_id = "Job Opening Id is required";
    }

    if (Validator.isEmpty(data.status)) {
        errors.status = "Status is required";
    }

    if (Validator.isEmpty(data.job_work_status)) {
        errors.job_work_status = "Job work status is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
