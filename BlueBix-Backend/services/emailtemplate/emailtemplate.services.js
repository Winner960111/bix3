const { commonFunctions } = require("../../helper");
const EmailTemplateModel = require("./emailtemplate.model");
// const jobworkModel = require("./jobwork.model");
// const UsersModel = require("../users/users.model");
// const JobOpeningModel = require("../jobopening/jobopening.model");
// const FreelanceSubmissionModel = require("../jobopening/submission.model");

const isEmpty = require("../../validations/is-empty");
const fs = require("fs");
const mime = require("mime");
const fse = require("fs-extra");
const mongoose = require("mongoose");
const moment = require("moment");

exports.save = async (reqbody) => {
  try {
    let email_template_data = {};
    email_template_data.user_id = reqbody.user_id;
    email_template_data.email_type = reqbody.email_type;
    email_template_data.content = reqbody.content;
    email_template_data.created_at = Date.now();
    email_template_data.updated_at = Date.now();

    let email_template_create = await EmailTemplateModel.create(email_template_data);
    return { email_template: email_template_create };
  } catch (error) {
    console.log(error);
  }
}

/*
*  Check Email Template Exist
*/
exports.is_exist_email_template = async (id) => {
  try {
    let email_template_exist = await EmailTemplateModel.findOne({ _id: id }).lean();
    if (!email_template_exist) {
      return false;
    }
    return email_template_exist;
  } catch (error) {
    console.error("Error : ", error);
  }
};

exports.update = async (id, reqbody, user) => {
  try {

    let update_email_template = {};

    update_email_template.email_type = reqbody.email_type;
    update_email_template.content = reqbody.content;
    update_email_template.updated_at = Date.now();
    update_email_template.updated_by = user;

    return await EmailTemplateModel.updateOne({ _id: id }, update_email_template).lean();
  } catch (error) {
    console.error("Error : ", error);
  }
};

exports.get_details_email_template = async (id) => {
  try {
    let email_template_details = await EmailTemplateModel.findOne({
      _id: id,
    }).lean();

    if (!email_template_details) {
      return false;
    }
    return email_template_details;
  } catch (error) {
    console.error("Error : ", error);
  }
};
exports.get_details_email_template_by_type = async (reqbody) => {
  try {

    let user_id = mongoose.Types.ObjectId(reqbody.user_id);
    let type = reqbody.email_type;
    let email_template_details = await EmailTemplateModel.findOne({
      user_id: user_id,
      email_type: type
    }).lean();

    if (!email_template_details) {
      return false;
    }
    return email_template_details;
  } catch (error) {
    console.error("Error : ", error);
  }
};