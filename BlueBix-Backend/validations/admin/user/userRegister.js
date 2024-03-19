const Validator = require("validator");
const isEmpty = require('../../is-empty');
const niv = require('../../niv');
const { commonResponse } = require("../../../helper");
const config = require("../../../config");

function validateRegisterInput(data, url = '') {
    let errors = {};

    data.first_name = !isEmpty(data.first_name) ? data.first_name : "";
    data.last_name = !isEmpty(data.last_name) ? data.last_name : "";
    data.display_name = !isEmpty(data.display_name) ? data.display_name : "";
    data.default = !isEmpty(data.default) ? data.default : "";
    data.login_email = !isEmpty(data.login_email) ? data.login_email : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.alternate_email = !isEmpty(data.alternate_email) ? data.alternate_email : "";
    data.phone_home = !isEmpty(data.phone_home) ? data.phone_home : "";
    data.phone_work = !isEmpty(data.phone_work) ? data.phone_work : "";
    data.mobile = !isEmpty(data.mobile) ? data.mobile : "";
    // data.reporting_manager = !isEmpty(data.reporting_manager) ? data.reporting_manager : "";
    data.profile = !isEmpty(data.profile) ? data.profile : "";
    data.status = !isEmpty(data.status) ? data.status : "";
    data.assigned_role = !isEmpty(data.assigned_role) ? data.assigned_role : "";

    var alpha_name_pattern = /^[a-zA-Z"/" "\s]+$/;
    var phone_number_regex = /^[0-9\-]+$/g


    // if (!Validator.isLength(data.first_name, {
    //     min: 2,
    //     max: 15
    // })
    // ) {
    //     errors.first_name = "Enter First Name between 2 to 15 Characters";
    // }

    if (!data.first_name.match(alpha_name_pattern)) {
        errors.first_name = "Enter First Name in Characters";
    }

    if (Validator.isEmpty(data.first_name)) {
        errors.first_name = "First Name is required";
    }

    // if (!Validator.isLength(data.last_name, {
    //     min: 2,
    //     max: 15
    // })
    // ) {
    //     errors.last_name = "Enter Last Name between 2 to 15 Characters";
    // }

    if (!data.last_name.match(alpha_name_pattern)) {
        errors.last_name = "Enter Last Name in Characters";
    }

    if (Validator.isEmpty(data.last_name)) {
        errors.last_name = "Last Name is required";
    }

    // if (!Validator.isLength(data.display_name, {
    //     min: 2,
    //     max: 40
    // })
    // ) {
    //     errors.display_name = "Enter Display Name between 2 to 40 Characters";
    // }

    if (!data.display_name.match(alpha_name_pattern)) {
        errors.display_name = "Enter Display Name in Characters";
    }

    if (Validator.isEmpty(data.display_name)) {
        errors.display_name = "Display Name is required";
    }

    // if (!data.default.match(alpha_name_pattern)) {
    //     errors.default = "Enter Default Email in Characters";
    // }

    if (Validator.isEmpty(data.default)) {
        errors.default = "Default Email is required";
    }

    if (!Validator.isEmail(data.login_email)) {
        errors.login_email = "Login Email is invalid";
    }

    if (Validator.isEmpty(data.login_email)) {
        errors.login_email = "Login Email is required";
    }


    if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "Email is required";
    }



    if (!isEmpty(data.alternate_email)) {
        if (!Validator.isEmail(data.alternate_email)) {
            errors.alternate_email = "Alternate Email is invalid";
        }
    }



    if (!isEmpty(data.phone_home.toString())) {

        if (!data.phone_home.toString().match(phone_number_regex)) {
            errors.phone_home = "Phone Number is Invalid";
        }

        // if (!Validator.isLength(data.phone_home.toString(), {
        //     min: 10,
        //     max: 10
        // })
        // ) {
        //     errors.phone_home = "Phone Number must be 10 digits";
        // }

        // if (!Validator.isNumeric(data.phone_home.toString())) {
        //     errors.phone_home = "Phone Number is Invalid";
        // }

    }

    if (!isEmpty(data.phone_work.toString())) {

        if (!data.phone_work.toString().match(phone_number_regex)) {
            errors.phone_work = "Phone Number is Invalid";
        }

        // if (!Validator.isLength(data.phone_work.toString(), {
        //     min: 10,
        //     max: 10
        // })
        // ) {
        //     errors.phone_work = "Phone Number must be 10 digits";
        // }

        // if (!Validator.isNumeric(data.phone_work.toString())) {
        //     errors.phone_work = "Phone Number is Invalid";
        // }
    }

    if (!isEmpty(data.mobile.toString())) {

        if (!data.mobile.toString().match(phone_number_regex)) {
            errors.mobile = "Mobile Number is Invalid";
        }
        // if (!Validator.isLength(data.mobile.toString(), {
        //     min: 10,
        //     max: 10
        // })
        // ) {
        //     errors.mobile = "Mobile Number must be 10 digits";
        // }

        // if (!Validator.isNumeric(data.mobile.toString())) {
        //     errors.mobile = "Mobile Number is Invalid";
        // }
    }



    // if (data.reporting_manager.length == 0) {
    //     errors.reporting_manager = "Reporting Manager is required";
    // }

    if (data.profile.length == 0) {
        errors.profile = "Profile is required";
    }

    if (Validator.isEmpty(data.status)) {
        errors.status = "Status is required";
    }

    if (Validator.isEmpty(data.assigned_role)) {
        errors.assigned_role = "Assigned Role is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};

async function validateRegister(req, res, url = '') {
    const validateObj = {
        first_name: `required|alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
        last_name: `required|alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
        display_name: `required|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
        email: 'required|email',
        // email: 'required|email|unique:User,email',
        default: 'required',
        login_email: 'required|email',
        middle_name: `alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
        // phone_home: `required|minLength:${config.validateLength.minPhoneLength}|maxLength:${config.validateLength.maxPhoneLength}`,
        // phone_work: `required|minLength:${config.validateLength.minPhoneLength}|maxLength:${config.validateLength.maxPhoneLength}`,
        // reporting_manager: 'required|mongoId',
        'profile': 'required|array',
        'profile.*': `required|string|in:${config.roles.join()}`
    }

    // if (req.params.id) {
    //     validateObj.email = 'required|email|unique:User,email,' + req.params.id;
    // }


    const v = new niv.Validator(req.body, validateObj);

    niv.addCustomMessages({
        'login_email.required': "The login email field is mandatory.",
        'login_email.email': "The login email must be a valid email address.",
        'profile.*.in': `The profile must be of the following("bdm","recruiter","candidate")`
    });

    const matched = await v.check();
    if (!matched) {
        const errors = commonResponse.validateResp(v.errors)
        return { ...{ status: false }, ...{ errors: errors } }
    } else {
        return { status: true }
    }
}

module.exports = {
    validateRegister,
    validateRegisterInput
}