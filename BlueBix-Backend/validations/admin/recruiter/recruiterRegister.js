const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateRecruiterRegisterInput(data,url='') {
    let errors = {};

    data.first_name        = !isEmpty(data.first_name) ? data.first_name : "";
    data.last_name         = !isEmpty(data.last_name) ? data.last_name : "";
    data.display_name      = !isEmpty(data.display_name) ? data.display_name : "";
    data.email             = !isEmpty(data.email) ? data.email : "";
    data.alternative_email = !isEmpty(data.alternative_email) ? data.alternative_email : "";
    data.phone_number_home = !isEmpty(data.phone_number_home) ? data.phone_number_home : "";
    data.contact_number    = !isEmpty(data.contact_number) ? data.contact_number : "";
    data.password          = !isEmpty(data.password) ? data.password : "";
    data.confirm_password  = !isEmpty(data.confirm_password) ? data.confirm_password: "";
    data.profile           = !isEmpty(data.profile) ? data.profile : "";
    data.role              = !isEmpty(data.role) ? data.role : "";
    data.current_location  = !isEmpty(data.current_location) ? data.current_location : "";
 

    var alpha_name_pattern = /^[a-zA-Z"/" "\s]+$/;


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

    if(!data.last_name.match(alpha_name_pattern)){
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

        

    if (!isEmpty(data.alternative_email)) {
        if (!Validator.isEmail(data.alternative_email)) {
            errors.alternative_email = "Alternative Email is invalid";
        }
    }

    

    if (!isEmpty(data.phone_number_home)) {

        if (!Validator.isLength(data.phone_number_home, {
            min: 10,
            max: 10
        })
        ) {
            errors.phone_number_home = "Phone Number must be 10 digits";
        }

        if (!Validator.isNumeric(data.phone_number_home)) {
            errors.phone_number_home = "Phone Number is Invalid";
        }

    }


    if (!Validator.isLength(data.contact_number, {
        min: 10,
        max: 10
    })
    ) {
        errors.contact_number = "Contact Number must be 10 digits";
    }

    if (!Validator.isNumeric(data.contact_number)) {
        errors.contact_number = "Contact Number is Invalid";
    }

    if (Validator.isEmpty(data.contact_number)) {
        errors.contact_number = "Contact Number is required";
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

    
    if(url !='edit'){

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
