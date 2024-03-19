

const Validator = require("validator");
const isEmpty = require('../../is-empty');
const niv = require('../../niv');
const { commonResponse } = require("../../../helper");
const config = require("../../../config");

exports.validateCandidatePersonalDetailInput = function (data) {
    let errors = {};

    data.gender = !isEmpty(data.gender) ? data.gender : "";
    data.home_town = !isEmpty(data.home_town) ? data.home_town : "";

    var alpha_name_pattern = /^[a-zA-Z"/" "\s]+$/;

    if (!isEmpty(data.gender)) {

        if (!data.gender.match(alpha_name_pattern)) {
            errors.gender = "Enter Gender in Characters";
        }

    }

    if (!isEmpty(data.home_town)) {

        if (!data.home_town.match(alpha_name_pattern)) {
            errors.home_town = "Enter Home Town in Characters";
        }

    }


    return {
        errors,
        isValid: isEmpty(errors)
    };
};

exports.validateCandidatePersonalDetails = async function (req, res, url = '') {
    const validateObj = {
        gender: 'alpha',
        home_town: 'alpha',
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