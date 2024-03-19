const ContactService = require("./contact.services");
const UserService = require("../users/users.services");
const { commonResponse, commonFunctions } = require("../../helper");
const validateContactInput = require("../../validations/admin/contact/contact");
const mail = require("../../helper/email/index");
const isEmpty = require("../../validations/is-empty");


module.exports = {

    /*
    *  Create Contact
    */
    createContact: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            const { errors, isValid } = validateContactInput(req.body);

            req.body.email = req.body.email.toLowerCase();
            let is_exist = await ContactService.is_exist(req.body.email);
            // let is_exist_company_name = await ContactService.is_exist_company_name(req.body.company_id);

            if (is_exist) {
                errors.email = "Email Id is Already Exist"
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let user = await ContactService.save(req.body, req.user);
            if (user) {
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

                const email = user.email;
                const name = user.first_name + ' ' + user.last_name;

                // const link = process.env.BASE_URL + "bluebix-demo/auth/company/login";
                const link = process.env.BASE_URL + "auth/login";
                const send_mail_data = {
                    link: link,
                    name: name,
                    email: email,
                    content: is_exist_email_template.content,
                    footer_content: is_exist_footer_email_template.content,
                    role: 'contact'
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
                commonResponse.success(res, 201, user, 'Contact Create Successfully');
                const send_mail = await mail.send(mail_option, req);
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, user, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  Contact List
    */
    getAllContactList: async (req, res, next) => {
        try {

            let contact_list = await ContactService.contactlist(req.body);

            if (contact_list) {
                commonResponse.success(res, 200, contact_list, 'All Contact Listing Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, contact_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Get Detail Contact Profile By Id
    */
    getContactProfileDetails: async (req, res, next) => {
        try {
            let contact_profile_details = await ContactService.get(req.params.id);
            if (contact_profile_details) {
                commonResponse.success(res, 200, contact_profile_details, 'Contact Profile Details');
            } else {
                if (contact_profile_details == false) {
                    return commonResponse.customResponse(res, "User_Profile", 400, contact_profile_details, "Company does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, contact_profile_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  Contact Profile Update  By Id
    */
    updateContactProfile: async (req, res, next) => {
        try {
            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            // let user = req.user._id;
            var url = req.originalUrl.split('/');

            let is_exist_user = await ContactService.is_exist_user(id);

            if (is_exist_user) {

                const { errors, isValid } = validateContactInput(req.body, url[4]);

                let is_exist_email = await ContactService.is_exist(req.body.email);
                // let is_exist_company_name = await ContactService.is_exist_company_name(req.body.company_id);

                if (is_exist_email && isEmpty(errors.email) && is_exist_email._id != id) {
                    errors.email = "Email Id is Already Exist"
                }

                if (!isValid || !isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                let updateContactProfile = await ContactService.update(id, req.body, req.user);

                if (updateContactProfile) {
                    commonResponse.success(res, 200, updateContactProfile, 'Contact Profile Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateContactProfile, 'Something went wrong, Please try again');
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
    *   Delete Contact By Id
    */
    deleteContactProfile: async (req, res, next) => {
        try {
            let id = req.params.id;

            // if(!req.user){
            //     return commonResponse.customErrorResponse(res, 401,"Invalid User login","Invalid Login credential");
            // }

            // let user = req.user._id;

            let delete_company_profile = await ContactService.delete(id);
            if (delete_company_profile) {
                commonResponse.success(res, 200, delete_company_profile, 'Contact Profile Deleted Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_company_profile, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Create Contact Activity
    */
    createContactActivity: async (req, res, next) => {
        try {
            let id = req.params.id;

            // if(!req.user){
            //     return commonResponse.customErrorResponse(res, 401,"Invalid User login","Invalid Login credential");
            // }

            // let user = req.user._id;

            let contact_activity = await ContactService.create_contact_activity(req.body);
            if (contact_activity) {
                commonResponse.success(res, 200, contact_activity, 'Contact Activity Create Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, contact_activity, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   All Contact Activity List
    */
    contactActivityList: async (req, res, next) => {
        try {
            let id = req.params.id;

            // if(!req.user){
            //     return commonResponse.customErrorResponse(res, 401,"Invalid User login","Invalid Login credential");
            // }

            // let user = req.user._id;

            let contact_activity_list = await ContactService.contact_activity_list(req.body);
            if (contact_activity_list) {
                commonResponse.success(res, 200, contact_activity_list, 'All Contact Activity List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, contact_activity_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  Contact List for dropdown with first_name and last_name
    */
    // getContactList: async (req, res, next) => {
    //     try {

    //         let contact_list_details = await ContactService.contact_profile_list(req.body);

    //         if (contact_list_details) {
    //             commonResponse.success(res, 200, contact_list_details, 'All Contact Listing Details');
    //         } else {
    //             return commonResponse.customResponse(res, "SERVER_ERROR", 400, contact_list_details, 'Something went wrong, Please try again');
    //         }
    //     } catch (error) {
    //         console.log("Create User -> ", error);
    //         return next(error);
    //     }
    // },
    bdmContactList: async (req, res, next) => {
        try {
            let bdmContactList = await ContactService.getBdmContactList(req.body);
            if (bdmContactList) {
                commonResponse.success(res, 200, bdmContactList, 'All Contact Listing Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, bdmContactList, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.error("Bdm Contact List -> ", error);
            return next(error);
        }
    },

    adminContactList: async (req, res, next) => {
        try {
            let bdmContactList = await ContactService.getAdminContactList(req.body);
            if (bdmContactList) {
                commonResponse.success(res, 200, bdmContactList, 'All Contact Listing Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, bdmContactList, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.error("Bdm Contact List -> ", error);
            return next(error);
        }
    }
};
