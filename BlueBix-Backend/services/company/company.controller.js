const CompanyService = require("./company.services");
const { commonResponse, commonFunctions } = require("../../helper");
const { validateCompanyRegisterInput, validateCompanyRegister } = require("../../validations/admin/company/companyRegister");
const { validateCompanyLoginInput, validateLogin } = require("../../validations/admin/company/companyLogin");
// const validateUserTypeInput = require("../../validations/admin/user/usertype");
const validateForgotPasswordInput = require("../../validations/admin/user/forgotPassword");
const validateResetPasswordInput = require("../../validations/admin/user/resetPassword");
const validateChangePassword = require("../../validations/admin/user/changePassword");
const validateInterviewScheduleInput = require("../../validations/admin/company/companyInterviewSchedule");

const mail = require("../../helper/email/index");
const isEmpty = require("../../validations/is-empty");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UserService = require("../users/users.services");
const EmailActivity = require("../emailactivity/emailactivity.model");
const Roles = require("../roles/roles.model");
const { common } = require('../../helper');
const Message = require("../message/message.model");

module.exports = {

    /*
    *  Register New User
    */
    companyRegister: async (req, res, next) => {

        try {
            // const { errors, isValid } = validateCompanyRegisterInput(req.body);

            //Validations
            const valError = await validateCompanyRegister(req, res)
            if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

            const errors = {}

            req.body.email_1 = req.body.email_1.toLowerCase();
            let is_exist = await CompanyService.is_exist(req.body.email_1);
            let is_exist_company_name = await CompanyService.is_exist_company_name(req.body.company_name);
            let is_exist_company_code = await CompanyService.is_exist_company_code(req.body.company_code);

            if (is_exist) {
                errors.email_1 = "Email Id is Already Exist"
            }

            if (is_exist_company_name) {
                errors.company_name = "Company Name is Already Exist"
            }
            if (is_exist_company_code) {
                errors.company_code = "Company Code is Already Exist"
            }
            if (!isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (req.body.password == '') {
                req.body.password = commonFunctions.randomPassword(8);
            }

            let user = await CompanyService.save(req.body);

            if (user) {

                // let link = process.env.BASE_URL + 'bluebix-demo/auth/company/login';
                let link = process.env.BASE_URL + 'auth/login';

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

                let email = user.email_1;
                let name = user.company_name;

                let send_mail_data = {
                    link: link,
                    name: name,
                    email: email,
                    // password: req.body.password,
                    password: '',
                    role: 'Company',
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
                    email: user.email_1,
                    company_name: user.company_name,
                    company_code: user.company_code
                };

                jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.EXPIRE_JWT_SECRET || "24h" },
                    (err, token) => {
                        commonResponse.success(res, 201, { user_detail: user, token: "Bearer " + token }, 'Signup Successfully');
                    }
                );
                let send_mail = await mail.send(mail_option, req);// Send a mail to comapny
                const content = {
                    company_name: user.company_name
                }
                if (req.user._id) {

                    const rolename = await Roles.findById(req.user.assigned_role);

                    if (rolename.role_name === 'admin' && req.body.assigned_to_bdm) {
                        content.created_by = 'admin';
                        req.body.assigned_to_bdm.forEach(async el => {
                            const bdm = await UserService.is_exist_user(el);
                            const messageData = {
                                message: `Client ${req.body.company_name} assigned to BDM ${bdm.display_name}.`,
                                'title': 'Client Assign',
                                user_id: el,
                                user_role: 'admin',
                                created_at: Date.now(),
                                updated_at: Date.now()
                            }
                            await Message.create(messageData);
                            common.sendMailNotification('client_created', 'Client Created', el, bdm.display_name, bdm.login_email, is_exist_footer_email_template.content, false, content, req);
                        })
                    }
                    // for bdm
                    else {
                        content.created_by = 'bdm';
                        common.sendMailNotification('client_created', 'Client Created', req.user._id, req.user.display_name, req.user.login_email, is_exist_footer_email_template.content, true, content, req);
                    }

                    const UserModel = require("../users/users.model");

                    // Send a mail to admin if company created by bdm
                    const findAdminLogin = await UserModel.findOne({ "profile": { $in: ["admin"] } });
                    if (findAdminLogin) {
                        const send_mail = {
                            name: (rolename.role_name == 'bdm') ? req.user.display_name : '',
                            content: {
                                company_name: user.company_name,
                                created_by: 'admin-bdm',
                                cretaedLoginRole: rolename.role_name
                            },
                            footer_content: is_exist_footer_email_template.content,
                        };


                        const mail_options = {
                            filename: 'client_created',
                            data: send_mail,
                            subject: 'Client Created',
                            from_user_email: "test.knptech.2023@gmail.com",
                            from_user_password: "qufezstbbfkkxhid",
                            smtp_host: "smtp.gmail.com",
                            smtp_port: 465,
                            user: {
                                email: findAdminLogin.email
                            },
                        };
                        let sendEmail = await mail.send(mail_options, req);// Send a mail to admin
                    }

                }

            }
            // commonResponse.success(res, 201, user, 'Signup Successfully');
            else {
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
    companyLogin: async (req, res, next) => {

        // const { errors, isValid } = validateCompanyLoginInput(req.body);

        // if (!isValid) {
        //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        // }

        // Valaidations
        const valError = await validateLogin(req, res)
        if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

        const errors = {}
        let is_user = await CompanyService.is_exist_role(req.body.email);

        if (!is_user) {
            errors.email = "Invalid Email";
            return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        }

        var password_match;
        if (is_user.email_1 == req.body.email) {
            password_match = await commonFunctions.matchPassword(req.body.password, is_user.password);
        }
        if (is_user.contact_person_details && is_user.contact_person_details.email == req.body.email) {

            password_match = await commonFunctions.matchPassword(req.body.password, is_user.contact_person_details.password);
        }

        if (password_match) {

            let payload;
            if (is_user.email_1 == req.body.email) {
                payload = {
                    _id: is_user._id,
                    email: is_user.email_1,
                    company_name: is_user.company_name,
                    company_code: is_user.company_code
                };
            }

            if (is_user.contact_person_details && is_user.contact_person_details.email == req.body.email) {
                payload = {
                    _id: is_user.contact_person_details._id,
                    email: is_user.contact_person_details.email,
                    company_id: is_user.contact_person_details.company_id,
                    display_name: is_user.contact_person_details.display_name
                };
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
    *  Company List
    */

    getAllCompanyList: async (req, res, next) => {
        try {

            let company_list = await CompanyService.companylist(req.body);

            if (company_list) {
                commonResponse.success(res, 200, company_list, 'All Company Listing Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, company_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
*  Company List  names
*/

    getAllCompanyName: async (req, res, next) => {
        try {

            let company_list = await CompanyService.companylistNames(req.body);

            if (company_list) {
                commonResponse.success(res, 200, company_list, 'All Company Names Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, company_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Get Detail User Profile By Id
    */
    getCompanyProfileDetails: async (req, res, next) => {
        try {
            let company_profile_details = await CompanyService.get(req.body);

            if (company_profile_details) {
                commonResponse.success(res, 200, company_profile_details, 'Company Profile Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, company_profile_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  User Profile Update Job By Id
    */
    updateCompanyProfile: async (req, res, next) => {
        try {
            let id = req.params.id;
            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;
            var url = req.originalUrl.split('/');

            url = url[4] === "company" ? url[5] : url[4];
            let is_exist_user = await CompanyService.is_exist_user(id);

            if (is_exist_user) {

                const { errors, isValid } = validateCompanyRegisterInput(req.body, url);

                let is_exist_email = await CompanyService.is_exist(req.body.email_1);
                let is_exist_company_name = await CompanyService.is_exist_company_name(req.body.company_name);
                let is_exist_company_code = await CompanyService.is_exist_company_code(req.body.company_code);

                if (is_exist_email && isEmpty(errors.email_1) && is_exist_email._id != id) {
                    errors.email_1 = "Email Id is Already Exist"
                }

                if (is_exist_company_name && isEmpty(errors.company_name) && is_exist_company_name._id != id) {
                    errors.company_name = "Company Name is Already Exist"
                }

                if (is_exist_company_code && isEmpty(errors.company_code) && is_exist_company_code._id != id) {
                    errors.company_code = "Company Code is Already Exist"
                }

                if (!isValid || !isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                let updateCompanyProfile = await CompanyService.update(id, req.body, user);

                let is_exist_footer_email_template = await UserService.email_template_by_type('register_user_footer');
                if (!is_exist_footer_email_template) {
                    is_exist_footer_email_template = { content: "Best Regards, Bluebix Customer Support" };
                }

                if (updateCompanyProfile) {
                    if (user) {
                        const rolename = await Roles.findById(req.user.assigned_role);

                        if (rolename.role_name === 'admin' && req.body.assigned_to_bdm) {
                            req.body.assigned_to_bdm.forEach(async el => {
                                const bdm = await UserService.is_exist_user(el);
                                const content = {
                                    company_name: req.body.company_name,
                                    company_code: req.body.company_code
                                }
                                const messageData = {
                                    message: `Client ${req.body.company_name} assigned to BDM ${bdm.display_name}.`,
                                    title: 'Client Assign',
                                    user_id: el,
                                    user_role: 'admin',
                                    created_at: Date.now(),
                                    updated_at: Date.now()
                                }
                                await Message.updateOne({ message: `Client ${req.body.company_name} assigned to BDM ${bdm.display_name}.` }, messageData, { upsert: true });

                                common.sendMailNotification('client_assigned', 'Client Assigned', el, bdm.display_name, bdm.login_email, is_exist_footer_email_template.content, true, content, req);
                            });
                        }
                    }
                    commonResponse.success(res, 200, updateCompanyProfile, 'Company Profile Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateCompanyProfile, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, {}, "Company does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Delete Company By Id
    */
    deleteCompanyProfile: async (req, res, next) => {
        try {
            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            let delete_company_profile = await CompanyService.delete(id, user);
            if (delete_company_profile) {
                commonResponse.success(res, 200, delete_company_profile, 'Company Profile Deleted Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_company_profile, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   List of Company Name  bdm id wise used in job opening account name dropdown
    */
    listOfCompanyNameList: async (req, res, next) => {
        try {
            // let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            // let user = req.user._id;

            let account_name_list = await CompanyService.account_name_list(req.body);
            if (account_name_list) {
                commonResponse.success(res, 200, account_name_list, 'Account Name List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, account_name_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   List of Company Name  recruiter id wise used in job opening account name dropdown
    */
    listOfCompanyNameListRecruiterWise: async (req, res, next) => {
        try {
            // let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            // let user = req.user._id;

            let company_name_list = await CompanyService.company_name_list_recruiter_wise(req.body);
            if (company_name_list) {
                commonResponse.success(res, 200, company_name_list, 'Company Name List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, company_name_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },



    /*
     * Company Password Change
    */
    companyPasswordChange: async (req, res, next) => {
        try {

            if (!req.user || req.user.profile) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            const { errors, isValid } = validateChangePassword(req.body, 'company');

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            // let id = mongoose.Types.ObjectId()

            let is_exist_user = await CompanyService.is_exist_user(req.body.company_id);

            if (is_exist_user) {

                let password_match = await commonFunctions.matchPassword(req.body.current_password, is_exist_user.password);

                if (password_match) {

                    let updateCompanyPassword = await CompanyService.change_company_password(req.body, user);

                    if (updateCompanyPassword) {
                        commonResponse.success(res, 200, updateCompanyPassword, 'Your Password Successfully Changed');
                    } else {
                        return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateCompanyPassword, 'Something went wrong, Please try again');
                    }

                } else {
                    errors.current_password = "Current Password is Wrong";
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }


            } else {
                return commonResponse.customResponse(res, "Company_Profile", 400, is_exist_user, "Company does not exist");
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

    companyForgotPassword: async (req, res, next) => {
        try {
            var email = req.body.email;
            // let user = req.user._id;

            const { errors, isValid } = validateForgotPasswordInput(req.body);

            let is_exist = await CompanyService.is_exist(req.body.email, { email_1: 1, company_name: 1 });

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

                    let updateUserForgotpassword = await CompanyService.update_token(token_data, email);

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

                        // var link = process.env.BASE_URL + "bluebix-demo/auth/company/reset-password/" + data;
                        var link = process.env.BASE_URL + "auth/reset-password/" + data + "?role=company";
                        var send_mail_data = {

                            link: link,
                            name: is_exist.company_name,
                            content: is_exist_email_template.content,
                            footer_content: is_exist_footer_email_template.content,

                        };
                        // var link = "http://localhost:3000/" + "reset-password/" + data;

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
                                role: 'Company'
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
                errors.email = "Company does not exists with this Email Id";
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }


        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    companyResetPassword: async (req, res, next) => {
        try {
            let token = req.body.token;
            // let user = req.user._id;

            //check token is exist or not
            let is_exist_user_token = await CompanyService.is_exist_user_token(req.body.token);
            const { errors, isValid } = validateResetPasswordInput(req.body);



            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (is_exist_user_token) {

                //reset passowrd
                let user_password_reset = await CompanyService.user_password_reset(req.body);

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


    //Candidate Submission List by bdm showing to Company
    candidateSubmissionListForCompany: async (req, res, next) => {
        try {

            let candidte_submission_list_for_company = await CompanyService.candidte_submission_list_for_company(req.body);

            if (candidte_submission_list_for_company) {
                commonResponse.success(res, 200, candidte_submission_list_for_company, 'Candidate Submission List For Company');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidte_submission_list_for_company, 'Something went wrong, Please try again');
            }


        } catch (e) {
            console.log("E", e);
        }
    },

    //Candidate Submission List by bdm showing to Company
    candidateSubmissionListByCompany: async (req, res, next) => {
        try {
            let candidte_submission_list_for_company = await CompanyService.candidte_submission_list_by_company(req.body);

            if (candidte_submission_list_for_company) {
                commonResponse.success(res, 200, candidte_submission_list_for_company, 'Candidate Submission List For Company');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidte_submission_list_for_company, 'Something went wrong, Please try again');
            }


        } catch (e) {
            console.log("E", e);
        }
    },

    //List of State 

    listOfStateList: async (req, res, next) => {
        try {

            let state_list = await CompanyService.state_list();

            if (state_list) {
                commonResponse.success(res, 200, state_list, 'All State List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, state_list, 'Something went wrong, Please try again');
            }


        } catch (e) {
            console.log("E", e);
        }
    },

    //List of City  

    listOfCityList: async (req, res, next) => {
        try {

            let city_list = await CompanyService.city_list(req.body);

            if (city_list) {
                commonResponse.success(res, 200, city_list, 'All City List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, city_list, 'Something went wrong, Please try again');
            }


        } catch (e) {
            console.log("E", e);
        }
    },

    addState: async (req, res, next) => {
        try {

            if (req.body.name == undefined || req.body.name == '') {
                return commonResponse.customErrorResponse(res, 422, '', "State name is required");
            }

            let checkExist = await CompanyService.check_state_exists(req.body);

            if (checkExist.length > 0) {
                return commonResponse.customErrorResponse(res, 422, '', "State name already exists.");
            }

            let state_add = await CompanyService.state_add(req.body);

            if (state_add) {
                commonResponse.success(res, 200, state_add, 'State has been added successfully.');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, state_add, 'Something went wrong, Please try again');
            }
        } catch (e) {
            console.log("E", e);
        }
    },

    addCity: async (req, res, next) => {
        try {
            if (req.body.state_id == undefined || req.body.state_id == '') {
                return commonResponse.customErrorResponse(res, 422, '', "State Id is required");
            }
            if (req.body.name == undefined || req.body.name == '') {
                return commonResponse.customErrorResponse(res, 422, '', "City name is required");
            }

            let checkExist = await CompanyService.check_state_exists_by_id(req.body);
            if (checkExist.length == 0) {
                return commonResponse.customErrorResponse(res, 422, '', "State Not found.");
            }

            let city_add = await CompanyService.city_add(req.body);

            if (city_add.length > 0) {
                commonResponse.success(res, 200, city_add, 'City has been added successfully.');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, city_add, 'Failed to add city. Please check request');
            }
        } catch (e) {
            console.log("E", e);
        }
    },


    //Get BDM Selected Candidate Details By id For Company 

    getCandidateProfileDetailsByIdForCompany: async (req, res, next) => {
        try {

            let candidate_details = await CompanyService.candidate_details(req.body);

            if (candidate_details) {
                commonResponse.success(res, 200, candidate_details, 'Candidate Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_details, 'Something went wrong, Please try again');
            }


        } catch (e) {
            console.log("E", e);
        }
    },


    //Get CompanyWise Job Opening Id List dropdown

    getCompanyWiseOpeningIdList: async (req, res, next) => {
        try {

            let company_opening_id_list = await CompanyService.company_opening_id_list(req.body);

            if (company_opening_id_list) {
                commonResponse.success(res, 200, company_opening_id_list, 'Opening List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, company_opening_id_list, 'Something went wrong, Please try again');
            }


        } catch (e) {
            console.log("E", e);
        }
    },


    //Get Company Wise ShortList Candidate Category List dropdown

    getCompanyWiseShortListCandidateCategoryList: async (req, res, next) => {
        try {

            let company_category_list = await CompanyService.company_category_list(req.body);

            if (company_category_list) {
                commonResponse.success(res, 200, company_category_list, 'Category List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, company_category_list, 'Something went wrong, Please try again');
            }


        } catch (e) {
            console.log("E", e);
        }
    },


    //Company Status Change By Company Id

    companyStatusChange: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            let user = req.user;
            let id = req.params.id;


            let is_exist_company = await CompanyService.is_exist_user(id);

            if (is_exist_company) {

                let company_status = await CompanyService.company_status_change(id, req.body, user);

                if (company_status) {
                    commonResponse.success(res, 200, company_status, 'Company Status Change Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, company_status, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "Company", 400, {}, "Company does not exist");
            }




        } catch (e) {
            console.log("E", e);
        }
    },

    statusCount: async (req, res, next) => {
        try {
            let statusCountDetails = await CompanyService.count_jobopen_status(
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

    updateJobSubmissionViewStatusByCompanyCount: async (req, res, next) => {
        try {
            let company_id = req.body.company_id;
            let opening_id = req.body.opening_id;

            if (company_id == '' || company_id == undefined) {
                return commonResponse.customResponse(
                    res,
                    "SERVER_ERROR",
                    400,
                    '',
                    "Company Id field is required."
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

            let statusCountDetails = await CompanyService.update_job_submission_view_status_by_company(
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
                    "Something went wrong, Please try again"
                );
            }
        } catch (error) {
            console.error("Error", error);
            next(error);
        }
    },
    interviewSchedule: async (req, res, next) => {
        try {
            const { errors, isValid } = validateInterviewScheduleInput(req.body);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let user = await CompanyService.saveInterviewSchedule(req.body);
            if (user) {
                return commonResponse.success(res, 201, user, 'Interview Schedule has been Successfully.');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, user, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

};
