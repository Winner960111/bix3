const AdminService = require("./admin.services");
const { commonResponse, commonFunctions } = require("../../helper");
const { validateRegisterInput, validateRegister } = require("../../validations/admin/user/register");
const { validateLoginInput, validateLogin } = require("../../validations/admin/user/login");
const validateUserTypeInput = require("../../validations/admin/user/usertype");
const validateForgotPasswordInput = require("../../validations/admin/user/forgotPassword");
const validateResetPasswordInput = require("../../validations/admin/user/resetPassword");
const mail = require("../../helper/email/index");
const isEmpty = require("../../validations/is-empty");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RoleModel = require("../roles/roles.model");
const UserService = require("../users/users.services");
const Imap = require('imap'),
    inspect = require('util').inspect;
const niv = require('../../validations/niv');
const config = require("../../config");


module.exports = {

    /*
    *  Register New User
    */
    adminRegister: async (req, res, next) => {
        try {
            // const { errors, isValid } = validateRegisterInput(req.body);

            // Valaidations
            const valError = await validateRegister(req, res)
            // const valError = await validateRegister(req, res)
            if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

            const errors = {}
            req.body.email = req.body.email.toLowerCase();
            let is_exist = await AdminService.is_exist(req.body.email);

            if (is_exist) {
                errors.email = "Email Id is Already Exist"
            }

            if (!isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let user = await AdminService.save(req.body);
            let role_id = await RoleModel.findOne({ _id: user.assigned_role }, { role_name: 1 }).lean();

            if (user) {

                let link = process.env.BASE_URL + 'auth/login';
                if (role_id) {
                    //send email
                    // if (role_id.role_name == "admin") {
                    //     link = process.env.BASE_URL + "bluebix-demo/auth/admin/login";
                    // }
                    // if (role_id.role_name == "bdm") {
                    //     link = process.env.BASE_URL + "bluebix-demo/auth/bdm/login";
                    // }
                    // if (role_id.role_name == "recruiter") {
                    //     link = process.env.BASE_URL + "bluebix-demo/auth/recruiter/login";
                    // }
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

                let email = user.email;
                let name = user.display_name;
                let password = '';
                if (req.body.password != '' && req.body.password != undefined) {
                    password = req.body.password;
                }

                var send_mail_data = {
                    link: link,
                    name: name,
                    email: email,
                    password: password,
                    role: 'Admin',
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
                        email: email,
                    },
                };

                let payload = {
                    _id: user._id,
                    email: user.email,
                    display_name: user.display_name,
                    mobile: user.mobile,
                    profile: user.profile,
                    assigned_role: role_id
                };

                jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.EXPIRE_JWT_SECRET || "24h" },
                    (err, token) => {
                        commonResponse.success(res, 201, { user_detail: user, token: "Bearer " + token }, 'Admin Signup Successfully');
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
    *  Login
    */
    adminLogin: async (req, res, next) => {

        // Valaidations
        const valError = await validateLogin(req, res)
        if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

        const errors = {}

        // const { errors, isValid } = validateLoginInput.validateLoginInput(req.body);
        // if (!isValid) {
        //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        // }

        let is_user = await AdminService.is_exist_role(req.body.email, req.body.profile);
        if (!is_user) {
            errors.email = "Invalid Email Or Profile";
            return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
        }

        let password_match = await commonFunctions.matchPassword(req.body.password, is_user.password);
        // let assigned_role = await 

        let role_id = await RoleModel.findOne({ _id: is_user.assigned_role }, { role_name: 1 }).lean();

        if (password_match) {
            const payload = {
                _id: is_user._id,
                email: is_user.email,
                display_name: is_user.display_name,
                phone_home: is_user.phone_home,
                profile: is_user.profile,
                assigned_role: role_id
            };
            delete is_user.password
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: process.env.EXPIRE_JWT_SECRET || "24h" },
                (err, token) => {
                    commonResponse.success(res, 200, { user_detail: is_user, token: "Bearer " + token }, 'Admin Login Successfully');
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
    *  All Admin List
    */

    getAllAdminList: async (req, res, next) => {
        try {

            let admin_list = await AdminService.adminlist(req.body);

            if (admin_list) {
                commonResponse.success(res, 200, admin_list, 'All Admin Listing Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, admin_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Get Detail Admin Profile By Id
    */
    getAdminProfileDetails: async (req, res, next) => {
        try {
            let admin_profile_details = await AdminService.get(req.params.id);
            if (admin_profile_details) {
                commonResponse.success(res, 200, admin_profile_details, 'Admin Profile Details');
            } else {
                if (admin_profile_details == false) {
                    return commonResponse.customResponse(res, "User_Profile", 400, admin_profile_details, "Admin does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, admin_profile_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  Admin Profile Update Job By Id
    */
    updateAdminProfile: async (req, res, next) => {
        try {
            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;
            var url = req.originalUrl.split('/');
            let is_exist_user = await AdminService.is_exist_user(id);

            if (is_exist_user) {

                // Valaidations

                const validateObj = {
                    first_name: `required|alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
                    last_name: `required|alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
                    display_name: `required|alpha|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
                    default: `required|minLength:${config.validateLength.minSLength}|maxLength:${config.validateLength.maxSLength}`,
                    email: 'required|email',
                    login_email: 'required|email',
                    alternate_email: 'email',
                }

                const v = new niv.Validator(req.body, validateObj);

                const matched = await v.check();
                if (!matched) {
                    const errors = commonResponse.validateResp(v.errors)
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                // const valError = await validateRegister(req, res, url[4])
                // if (!valError.status) return commonResponse.customErrorResponse(res, 422, "Something went wrong", valError.errors);

                const errors = {}

                // const { errors, isValid } = validateRegisterInput(req.body, url[4]);

                let is_exist_email = await AdminService.is_exist(req.body.email);
                let is_exist_login_email = await AdminService.is_exist(req.body.login_email);
                // let is_exist_login_email = await AdminService.is_exist_login_email(req.body.login_email);

                if (is_exist_email && isEmpty(errors.email) && is_exist_email._id != id) {
                    errors.email = "Email Id is Already Exist"
                }

                if (is_exist_login_email && isEmpty(errors.login_email) && is_exist_login_email._id != id) {
                    errors.login_email = "Login Email Id is Already Exist"
                }

                if (!isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                let updateAdminProfile = await AdminService.update(id, req.body, is_exist_user, user);

                if (updateAdminProfile) {
                    commonResponse.success(res, 200, updateAdminProfile, 'Admin Profile Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateAdminProfile, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "User_Profile", 400, is_exist_user, "Admin does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Delete Admin By Id
    */
    deleteAdminProfile: async (req, res, next) => {
        try {
            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            let delete_admin_profile = await AdminService.delete(id, user);
            if (delete_admin_profile) {
                commonResponse.success(res, 200, delete_admin_profile, 'Admin Profile Deleted Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_admin_profile, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
     *   Get All Email List
     */
    getEmailList: async (req, res, next) => {
        try {

            // let email_list_details = await AdminService.email_list(req.body);
            // if (email_list_details) {
            //     commonResponse.success(res, 200, email_list_details, 'All Email Listing Details');
            // } else {
            //     return commonResponse.customResponse(res, "SERVER_ERROR", 400, email_list_details, 'Something went wrong, Please try again');
            // }
            var imap = new Imap({
                user: process.env.INCOMING_EMAIL_USER,
                password: process.env.INCOMING_EMAIL_PASSWORD,
                host: process.env.INCOMING_EMAIL_HOST,
                port: process.env.INCOMING_EMAIL_PORT,
                tls: true,
                tlsOptions: {
                    rejectUnauthorized: false
                },
                authTimeout: 3000
            });

            var email_array = [];
            var email_data = [];
            function openInbox(cb) {
                imap.openBox('INBOX', true, cb);
            }

            //range wise data get 1 to 10
            imap.once('ready', function () {
                openInbox(function (err, box) {
                    if (err) throw err;
                    var f = imap.seq.fetch(`1:${req.body.number}`, {
                        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
                        struct: true
                    });
                    f.on('message', function (msg, seqno) {
                        var prefix = '(#' + seqno + ') ';
                        msg.on('body', function (stream, info) {
                            var buffer = '';
                            stream.on('data', function (chunk) {
                                buffer += chunk.toString('utf8');

                            });
                            stream.once('end', function () {

                                var buffer_obj = Imap.parseHeader(buffer);
                                buffer_obj['id'] = seqno

                                email_array.push(buffer_obj)

                            });
                        });
                        msg.once('attributes', function (attrs) {
                            email_data.push(attrs, false, 8)
                        });
                        msg.once('end', function () {
                        });
                    });
                    f.once('error', function (err) {
                        console.log('Fetch error: ' + err);
                    });
                    f.once('end', function () {
                        console.log('Done fetching all messages!');
                        commonResponse.success(res, 200, email_array, 'Email List Successfully');
                        imap.end();
                    });

                });
            });

            imap.once('error', function (err) {
                console.log(err);
            });

            imap.once('end', function () {
                // commonResponse.success(res, 200, email_array, 'Email List Successfully');
                console.log('Connection ended');
            });

            imap.connect();
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
     *   Get Detail All Count no of user
     */
    getUserListCount: async (req, res, next) => {
        try {
            const { errors, isValid } = validateUserTypeInput(req.body);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let user_count_details = await AdminService.user_list_count(req.body);
            if (user_count_details) {
                commonResponse.success(res, 200, user_count_details, 'Total User Count Details');
            } else {
                if (user_count_details == false) {
                    return commonResponse.customResponse(res, "User_Profile", 400, user_count_details, "User does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, user_count_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    adminForgotPassword: async (req, res, next) => {
        try {
            var email = req.body.email;
            let user = req.user._id;

            const { errors, isValid } = validateForgotPasswordInput(req.body);

            let is_exist = await AdminService.is_exist(req.body.email);

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

                    let updateUserForgotpassword = await AdminService.update_token(token_data, email);

                    if (updateUserForgotpassword) {
                        // var link = process.env.BASE_URL + "bluebix-demo/forgot-password/" + data;
                        var link = process.env.BASE_URL + "auth/reset-password/" + data + "?role=admin";
                        const mail_option = {
                            filename: "reset_password",
                            data: link,
                            subject: "Forgot Password Link",
                            user: {
                                email: email
                            },
                        };
                        commonResponse.success(res, 200, updateUserForgotpassword, 'Forgot Password Link is sent to your registered email id');
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

    adminResetPassword: async (req, res, next) => {
        try {
            let token = req.body.token;
            let user = req.user._id;

            //check token is exist or not
            let is_exist_user_token = await AdminService.is_exist_admin_token(req.body.token);
            const { errors, isValid } = validateResetPasswordInput(req.body);



            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            if (is_exist_user_token) {

                //reset passowrd
                let user_password_reset = await AdminService.admin_password_reset(req.body, user);

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
            let statusCountDetails = await AdminService.count_jobopen_status(
                req.body
            );
            if (statusCountDetails) {
                commonResponse.success(
                    res,
                    200,
                    statusCountDetails,
                    "Count Details"
                );
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
    listCompany: async (req, res, next) => {
        try {
            let company_listing = await AdminService.company_list();

            if (company_listing) {
                commonResponse.success(res, 200, company_listing, "Company Listing");
            } else {
                return commonResponse.customResponse(
                    res,
                    "SERVER_ERROR",
                    400,
                    company_listing,
                    "Something went wrong, Please try again"
                );
            }
        } catch (error) {
            console.log("Listing company -> ", error);
            return next(error);
        }
    },

    listCompanyById: async (req, res, next) => {
        try {
            let company_listing_by_companyId =
                await AdminService.company_listing_by_companyId(req.body);

            if (company_listing_by_companyId) {
                commonResponse.success(
                    res,
                    200,
                    company_listing_by_companyId,
                    "Company details get successfully."
                );
            } else {
                return commonResponse.customResponse(
                    res,
                    "SERVER_ERROR",
                    400,
                    company_listing_by_companyId,
                    "Something went wrong, Please try again"
                );
            }
        } catch (error) {
            console.log("Listing company -> ", error);
            return next(error);
        }
    },


};
