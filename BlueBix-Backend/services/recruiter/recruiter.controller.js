const RecruiterService = require("./recruiter.services");
const { commonResponse, commonFunctions } = require("../../helper");
const validateRecruiterRegisterInput = require("../../validations/admin/recruiter/recruiterRegister");
const validateRecruiterSubmissionInput = require("../../validations/admin/recruiter/recruiterSubmission");
const { validateLoginInput, validateLogin } = require("../../validations/admin/user/login");
// const validateUserTypeInput = require("../../validations/admin/user/usertype");
const validateForgotPasswordInput = require("../../validations/admin/user/forgotPassword");
const validateResetPasswordInput = require("../../validations/admin/user/resetPassword");
const mail = require("../../helper/email/index");
const isEmpty = require("../../validations/is-empty");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Company = require("../company/company.model");
const Recruiter = require("./recruiter.model");
const Bdm = require("../bdm/bdm.model");
const JobOpenings = require("../jobopening/jobopening.model");
const niv = require('../../validations/niv');

module.exports = {

    /*
    *  Register New User
    */
    recruiterRegister: async (req, res, next) => {
        try {
            const { errors, isValid } = validateRecruiterRegisterInput(req.body);

            req.body.email = req.body.email.toLowerCase();
            let is_exist = await RecruiterService.is_exist(req.body.email);

            if (is_exist) {
                errors.email = "Email Id is Already Exist"
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let user = await RecruiterService.save(req.body);

            if (user) {
                let payload = {
                    _id: user._id,
                    email: user.email,
                    display_name: user.display_name,
                    contact_number: user.contact_number,
                    role: user.role
                };


                jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.EXPIRE_JWT_SECRET || "24h" },
                    (err, token) => {
                        commonResponse.success(res, 201, { user_detail: user, token: "Bearer " + token }, 'Signup Successfully');
                    }
                );
                // commonResponse.success(res, 201, user, 'Signup Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, user, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  Login
    */
    recruiterLogin: async (req, res, next) => {

        const valError = await validateLogin(req, res)
        if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

        const errors = {}

        // const { errors, isValid } = validateLoginInput(req.body);

        // if (!isValid) {
        //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        // }

        let is_user = await RecruiterService.is_exist_role(req.body.email, req.body.role);

        if (!is_user) {
            errors.email = "Invalid Email";
            return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        }

        let password_match = await commonFunctions.matchPassword(req.body.password, is_user.password);

        if (password_match) {
            const payload = {
                _id: is_user._id,
                email: is_user.email,
                name: is_user.first_name + ' ' + is_user.last_name,
                contact_number: is_user.contact_number,
                role: is_user.role
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: process.env.EXPIRE_JWT_SECRET || "24h" },
                (err, token) => {
                    commonResponse.success(res, 200, { user_detail: is_user, token: "Bearer " + token }, 'Login Successfully');
                }
            );

        }
        else {
            errors.password = "Invalid Password";
            return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        }
    },


    // /*
    // *  Logged In User Details
    // */

    // loggedUserDetails: async (req, res, next) => {
    //     try {
    //         let user = req.user._id;

    //         let logged_user_detail = await UsersService.loggedUserDetail(user);

    //         if (logged_user_detail) {
    //             commonResponse.success(res, 200, logged_user_detail, 'Logged User List');
    //         } else {
    //             return commonResponse.customResponse(res, "SERVER_ERROR", 400, logged_user_detail, 'Something went wrong, Please try again');
    //         }
    //     } catch (error) {
    //         console.log("Create User -> ", error);
    //         return next(error);
    //     }
    // },


    /*
    *  Recruiter List
    */

    getAllRecruiterList: async (req, res, next) => {
        try {

            let recruiter_list = await RecruiterService.recruiterlist(req.body);

            if (recruiter_list) {
                commonResponse.success(res, 200, recruiter_list, 'All Recruiter Listing Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, recruiter_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Get Detail User Profile By Id
    */
    getRecruiterProfileDetails: async (req, res, next) => {
        try {
            let recruiter_profile_details = await RecruiterService.get(req.params.id);
            if (recruiter_profile_details) {
                commonResponse.success(res, 200, recruiter_profile_details, 'Recruiter Profile Details');
            } else {
                if (recruiter_profile_details == false) {
                    return commonResponse.customResponse(res, "User_Profile", 400, recruiter_profile_details, "Recruiter does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, recruiter_profile_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  Recruiter Profile Update Job By Id
    */
    updateRecruiterProfile: async (req, res, next) => {
        try {
            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid credential or User does not exist");
            }
            let user = req.user._id;
            var url = req.originalUrl.split('/');

            let is_exist_user = await RecruiterService.is_exist_user(id);

            if (is_exist_user) {

                const { errors, isValid } = validateRecruiterRegisterInput(req.body, url[4]);

                let is_exist_email = await RecruiterService.is_exist(req.body.email);

                if (is_exist_email && isEmpty(errors.email) && is_exist_email._id != id) {
                    errors.email = "Email Id is Already Exist"
                }


                if (!isValid || !isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                let updateUserProfile = await RecruiterService.update(id, req.body, user);

                if (updateUserProfile) {
                    commonResponse.success(res, 200, updateUserProfile, 'Recruiter Profile Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateUserProfile, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user, "Recruiter does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    // /*
    //  *   Get Detail All User List with Count no of user
    //  */
    // getUserList: async (req, res, next) => {
    //     try {
    //         let user_list_details = await UsersService.user_list_count();
    //         if (user_list_details) {
    //             commonResponse.success(res, 200, user_list_details, 'User List Details');
    //         } else {
    //             return commonResponse.customResponse(res, "SERVER_ERROR", 400, user_list_details, 'Something went wrong, Please try again');
    //         }
    //     } catch (error) {
    //         console.log("Create User -> ", error);
    //         return next(error);
    //     }
    // },

    recruiterForgotPassword: async (req, res, next) => {
        try {
            var email = req.body.email;
            let user = req.user._id;

            const { errors, isValid } = validateForgotPasswordInput(req.body);

            let is_exist = await RecruiterService.is_exist(req.body.email);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (is_exist) {

                const token_fun = async (data) => {
                    var token_data = {
                        reset_password_token: data,
                        reset_password_expires: Date.now() + 60 * 60 * 24 * 1000,
                        updated_at: Date.now(),
                        updated_by: user
                    };

                    let updateUserForgotpassword = await RecruiterService.update_token(token_data, email);

                    if (updateUserForgotpassword) {

                        var link = "http://localhost:3000/" + "reset-password/" + data;
                        const mail_option = {
                            filename: "reset_password",
                            data: link,
                            subject: "Password reset link",
                            user: {
                                email: email,
                            },
                        };
                        commonResponse.success(res, 200, updateUserForgotpassword, 'Password reset link is sent to your registered email id');
                        var send_mail = await mail.send(mail_option);
                    }
                    else {
                        return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateUserForgotpassword, 'Something went wrong, Please try again');
                    }


                };
                crypto.randomBytes(20, (err, buffer) => {
                    var token = buffer.toString("hex");
                    token_fun(token);
                });
            } else {
                var error = {};
                error.email = "User does not exists with this Email Id";
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", error);
            }


        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    recruiterResetPassword: async (req, res, next) => {
        try {
            let token = req.body.token;
            let user = req.user._id;

            //check token is exist or not
            let is_exist_user_token = await RecruiterService.is_exist_user_token(req.body.token);
            const { errors, isValid } = validateResetPasswordInput(req.body);



            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (is_exist_user_token) {

                //reset passowrd
                let user_password_reset = await RecruiterService.user_password_reset(req.body, user);

                if (user_password_reset) {
                    commonResponse.success(res, 200, user_password_reset, 'Your Password Successfully Changed');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateUserProfile, 'Something went wrong, Please try again');
                }
            } else {
                var error = {};
                error.token = 'Token is invalid or has expired.';
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", error);
            }

        } catch (e) {
            console.log("E", e);
        }
    },
    recruiterSubmissionCreate: async (req, res, next) => {
        try {
            const validateObj = {
                candidate_id: 'required|mongoId|exists:Candidate,_id',
                company_id: 'required|mongoId|exists:Company,_id',
                recruiter_id: 'required|mongoId|exists:User,_id',
                opening_id: 'required',
                submission_status: 'required|alpha',
            }
            if (req.body.bdm_id) validateObj.bdm_id = 'required|mongoId|exists:User,_id'

            const v = new niv.Validator(req.body, validateObj);

            const matched = await v.check();
            if (!matched) {
                const errors = commonResponse.validateResp(v.errors)
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            // const { errors, isValid } = validateRecruiterSubmissionInput(req.body);

            // if (!isValid || !isEmpty(errors)) {
            //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            // }
            let errors = {}
            const check_recruiter_submission = await RecruiterService.is_exist_recruiter_submission(
                req.body
            );

            if (check_recruiter_submission) {
                errors.exists = "Already exists.";
            }
            if (!isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            // // Validate ids
            // await commonFunctions.validateId(res, req.body.company_id, Company, "company_id");
            // await commonFunctions.validateId(res, req.body.recruiter_id, Recruiter, "recruiter_id");
            // await commonFunctions.validateId(res, req.body.opening_id, JobOpenings, "opening_id");
            // if (req.body.bdm_id)
            //     await commonFunctions.validateId(res, req.body.bdm_id, Bdm, "bdm_id");


            //  if (is_job_approved.job_work_status === "Approved") {
            let recruiterSubmissionDetails = await RecruiterService.recruiter_submission(req.body);

            if (recruiterSubmissionDetails) {
                commonResponse.success(
                    res,
                    200,
                    recruiterSubmissionDetails,
                    "Submitted successfully"
                );
            } else {
                return commonResponse.customResponse(
                    res,
                    "SERVER_ERROR",
                    400,
                    recruiterSubmissionDetails,
                    "Something went wrong, Please try again"
                );
            }
            /*  } else {
                  return commonResponse.customResponse(
                      res,
                      "Job_Work",
                      400,
                      {},
                      "Your job application has not been approved"
                  );
              }*/
        } catch (error) {
            console.error("Error", error);
            next(error);
        }
    },
    statusCount: async (req, res, next) => {
        try {
            let statusCountDetails = await RecruiterService.count_jobopen_status(
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

            const { errors, isValid } = commonFunctions.commonValidation(req);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let statusDetails = await RecruiterService.jobopen_status(
                req.body
            );

            if (statusDetails) {
                commonResponse.success(res, 200, statusDetails, "Job Details");
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


};
