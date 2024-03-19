const CandidateService = require("./candidate.services");
const UserService = require("../users/users.services");
const { commonResponse, commonFunctions } = require("../../helper");
const { validateDirectCandidateRegisterInput, validateDirectCandidateRegister } = require("../../validations/admin/candidate/candidateDirectRegister");
const { validateCandidateRegisterInput, validateRegister } = require("../../validations/admin/candidate/candidateRegister");
const { validateCandidateLoginInput, validateLogin } = require("../../validations/admin/company/companyLogin");
// const validateUserTypeInput = require("../../validations/admin/user/usertype");
const validateForgotPasswordInput = require("../../validations/admin/user/forgotPassword");
const validateResetPasswordInput = require("../../validations/admin/user/resetPassword");
const validateChangePassword = require("../../validations/admin/user/changePassword");
const validateVerifyEmail = require("../../validations/admin/candidate/verifyEmail");
const { validateQualificationDetailsInput, validateQualificationDetails } = require("../../validations/admin/candidate/qualificationDetails");
const { validateEmployeeDetailsInput, validateEmployeeDetails } = require("../../validations/admin/candidate/employeeDetails");
const { validateCandidateITSkillsDetailsInput, validateITSkills } = require("../../validations/admin/candidate/candidateITSkills");
const validateCandidateCareerDetailsInput = require("../../validations/admin/candidate/candidateCareerDetails");
const { validateCandidatePersonalDetailsInput, validateCandidatePersonalDetails } = require("../../validations/admin/candidate/candidatePersonalDetails");
const validateDirectCandidateApplyJobInput = require("../../validations/admin/candidate/candidateDirectApplyJob");
const validateJobSavedInput = require("../../validations/admin/jobsaved/jobSave");

const mail = require("../../helper/email/index");
const isEmpty = require("../../validations/is-empty");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const xmlToJs = require('xml2js');



module.exports = {

    /*
    *  Register New Candidate
    */
    candidateDirectRegister: async (req, res, next) => {
        try {

            // Valaidations
            const valError = await validateDirectCandidateRegister(req, res)
            if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

            const errors = {}

            // const { errors, isValid } = validateDirectCandidateRegisterInput(req.body);

            req.body.email = req.body.email.toLowerCase();
            let is_exist = await CandidateService.is_exist(req.body.email, { email: 1 });

            // if (req.body.form_type == '1') {

            if (is_exist) {
                errors.email = "Email Id is Already Exist"
            }
            // }

            // if (!isValid || !isEmpty(errors)) {
            if (!isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let user = await CandidateService.save_direct_candidate_data(req.body);

            if (user) {
                let link = process.env.BASE_URL + "auth/login";

                //register user
                let is_exist_email_template =
                    await UserService.email_template_by_type(
                        "register_user_welcome_msg"
                    );
                if (!is_exist_email_template) {
                    is_exist_email_template = {};
                    is_exist_email_template.content = "Welcome to the Bluebix. I'm so glad you registred in Bluebix.";
                }

                let is_exist_footer_email_template =
                    await UserService.email_template_by_type(
                        "register_user_footer"
                    );
                if (!is_exist_footer_email_template) {
                    is_exist_footer_email_template = {};
                    is_exist_footer_email_template.content =
                        "Best Regards, Bluebix Customer Support";
                }

                let email = user.candidate_details.email;
                let name = user.candidate_details.first_name + " " + user.candidate_details.last_name;
                let password = '';
                if (req.body.password != "" && req.body.password != undefined) {
                    password = req.body.password;
                }

                var send_mail_data = {
                    link: link,
                    name: name,
                    email: email,
                    password: password,
                    role: 'Candidate',
                    content: is_exist_email_template.content,
                    footer_content: is_exist_footer_email_template.content,
                };

                const mail_option = {
                    filename: "user_register",
                    data: send_mail_data,
                    subject: "Register Email",
                    from_user_email: "test.knptech.2023@gmail.com",
                    from_user_password: "qufezstbbfkkxhid",
                    smtp_host: "smtp.gmail.com",
                    smtp_port: 465,
                    user: {
                        email: email
                    },
                };

                let payload = {
                    _id: user.candidate_details._id,
                    email: user.candidate_details.email,
                    name:
                        user.candidate_details.first_name +
                        " " +
                        user.candidate_details.last_name,
                    mobile: user.candidate_details.mobile,
                };

                jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.EXPIRE_JWT_SECRET || "24h" },
                    (err, token) => {
                        commonResponse.success(
                            res,
                            200,
                            {
                                candidate_detail: user.candidate_details,
                                token: "Bearer " + token,
                            },
                            "Candiate Signup Successfully"
                        );
                    }
                );

                var send_mail = await mail.send(mail_option, req);


                // if (user.candidate_first_form) {
                //     commonResponse.success(res, 201, user, 'Candiate Profile Register Successfully');
                // }
                // if (user.candidate_second_form) {
                //     commonResponse.success(res, 200, user, 'Candiate Profile Updated Successfully');
                // }
                // if (user.candidate_third_form) {

                //     let payload = {
                //         _id: user.candidate_third_form._id,
                //         email: user.candidate_third_form.email,
                //         name: user.candidate_third_form.first_name + ' ' + user.candidate_third_form.last_name,
                //         mobile: user.candidate_third_form.mobile
                //     };

                //     let crypto_token_data = crypto.randomBytes(20).toString('hex');

                //     var token_data = {
                //         email_token: crypto_token_data,
                //         updated_at: Date.now()
                //     };

                //     let updateCandidateRegisterVerifyEmail = await CandidateService.update_email_token(token_data, user.candidate_third_form.email);
                //     // console.log("updateCandidateRegisterVerifyEmail::",updateCandidateRegisterVerifyEmail);

                //     if (updateCandidateRegisterVerifyEmail) {
                //         var link = process.env.BASE_URL + "verify-email/" + crypto_token_data;
                //         // var link = "http://localhost:5000/" + "api/v1/candidate/verify-email/" + crypto_token_data;
                //         // console.log("link::",link);
                //         const mail_option = {
                //             filename: "candidate_register",
                //             data: link,
                //             subject: "Verify Your Email",
                //             user: {
                //                 email: user.candidate_third_form.email,
                //             },
                //         };
                //         commonResponse.success(res, 200, updateCandidateRegisterVerifyEmail, 'Verify Your Email link is sent to your registered email id');
                //         var send_mail = await mail.send(mail_option);
                //     } else {
                //         return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateCandidateRegisterVerifyEmail, 'Something went wrong, Please try again');
                //     }

                //     // jwt.sign(
                //     //     payload,
                //     //     process.env.JWT_SECRET,
                //     //     { expiresIn: process.env.EXPIRE_JWT_SECRET || "24h" },
                //     //     (err, token) => {
                //     //         commonResponse.success(res, 200, { candidate_detail: user.candidate_third_form, token: "Bearer " + token }, 'Candiate Signup Successfully');
                //     //     }
                //     // );
                // }
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, user, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
   *  Register New Candidate Through Recruiter
   */
    candidateRecruiterRegister: async (req, res, next) => {
        try {
            // Validations
            const valError = await validateRegister(req, res)
            if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);
            const errors = {}

            // return res.status(200).json({message:"Hello World"});
            // const { errors, isValid } = validateCandidateRegisterInput(req.body);

            // req.body.email = req.body.email.toLowerCase();
            let is_exist = await CandidateService.is_exist(req.body.email, { email: 1 });

            if (is_exist) {
                errors.email = "Email Id is Already Exist"
            }

            if (!req.body.attachments) {
                errors.attachments = "Please upload document"
            }

            // if (!isValid || !isEmpty(errors)) {
            if (!isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (req.body.password == undefined) {
                req.body.password = commonFunctions.randomPassword(8);
            }

            let candidate_details = await CandidateService.save(req.body, req.user);

            if (candidate_details) {
                // console.log("candidate_details::",candidate_details);
                //register user
                let is_exist_email_template =
                    await UserService.email_template_by_type('register_user_welcome_msg');
                if (!is_exist_email_template) {
                    is_exist_email_template = {};
                    is_exist_email_template.content = "Welcome to the Bluebix. I'm so glad you registred in Bluebix.";
                }

                let is_exist_footer_email_template =
                    await UserService.email_template_by_type('register_user_footer');
                if (!is_exist_footer_email_template) {
                    is_exist_footer_email_template = {};
                    is_exist_footer_email_template.content = "Best Regards, Bluebix Customer Support";
                }

                let email = candidate_details.email;
                let name = candidate_details.first_name + ' ' + candidate_details.last_name;


                let link = process.env.BASE_URL + "auth/login";
                var send_mail_data = {
                    link: link,
                    name: name,
                    email: email,
                    password: req.body.password,
                    role: 'Candidate',
                    content: is_exist_email_template.content,
                    footer_content: is_exist_footer_email_template.content,
                };

                const mail_option = {
                    filename: "user_register",
                    data: send_mail_data,
                    subject: "Register Email",
                    from_user_email: "test.knptech.2023@gmail.com",
                    from_user_password: "qufezstbbfkkxhid",
                    smtp_host: "smtp.gmail.com",
                    smtp_port: 465,
                    user: {
                        email: email
                    },
                };
                // const mail_option = {
                //     filename: "candidate_register",
                //     data:candidate_details,
                //     // data:req.body.message,
                //     subject:"",
                //     from_user_email:user_email_detail.email,
                //     from_user_password:user_password,
                //     smtp_host:user_email_detail.smtp_host,
                //     smtp_port:user_email_detail.smtp_port,
                //     user: {
                //         email:req.body.to
                //     },
                // };
                // var send_mail = await mail.send(mail_option);
                // commonResponse.success(res, 200, "email send", 'Email Send');
                // let payload = {
                //     _id: user._id,
                //     email: user.email,
                //     name: user.first_name + ' ' + user.last_name,
                //     mobile: user.mobile
                // };
                commonResponse.success(res, 200, candidate_details, 'Candidate Successfully Register');
                var send_mail = await mail.send(mail_option, req);

                // let crypto_token_data = crypto.randomBytes(20).toString('hex');

                // var token_data = {
                //     email_token: crypto_token_data,
                //     updated_at: Date.now()
                // };

                // let updateCandidateRegisterVerifyEmail = await CandidateService.update_email_token(token_data, user.email);
                // // console.log("updateCandidateRegisterVerifyEmail::",updateCandidateRegisterVerifyEmail);

                // if (updateCandidateRegisterVerifyEmail) {

                //     var link = "http://localhost:5000/" + "api/v1/candidate/verify-email/" + crypto_token_data;
                //     // console.log("link::",link);
                //     const mail_option = {
                //         filename: "candidate_register",
                //         data: link,
                //         subject: "Verify Your Email",
                //         user: {
                //             email: user.email,
                //         },
                //     };
                //     commonResponse.success(res, 200, updateCandidateRegisterVerifyEmail, 'Verify Your Email link is sent to your registered email id');
                //     var send_mail = await mail.send(mail_option);
                // } else {
                //     return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateCandidateRegisterVerifyEmail, 'Something went wrong, Please try again');
                // }

                // jwt.sign(
                //     payload,
                //     process.env.JWT_SECRET,
                //     { expiresIn: process.env.EXPIRE_JWT_SECRET || "24h" },
                //     (err, token) => {
                //         commonResponse.success(res, 201, { user_detail: user, token: "Bearer " + token }, 'Signup Successfully');
                //     }
                // );
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, {}, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  Login
    */
    candidateLogin: async (req, res, next) => {

        // const { errors, isValid } = validateCandidateLoginInput(req.body);
        // if (!isValid) {
        //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        // }

        // Valaidations
        const valError = await validateLogin(req, res)
        if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

        const errors = {}

        let is_email_verify = await CandidateService.is_email_verify(req.body.email);
        if (!is_email_verify) {
            errors.email = "Email is not Verified";
            return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        }

        let is_user = await CandidateService.is_exist_role(req.body.email);

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
                mobile: is_user.mobile
            };
            delete is_user.password
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


    /*
    *  All Candidate List
    */

    getAllCandidateList: async (req, res, next) => {
        try {

            let candidate_list = await CandidateService.candidatelist(req.body);

            if (candidate_list) {
                commonResponse.success(res, 200, candidate_list, 'All Candidate Listing Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Update Candidate Submission Status
    */
    candidateSubmissionStatusChange: async (req, res, next) => {
        try {
            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            let user = req.user;

            let is_exist_candidate = await CandidateService.is_exist_candidate(id);

            if (is_exist_candidate) {

                let updateCandidateStatus = await CandidateService.update_candidate_status(id, req.body, user);


                if (updateCandidateStatus) {
                    commonResponse.success(res, 200, updateCandidateStatus, 'Candidate Status Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateCandidateStatus, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "Candidate_Status", 400, {}, "Candidate does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Get Detail Candidate Profile By Id
    */
    getCandidateProfileDetails: async (req, res, next) => {
        try {

            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }

            let candidate_profile_details = await CandidateService.get(req.params.id, req.user);

            if (candidate_profile_details) {
                commonResponse.success(res, 200, candidate_profile_details, 'Candidate Profile Details');
            } else {

                // if (candidate_profile_details == false) {
                //     return commonResponse.customResponse(res, "User_Profile", 400, candidate_profile_details, "Candidate does not exist");
                // }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_profile_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  Candidate Profile Update By Id
    */
    updateCandidateProfile: async (req, res, next) => {
        try {

            let id = req.params.id;

            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }

            let user = req.user;

            let url = req.originalUrl.split('/');

            let is_exist_user = await CandidateService.is_exist_candidate(id);

            if (is_exist_user) {

                // const { errors, isValid } = validateCandidateRegisterInput(req.body, url[4]);

                // Valaidations
                const valError = await validateRegister(req, res, url[4])
                if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);
                const errors = {}

                let is_exist_email = await CandidateService.is_exist(req.body.email, { email: 1 });

                if (is_exist_email && isEmpty(errors.email) && is_exist_email._id != id) {
                    errors.email = "Email Id Already Exists"
                }

                if (!isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                let updateCandidateProfile = await CandidateService.update(id, req.body, user);

                if (updateCandidateProfile) {
                    commonResponse.success(res, 200, updateCandidateProfile, 'Candidate Profile Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateCandidateProfile, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user, "Candidate does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  Candidate Profile Details form 1 Update By Id
    */
    updateCandidateProfileDetails: async (req, res, next) => {
        try {

            let id = req.params.id;

            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }

            let user = req.user;
            var url = req.originalUrl.split('/');

            let is_exist_user = await CandidateService.is_exist_candidate(id);

            if (is_exist_user) {

                // const { errors, isValid } = validateDirectCandidateRegisterInput(req.body, url[4]);

                // Validations
                const valError = await validateDirectCandidateRegister(req, res, url[4])
                if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);
                const errors = {}

                let is_exist_email = await CandidateService.is_exist(req.body.email, { email: 1 });

                if (is_exist_email && isEmpty(errors.email) && is_exist_email._id != id) {
                    errors.email = "Email Id is Already Exist"
                }

                if (!isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }
                let updateCandidateProfileDetails = await CandidateService.update_candidate_profile(id, req.body, is_exist_user, user);

                if (updateCandidateProfileDetails) {
                    commonResponse.success(res, 200, updateCandidateProfileDetails, 'Candidate Profile Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateCandidateProfileDetails, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user, "Candidate does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  Candidate Personal Details DOB,gender like fields Update By Id
    */
    updateCandidatePersonalDetails: async (req, res, next) => {
        try {

            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user;
            var url = req.originalUrl.split('/');

            let is_exist_user = await CandidateService.is_exist_candidate(id);

            if (is_exist_user) {

                // Validations
                const valError = await validateCandidatePersonalDetails(req, res)
                if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);
                const errors = {}

                // const { errors, isValid } = validateCandidatePersonalDetailsInput(req.body);

                // if (!isValid || !isEmpty(errors)) {
                //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                // }

                let updateCandidatePersonalDetails = await CandidateService.update_candidate_personal_detail(id, req.body, is_exist_user, user);

                if (updateCandidatePersonalDetails) {
                    commonResponse.success(res, 200, updateCandidatePersonalDetails, 'Candidate Personal Details Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateCandidatePersonalDetails, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user, "Candidate does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  Candidate Career Profile Details Job Category,Role,Desired Job Type like fields Update By Id
    */
    updateCandidateCareerProfileDetails: async (req, res, next) => {
        try {

            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }



            let user = req.user;
            var url = req.originalUrl.split('/');

            let is_exist_user = await CandidateService.is_exist_candidate(id);

            if (is_exist_user) {


                const { errors, isValid } = validateCandidateCareerDetailsInput(req.body);

                if (!isValid || !isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                let updateCandidateCareerProfileDetails = await CandidateService.update_candidate_career_profile(id, req.body, is_exist_user, user);

                if (updateCandidateCareerProfileDetails) {
                    commonResponse.success(res, 200, updateCandidateCareerProfileDetails, 'Candidate Career Profile Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateCandidateCareerProfileDetails, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user, "Candidate does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },



    /*
     *  Candidate Profile Summary  Details attachments,profile summary like fields Update By Id
    */
    updateCandidateProfileSummaryDetails: async (req, res, next) => {
        try {

            let id = req.params.id;


            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user;
            const url = req.originalUrl.split('/');

            let is_exist_user = await CandidateService.is_exist_candidate(id);


            if (is_exist_user) {

                let updateCandidateSummaryProfileDetails = await CandidateService.update_candidate_summary_profile(id, req.body, is_exist_user, user);




                if (updateCandidateSummaryProfileDetails) {
                    commonResponse.success(res, 200, updateCandidateSummaryProfileDetails, 'Candidate Summary Profile Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateCandidateSummaryProfileDetails, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user, "Candidate does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Delete Candidate Profile By Id
    */
    deleteCandidateProfile: async (req, res, next) => {
        try {
            let id = req.params.id;

            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }

            let user = req.user._id;

            let delete_candidate_profile = await CandidateService.delete(id, user);
            if (delete_candidate_profile) {
                commonResponse.success(res, 200, delete_candidate_profile, 'Candidate Profile Deleted Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_candidate_profile, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
 *   Delete User Profile Image
 */
    deleteUserProfileImage: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user;

            let delete_user_profile = await UserService.delete_profile_image(user);
            if (delete_user_profile) {
                console.log('x', delete_user_profile);
                commonResponse.success(res, 200, delete_user_profile, 'Candidate Profile Image Deleted Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_user_profile, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Delete Employee Profile Details By Id
    */
    deleteEmployeeProfileDetails: async (req, res, next) => {
        try {
            let id = req.params.id;

            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }
            // let user = req.user._id;

            let delete_employee_details_profile = await CandidateService.delete_employee_details(id, req.body);

            if (delete_employee_details_profile) {
                commonResponse.success(res, 200, delete_employee_details_profile, 'Employee Details Deleted Successfully');
            } else {
                if (delete_employee_details_profile == false) {
                    return commonResponse.customResponse(res, "Employee_Profile", 400, delete_employee_details_profile, "Employee Details does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_employee_details_profile, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Delete Employee Qualification Profile Details By Id
    */
    deleteEmployeeQualificationProfileDetails: async (req, res, next) => {
        try {
            let id = req.params.id;

            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }

            // let user = req.user._id;

            let delete_qualification_details_profile = await CandidateService.delete_qualification_details(id, req.body);
            if (delete_qualification_details_profile) {
                commonResponse.success(res, 200, delete_qualification_details_profile, 'Qualification Details Profile Deleted Successfully');
            } else {
                if (delete_qualification_details_profile == false) {
                    return commonResponse.customResponse(res, "Candidate_Profile", 400, delete_qualification_details_profile, "Qualification Details does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_qualification_details_profile, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Delete Candidate IT Skills Details By Id
    */
    deleteCandidateITSkillsDetails: async (req, res, next) => {
        try {
            let id = req.params.id;

            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }

            // let user = req.user._id;

            let delete_it_skills = await CandidateService.delete_it_skill_details(id, req.body);
            if (delete_it_skills) {
                commonResponse.success(res, 200, delete_it_skills, 'Candidate IT Skill Deleted Successfully');
            } else {
                if (delete_it_skills == false) {
                    return commonResponse.customResponse(res, "Candidate_Profile", 400, delete_it_skills, "Candidate IT Skill does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_it_skills, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },



    /*
     * Candidate Password Change
    */
    candidatePasswordChange: async (req, res, next) => {
        try {

            if (!req.user || req.user.profile) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            const { errors, isValid } = validateChangePassword(req.body, 'candidate');

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            // let id = mongoose.Types.ObjectId()

            let is_exist_user = await CandidateService.is_exist_candidate(req.body.candidate_id);

            if (is_exist_user) {

                let password_match = await commonFunctions.matchPassword(req.body.current_password, is_exist_user.password);

                if (password_match) {

                    let updateCandidatePassword = await CandidateService.change_candidate_password(req.body, user);

                    if (updateCandidatePassword) {
                        commonResponse.success(res, 200, updateCandidatePassword, 'Your Password Successfully Changed');
                    } else {
                        return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateCandidatePassword, 'Something went wrong, Please try again');
                    }

                } else {
                    errors.current_password = "Current Password is Wrong";
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }


            } else {
                return commonResponse.customResponse(res, "Candidate_Profile", 400, is_exist_user, "Candidate does not exist");
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    candidateForgotPassword: async (req, res, next) => {
        try {
            const email = req.body.email;


            const { errors, isValid } = validateForgotPasswordInput(req.body);

            const is_exist = await CandidateService.is_exist(email, { first_name: 1, last_name: 1 });


            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (is_exist) {

                const token_fun = async (data) => {
                    const token_data = {
                        reset_password_token: data,
                        reset_password_expires: Date.now() + 60 * 60 * 24 * 1000,
                        updated_at: Date.now(),
                        // updated_by: user
                    };

                    const updateUserForgotpassword = await CandidateService.update_token(token_data, email);

                    if (updateUserForgotpassword) {
                        let is_exist_email_template =
                            await UserService.forgot_password_email_template_exists({ content: 1 });

                        if (!is_exist_email_template) {
                            is_exist_email_template = {};
                            is_exist_email_template.content = "Reset Your Password";
                        }

                        let is_exist_footer_email_template =
                            await UserService.footer_email_template_exists({ content: 1 });
                        if (!is_exist_footer_email_template) {
                            is_exist_footer_email_template = {};
                            is_exist_footer_email_template.content = "Best Regards, Bluebix Customer Support";
                        }
                        const link = process.env.BASE_URL + "auth/reset-password/" + data + "?role=candidate";
                        const send_mail_data = {
                            link: link,
                            name: is_exist.first_name + " " + is_exist.last_name,
                            content: is_exist_email_template.content,
                            footer_content: is_exist_footer_email_template.content,

                        };

                        // var link = "http://localhost:3000/" + "reset-password/" + data;
                        // const mail_option = {
                        //     filename: "reset_password",
                        //     data: send_mail_data,
                        //     subject: "Forgot Password Link",
                        //     from_user_email:"492b1a961fc7dc",
                        //     from_user_password:"ef28324d337590",
                        //     smtp_host:"sandbox.smtp.mailtrap.io",
                        //     smtp_port:2525,
                        //     user: {
                        //         email: email,
                        //     },
                        // };

                        const mail_option = {
                            filename: "reset_password",
                            data: send_mail_data,
                            subject: "Forgot Password Link",
                            from_user_email: "test.knptech.2023@gmail.com",
                            from_user_password: "qufezstbbfkkxhid",
                            smtp_host: "smtp.gmail.com",
                            smtp_port: 465,
                            user: {
                                email: email
                            },
                        };

                        commonResponse.success(res, 200, updateUserForgotpassword, 'Forgot Password Link is sent to your registered email id');
                        const send_mail = await mail.send(mail_option, req);
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
                // var error = {};
                errors.email = "Candidate does not exists with this Email Id";
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    candidateResetPassword: async (req, res, next) => {
        try {
            const token = req.body.token;
            // let user = req.user._id;

            //check token is exist or not
            let is_exist_user_token = await CandidateService.is_exist_user_token(token);
            const { errors, isValid } = validateResetPasswordInput(req.body);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (is_exist_user_token) {

                //reset passowrd
                let user_password_reset = await CandidateService.user_password_reset(req.body);

                if (user_password_reset) {
                    commonResponse.success(res, 200, user_password_reset, 'Your Password Successfully Changed');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateUserProfile, 'Something went wrong, Please try again');
                }
            } else {
                // var error = {};
                errors.token = 'Token is invalid or has expired.';
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

        } catch (e) {
            console.log("E", e);
        }
    },

    /*
    *   Verify Candidate Email at Register time
    */
    candidateRegisterVerifyEmail: async (req, res, next) => {
        try {
            let token = req.body.token;

            const { errors, isValid } = validateVerifyEmail(req.body);

            if (!isValid) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let is_candidate_email_token = await CandidateService.candidate_email_token(token);

            if (is_candidate_email_token) {

                let candidate_email_verify = await CandidateService.candidate_email_verify(token);

                if (candidate_email_verify.email_verify) {

                    let payload = {
                        _id: candidate_email_verify.candidate_details._id,
                        email: candidate_email_verify.candidate_details.email,
                        name: candidate_email_verify.candidate_details.first_name + ' ' + candidate_email_verify.candidate_details.last_name,
                        mobile: candidate_email_verify.candidate_details.mobile
                    };

                    jwt.sign(
                        payload,
                        process.env.JWT_SECRET,
                        { expiresIn: process.env.EXPIRE_JWT_SECRET || "24h" },
                        (err, token) => {
                            commonResponse.success(res, 200, { candidate_detail: candidate_email_verify.candidate_details, token: "Bearer " + token }, 'Candiate Signup Successfully');
                        }
                    );
                    // commonResponse.success(res, 200, candidate_email_verify, 'Your Email is Successfully Verify');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_email_verify.email_verify, 'Something went wrong, Please try again');
                }
            } else {
                // var errors = {};
                errors.token = 'Token is invalid.';
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Candidate Employee Details Register 
    */
    candidateEmployeeDetailsRegister: async (req, res, next) => {
        try {
            const valError = await validateEmployeeDetails(req, res)
            if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

            const errors = {}
            // const { errors, isValid } = validateEmployeeDetailsInput(req.body);
            // if (!isValid || !isEmpty(errors)) {
            //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            // }

            let is_exist_user_employee = await CandidateService.is_exist_candidate_in_employee(req.body.id);


            let employee_details_save = await CandidateService.save_employee_details(req.body, is_exist_user_employee);
            if (employee_details_save) {
                commonResponse.success(res, 200, employee_details_save, 'Employee Details Successfully Saved');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, employee_details_save, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Candidate Qualification Details Register 
    */
    candidateQualificationDetailsRegister: async (req, res, next) => {
        try {

            // Validations
            const valError = await validateQualificationDetails(req, res)
            if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

            const errors = {}

            // const { errors, isValid } = validateQualificationDetailsInput(req.body);

            // if (!isEmpty(errors)) {
            //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            // }

            let is_exist_user_qualification = await CandidateService.is_exist_candidate_in_qualification(req.body.id);

            let qualification_details_save = await CandidateService.save_qualification_details(req.body, is_exist_user_qualification);
            if (qualification_details_save) {
                commonResponse.success(res, 200, qualification_details_save, 'Candidate Qualification Details Successfully Saved');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, qualification_details_save, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Candidate IT Skills Details Register 
    */
    candidateITSkillDetailsRegister: async (req, res, next) => {
        try {

            // Validations
            const valError = await validateITSkills(req, res)
            if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);
            const errors = {}

            // const { errors, isValid } = validateCandidateITSkillsDetailsInput(req.body);

            // if (!isValid || !isEmpty(errors)) {
            //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            // }

            let is_exist_user_it_skills = await CandidateService.is_exist_candidate_with_it_skills(req.body.id);

            let candidate_it_skill_details_save = await CandidateService.save_candidate_it_skill_details(req.body, is_exist_user_it_skills);
            if (candidate_it_skill_details_save) {
                commonResponse.success(res, 200, candidate_it_skill_details_save, 'Candidate IT Skills Details Successfully Saved');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_it_skill_details_save, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },



    /*
    *   Update Candidate Employee Details 
    */
    updateCandidateEmployeeDetails: async (req, res, next) => {
        try {

            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }

            let user = req.user;

            let is_exist_user_employee = await CandidateService.is_exist_candidate_in_employee(req.params.id);

            if (is_exist_user_employee) {

                var url = req.originalUrl.split('/');

                // const { errors, isValid } = validateEmployeeDetailsInput(req.body, url[5]);
                const valError = await validateEmployeeDetails(req, res, url[5])
                if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

                const errors = {}

                // if (!isValid || !isEmpty(errors)) {
                //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                // }

                let update_employee_details = await CandidateService.update_employee_details(req.body, user);
                if (update_employee_details) {
                    commonResponse.success(res, 200, update_employee_details, 'Candidate Employee Details Successfully Updated');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, update_employee_details, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user_employee, "Candidate does not exist");
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Update Candidate Qualification Details
    */
    updateCandidateQualificationDetails: async (req, res, next) => {
        try {


            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }

            let user = req.user;

            let is_exist_user_qualification = await CandidateService.is_exist_candidate_in_qualification(req.params.id);

            if (is_exist_user_qualification) {

                var url = req.originalUrl.split('/');

                // const { errors, isValid } = validateQualificationDetailsInput(req.body, url[5]);

                // Validations
                const valError = await validateQualificationDetails(req, res, url[5])
                if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

                const errors = {}

                // if (!isValid || !isEmpty(errors)) {
                //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                // }

                let update_qualification_details = await CandidateService.update_qualification_details(req.body, user);
                if (update_qualification_details) {
                    commonResponse.success(res, 200, update_qualification_details, 'Candidate Qualification Details Successfully Updated');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, update_qualification_details, 'Something went wrong, Please try again');
                }

            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user_qualification, "Candidate does not exist");
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Update Candidate IT Skills Details
    */
    updateCandidateITSkillsDetails: async (req, res, next) => {
        try {

            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }

            let user = req.user;

            let is_exist_user_it_skills = await CandidateService.is_exist_candidate_with_it_skills(req.params.id);

            if (is_exist_user_it_skills) {

                var url = req.originalUrl.split('/');

                // const { errors, isValid } = validateCandidateITSkillsDetailsInput(req.body, url[5]);

                // Validations
                const valError = await validateITSkills(req, res, url[5])
                if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);
                const errors = {}


                // if (!isValid || !isEmpty(errors)) {
                //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                // }

                let update_candidate_it_skill_details = await CandidateService.update_it_skills_details(req.body, user);
                if (update_candidate_it_skill_details) {
                    commonResponse.success(res, 200, update_candidate_it_skill_details, 'Candidate IT Skills Successfully Updated');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, update_candidate_it_skill_details, 'Something went wrong, Please try again');
                }

            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user_it_skills, "Candidate does not exist");
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Candidate ShortList Details By Candidate Id
    */
    candidateShortListDetails: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let candidate_details = await CandidateService.shortlist_candidate_details(req.body);

            if (candidate_details) {
                commonResponse.success(res, 200, candidate_details, 'Candidate Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Candidate Show All Job Opening List
    */
    candidateShowAllJobOpeningList: async (req, res, next) => {
        try {

            if (req.body.candidate_id == '' || req.body.candidate_id == undefined) {
                return commonResponse.customErrorResponse(res, 401, "Candidate Id is required", "Candidate Id is required");
            }

            let candidate_details = await CandidateService.all_job_opening_list(req.body);

            if (candidate_details) {
                commonResponse.success(res, 200, candidate_details, 'Candidate Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Candidate Job Opening Wise City List Dropdown
    */
    candidateJobOpeningWiseCityList: async (req, res, next) => {
        try {

            let city_list = await CandidateService.job_opening_city_list();

            if (city_list) {
                commonResponse.success(res, 200, city_list, 'City List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, city_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Candidate Job Opening Wise Category List Dropdown
    */
    candidateJobOpeningWiseCategoryList: async (req, res, next) => {
        try {


            let category_list = await CandidateService.job_opening_category_list();

            if (category_list) {
                commonResponse.success(res, 200, category_list, 'Category List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, category_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*Candidate Apply Jobs*/
    applyJobs: async (req, res, next) => {
        try {

            const { errors, isValid } = validateDirectCandidateApplyJobInput(req.body);

            /*   let findRecruiter = await CandidateService.find_recruiter(req.body);
  
              if(isEmpty(findRecruiter)){
                  errors.exists = "Recruiter not found."
              }
               if(findRecruiter) {
              req.body.recruiter_id = findRecruiter['recruiter_id'].toString();;
          }*/

            let is_exist = await CandidateService.is_exist_job_apply_request(req.body);
            if (is_exist) {
                errors.exists = "Job Apply Request already sent."
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let jobapplyresult = await CandidateService.JobApply(req.body);

            if (jobapplyresult) {
                commonResponse.success(res, 201, jobapplyresult, 'Successfully applied for this job');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobapplyresult, 'Something went wrong, Please try again');
            }

        } catch (error) {
            console.log("Apply Jobs -> ", error);
            return next(error);
        }

    },

    /*
*  All List Candidates who has applied for jobs
*/
    listCandidates: async (req, res, next) => {
        try {

            let candidate_listing = await CandidateService.candidate_listing(
                req.body
            );

            if (candidate_listing) {
                commonResponse.success(
                    res,
                    200,
                    candidate_listing,
                    "All candidates list with job applied"
                );
            } else {
                return commonResponse.customResponse(
                    res,
                    "SERVER_ERROR",
                    400,
                    candidate_listing,
                    "Something went wrong, Please try again"
                );
            }
        } catch (error) {
            console.log("Listing candidates -> ", error);
            return next(error);
        }
    },

    //save jobs
    savedJob: async (req, res, next) => {
        try {
            const { errors, isValid } = validateJobSavedInput(req.body);

            let is_exist = await CandidateService.is_exist_job_saved_request(req.body);
            if (is_exist) {
                errors.exists = "Job is already saved by the candidate."
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }
            let savedJobDetails = await CandidateService.save_job(
                req.body
            );
            if (savedJobDetails) {
                commonResponse.success(
                    res,
                    200,
                    savedJobDetails,
                    "Job saved successfully"
                );
            } else {
                return commonResponse.customResponse(
                    res,
                    "SERVER_ERROR",
                    400,
                    savedJobDetails,
                    "Something went wrong, Please try again"
                );
            }

        } catch (error) {
            console.error("Error", error);
            next(error);
        }
    },

    /*
  *   Delete job saved
  */
    deleteJobSaved: async (req, res, next) => {
        try {
            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            let delete_save_job = await CandidateService.deleteJobs(id, user);
            if (delete_save_job) {
                commonResponse.success(res, 200, delete_save_job, 'Saved Job Deleted Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_save_job, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Delete save job -> ", error);
            return next(error);
        }
    },

    saved_job_list: async (req, res, next) => {
        try {
            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            let savedJobList = await CandidateService.job_saved_list(user);
            if (savedJobList) {
                commonResponse.success(res, 200, savedJobList, 'List of saved jobs');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, savedJobList, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("save job list -> ", error);
            return next(error);
        }
    },

    reportListSubmissions: async (req, res, next) => {
        try {
            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            let reportList = await CandidateService.reportListSubmissions(req.body);
            if (reportList) {
                commonResponse.success(res, 200, reportList, 'List of candidate submissions');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, reportList, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("save job list -> ", error);
            return next(error);
        }
    },

    fetchCandidatesFromMonster: async (req, res, next) => {
        try {
            const catToken = process.env.CAT_TOKEN;
            const version = 2.0;
            const url = ` https://prsx.monster.com/query.ashx?
                    &ver=${version}
                    &cat=${catToken}
                    &jt=programmer
                    &sk=php
                    $page=1
                    `;

            // xml
            const response = await axios(url);
            console.log(response);

            // convert into json
            if (response) {
                const result = await xmlToJs.parseStringPromise(response);

                console.log('after coversion', result);
            }
        }
        catch (error) {
            console.log("Fetch candidates from monster", error);
            return next(error);
        }
    }

};