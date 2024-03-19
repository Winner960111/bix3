const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateDirectCandidateApplyJobInput(data, url = '') {
    let errors = {};


       // data.company_id = !isEmpty(data.company_id) ? data.company_id : "";
        data.job_opening_id = !isEmpty(data.job_opening_id) ? data.job_opening_id : "";
        data.opening_title = !isEmpty(data.opening_title) ? data.opening_title : "";
        data.candidate_id = !isEmpty(data.candidate_id) ? data.candidate_id : "";
        data.recruiter_id = !isEmpty(data.recruiter_id) ? data.recruiter_id : "";
        data.profile_submit = !isEmpty(data.profile_submit) ? data.profile_submit : "";

       /* if (Validator.isEmpty(data.company_id)) {
            errors.company_id = "Company ID is required";
        }*/

        if (Validator.isEmpty(data.job_opening_id)) {
            errors.job_opening_id = "Job Opening ID is required";
        }

        if (Validator.isEmpty(data.candidate_id)) {
            errors.candidate_id = "Candidate ID is required";
        }

        if (Validator.isEmpty(data.profile_submit)) {
            errors.profile_submit = "Profile Submit is required";
        }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
