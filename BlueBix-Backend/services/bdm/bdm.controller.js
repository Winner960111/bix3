const BdmService = require("./bdm.services");
const { commonResponse, commonFunctions } = require("../../helper");
const validateBdmRegisterInput = require("../../validations/admin/bdm/bdmRegister");
const { validateLoginInput, validateLogin } = require("../../validations/admin/user/login");
// const validateUserTypeInput = require("../../validations/admin/user/usertype");
const validateForgotPasswordInput = require("../../validations/admin/user/forgotPassword");
const validateResetPasswordInput = require("../../validations/admin/user/resetPassword");
const mail = require("../../helper/email/index");
const isEmpty = require("../../validations/is-empty");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");



module.exports = {

    /*
    *  Register New User
    */
    bdmRegister: async (req, res, next) => {
        try {
            const { errors, isValid } = validateBdmRegisterInput(req.body);

            req.body.email = req.body.email.toLowerCase();
            let is_exist = await BdmService.is_exist(req.body.email);

            if (is_exist) {
                errors.email = "Email Id is Already Exist"
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let user = await BdmService.save(req.body);

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
    bdmLogin: async (req, res, next) => {

        const valError = await validateLogin(req, res)
        if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);
        const errors = {}

        // const { errors, isValid } = validateLoginInput(req.body);

        // if (!isValid) {
        //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        // }

        let is_user = await BdmService.is_exist_role(req.body.email, req.body.role);

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
    *  BDM List
    */

    getAllBdmList: async (req, res, next) => {
        try {

            let bdm_list = await BdmService.bdmlist(req.body);

            if (bdm_list) {
                commonResponse.success(res, 200, bdm_list, 'All BDM Listing Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, bdm_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Get Detail User Profile By Id
    */
    getBdmProfileDetails: async (req, res, next) => {
        try {
            let bdm_profile_details = await BdmService.get(req.params.id);
            if (bdm_profile_details) {
                commonResponse.success(res, 200, bdm_profile_details, 'User Profile Details');
            } else {
                if (bdm_profile_details == false) {
                    return commonResponse.customResponse(res, "User_Profile", 400, bdm_profile_details, "BDM does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, bdm_profile_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  User Profile Update Job By Id
    */
    updateBdmProfile: async (req, res, next) => {
        try {
            let id = req.params.id;
            var url = req.originalUrl.split('/');

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            let user = req.user._id;

            let is_exist_user = await BdmService.is_exist_user(id);

            if (is_exist_user) {

                const { errors, isValid } = validateBdmRegisterInput(req.body, url[4]);

                let is_exist_email = await BdmService.is_exist(req.body.email);

                if (is_exist_email && isEmpty(errors.email) && is_exist_email._id != id) {
                    errors.email = "Email Id is Already Exist"
                }

                if (!isValid || !isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                let updateUserProfile = await BdmService.update(id, req.body, user);

                if (updateUserProfile) {
                    commonResponse.success(res, 200, updateUserProfile, 'BDM Profile Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateUserProfile, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, {}, "BDM does not exist");
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

    bdmForgotPassword: async (req, res, next) => {
        try {
            var email = req.body.email;
            let user = req.user._id;

            const { errors, isValid } = validateForgotPasswordInput(req.body);

            let is_exist = await BdmService.is_exist(req.body.email);

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

                    let updateUserForgotpassword = await BdmService.update_token(token_data, email);

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

    bdmResetPassword: async (req, res, next) => {
        try {
            let token = req.body.token;
            let user = req.user._id;

            //check token is exist or not
            let is_exist_user_token = await BdmService.is_exist_user_token(req.body.token);
            const { errors, isValid } = validateResetPasswordInput(req.body);



            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (is_exist_user_token) {

                //reset passowrd
                let user_password_reset = await BdmService.user_password_reset(req.body, user);

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

    statusCount: async (req, res, next) => {
        try {
            let statusCountDetails = await BdmService.count_jobopen_status(
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
            let statusDetails = await BdmService.jobopen_status(
                req.body
            );

            if (statusDetails) {
                commonResponse.success(res, 200, statusDetails, "Count Details");
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

    getFreelancerList: async (req, res, next) => {
        try {
            let statusCountDetails = await BdmService.freelancer_list();

            if (statusCountDetails) {
                commonResponse.success(res, 200, statusCountDetails, "Freelancer list");
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

    updateJobSubmissionViewStatusByBdmCount: async (req, res, next) => {
        try {
            let bdm_id = req.body.bdm_id;
            let opening_id = req.body.opening_id;

            if (bdm_id == '' || bdm_id == undefined) {
                return commonResponse.customResponse(
                    res,
                    "SERVER_ERROR",
                    400,
                    '',
                    "BDM Id field is required."
                );
            }

            if (opening_id == '' || opening_id == undefined) {
                return commonResponse.customResponse(
                    res,
                    "SERVER_ERROR",
                    400,
                    '',
                    "Opening Id field is required."
                );
            }

            let statusCountDetails = await BdmService.update_job_submission_view_status_by_bdm(
                req.body
            );

            if (statusCountDetails) {
                commonResponse.success(res, 200, statusCountDetails, "Status updated successfully.");
            } else {
                return commonResponse.customResponse(
                    res,
                    "SERVER_ERROR",
                    400,
                    statusCountDetails,
                    "No matching data with jobs"
                );
            }
        } catch (error) {
            console.error("Error", error);
            next(error);
        }
    },

};
