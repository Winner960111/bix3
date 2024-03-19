const { commonResponse, commonFunctions } = require("../../helper");
const emailTemplateService = require('./emailtemplate.services');
const validateEmailTemplateInput = require("../../validations/admin/emailtemplate/emailTemplateCreate");

const mail = require("../../helper/email/index");
const isEmpty = require("../../validations/is-empty");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RoleModel = require("../roles/roles.model");
const UsersModel = require("../users/users.model");


module.exports = {
  emailTemplateCreate: async (req, res, next) => {
    try {
      const { errors, isValid } = validateEmailTemplateInput(req.body);


      if (!isValid || !isEmpty(errors)) {
        return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
      }


      let emailTemplateDetails = await emailTemplateService.save(

        req.body
      );
      if (emailTemplateDetails) {
        commonResponse.success(
          res,
          200,
          emailTemplateDetails,
          "Email template submitted successfully"
        );
      } else {
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          emailTemplateDetails,
          "Something went wrong, Please try again"
        );
      }

    } catch (error) {
      console.error("Error", error);
      next(error);
    }
  },

  updateEmailTemplate: async (req, res, next) => {
    try {
      let id = req.params.id;

      if (!req.user) {
        return commonResponse.customErrorResponse(
          res,
          401,
          "Invalid User login",
          "Invalid Login credential"
        );
      }

      let user = req.user._id;
      console.log('user', user);

      let email_template_exists = await emailTemplateService.is_exist_email_template(
        id
      );

      if (email_template_exists) {
        let updateEmailTemplate = await emailTemplateService.update(
          id,
          req.body,
          user
        );
        if (updateEmailTemplate) {
          commonResponse.success(
            res,
            200,
            updateEmailTemplate,
            "Email Template Updated Successfully"
          );
        } else {
          return commonResponse.customResponse(
            res,
            "SERVER_ERROR",
            400,
            updateEmailTemplate,
            "Something went wrong, Please try again"
          );
        }
      } else {
        return commonResponse.customResponse(
          res,
          "email_template",
          400,
          {},
          "Email Template does not exist"
        );
      }
    } catch (error) {
      console.error("Error", error);
      return next(error);
    }
  },
  getEmailTemplateDetails: async (req, res, next) => {
    try {
      let email_template_details =
        await emailTemplateService.get_details_email_template(req.params.id);

      if (email_template_details) {
        commonResponse.success(
          res,
          200,
          email_template_details,
          "Email Template Details"
        );
      } else {

        if (email_template_details == false) {
          return commonResponse.customResponse(
            res,
            "Email_template",
            400,
            email_template_details,
            "Email Template does not exist"
          );
        }
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          email_template_details,
          "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.log("Create User -> ", error);
      return next(error);
    }
  },

  getEmailTemplateDetailsByType: async (req, res, next) => {
    try {

      if (req.body.email_type == '' || req.body.email_type == undefined) {
        return commonResponse.customResponse(
          res,
          "Email_template",
          400,
          '',
          "Email type field is required"
        );
      }

      if (req.body.user_id == '' || req.body.user_id == undefined) {
        return commonResponse.customResponse(
          res,
          "Email_template",
          400,
          '',
          "User Id field is required"
        );
      }

      let email_template_details =
        await emailTemplateService.get_details_email_template_by_type(req.body);

      if (email_template_details) {
        commonResponse.success(
          res,
          200,
          email_template_details,
          "Email Template Details"
        );
      } else {
        if (email_template_details == false) {
          return commonResponse.customResponse(
            res,
            "Email_template",
            400,
            {},
            "Email Template does not exist"
          );
        }
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          email_template_details,
          "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.log("Create User -> ", error);
      return next(error);
    }
  },

}