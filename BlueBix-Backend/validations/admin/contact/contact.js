const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateContactInput(data,url='') {
    let errors = {};
      
    data.company_id        = !isEmpty(data.company_id) ? data.company_id : "";
    // data.contact_owner       = !isEmpty(data.contact_owner) ? data.contact_owner : "";
    data.display_name        = !isEmpty(data.display_name) ? data.display_name : "";
    // data.title               = !isEmpty(data.title) ? data.title : "";
    data.first_name          = !isEmpty(data.first_name) ? data.first_name : "";
    data.last_name           = !isEmpty(data.last_name) ? data.last_name : "";
    data.phone               = !isEmpty(data.phone) ? data.phone : "";
    // data.other_phone         = !isEmpty(data.other_phone) ? data.other_phone : "";
    data.mobile              = !isEmpty(data.mobile) ? data.mobile : "";
    data.email               = !isEmpty(data.email) ? data.email : "";
    data.alternative_email   = !isEmpty(data.alternative_email) ? data.alternative_email : "";
    data.category            = !isEmpty(data.category) ? data.category : "";
    data.contact_status      = !isEmpty(data.contact_status) ? data.contact_status : "";
   
    data.state               = !isEmpty(data.state) ? data.state : "";
    data.city                = !isEmpty(data.city) ? data.city : "";

    // "^[a-zA-Z\-]+$"
  

    var alpha_name_pattern = /^[a-zA-Z"/" "\s]+$/;
    var phone_number_regex = /^[0-9\-]+$/g


    if (Validator.isEmpty(data.company_id)) {
        errors.company_id = "Company Id is required";
    }   
 
    // if (Validator.isEmpty(data.contact_owner)) {
    //     errors.contact_owner = "Contact Owner is required";
    // }   

    
    // if (!data.first_name.match(alpha_name_pattern)) {
    //     errors.first_name = "Enter First Name in Characters";
    // }

    if (Validator.isEmpty(data.display_name)) {
        errors.display_name = "Display Name is required";
    }   

    // if (!data.first_name.match(alpha_name_pattern)) {
    //     errors.first_name = "Enter First Name in Characters";
    // }

    if (Validator.isEmpty(data.first_name)) {
        errors.first_name = "First Name is required";
    }

    // if(!data.last_name.match(alpha_name_pattern)){
    //     errors.last_name = "Enter Last Name in Characters";
    // }

    if (Validator.isEmpty(data.last_name)) {
        errors.last_name = "Last Name is required";
    }  
   
    // if (!Validator.isLength(data.phone.toString(), {
    //     min: 10,
    //     max: 10
    // })
    // ) {
    //     errors.phone = "Phone Number must be 10 digits";
    // }

    // if (!Validator.isNumeric(data.phone.toString())) {
    //     errors.phone = "Phone Number is Invalid";
    // }

    // if (Validator.isEmpty(data.phone.toString())) {
    //     errors.phone = "Phone Number is required";
    // }

    if (!isEmpty(data.phone.toString())) {

        if (!data.phone.toString().match(phone_number_regex)) {
            errors.phone = "Phone Number is Invalid";
        }
       
    }

    // if (!isEmpty(data.other_phone.toString())) {

    //     if (!Validator.isLength(data.other_phone.toString(), {
    //         min: 10,
    //         max: 10
    //     })
    //     ) {
    //         errors.other_phone = "Phone Number must be 10 digits";
    //     }

    //     if (!Validator.isNumeric(data.other_phone.toString())) {
    //         errors.other_phone = "Phone Number is Invalid";
    //     }

    // }
    
    // if (!isEmpty(data.mobile.toString())) {

    //     if (!Validator.isLength(data.mobile.toString(), {
    //         min: 10,
    //         max: 10
    //     })
    //     ) {
    //         errors.mobile = "Mobile Number must be 10 digits";
    //     }

    //     if (!Validator.isNumeric(data.mobile.toString())) {
    //         errors.mobile = "Mobile Number is Invalid";
    //     }

    // }



    if (!data.mobile.toString().match(phone_number_regex)) {
        errors.mobile = "Mobile Number is Invalid";
    }

    if (Validator.isEmpty(data.mobile.toString())) {
        errors.mobile = "Mobile Number is required";
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

   
    
    if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "Email is required";
    }

    if (!isEmpty(data.alternative_email)) {
        if (!Validator.isEmail(data.alternative_email)) {
            errors.alternative_email = "Alternative Email is invalid";
        }
    }
    
    // if (Validator.isEmpty(data.state.toString())) {
    //     errors.state = "State is required";
    // }

    // if (Validator.isEmpty(data.city.toString())) {
    //     errors.city = "City is required";
    // }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
