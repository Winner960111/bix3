const UserService = require("./users.services");
const { commonResponse, commonFunctions } = require("../../helper");
const { validateRegisterInput, validateRegister } = require("../../validations/admin/user/userRegister");
const { validateLoginInput, validateLogin } = require("../../validations/admin/user/login");
const validateDashBoardInput = require("../../validations/admin/user/dashboard");
const validatePrimaryRecruitInput = require("../../validations/admin/jobopening/primaryRecruiter");
const validateChangePassword = require("../../validations/admin/user/changePassword");

const validateUserTypeInput = require("../../validations/admin/user/usertype");
const validateForgotPasswordInput = require("../../validations/admin/user/forgotPassword");
const validateResetPasswordInput = require("../../validations/admin/user/resetPassword");
const mail = require("../../helper/email/index");
const isEmpty = require("../../validations/is-empty");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RoleModel = require("../roles/roles.model");
const { simpleParser } = require("mailparser");
const EmailActivity = require("../emailactivity/emailactivity.model");
const Imap = require("imap");
const Candidate = require("../candidate/candidate.model");
const User = require("../users/users.model");
const CandidateQualification = require("../candidate/qualification.model");
const Employee = require("../candidate/employee.model");
const JobApplyings = require("../jobapplying/jobapplying.model");
const JobSaved = require("../jobsaved/jobsaved.model");
const CandidateITSkills = require("../candidate/itskills.model");
const CandidateSubmission = require("../jobopening/submission.model");

module.exports = {

    /*
    *  Register New User
    */
    userRegister: async (req, res, next) => {
        try {
            // const { errors, isValid } = validateLoginInput(req.body);

            // Valaidations
            const valError = await validateRegister(req, res)
            // const valError = await validateRegister(req, res)
            if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

            const errors = {}

            req.body.email = req.body.email.toLowerCase();
            let is_exist = await UserService.is_exist_email(req.body.email);
            let is_exist_login_email = await UserService.is_exist_login_email(req.body.login_email);

            if (is_exist) {
                errors.email = "Email Id is Already Exist"
            }

            if (is_exist_login_email) {
                errors.login_email = "Login Email Id is Already Exist"
            }

            if (!isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (req.body.password == undefined) {
                req.body.password = commonFunctions.randomPassword(8);
            }


            let user = await UserService.save(req.body);
            let role_id = await RoleModel.findOne({ _id: user.assigned_role }, { role_name: 1 }).lean();

            if (user) {
                let link = process.env.BASE_URL + 'auth/login';
                if (role_id) {
                    // //send email
                    // if (role_id.role_name == "admin") {
                    //     link = process.env.BASE_URL + "bluebix-demo/auth/admin/login";
                    // }
                    // if (role_id.role_name == "bdm") {
                    //     link = process.env.BASE_URL + "bluebix-demo/auth/bdm/login";
                    // }
                    // if (role_id.role_name == "recruiter") {
                    //     link = process.env.BASE_URL + "bluebix-demo/auth/recruiter/login";
                    // }
                    // if (role_id.role_name == "freelancerecruiter") {
                    //     link = process.env.BASE_URL + "bluebix-demo/auth/freelanceRecruiter/login";
                    // }

                }

                let email = user.email;
                let name = user.display_name;

                // set email notifications, bdm for now
                if (role_id.role_name == "bdm") {
                    const arr = [
                        {
                            email_type: 'job_created',
                            description: "On New Job Creation"
                        },
                        {
                            email_type: 'job_requested',
                            description: "Freelancer Job Request"
                        },
                        {
                            email_type: 'job_assigned',
                            description: "On Job Assignment"
                        },
                        {
                            email_type: 'client_created',
                            description: "On Client Creation"
                        },
                        {
                            email_type: 'client_assigned',
                            description: "On Client Assignment"
                        },
                        {
                            email_type: 'candidate_submitted',
                            description: "On Candidate Submission"
                        }
                    ];
                    arr.forEach(async elm => await EmailActivity.create({
                        user_id: user._id,
                        ...elm,
                        status: true
                    }))
                }



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

                let formattedRole = role_id.role_name
                    ? role_id.role_name === 'bdm'
                        ? role_id.role_name.toUpperCase()
                        : role_id.role_name.charAt(0).toUpperCase() + role_id.role_name.substr(1)
                    : '';

                var send_mail_data = {
                    link: link,
                    name: name,
                    email: email,
                    password: req.body.password,
                    role: formattedRole,
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
                    _id: user._id,
                    email: user.email,
                    display_name: user.display_name,
                    profile: user.profile,
                    assigned_role: role_id
                };

                // console.log("payload::", payload);
                jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.EXPIRE_JWT_SECRET || "24h" },
                    (err, token) => {
                        commonResponse.success(res, 201, { user_detail: user, token: "Bearer " + token }, 'Signup Successfully');
                    }
                );
                var send_mail = await mail.send(mail_option, req);
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
     * Reporting Manager User List
    */
    userReportingManagerList: async (req, res, next) => {
        try {

            let user_list_reporting_manager = await UserService.list_reporting_manager();

            if (user_list_reporting_manager) {
                commonResponse.success(res, 200, user_list_reporting_manager, 'User Reporting Manager List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, user_list_reporting_manager, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
     * User Role List
    */
    userRoleList: async (req, res, next) => {
        try {

            let user_role_list = await UserService.user_role_list();

            if (user_role_list) {
                commonResponse.success(res, 200, user_role_list, 'User Role List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, user_role_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
     * ALL User List
    */
    allUserList: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            let all_user_list = await UserService.user_list(req.body, user);

            if (all_user_list) {
                commonResponse.success(res, 200, all_user_list, 'All User List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, all_user_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
     * ALL User Profile List for dropdown only display _id and display_name
    */

    allUserProfileList: async (req, res, next) => {
        try {

            let all_user_list = await UserService.all_user_profile_list(req.body);

            if (all_user_list) {
                commonResponse.success(res, 200, all_user_list, 'All User List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, all_user_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
     * ALL User List with different role  wise 
    */
    dashboardUserList: async (req, res, next) => {
        try {

            const { errors, isValid } = validateDashBoardInput(req.body);

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let dashboard_list = await UserService.dashbaord_list(req.body, req.user);

            if (dashboard_list) {
                commonResponse.success(res, 200, dashboard_list, 'Dashboard User List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, dashboard_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
     * Latest Five Candidate List For Dashboard 
    */
    dashboardLatestCandidateList: async (req, res, next) => {
        try {


            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;


            let latest_five_candidate_list = await UserService.latest_candidate_dashbaord_list(req.body);

            if (latest_five_candidate_list) {
                commonResponse.success(res, 200, latest_five_candidate_list, 'Latest Five Candidate List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, latest_five_candidate_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  Login
    */
    userLogin: async (req, res, next) => {

        // const { errors, isValid } = validateLoginInput(req.body);

        // if (!isValid) {
        //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        // }

        // Valaidations
        const valError = await validateLogin(req, res)
        if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

        const errors = {}

        let is_user = await UserService.is_exist_role(req.body.email, req.body.profile);

        if (!is_user) {
            errors.email = "Invalid Email Or Profile";
            return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        }

        let password_match = await commonFunctions.matchPassword(req.body.password, is_user.password);

        let role_id = await RoleModel.findOne({ _id: is_user.assigned_role }, { role_name: 1 }).lean();

        if (password_match) {

            const payload = {
                _id: is_user._id,
                email: is_user.email,
                name: is_user.display_name,
                profile: is_user.profile,
                assigned_role: role_id

            };
            if (is_user.candidate_id) {
                is_user._id = is_user.candidate_id
            }

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
    *   Get Detail Admin Profile By Id
    */
    getUserProfileDetails: async (req, res, next) => {
        try {

            let user_profile_details = await UserService.get(req.params.id);

            if (user_profile_details) {
                commonResponse.success(res, 200, user_profile_details, 'User Profile Details');
            } else {
                if (user_profile_details == false) {
                    return commonResponse.customResponse(res, "User_Profile", 400, user_profile_details, "User does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, user_profile_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },



    /*
    *  Admin Profile Update Job By Id
    */
    updateUserProfile: async (req, res, next) => {
        try {
            let id = req.params.id;


            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;
            var url = req.originalUrl.split('/');
            let is_exist_user = await UserService.is_exist_user(id);

            if (is_exist_user) {

                // Valaidations
                const valError = await validateRegister(req, res, url[4])
                if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

                const errors = {}

                // const { errors, isValid } = validateRegisterInput(req.body, url[4]);

                let is_exist_email = await UserService.is_exist_email(req.body.email);
                let is_exist_login_email = await UserService.is_exist_login_email(req.body.login_email);


                if (is_exist_email && isEmpty(errors.email) && is_exist_email._id != id) {
                    errors.email = "Email Id is Already Exist"
                }

                if (is_exist_login_email && isEmpty(errors.login_email) && is_exist_login_email._id != id) {
                    errors.login_email = "Login Email Id is Already Exist"
                }

                if (!isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                let updateUserProfile = await UserService.update(id, req.body, is_exist_user, user);

                if (updateUserProfile) {
                    commonResponse.success(res, 200, updateUserProfile, 'User Profile Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateUserProfile, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user, "User does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },



    /*
    *   Delete User By Id
    */
    deleteUserProfile: async (req, res, next) => {
        try {
            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            let delete_user_profile = await UserService.delete(id, user);
            if (delete_user_profile) {
                commonResponse.success(res, 200, delete_user_profile, 'User Profile Deleted Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_user_profile, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
     * Primary recruiter list where reporting_manager contain account_owner id
    */

    allUserPrimaryRecruiterList: async (req, res, next) => {
        try {

            const { errors, isValid } = validatePrimaryRecruitInput(req.body);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }


            let user_primary_recruiter_list = await UserService.user_primary_recruiter_list(req.body);

            if (user_primary_recruiter_list) {
                commonResponse.success(res, 200, user_primary_recruiter_list, 'Primary Recruiter List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, user_primary_recruiter_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
     * ALL Assign more recruiter list where profile is recruiter
    */
    allUserAssignMoreRecruitersList: async (req, res, next) => {
        try {

            let user_assign_more_recruiter_list = await UserService.user_assign_more_recruiter_list();

            if (user_assign_more_recruiter_list) {
                commonResponse.success(res, 200, user_assign_more_recruiter_list, 'All Assign More Recruiter List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, user_assign_more_recruiter_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
     * ALL User Change Password
    */
    allUserChangePassword: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            const { errors, isValid } = validateChangePassword(req.body, 'user');

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            // let id = mongoose.Types.ObjectId()

            let is_exist_user = await UserService.is_exist_user(req.body.user_id);

            if (is_exist_user) {

                let password_match = await commonFunctions.matchPassword(req.body.current_password, is_exist_user.password);

                if (password_match) {

                    let updateUserPassword = await UserService.change_user_password(req.body, user);

                    if (updateUserPassword) {
                        commonResponse.success(res, 200, updateUserPassword, 'Your Password Successfully Changed');
                    } else {
                        return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateUserPassword, 'Something went wrong, Please try again');
                    }

                } else {
                    errors.current_password = "Current Password is Wrong";
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }


            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user, "User does not exist");
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    // /*
    //  *   Get Detail All Count no of user
    //  */
    // getUserListCount: async (req, res, next) => {
    //     try {
    //         const { errors, isValid } = validateUserTypeInput(req.body);

    //         if (!isValid || !isEmpty(errors)) {
    //             return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
    //         }

    //         let user_count_details = await AdminService.user_list_count(req.body);
    //         if (user_count_details) {
    //             commonResponse.success(res, 200, user_count_details, 'Total User Count Details');
    //         } else {
    //             if(user_count_details == false){
    //                 return commonResponse.customResponse(res, "User_Profile", 400, user_count_details, "User does not exist");
    //             }
    //             return commonResponse.customResponse(res, "SERVER_ERROR", 400, user_count_details, 'Something went wrong, Please try again');
    //         }
    //     } catch (error) {
    //         console.log("Create User -> ", error);
    //         return next(error);
    //     }
    // },

    userForgotPassword: async (req, res, next) => {
        try {
            var email = req.body.email;
            // let user = req.user._id;

            const { errors, isValid } = validateForgotPasswordInput(req.body);

            let is_exist = await UserService.is_exist_user_email(req.body.email, { display_name: 1 });

            let is_exist_email_template = await UserService.forgot_password_email_template_exists({ content: 1 });
            if (!is_exist_email_template) {
                is_exist_email_template = {};
                is_exist_email_template.content = "Reset Your Password";
            }

            let is_exist_footer_email_template = await UserService.footer_email_template_exists({ content: 1 });

            if (!is_exist_footer_email_template) {
                is_exist_footer_email_template = {};
                is_exist_footer_email_template.content = "Best Regards, Bluebix Customer Support";
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (is_exist) {

                const token_fun = async (data) => {
                    var token_data = {
                        reset_password_token: data,
                        reset_password_expires: Date.now() + 60 * 60 * 24 * 1000,
                        updated_at: Date.now(),
                        // updated_by: user
                    };

                    let updateUserForgotpassword = await UserService.update_token(token_data, email);

                    if (updateUserForgotpassword) {

                        // let restPwdRole = ''
                        // if (req.body.role == 'admin') restPwdRole = 'admin';
                        // if (req.body.role == 'bdm') restPwdRole = 'bdm';
                        // if (req.body.role == 'recruiter') restPwdRole = 'recruiter';
                        // if (req.body.role == 'freelanceRecruiter') restPwdRole = 'freelanceRecruiter';

                        // const link = `${process.env.BASE_URL}auth/reset-password/${data}?role=${restPwdRole}`;
                        const link = `${process.env.BASE_URL}auth/reset-password/${data}`;

                        let formattedRole = req.body.role ? req.body.role.charAt(0).toUpperCase() + req.body.role.substr(1) : '';

                        var send_mail_data = {
                            link: link,
                            name: is_exist.display_name,
                            content: is_exist_email_template.content,
                            footer_content: is_exist_footer_email_template.content,
                            role: formattedRole
                        };

                        const mail_option = {
                            filename: "reset_password",
                            data: send_mail_data,
                            subject: "Forgot Password Link",
                            from_user_email: "test.knptech.2023@gmail.com",
                            from_user_password: "qufezstbbfkkxhid",
                            smtp_host: "smtp.gmail.com",
                            smtp_port: 465,
                            user: {
                                email: email,
                                role: req.body.role || ''
                            },
                        };
                        commonResponse.success(res, 200, updateUserForgotpassword, 'Forgot Password Link is sent to your registered email id');
                        var send_mail = await mail.send(mail_option, req);
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
                errors.email = "User does not exists with this Email Id";
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }


        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    userResetPassword: async (req, res, next) => {
        try {
            let token = req.body.token;
            // let user = req.user._id;

            //check token is exist or not
            let is_exist_user_token = await UserService.is_exist_user_token(req.body.token);
            const { errors, isValid } = validateResetPasswordInput(req.body);



            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (is_exist_user_token) {

                //reset passowrd
                let user_password_reset = await UserService.user_password_reset(req.body, is_exist_user_token);

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
    messageListByUser: async (req, res, next) => {
        try {
            let message_list = await UserService.message_list_by_user(req.body);

            if (message_list) {
                commonResponse.success(res, 200, message_list, 'Get message list has been successfully.');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, message_list, 'Something went wrong, Please try again');
            }


        } catch (e) {
            console.log("E", e);
        }
    },

    /***
 * Get inbox email list
 */
    getEmailInboxList: async (req, res, next) => {

        if (req.body.user_id == undefined || req.body.user_id == '') {
            return commonResponse.customErrorResponse(
                res,
                422,
                '',
                "User Id is required."
            );
        }
        if (req.body.start == undefined || req.body.start == '') {
            return commonResponse.customErrorResponse(
                res,
                422,
                '',
                "start no is required."
            );
        }
        if (req.body.limit == undefined || req.body.limit == '') {
            return commonResponse.customErrorResponse(
                res,
                422,
                '',
                "Limit is required."
            );
        }


        let getEmailDetail = await UserService.get_email_setting_details(
            req.body
        );
        let start = parseInt(req.body.start);
        let limit = parseInt(req.body.limit);
        if (!getEmailDetail) {
            return commonResponse.customErrorResponse(
                res,
                422,
                '',
                "SMTP details not found."
            );
        }

        const imapConfig = {
            user: getEmailDetail.email,
            password: getEmailDetail.smtp_password,
            host: getEmailDetail.smtp_host,
            port: 993,
            tls: true,
        };

        console.log(imapConfig);
        let fetchlimit = `${start}:${limit}`;

        let inboxList = [];
        try {
            const imap = new Imap(imapConfig);
            imap.once("ready", () => {
                console.log("ready read!");
                // [Gmail]/Sent Mail
                imap.openBox("INBOX", true, function (err, box) {

                    var f = imap.seq.fetch(fetchlimit, {
                        bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
                        struct: true,
                    });
                    f.on("message", function (msg, seqno) {
                        // console.log("Message #%d", seqno);
                        var prefix = "(#" + seqno + ") ";

                        msg.on("body", function (stream, info) {
                            //if (info.which === "TEXT"){}
                            var buffer = "";
                            simpleParser(stream, async (err, parsed) => {
                                const { from, subject, textAsHtml, text } = parsed;

                                const emptyObject = {
                                    seqno: seqno,
                                    from: from,
                                    subject: subject,
                                    textAsHtml: textAsHtml,
                                    text: text,
                                };

                                if (inboxList.length > 0) {
                                    const messageObject = inboxList.find((item, index) => {
                                        return item.seqno === seqno;
                                    });
                                    if (messageObject) {
                                        const index = inboxList.findIndex((item, index) => {
                                            return item.seqno === seqno;
                                        });
                                        // messageObject.textAsHtml = textAsHtml;
                                        messageObject.text = text;

                                        module.exports.addAfter(inboxList, index, messageObject);
                                    } else {
                                        inboxList.push(emptyObject);
                                    }
                                } else {
                                    inboxList.push(emptyObject);
                                }


                            });

                            stream.once("end", function () {
                                if (info.which !== "TEXT")
                                    console.log("end", prefix + "Parsed header: %s");
                                else {
                                    console.log("end", prefix);
                                    console.log("end", "Body [%s] Finished");
                                }
                                //console.log("inboxList", inboxList.length);
                            });
                        });

                        msg.once("end", function () {
                            // console.log("end", prefix, "Finished");
                        });
                    });
                    f.once("error", function (err) {
                        console.log("Fetch error: " + err);
                    });
                    f.once("end", function () {
                        commonResponse.success(
                            res,
                            200,
                            inboxList,
                            "Email List Successfully"
                        );
                        console.log("Done fetching all messages!");
                        imap.end();
                    });
                });
            });

            imap.once("error", (err) => {
                console.log(err);
            });

            imap.once("end", () => {
                console.log("Connection ended");
                //console.log("inboxList", JSON.stringify(inboxList));
            });

            imap.connect().then(function (connection) {
                connection.getBoxes().then((response) => {
                    var r = response;
                    console.log("connection getBoxes", r);
                });
            });
        } catch (ex) {
            console.log("an error occurred");
        }
    },


    getEmailList: async (req, res, next) => {
        let imap = {}
        let getEmailDetail = await UserService.get_email_setting_details(req.body);

        if (!getEmailDetail) {
            return commonResponse.customErrorResponse(res, 422, '', "Email incoming Configuration not seted.");
        }

        if (req.body.user_id == undefined || req.body.user_id == '') {
            return commonResponse.customErrorResponse(res, 422, '', "User Id is required.");
        }

        let user_password = commonFunctions.decrypt(getEmailDetail.smtp_password)

        const imapConfig = new Imap({
            user: getEmailDetail.email,
            password: user_password,
            host: getEmailDetail.smtp_host,
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false }
        });

        let fetchLimitObj = { 'start': 1, 'limit': '*' }

        imap = imapConfig
        if (req.body.start) fetchLimitObj.start = parseInt(req.body.start)
        if (req.body.limit) fetchLimitObj.limit = parseInt(req.body.limit)

        const fetchLimit = `${fetchLimitObj.start}:${fetchLimitObj.limit}`


        imapConfig.once('ready', async function () {
            console.log('............Conection Establish with imapConfig.................');
            console.log('req.params.folderName :>>', req.params.folderName);
            if (req.params.folderName == 'inbox' || req.params.folderName == 'sent') {
                try {
                    const inboxList = await commonFunctions.getEmailList(req, fetchLimit, imap);
                    commonResponse.success(res, 200, inboxList, "Email List Successfully");

                } catch (error) {
                    console.log("Catch Error", error)
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", 'Connection could not established with server');
                }
            }
        });

        imapConfig.once('error', function (err) {
            console.log('error :>>', err);
            let errorMsg = 'Connection could not established with server';
            if (err.textCode == 'AUTHENTICATIONFAILED') errorMsg = "Invalid Credentials"
            return commonResponse.customErrorResponse(res, 422, "Something went wrong", 'Connection could not established with server');
        });

        imapConfig.once('end', function () {
            console.log('Connection ended');
        });

        imapConfig.connect();

        // if (req.body.user_id == undefined || req.body.user_id == '') {
        //     return commonResponse.customErrorResponse(
        //         res,
        //         422,
        //         '',
        //         "User Id is required."
        //     );
        // }
        // if (req.body.start == undefined || req.body.start == '') {
        //     return commonResponse.customErrorResponse(
        //         res,
        //         422,
        //         '',
        //         "start no is required."
        //     );
        // }
        // if (req.body.limit == undefined || req.body.limit == '') {
        //     return commonResponse.customErrorResponse(
        //         res,
        //         422,
        //         '',
        //         "Limit is required."
        //     );
        // }


        // let getEmailDetail = await UserService.get_email_setting_details(
        //     req.body
        // );
        // let start = parseInt(req.body.start);
        // let limit = parseInt(req.body.limit);
        // if (!getEmailDetail) {
        //     return commonResponse.customErrorResponse(
        //         res,
        //         422,
        //         '',
        //         "SMTP details not found."
        //     );
        // }

        // const imapConfig = {
        //     user: getEmailDetail.email,
        //     password: getEmailDetail.smtp_password,
        //     host: getEmailDetail.smtp_host,
        //     port: 993,
        //     tls: true,
        // };


        // /*const imapConfig = {
        //     user: "",
        //     password: "",
        //     host: "imap.gmail.com",
        //     port: 993,
        //     tls: true,
        // };*/
        // console.log(imapConfig);
        // let fetchlimit = `${start}:${limit}`;

        // let inboxList = [];
        // try {
        //     const imap = new Imap(imapConfig);
        //     imap.once("ready", () => {
        //         console.log("ready read!");
        //         // [Gmail]/Sent Mail
        //         imap.openBox("[Gmail]/Sent Mail", true, function (err, box) {

        //             var f = imap.seq.fetch(fetchlimit, {
        //                 bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
        //                 struct: true,
        //             });
        //             f.on("message", function (msg, seqno) {
        //                 // console.log("Message #%d", seqno);
        //                 var prefix = "(#" + seqno + ") ";

        //                 msg.on("body", function (stream, info) {
        //                     //if (info.which === "TEXT"){}
        //                     var buffer = "";
        //                     simpleParser(stream, async (err, parsed) => {
        //                         const { from, subject, textAsHtml, text } = parsed;
        //                         console.log("body");

        //                         const emptyObject = {
        //                             seqno: seqno,
        //                             from: from,
        //                             subject: subject,
        //                             textAsHtml: textAsHtml,
        //                             text: text,
        //                         };

        //                         if (inboxList.length > 0) {
        //                             const messageObject = inboxList.find((item, index) => {
        //                                 return item.seqno === seqno;
        //                             });
        //                             if (messageObject) {
        //                                 const index = inboxList.findIndex((item, index) => {
        //                                     return item.seqno === seqno;
        //                                 });
        //                                 // messageObject.textAsHtml = textAsHtml;
        //                                 messageObject.text = text;

        //                                 module.exports.addAfter(inboxList, index, messageObject);
        //                             } else {
        //                                 inboxList.push(emptyObject);
        //                             }
        //                         } else {
        //                             inboxList.push(emptyObject);
        //                         }


        //                     });

        //                     stream.once("end", function () {
        //                         if (info.which !== "TEXT")
        //                             console.log("end", prefix + "Parsed header: %s");
        //                         else {
        //                             console.log("end", prefix);
        //                             console.log("end", "Body [%s] Finished");
        //                         }
        //                         //console.log("inboxList", inboxList.length);
        //                     });
        //                 });

        //                 msg.once("end", function () {
        //                     // console.log("end", prefix, "Finished");
        //                 });
        //             });
        //             f.once("error", function (err) {
        //                 console.log("Fetch error: " + err);
        //             });
        //             f.once("end", function () {
        //                 commonResponse.success(
        //                     res,
        //                     200,
        //                     inboxList,
        //                     "Email List Successfully"
        //                 );
        //                 console.log("Done fetching all messages!");
        //                 imap.end();
        //             });
        //         });
        //     });

        //     imap.once("error", (err) => {
        //         console.log(err);
        //     });

        //     imap.once("end", () => {
        //         console.log("Connection ended");
        //     });

        //     imap.connect().then(function (connection) {
        //         connection.getBoxes().then((response) => {
        //             var r = response;
        //             console.log("connection getBoxes", r);
        //         });
        //     });
        // } catch (ex) {
        //     console.log("an error occurred");
        // }
    },

    addAfter(array, index, newItem) {
        return [...array.slice(0, index), newItem, ...array.slice(index)];
    },

    monsterCandidateList: async (req, res, next) => {
        try {
            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            let candidateList = await UserService.monsterCandidateList(req);
            if (candidateList) {
                const candidateListWithViewOrNot = await UserService.checkMonsterCandidateAlreadyViewed(candidateList)
                return commonResponse.success(res, 200, candidateListWithViewOrNot, 'All Candidate List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidateList, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("monster -> ", error);
            return next(error);
        }
    },
    monsterCandidateView: async (req, res, next) => {
        try {
            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            const candidate = await UserService.monsterCandidateView(req);
            if (candidate) {
                return commonResponse.success(res, 200, candidate, 'Candidate');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("monster -> ", error);
            return next(error);
        }
    },

    getMonsterCandidateList: async (req, res, next) => {
        try {
            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            let candidateList = await UserService.getMonsterCandidateList(req);
            if (candidateList) {
                return commonResponse.success(res, 200, candidateList, 'All Candidate List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidateList, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("monster -> ", error);
            return next(error);
        }
    },
    getMonsterCandidate: async (req, res, next) => {
        try {
            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            const candidate = await UserService.getMonsterCandidate(req);
            if (candidate) {
                return commonResponse.success(res, 200, candidate, 'Candidate');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("monster -> ", error);
            return next(error);
        }
    },

    insertUserFromCandidateTable: async (req, res, next) => {
        try {
            // let candidateList = await Candidate.find({ email: "ketul.knp@gmail.com" });
            let candidateList = await Candidate.find({});
            if (candidateList.length) {
                candidateList.forEach(async can => {
                    let user = await User.findOne({ email: can.email });
                    console.log('can :>>', user);
                    if (user) {
                        await Candidate.deleteOne({ _id: can._id });
                        // delete candidate IT Skills
                        await CandidateITSkills.deleteMany({ candidate_id: can._id })
                        // delete submission
                        await CandidateSubmission.deleteMany({ candidate_id: can._id })
                        // delete candidate qualification
                        await CandidateQualification.deleteMany({ candidate_id: can._id })
                        // delete employee 
                        await Employee.deleteMany({ candidate_id: can._id })
                        // delete job apply
                        await JobApplyings.deleteMany({ candidate_id: can._id })
                        // delete Saved Job
                        await JobSaved.deleteMany({ candidate_id: can._id })


                    } else {
                        await User.create({
                            "email": can.email,
                            "password": can.password,
                            "profile": ['candidate'],
                            "first_name": can.first_name,
                            "last_name": can.last_name,
                            "display_name": `${can.first_name} ${can.last_name}`,
                            "candidate_id": can._id,
                            "assigned_role": "65cb187df3795ca8155af311",
                            "status": "Active",
                            "default": "login_email",
                            "phone_work": can.mobile,
                            "login_email": can.email
                        })
                    }
                });
                res.send("Inserted Can");
            }

        } catch (error) {

        }
    }

};
