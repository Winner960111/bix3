const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateDashBoardInput(data) {
  let errors = {};
    

    data.role = !isEmpty(data.role) ? data.role : "";
    data.id = !isEmpty(data.id) ? data.id : "";
   
    if(data.role != "admin" && data.role != "candidate" && data.role == "" ){
        if (Validator.isEmpty(data.id)) {
            errors.id = "Id is required";
        }
    }

    
  return {
    errors,
    isValid: isEmpty(errors)
  };
};