const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateJobAssignInput(data) {
  let errors = {};

  data.opening_id = !isEmpty(data.opening_id) ? data.opening_id : "";
  data.bdm_id = !isEmpty(data.bdm_id) ? data.bdm_id : "";
  data.recruiter_id = !isEmpty(data.recruiter_id) ? data.recruiter_id : "";

  let checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;


  if (Validator.isEmpty(data.opening_id)) {
    errors.opening_id = "Opening Id is required";
  }

  if (!isEmpty(data.bdm_id)) {

    if (typeof (data.bdm_id) == 'string') data.bdm_id = data.bdm_id.split(' , ');

    if (data.bdm_id.filter(el => !el.match(checkForHexRegExp)).length > 0) {
      errors.bdm_id = "Bdm Id is invalid";
    }
  }



  // if (!isEmpty(data.bdm_id)) {

  //     if (!data.bdm_id.match(checkForHexRegExp)) {
  //       errors.bdm_id = "Bdm Id is invalid";
  //     }
  // }




  return {
    errors,
    isValid: isEmpty(errors)
  };
};