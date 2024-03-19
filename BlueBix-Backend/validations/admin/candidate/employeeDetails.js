const Validator = require("validator");
const isEmpty = require('../../is-empty');
const niv = require('../../niv');
const { commonResponse } = require("../../../helper");
const config = require("../../../config");



exports.validateEmployeeDetailsInput = function (data, url = '') {

    let errors = {};

    if (url != 'edit') {
        data.id = !isEmpty(data.id) ? data.id : "";

        let checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

        if (!data.id.match(checkForHexRegExp)) {
            errors.id = "Id is invalid";
        }

        if (Validator.isEmpty(data.id)) {
            errors.id = "Id is required";
        }
    }

    if (url == 'edit') {
        for (let i = 0; i < data.employee_details.length; i++) {

            let candidate_id = data.employee_details[i].candidate_id;
            let _id = data.employee_details[i]._id;

            if (Validator.isEmpty(_id)) {
                errors._id = 'Id is required'
            }
            if (Validator.isEmpty(candidate_id)) {
                errors.candidate_id = 'Candidate Id is required'
            }
        }
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};


exports.validateEmployeeDetails = async function (req, res, url = '') {
    const validateObj = {}
    
    if (url != 'edit') {
        validateObj.id = 'required|mongoId'
    }

    if (url == 'edit') {
        validateObj.employee_details = 'required|array'
        validateObj['employee_details.*.candidate_id'] = 'required|mongoId'
        validateObj['employee_details.*._id'] = 'required|mongoId'
    }

    const v = new niv.Validator(req.body, validateObj);

    niv.addCustomMessages({
        "id.mongoId": "Requested id param must be a valid id",
        "employee_details.*._id": "Id param must be a valid id",
        "employee_details.*.candidate_id": "Id param must be a valid id",
    });

    const matched = await v.check();
    if (!matched) {
        const errors = commonResponse.validateResp(v.errors)
        return { ...{ status: false }, ...{ errors: errors } }
    } else {
        return { status: true }
    }
}