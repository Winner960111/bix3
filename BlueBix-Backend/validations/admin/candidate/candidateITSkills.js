const Validator = require("validator");
const isEmpty = require('../../is-empty');
const niv = require('../../niv');
const { commonResponse } = require("../../../helper");
const config = require("../../../config");

exports.validateITSkillsInput = function (data, url = '') {
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


        for (var i = 0; i < data.it_skills_details.length; i++) {

            // if(url == 'edit'){
            var candidate_id = data.it_skills_details[i].candidate_id;
            var _id = data.it_skills_details[i]._id;
            // }

            if (Validator.isEmpty(_id)) {
                errors._id = 'Id is required'
            }
            if (Validator.isEmpty(candidate_id)) {
                errors.candidate_id = 'Candidate Id is required'
            }
        }
    }
    // var it_skills_detail = [];

    // for (var i = 0; i < data.qualification_details.length; i++) {

    //     if(url == 'edit'){
    //         var candidate_id = data.qualification_details[i].candidate_id;
    //         var _id = data.qualification_details[i]._id;
    //     }
    //     var qualification = data.qualification_details[i].qualification;
    //     var course = data.qualification_details[i].course;
    //     var course_type = data.qualification_details[i].course_type;
    //     var specialization = data.qualification_details[i].specialization;
    //     var university = data.qualification_details[i].university;
    //     var passing_year = data.qualification_details[i].passing_year;


    //     if (Validator.isEmpty(qualification)) {
    //         errors.qualification = 'Qualification is required'
    //     }
    //     if (Validator.isEmpty(course)) {
    //         errors.course = 'Course  is required'
    //     }
    //     if (Validator.isEmpty(course_type)) {
    //         errors.course_type = 'Course Type is required'
    //     }
    //     if (Validator.isEmpty(specialization)) {
    //         errors.specialization = 'Specialization is required'
    //     }
    //     if (Validator.isEmpty(university)) {
    //         errors.university = 'University is required'
    //     }
    //     if (Validator.isEmpty(passing_year)) {
    //         errors.passing_year = 'Passing Year is required'
    //     }


    //     if (!Validator.isEmpty(qualification) && !Validator.isEmpty(course) && !Validator.isEmpty(course_type) && !Validator.isEmpty(specialization) && !Validator.isEmpty(university) && !Validator.isEmpty(passing_year)) {

    //         add_object = {};

    //         if(url == "edit"){

    //             add_object['candidate_id'] = candidate_id;
    //             add_object['_id'] = _id;
    //         }

    //         add_object['qualification'] = qualification;
    //         add_object['course'] = course;
    //         add_object['course_type'] = course_type;
    //         add_object['specialization'] = specialization;
    //         add_object['university'] = university;
    //         add_object['passing_year'] = passing_year;
    //         it_skills_detail.push(add_object);

    //     }
    //     //    }
    //     //    else{
    //     //         add_object = {}
    //     //         add_object['qualification'] = qualification || null;
    //     //         add_object['course'] = course || null;
    //     //         add_object['course_type'] = course_type || null;
    //     //         add_object['specialization'] = specialization || null;
    //     //         add_object['university'] = university || null;
    //     //         add_object['passing_year'] = passing_year || null;
    //     //         eduction_detail.push(add_object);
    //     //    }
    // }

    // data.qualification_details = it_skills_detail;

    return {
        errors,
        isValid: isEmpty(errors)
    };
};

exports.validateITSkills = async function (req, res, url = '') {
    const validateObj = {}

    if (url != 'edit') {
        validateObj.id = 'required|mongoId'
    }

    if (url == 'edit') {
        validateObj.qualification_details = 'required|array'
        validateObj['qualification_details.*.candidate_id'] = 'required|mongoId'
        validateObj['qualification_details.*._id'] = 'required|mongoId'
    }

    const v = new niv.Validator(req.body, validateObj);

    niv.addCustomMessages({
        "id.mongoId": "Requested id param must be a valid id",
        "qualification_details.*._id": "Id param must be a valid id",
        "qualification_details.*.candidate_id": "Id param must be a valid id",
    });

    const matched = await v.check();
    if (!matched) {
        const errors = commonResponse.validateResp(v.errors)
        return { ...{ status: false }, ...{ errors: errors } }
    } else {
        return { status: true }
    }

}