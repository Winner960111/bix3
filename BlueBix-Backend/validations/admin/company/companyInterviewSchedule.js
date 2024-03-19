const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateInterviewScheduleInput(data,url='') {
 
    let errors = {};

    
    data.date_of_interview        = !isEmpty(data.date_of_interview) ? data.date_of_interview : "";
    data.duration       = !isEmpty(data.duration) ? data.duration : "";
    data.interview_type            = !isEmpty(data.interview_type) ? data.interview_type : "";
    data.time_of_interview        = !isEmpty(data.time_of_interview) ? data.time_of_interview : "";
    data.comment               = !isEmpty(data.comment) ? data.comment : "";
    data.status                = !isEmpty(data.status) ? data.status : "";
    data.opening_id             = !isEmpty(data.opening_id) ? data.opening_id : "";
    data.candidate_id             = !isEmpty(data.candidate_id) ? data.candidate_id : "";
    data.submission_id      = !isEmpty(data.submission_id) ? data.submission_id : "";

    if (Validator.isEmpty(data.date_of_interview)) {
        errors.date_of_interview = "Date of interview is required";
    }   

    if (Validator.isEmpty(data.duration)) {
        errors.duration = "Duration is required";
    }   

    if (Validator.isEmpty(data.interview_type)) {
        errors.interview_type = "Interview Type is required";
    }

    if (Validator.isEmpty(data.time_of_interview)) {
        errors.time_of_interview = "Interview Time is required";
    }

    if (Validator.isEmpty(data.submission_id)) {
        errors.submission_id = "Submission Id is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
