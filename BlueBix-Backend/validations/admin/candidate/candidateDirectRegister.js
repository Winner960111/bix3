const Validator = require("validator");
const isEmpty = require('../../is-empty');
const niv = require('../../niv');
const { commonResponse } = require("../../../helper");
const config = require("../../../config");


exports.validateDirectCandidateRegisterInput = function (data, url = '') {
    let errors = {};


    // if (data.form_type == "1") {

    data.first_name = !isEmpty(data.first_name) ? data.first_name : "";
    data.middle_name = !isEmpty(data.middle_name) ? data.middle_name : "";
    data.last_name = !isEmpty(data.last_name) ? data.last_name : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.mobile = !isEmpty(data.mobile) ? data.mobile : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.confirm_password = !isEmpty(data.confirm_password) ? data.confirm_password : "";
    data.total_work_exp_year = !isEmpty(data.total_work_exp_year) ? data.total_work_exp_year : "";
    data.total_work_exp_month = !isEmpty(data.total_work_exp_month) ? data.total_work_exp_month : "";




    var alpha_name_pattern = /^[a-zA-Z"/" "\s]+$/;
    var phone_number_regex = /^[0-9\-]+$/g;


    if (!data.first_name.match(alpha_name_pattern)) {
        errors.first_name = "Enter First Name in Characters";
    }

    if (Validator.isEmpty(data.first_name)) {
        errors.first_name = "First Name is required";
    }

    if (!isEmpty(data.middle_name)) {

        if (!data.middle_name.match(alpha_name_pattern)) {
            errors.middle_name = "Enter Middle Name in Characters";
        }

    }


    if (!data.last_name.match(alpha_name_pattern)) {
        errors.last_name = "Enter Last Name in Characters";
    }

    if (Validator.isEmpty(data.last_name)) {
        errors.last_name = "Last Name is required";
    }


    // if (!Validator.isLength(data.mobile, {
    //     min: 10,
    //     max: 10
    // })
    // ) {
    //     errors.mobile = "Mobile Number must be 10 digits";
    // }

    if (!data.mobile.toString().match(phone_number_regex)) {
        errors.mobile = "Mobile Number is Invalid";
    }

    // if (!Validator.isNumeric(data.mobile)) {
    //     errors.mobile = "Mobile Number is Invalid";
    // }

    if (Validator.isEmpty(data.mobile)) {
        errors.mobile = "Mobile Number is required";
    }

    if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }

    if (Validator.isEmpty(data.total_work_exp_year)) {
        errors.total_work_exp_year = "Total Work Year Experience is required";
    }

    if (Validator.isEmpty(data.total_work_exp_month)) {
        errors.total_work_exp_month = "Total Work Month Experience is required";
    }


    if (url != 'edit') {


        if (!Validator.isLength(data.password, { min: 6 })) {
            errors.password = "Password must be at least 6 characters";
        }

        if (Validator.isEmpty(data.password)) {
            errors.password = "Password is required";
        }

        if (!Validator.equals(data.password, data.confirm_password)) {
            errors.confirm_password = "Password did not match";
        }

        if (Validator.isEmpty(data.confirm_password)) {
            errors.confirm_password = "Confirm Password is required";
        }
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "Email is required";
    }

    if (url == 'edit') {
        data.current_location = !isEmpty(data.current_location) ? data.current_location : "";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};


exports.validateDirectCandidateRegister = async function (req, res, url = '') {
    const validateObj = {
        first_name: `required|alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
        last_name: `required|alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
        middle_name: `alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
        // email: 'required|email|unique:Candidate,email',
        email: 'required|email',
        mobile: `required|minLength:${config.validateLength.minPhoneLength}|maxLength:${config.validateLength.maxPhoneLength}`,
        total_work_exp_year: 'required|integer',
        total_work_exp_month: 'required|integer'
    }
    // if (req.params.id) {
    //     validateObj.email = 'required|email|unique:Candidate,email,' + req.params.id;
    // }

    if (url != 'edit') {
        validateObj.password = `required|minLength:${config.validateLength.minPwdLength}|maxLength:${config.validateLength.maxPwdLength}`
        validateObj.confirm_password = 'required|same:password'
    }
    const v = new niv.Validator(req.body, validateObj);

    // niv.addCustomMessages(message);

    const matched = await v.check();
    if (!matched) {
        const errors = commonResponse.validateResp(v.errors)
        return { ...{ status: false }, ...{ errors: errors } }
    } else {
        return { status: true }
    }

}