const Validator = require("validator");
const isEmpty = require('../../is-empty');
const niv = require('../../niv');
const { commonResponse } = require("../../../helper");
const config = require("../../../config");

exports.validateCompanyRegisterInput = function (data, url = '') {

    let errors = {};

    data.company_name = !isEmpty(data.company_name) ? data.company_name : "";
    data.company_owner = !isEmpty(data.company_owner) ? data.company_owner : "";
    data.category = !isEmpty(data.category) ? data.category : "";
    data.company_code = !isEmpty(data.company_code) ? data.company_code : "";
    data.state = !isEmpty(data.state) ? data.state : "";
    data.city = !isEmpty(data.city) ? data.city : "";
    data.email_1 = !isEmpty(data.email_1) ? data.email_1 : "";
    data.email_2 = !isEmpty(data.email_2) ? data.email_2 : "";
    data.phone_number_1 = !isEmpty(data.phone_number_1) ? data.phone_number_1 : "";
    data.phone_number_2 = !isEmpty(data.phone_number_2) ? data.phone_number_2 : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.confirm_password = !isEmpty(data.confirm_password) ? data.confirm_password : "";
    data.industry_type = !isEmpty(data.industry_type) ? data.industry_type : "";
    data.employee_strength = !isEmpty(data.employee_strength) ? data.employee_strength : "";

    var alpha_name_pattern = /^[a-zA-Z"/" "\s]+$/;
    var regex = /^[a-zA-Z0-9"/" "\s]+$/g
    // var regex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/g
    var company_regex = /^[a-zA-Z0-9\s!@#\$%\^\&*\)\(+=._-]+$/g
    //  var company_name = /^[a-zA-Z0-9\s.,'-]*$/
    var phone_number_regex = /^[0-9\-]+$/g
    // var regex = /^[a-zA-Z0-9!@#\$%\^]+$/g

    if (Validator.isEmpty(data.company_name)) {
        errors.company_name = "Company Name is required";
    }
    // if (Validator.isEmpty(data.company_owner)) {
    //     errors.company_owner = "Company Owner is required";
    // }   

    if (Validator.isEmpty(data.category)) {
        errors.category = "Category is required";
    }

    // if (!Validator.isAlphanumeric(data.company_code)) {
    //     errors.company_code = "Special Characters are not allowed";
    // }
    // if (!data.company_code.match(regex)) {
    //     errors.company_code = "Special Characters are not allowed";
    // }

    if (Validator.isEmpty(data.company_code)) {
        errors.company_code = "Company Code is required";
    }

    if (Validator.isEmpty(data.state.toString())) {
        errors.state = "State is required";
    }

    /* if (Validator.isEmpty(data.city.toString())) {
         errors.city = "City is required";
     }*/


    if (!Validator.isEmail(data.email_1)) {
        errors.email_1 = "Email is invalid";
    }

    if (Validator.isEmpty(data.email_1)) {
        errors.email_1 = "Email is required";
    }


    if (!isEmpty(data.phone_number_1.toString())) {

        if (!data.phone_number_1.toString().match(phone_number_regex)) {
            errors.phone_number_1 = "Phone Number is Invalid";
        }
        // if (!Validator.isLength(data.phone_number_1.toString(), {
        //     min: 10,
        //     max: 10
        // })
        // ) {
        //     errors.phone_number_1 = "Phone Number must be 10 digits";
        // }

        // if (!Validator.isNumeric(data.phone_number_1.toString())) {
        //     errors.phone_number_1 = "Phone Number is Invalid";
        // }

    }

    if (!isEmpty(data.phone_number_2.toString())) {

        if (!data.phone_number_2.toString().match(phone_number_regex)) {
            errors.phone_number_2 = "Phone Number is Invalid";
        }
    }

    if (!isEmpty(data.email_2)) {

        if (!Validator.isEmail(data.email_2)) {
            errors.email_2 = "Email is invalid";
        }
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

    // if (!data.industry_type.match(alpha_name_pattern)) {
    //     errors.industry_type = "Enter Industry Type in Characters";
    // }

    if (Validator.isEmpty(data.industry_type)) {
        errors.industry_type = "Industry Type is required";
    }

    if (!Validator.isNumeric(data.employee_strength.toString())) {
        errors.employee_strength = "Enter Employee Strength in Number";
    }

    if (Validator.isEmpty(data.employee_strength.toString())) {
        errors.employee_strength = "Employee Strength is required";
    }


    return {
        errors,
        isValid: isEmpty(errors)
    };
};

exports.validateCompanyRegister = async function (req, res, url = '') {
    const validateObj = {
        company_name: `required|alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
        category: `required`,
        company_code: `required`,
        state: 'required',
        email_1: 'required|email',
        email_2: 'email',
        phone_number_1: "integer",
        phone_number_2: "integer",
        industry_type: "required",
        employee_strength: 'required|integer',
    }

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
