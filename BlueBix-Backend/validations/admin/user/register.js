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
    data.email = !isEmpty(data.email) ? data.email : "";
    data.login_email = !isEmpty(data.login_email) ? data.login_email : "";
    data.alternative_email = !isEmpty(data.alternative_email) ? data.alternative_email : "";
    data.phone_home = !isEmpty(data.phone_home) ? data.phone_home : "";
    data.mobile = !isEmpty(data.mobile) ? data.mobile : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.confirm_password = !isEmpty(data.confirm_password) ? data.confirm_password : "";
    data.profile = !isEmpty(data.profile) ? data.profile : "";
    data.role = !isEmpty(data.role) ? data.role : "";
    data.current_location = !isEmpty(data.current_location) ? data.current_location : "";

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

    if (Validator.isEmpty(data.default)) {
        errors.default = "Default Email is required";
    }

    if (!isEmpty(data.login_email)) {
        if (!Validator.isEmail(data.login_email)) {
            errors.login_email = "Login Email is invalid";
        }
    }

    if (!isEmpty(data.alternative_email)) {
        if (!Validator.isEmail(data.alternative_email)) {
            errors.alternative_email = "Alternative Email is invalid";
        }
    }



    if (!isEmpty(data.mobile.toString())) {

        if (!data.mobile.toString().match(phone_number_regex)) {
            errors.mobile = "Contact Number is Invalid";
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

    if (!data.phone_home.toString().match(phone_number_regex)) {
        errors.phone_home = "Phone Number is Invalid";
    }

    if (Validator.isEmpty(data.phone_home.toString())) {
        errors.phone_home = "Phone Number is required";
    }

    if (Validator.isEmpty(data.current_location)) {
        errors.current_location = "Current Location is required";
    }

    if (!Validator.isAlpha(data.profile)) {
        errors.profile = "Enter Profile in Characters";
    }

    if (Validator.isEmpty(data.profile)) {
        errors.profile = "Profile is required";
    }



    if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "Email is required";
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

    if (!Validator.isAlpha(data.role)) {
        errors.role = "Enter Role in Characters";
    }

    if (Validator.isEmpty(data.role)) {
        errors.role = "Role is required";
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
        display_name: `required|alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
        default: `required|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
        email: 'required|email',
        login_email: 'required|email',
        middle_name: `alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
        phone_home: `required|minLength:${config.validateLength.minPhoneLength}|maxLength:${config.validateLength.maxPhoneLength}`,
        mobile: `required|minLength:${config.validateLength.minPhoneLength}|maxLength:${config.validateLength.maxPhoneLength}`,
        current_location: 'required',
        'profile': 'required|array',
        'profile.*': `required|string|in:${config.roles.join()}`
    }


    if (url != 'edit') {
        validateObj.password = `required|minLength:${config.validateLength.minPwdLength}|maxLength:${config.validateLength.maxPwdLength}`
        validateObj.confirm_password = 'required|same:password'
    }
    const v = new niv.Validator(req.body, validateObj);

    niv.addCustomMessages({
        'login_email.required': "The default email field is mandatory.",
        'login_email.email': "The default email must be a valid email address.",
        'profile.*.in': `The profile must be in ${config.roles.join()}`

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