// const AdminService = require("./admin.services");
const { commonResponse, commonFunctions } = require("../../helper");
// const validateAdminRegisterInput = require("../../validations/admin/user/register");
// const validateLoginInput = require("../../validations/admin/user/login");
// const validateUserTypeInput = require("../../validations/admin/user/usertype");
// const validateForgotPasswordInput = require("../../validations/admin/user/forgotPassword");
// const validateResetPasswordInput = require("../../validations/admin/user/resetPassword");
// const mail = require("../../helper/email/index");
// const isEmpty = require("../../validations/is-empty");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
const JobOpeningModel = require("../jobopening/jobopening.model");
const CandidateModel = require("../candidate/candidate.model");

// const UserService = require("../users/users.services");
// const Imap = require('imap'),
//     inspect = require('util').inspect;


module.exports = {
  /*
   *  Register New User
   */
  getRecruiter: async (req, res, next) => {
    try {
      console.log(" this is get cruiter--------->", req.body);
        const jobOpenings = await JobOpeningModel.find({ opening_title: new RegExp(req.body.title, "i") });
        const candidates = await CandidateModel.find({first_name:new RegExp(req.body.name, "i")});
        // console.log('result======>', jobOpenings, candidates)
        commonResponse.success(res, 201, {jobOpenings: jobOpenings, candidates: candidates}, 'Fetched Successfully');
      //   const { errors, isValid } = validateAdminRegisterInput(req.body);

      //   req.body.email = req.body.email.toLowerCase();
      //   let is_exist = await AdminService.is_exist(req.body.email);

      //   if (is_exist) {
      //     errors.email = "Email Id is Already Exist";
      //   }

      //   if (!isValid || !isEmpty(errors)) {
      //     return commonResponse.customErrorResponse(
      //       res,
      //       422,
      //       "Something went wrong",
      //       errors
      //     );
      //   }

      //   let user = await AdminService.save(req.body);
      //   let role_id = await RoleModel.findOne(
      //     { _id: user.assigned_role },
      //     { role_name: 1 }
      //   ).lean();

      //   if (user) {
      //     let link = process.env.BASE_URL + "bluebix-demo/auth/login";
      //     if (role_id) {
      //       //send email
      //       if (role_id.role_name == "admin") {
      //         link = process.env.BASE_URL + "bluebix-demo/auth/admin/login";
      //       }
      //       if (role_id.role_name == "bdm") {
      //         link = process.env.BASE_URL + "bluebix-demo/auth/bdm/login";
      //       }
      //       if (role_id.role_name == "recruiter") {
      //         link = process.env.BASE_URL + "bluebix-demo/auth/recruiter/login";
      //       }
      //     }

      //     //register user
      //     let is_exist_email_template = await UserService.email_template_by_type(
      //       "register_user_welcome_msg"
      //     );
      //     if (!is_exist_email_template) {
      //       is_exist_email_template = {};
      //       is_exist_email_template.content =
      //         "Welcome to the Bluebix. I'm so glad you registred in Bluebix.";
      //     }

      //     let is_exist_footer_email_template =
      //       await UserService.email_template_by_type("register_user_footer");
      //     if (!is_exist_footer_email_template) {
      //       is_exist_footer_email_template = {};
      //       is_exist_footer_email_template.content =
      //         "Best Regards, Bluebix Customer Support";
      //     }

      //     let email = user.email;
      //     let name = user.display_name;
      //     let password = "";
      //     if (req.body.password != "" && req.body.password != undefined) {
      //       password = req.body.password;
      //     }

      //     var send_mail_data = {
      //       link: link,
      //       name: name,
      //       email: email,
      //       password: password,
      //       role: "Admin",
      //       content: is_exist_email_template.content,
      //       footer_content: is_exist_footer_email_template.content,
      //     };

      //     const mail_option = {
      //       filename: "user_register",
      //       data: send_mail_data,
      //       subject: "Register Email",
      //       from_user_email: "test.knptech.2023@gmail.com",
      //       from_user_password: "qufezstbbfkkxhid",
      //       smtp_host: "smtp.gmail.com",
      //       smtp_port: 465,
      //       user: {
      //         email: email,
      //       },
      //     };

      //     let payload = {
      //       _id: user._id,
      //       email: user.email,
      //       display_name: user.display_name,
      //       mobile: user.mobile,
      //       profile: user.profile,
      //       assigned_role: role_id,
      //     };

      //     jwt.sign(
      //       payload,
      //       process.env.JWT_SECRET,
      //       { expiresIn: process.env.EXPIRE_JWT_SECRET || "24h" },
      //       (err, token) => {
      //         commonResponse.success(
      //           res,
      //           201,
      //           { user_detail: user, token: "Bearer " + token },
      //           "Admin Signup Successfully"
      //         );
      //       }
      //     );
      //     var send_mail = await mail.send(mail_option);
      // commonResponse.success(res, 201, user, 'Signup Successfully');
      //   } else {
      // return commonResponse.customResponse(
      //   res,
      //   "SERVER_ERROR",
      //   400,
      //   user,
      //   "Something went wrong, Please try again"
      // );
      //   }
    } catch (error) {
      console.log("Create User -> ", error);
      return next(error);
    }
  },
};
