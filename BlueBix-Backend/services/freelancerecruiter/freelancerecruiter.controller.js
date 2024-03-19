const FreelancerecruiterService = require("./freelancerecruiter.services");
const { commonResponse, commonFunctions } = require("../../helper");
const validatefreelanceJobWorkRequest = require("../../validations/admin/freelance/freelanceJobWorkRequest");
const validateFreelanceSubmissionRequest = require('../../validations/admin/freelance/freelanceSubmissionRequest');
const validateLoginInput = require("../../validations/admin/user/login");
const validateDashBoardInput = require("../../validations/admin/user/dashboard");
const validatePrimaryRecruitInput = require("../../validations/admin/jobopening/primaryRecruiter");
const validateChangePassword = require("../../validations/admin/user/changePassword");
const UserServices = require("../users/users.services")
const mail = require("../../helper/email/index");
const isEmpty = require("../../validations/is-empty");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const EmailActivity = require("../emailactivity/emailactivity.model");
const EmailTemplate = require("../emailtemplate/emailtemplate.model");
const JobOpeningService = require("../jobopening/jobopening.services");
const JobOpenings = require("../jobopening/jobopening.model");
const UserModel = require("../users/users.model");


module.exports = {
  /*
  *  freelancer send request to BDM
  */
  jobWorkRequest: async (req, res, next) => {
    try {
      const { errors, isValid } = validatefreelanceJobWorkRequest(req.body);

      /* let findBdm = await FreelancerecruiterService.find_bdm(req.body);

       if(isEmpty(findBdm)){
           errors.exists = "BDM not found."
       }
       req.body.bdm_id = findBdm['mdm_id'].toString();*/

      let is_exist = await FreelancerecruiterService.is_exist_request(req.body);

      if (is_exist) {
        errors.exists = "Request is Already sent."
      }

      if (!isValid || !isEmpty(errors)) {
        return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
      }

      let freelance = await FreelancerecruiterService.save(req.body);

      if (freelance) {
        let is_email_activity_allowed = await EmailActivity.aggregate([
          {
            $match: {
              email_type: "job_requested",
              // user_id: user._id,
              status: true
            }
          },
          {
            $lookup: {
              from: 'emailtemplates',
              localField: 'email_type',
              foreignField: 'email_type',
              as: 'email_template',

            }
          },
          {
            $project: {
              "email_template.content": 1,
            }
          }
        ]);

        if (is_email_activity_allowed.length > 0) {

          const email_template = is_email_activity_allowed[0].email_template[0];
          let is_exist_footer_email_template = await EmailTemplate.find({ email_type: 'register_user_footer' });
          if (!is_exist_footer_email_template) {
            is_exist_footer_email_template = { content: "Best Regards, Bluebix Customer Support" };
          }

          const send_mail_data = {
            content: email_template.content,
            footer_content: is_exist_footer_email_template[0].content
          };

          const mail_option = {
            filename: "job_requested",
            subject: "Job Requested",
            from_user_email: "test.knptech.2023@gmail.com",
            from_user_password: "qufezstbbfkkxhid",
            smtp_host: "smtp.gmail.com",
            smtp_port: 465,
          };

          const freelance = await UserModel.findById(req.body.freelance_id);
          const opening = await JobOpenings.find({ opening_id: req.body.opening_id });

          if (req.body.bdm_id.length) {
            req.body.bdm_id.forEach(async bdmId => {

              const bdm = await UserServices.is_exist_user(bdmId);
              let send_mail = await mail.send({
                ...mail_option,
                data: { ...send_mail_data, name: bdm.display_name, freelance_name: freelance.first_name + freelance.last_name, opening_title: opening[0].opening_title },
                user: { email: bdm.login_email }
              }, req);

            })
          }
        }

        commonResponse.success(res, 201, freelance, 'Request has been sent Successfully');
      }
      else {
        return commonResponse.customResponse(res, "SERVER_ERROR", 400, freelance, 'Something went wrong, Please try again');
      }
    } catch (error) {
      console.log("Freelance request to BDM -> ", error);
      return next(error);
    }
  },

  /*
   *  All List Job Opening
   */
  listJobOpening: async (req, res, next) => {
    try {

      let data = {};
      if (req.body.freelance_id == '' || req.body.freelance_id == undefined) {
        return commonResponse.customResponse(res, "SERVER_ERROR", 400, data, "Freelance Id is required.");
      }

      let jobopening_listing = await FreelancerecruiterService.job_listing(
        req.body
      );

      if (jobopening_listing) {
        commonResponse.success(res, 200, jobopening_listing, "Job Opening Listing"
        );
      } else {
        return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobopening_listing, "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.log("Listing jobs -> ", error);
      return next(error);
    }
  },

  updateJobWork: async (req, res, next) => {
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

      //Check req body
      if (
        req.body.constructor === Object &&
        Object.keys(req.body).length === 0
      ) {
        return commonResponse.customErrorResponse(
          res,
          400,
          "Required some fields."
        );
      }

      //Check status fields
      if (!req.body.job_work_status) {
        return commonResponse.customErrorResponse(
          res,
          400,
          "Job Work status field is required."
        );
      }

      let user = req.user._id;

      let job_work_exists = await FreelancerecruiterService.is_exist_job_work(
        id
      );

      if (job_work_exists) {
        let updateJobWork = await FreelancerecruiterService.update(
          id,
          req.body,
          user
        );
        if (updateJobWork) {
          commonResponse.success(
            res,
            200,
            updateJobWork,
            "Job Work status Updated Successfully"
          );
        } else {
          return commonResponse.customResponse(
            res,
            "SERVER_ERROR",
            400,
            updateJobWork,
            "Something went wrong, Please try again"
          );
        }
      } else {
        return commonResponse.customResponse(
          res,
          "Job_Work",
          400,
          {},
          "Job Work does not exist"
        );
      }
    } catch (error) {
      console.error("Error", error);
      return next(error);
    }
  },

  freelanceSubmissionCreate: async (req, res, next) => {
    try {
      const { errors, isValid } = validateFreelanceSubmissionRequest(req.body);

      const job_work_application_id = req.body.job_work_application_id;
      const is_job_approved = await FreelancerecruiterService.is_exist_job_work(job_work_application_id);

      if (isEmpty(is_job_approved)) {
        errors.exists = "record not found."
      }

      if (!isValid || !isEmpty(errors)) {
        return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
      }

      if (is_job_approved.job_work_status === "Approved") {
        let freelanceSubmissionDetails = await FreelancerecruiterService.freelancer_submission(

          req.body
        );
        if (freelanceSubmissionDetails) {
          commonResponse.success(
            res,
            200,
            freelanceSubmissionDetails,
            "Freelancer submitted successfully"
          );
        } else {
          return commonResponse.customResponse(
            res,
            "SERVER_ERROR",
            400,
            freelanceSubmissionDetails,
            "Something went wrong, Please try again"
          );
        }
      } else {
        return commonResponse.customResponse(
          res,
          "Job_Work",
          400,
          {},
          "Your job application has not been approved"
        );
      }
    } catch (error) {
      console.error("Error", error);
      next(error);
    }
  },
  listJobWorkApplications: async (req, res, next) => {
    try {

      if (req.body.bdmId == undefined || req.body.bdmId == '') {
        return commonResponse.customErrorResponse(
          res,
          400,
          "BDM Id is required."
        );
      }

      let jobwork_listing =
        await FreelancerecruiterService.list_job_work_applications(req.body);

      if (jobwork_listing) {
        commonResponse.success(
          res,
          200,
          jobwork_listing,
          "Job Work application Listing"
        );
      } else {
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          jobwork_listing,
          "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.log("Listing jobs work applications -> ", error);
      return next(error);
    }
  },

  statusCount: async (req, res, next) => {
    try {
      let statusCountDetails = await FreelancerecruiterService.count_jobopen_status(
        req.body
      );

      if (statusCountDetails) {
        commonResponse.success(res, 200, statusCountDetails, "Count Details");
      } else {
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          statusCountDetails,
          "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.error("Error", error);
      next(error);
    }
  },

  statusJobs: async (req, res, next) => {
    try {
      let statusDetails = await FreelancerecruiterService.jobopen_status(
        req.body
      );

      if (statusDetails) {
        commonResponse.success(res, 200, statusDetails, "Count Details");
      } else {
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          statusDetails,
          "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.error("Error", error);
      next(error);
    }
  },

  approveJobOpening: async (req, res, next) => {
    try {

      let data = {};
      if (req.body.freelance_id == '' || req.body.freelance_id == undefined) {
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          data,
          "Freelance Id is required."
        );
      }

      let jobopening_listing = await FreelancerecruiterService.approve_job_opening(
        req.body
      );

      if (jobopening_listing) {
        commonResponse.success(
          res,
          200,
          jobopening_listing,
          "Approve Job Opening Listing"
        );
      } else {
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          jobopening_listing,
          "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.log("Listing jobs -> ", error);
      return next(error);
      console.log("Create User -> ", error);
      return next(error);
    }
  },

};


