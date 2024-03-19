const Validator = require("validator");
const moment = require("moment");
const isEmpty = require('../../is-empty');


module.exports = function validateJobOpeningInput(data) {
    let errors = {};

    data.account_name = !isEmpty(data.account_name) ? data.account_name : "";
    data.contact_name = !isEmpty(data.contact_name) ? data.contact_name : "";
    data.opening_title = !isEmpty(data.opening_title) ? data.opening_title : "";
    data.opening_id = !isEmpty(data.opening_id) ? data.opening_id : "";
    // data.account_owner = !isEmpty(data.account_owner) ? data.account_owner : "";
    // data.account_primary_recruit = !isEmpty(data.account_primary_recruit) ? data.account_primary_recruit : "";
    // data.access        = !isEmpty(data.access) ? data.access : "";
    // data.assign_more_recruits = !isEmpty(data.assign_more_recruits) ? data.assign_more_recruits : "";
    // data.end_client = !isEmpty(data.end_client) ? data.end_client : "";
    data.required_skills = !isEmpty(data.required_skills) ? data.required_skills : "";
    data.required_experience = !isEmpty(data.required_experience) ? data.required_experience : "";
    // data.bill_rate = !isEmpty(data.bill_rate) ? data.bill_rate : "";
    // data.bill_currency = !isEmpty(data.bill_currency) ? data.bill_currency : "";
    // data.bill_type = !isEmpty(data.bill_type) ? data.bill_type : "";
    // data.pay_rate = !isEmpty(data.pay_rate) ? data.pay_rate : "";
    data.pay_currency = !isEmpty(data.pay_currency) ? data.pay_currency : "";
    data.pay_type = !isEmpty(data.pay_type) ? data.pay_type : "";
    data.country = !isEmpty(data.country) ? data.country : "";
    data.state = !isEmpty(data.state) ? data.state : "";
    data.city = !isEmpty(data.city) ? data.city : "";
    data.zip_code = !isEmpty(data.zip_code) ? data.zip_code : "";
    data.number_of_openings = !isEmpty(data.number_of_openings) ? data.number_of_openings : "";
    data.max_resumes_allowed = !isEmpty(data.max_resumes_allowed) ? data.max_resumes_allowed : "";
    data.local_indicator = !isEmpty(data.local_indicator) ? data.local_indicator : "";
    data.security_clearance = !isEmpty(data.security_clearance) ? data.security_clearance : "";
    data.job_description = !isEmpty(data.job_description) ? data.job_description : "";
    data.duration = !isEmpty(data.duration) ? data.duration : "";
    data.category = !isEmpty(data.category) ? data.category : "";
    data.sub_category = !isEmpty(data.sub_category) ? data.sub_category : "";
    data.employment_type = !isEmpty(data.employment_type) ? data.employment_type : "";
    data.experience_level = !isEmpty(data.experience_level) ? data.experience_level : "";
    data.interview_type = !isEmpty(data.interview_type) ? data.interview_type : "";
    data.visa_type = !isEmpty(data.visa_type) ? data.visa_type : "";
    data.notes = !isEmpty(data.notes) ? data.notes : "";
    data.role = !isEmpty(data.role) ? data.role : "";
    data.salary_range = !isEmpty(data.salary_range) ? data.salary_range : "";
    data.currency = !isEmpty(data.currency) ? data.currency : "";
    data.salary_type = !isEmpty(data.salary_type) ? data.salary_type : "";

    var regex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/g

    var alpha_name_pattern = /^[a-zA-Z"/","" "\s]+$/;
    var character_number_pattern = /^[a-zA-Z0-9"/" "\s]+$/;

    // var alpha_name_pattern = /^[a-zA-Z"(""&""/","" "\s]+$/g;

    // var date_time = moment().format("YYYY-MM-DD HH:mm:ss");

    // if (!Validator.isLength(data.account_name, {
    //     min: 2,
    //     max: 15
    // })
    // ) {
    //     errors.account_name = "Enter Account Name between 2 to 15 Characters";
    // }

    // if (!data.account_name.match(alpha_name_pattern)){
    //     errors.account_name = "Enter Account Name in Characters";
    // }

    if (Validator.isEmpty(data.account_name)) {
        errors.account_name = "Account Name is required";
    }


    // if (!Validator.isLength(data.opening_title, {
    //     min: 2,
    //     max: 40
    // })
    // ) {
    //     errors.opening_title = "Enter Opening Title between 2 to 40 Characters";
    // }

    /* if (!data.opening_title.match(alpha_name_pattern)){
         errors.opening_title = "Enter Opening Title in Characters";
     }*/

    if (Validator.isEmpty(data.opening_title)) {
        errors.opening_title = "Opening Title is required";
    }

    if (Validator.isEmpty(data.opening_id)) {
        errors.opening_id = "Opening Id is required";
    }

    // if (Validator.isEmpty(data.account_owner)){
    //     errors.account_owner = "Account Owner is required";
    // }

    // if (!isEmpty(data.account_owner)){
    //     if (!Validator.isNumeric(data.account_owner)) {
    //         errors.account_owner = "Enter Account Owner Id in Number";
    //     }    
    // }

    // if (Validator.isEmpty(data.account_primary_recruit)){
    //     errors.account_primary_recruit = "Account Primary Recruit is required";
    // }
    // if (!isEmpty(data.account_primary_recruit)){
    //     if (!Validator.isNumeric(data.account_primary_recruit)) {
    //         errors.account_primary_recruit = "Enter Account Primary Recruit Id in Number";
    //     } 
    // }

    // if (!data.access.match(alpha_name_pattern)){
    //     errors.access = "Enter Access in Characters";
    // }

    // if (Validator.isEmpty(data.access)){
    //     errors.access = "Access is required";
    // }

    // if (!Validator.isNumeric(data.assign_more_recruits.toString())) {
    //     errors.assign_more_recruits = "Enter Assign More Recruits in Number";
    // } 

    // if (data.assign_more_recruits.length == 0){
    //     errors.assign_more_recruits = "Assign More Recruits is required";
    // }

    // if (!Validator.isNumeric(data.end_client.toString())) {
    //     errors.end_client = "Enter End Client Id in Number";
    // } 

    // if (Validator.isEmpty(data.end_client.toString())){
    //     errors.end_client = "End Client Id is required";
    // }

    // if (!data.required_skills.match(alpha_name_pattern)){
    //     errors.required_skills = "Enter Required Skills in Characters";
    // }

    // if (Validator.isEmpty(data.required_skills)){
    //     errors.required_skills = "Required Skills is required";
    // }

    if (data.required_skills.length == 0) {
        errors.required_skills = "Required Skills is required";
    }

    if (!Validator.isNumeric(data.required_experience.toString())) {
        errors.required_experience = "Enter Required Experience in Number";
    }

    if (Validator.isEmpty(data.required_experience.toString())) {
        errors.required_experience = "Required Experience is required";
    }

    // if (!isEmpty(data.bill_rate.toString())){
    //     if (!Validator.isNumeric(data.bill_rate.toString())) {
    //         errors.bill_rate = "Enter Bill Rate in Number";
    //     } 
    // }

    // if (!isEmpty(data.bill_currency.toString())){
    //     if (!Validator.isNumeric(data.bill_currency.toString())) {
    //         errors.bill_currency = "Enter Bill Currency in Number";
    //     } 
    // }

    // if (!isEmpty(data.bill_type)){
    //     if (!data.bill_type.match(alpha_name_pattern)){
    //         errors.bill_type = "Enter Bill Type in Characters";
    //     }
    // }

    // if (!isEmpty(data.pay_rate.toString())){
    //     if (!Validator.isNumeric(data.pay_rate.toString())) {
    //         errors.pay_rate = "Enter Pay Rate in Number";
    //     } 
    // }

    if (!isEmpty(data.pay_currency.toString())) {
        if (!Validator.isNumeric(data.pay_currency.toString())) {
            errors.pay_currency = "Enter Pay Currency in Number";
        }
    }

    if (!isEmpty(data.pay_type)) {
        if (!data.pay_type.match(alpha_name_pattern)) {
            errors.pay_type = "Enter Pay Type in Characters";
        }
    }

    if (!isEmpty(data.country)) {
        if (!data.country.match(alpha_name_pattern)) {
            errors.country = "Enter Country in Characters";
        }
    }

    // if (!isEmpty(data.state)){
    //     if (!data.state.match(alpha_name_pattern)){
    //         errors.state = "Enter State in Characters";
    //     } 
    // }

    // if (!data.city.match(alpha_name_pattern)){
    //     errors.city = "Enter City in Characters";
    // }

    /* if (Validator.isEmpty(data.city.toString())){
         errors.city = "City is required";
     }*/

    if (!isEmpty(data.zip_code.toString())) {
        if (!Validator.isNumeric(data.zip_code.toString())) {
            errors.zip_code = "Enter Zip Code in Number";
        }
    }

    if (!Validator.isNumeric(data.number_of_openings.toString())) {
        errors.number_of_openings = "Enter Number Of Openings in Number";
    }

    if (Validator.isEmpty(data.number_of_openings.toString())) {
        errors.number_of_openings = "Number Of Openings is required";
    }

    if (!isEmpty(data.max_resumes_allowed.toString())) {
        if (!Validator.isNumeric(data.max_resumes_allowed.toString())) {
            errors.max_resumes_allowed = "Enter Resumes in Number";
        }
    }

    // if (!isEmpty(data.local_indicator.toString())){
    //     if (!Validator.isNumeric(data.local_indicator.toString()    )) {
    //         errors.local_indicator = "Enter Local Indicator in Number";
    //     } 
    // }

    if (!isEmpty(data.security_clearance)) {
        if (!data.security_clearance.match(alpha_name_pattern)) {
            errors.security_clearance = "Enter Security Clearance in Characters";
        }
    }

    // if (!data.job_description.match(alpha_name_pattern)){
    //     errors.job_description = "Enter Job Description in Characters";
    // }

    if (Validator.isEmpty(data.job_description)) {
        errors.job_description = "Job Description is required";
    }

    if (!isEmpty(data.duration)) {
        if (!data.duration.match(character_number_pattern)) {
            errors.duration = "Enter Duration in Number or Character";
        }
    }

    // if (!data.category.match(alpha_name_pattern)){
    //     errors.category = "Enter Category in Characters";
    // }

    if (Validator.isEmpty(data.category)) {
        errors.category = "Category is required";
    }

    // if (!isEmpty(data.sub_category)){
    //     if (!data.sub_category.match(alpha_name_pattern)){
    //         errors.sub_category = "Enter Sub Category in Characters";
    //     } 
    // }

    /** employment dropdown */
    // if (!data.employment_type.match(alpha_name_pattern)){
    //     errors.employment_type = "Enter Employment Type in Characters";
    // }

    if (Validator.isEmpty(data.employment_type)) {
        errors.employment_type = "Employment Type is required";
    }

    /** experience_level dropdown */
    // if (!data.experience_level.match(alpha_name_pattern)){
    //     errors.experience_level = "Enter Experience Level in Characters";
    // }

    if (Validator.isEmpty(data.experience_level)) {
        errors.experience_level = "Experience Level is required";
    }

    /** position_type dropdown */

    // if (!isEmpty(data.position_type)){
    //     if (!data.position_type.match(alpha_name_pattern)){
    //         errors.position_type = "Enter Position Type in Characters";
    //     }
    // }


    /** interview_type dropdown */
    // if (!data.interview_type.match(alpha_name_pattern)){
    //     errors.interview_type = "Enter Interview Type in Characters";
    // }

    if (Validator.isEmpty(data.interview_type)) {
        errors.interview_type = "Interview Type is required";
    }

    if (data.visa_type.length == 0) {
        errors.visa_type = "Visa Type is required";
    }

    if (!isEmpty(data.notes)) {
        if (!data.notes.match(alpha_name_pattern)) {
            errors.notes = "Enter Notes in Characters";
        }
    }
    // if (!isEmpty(data.project_start_date)){
    //     if (!Validator.isDate(data.project_start_date)){
    //         errors.project_start_date = "Enter Project Start Date in YYYY/MM/DD";
    //     }
    // }



    // if (Validator.isEmpty(data.account_owner)){
    //     errors.account_owner = "Account Owner is required";
    // }

    // if (Validator.isEmpty(data.account_primary_recruit)){
    //     errors.account_primary_recruit = "Account Primary Recruit is required";
    // }




    // if (Validator.isEmpty(data.role)){
    //     errors.role = "Role is required";
    // }

    if (Validator.isEmpty(data.salary_range)) {
        errors.salary_range = "Salary Range is required";
    }

    if (Validator.isEmpty(data.currency)) {
        errors.currency = "Currency is required";
    }

    if (Validator.isEmpty(data.salary_type)) {
        errors.salary_type = "Salary Type is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
