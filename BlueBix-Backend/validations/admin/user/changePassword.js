const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateChangePassword(data,type) {
  let errors = {};

    data.current_password  = !isEmpty(data.current_password) ? data.current_password : "";
    data.new_password      = !isEmpty(data.new_password) ? data.new_password : "";
    data.confirm_password  = !isEmpty(data.confirm_password) ? data.confirm_password: "";
    
    if(type == 'user'){
        data.user_id  = !isEmpty(data.user_id) ? data.user_id : "";

        if (Validator.isEmpty(data.user_id)) {
            errors.user_id = "User Id is required";
        }
    }

    if(type == 'company'){
        data.company_id = !isEmpty(data.company_id) ? data.company_id : "";

        if (Validator.isEmpty(data.company_id)) {
            errors.company_id = "Company Id is required";
        }
    }

    if(type == 'candidate'){
        data.candidate_id = !isEmpty(data.candidate_id) ? data.candidate_id : "";

        if (Validator.isEmpty(data.candidate_id)) {
            errors.candidate_id = "Candidate Id is required";
        }
    }

    if (Validator.isEmpty(data.current_password)) {
        errors.current_password = "Current Password is required";
    }

    if (!Validator.isLength(data.new_password, { min: 6 })) {
        errors.new_password = "New Password must be at least 6 characters";
    }

    if (Validator.isEmpty(data.new_password)) {
        errors.new_password = "New Password is required";
    }

    if (!Validator.equals(data.new_password, data.confirm_password)) {
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