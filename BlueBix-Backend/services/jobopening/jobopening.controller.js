const JobOpeningService = require("./jobopening.services");
const { commonResponse, commonFunctions, common } = require("../../helper");
const validateJobOpeningInput = require("../../validations/admin/jobopening/jobOpening");
const validateContactInput = require("../../validations/admin/jobopening/accountOwner");
const validateCompanyInput = require("../../validations/admin/jobopening/accountOwner");
const validateJobAssignInput = require("../../validations/admin/jobassign/jobAssign");
const validatePrimaryRecruitInput = require("../../validations/admin/jobopening/primaryRecruiter");
const isEmpty = require("../../validations/is-empty");
const Roles = require("../roles/roles.model");
const CompanyModel = require("../../services/company/company.model");
const EmailTemplate = require("../emailtemplate/emailtemplate.model");
const UserServices = require('../../services/users/users.services')
const CandidateSubmission = require("./submission.model");
const JobOpenings = require("./jobopening.model");
const mail = require('../../helper/email/index');
const candidateServices = require('../candidate/candidate.services');
const Candidate = require("../candidate/candidate.model");
const UserModel = require("../users/users.model");

module.exports = {

    /*
    *  Create Job Opening
    */
    createJobOpening: async (req, res, next) => {
        try {
            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            const { errors, isValid } = validateJobOpeningInput(req.body);

            let is_exist_opening_id = await JobOpeningService.is_exist(req.body.opening_id);

            if (is_exist_opening_id) {
                errors.opening_id = "Opening Id is Already Exist"
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let jobopening_create = await JobOpeningService.save(req.body, req.user);
            console.log('jobopening_create', jobopening_create);

            if (jobopening_create) {

                console.log('x', req.user, typeof (req.user._id));

                if (req.body.company_name) {

                    const content = {
                        opening_title: jobopening_create.opening_title,
                        opening_id: jobopening_create.opening_id,
                        required_skills: jobopening_create.required_skills,
                        required_experience: jobopening_create.required_experience,
                        salary_type: jobopening_create.salary_type,
                        salary_range_from: jobopening_create.salary_range_from,
                        salary_range_to: jobopening_create.salary_range_to,
                        number_of_openings: jobopening_create.number_of_openings,
                        created_at: (new Date).toLocaleDateString()
                    };

                    // if admin then all assigned bdm + client
                    // if bdm then him + client
                    const rolename = await Roles.findById(req.user.assigned_role);
                    const company = await CompanyModel.findOne({ _id: req.body.account_name }, { email_1: 1, assigned_to_bdm: 1, is_email_send: 1 });
                    let is_exist_footer_email_template = (await EmailTemplate.find({ email_type: 'register_user_footer' }))[0];

                    if (!is_exist_footer_email_template) {
                        is_exist_footer_email_template = { content: "Best Regards, Bluebix Customer Support" };
                    }

                    if (rolename.role_name === 'admin') {
                        // all bdms
                        company.assigned_to_bdm.forEach(async el => {
                            const bdm = await UserServices.is_exist_user(el);
                            common.sendMailNotification('job_created', 'Job Created', el, bdm.display_name, bdm.login_email, is_exist_footer_email_template.content, true, content, req);
                        });
                    }
                    else {
                        // bdm
                        common.sendMailNotification('job_created', 'Job Created', req.user._id, req.user.display_name, req.user.email, is_exist_footer_email_template.content, false, content, req);
                    }

                    if (company.is_email_send) {
                        common.sendMailNotification('job_created', 'Job Created', company._id, req.body.company_name, company.email_1, is_exist_footer_email_template.content, false, content, req);
                    }

                    commonResponse.success(res, 200, jobopening_create, 'Job Opening Create Successfully ');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobopening_create, 'Something went wrong, Please try again');
                }
            }
        }
        catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  All List Job Opening
    */
    listJobOpening: async (req, res, next) => {
        try {

            let jobopening_listing = await JobOpeningService.list(req.body);

            if (jobopening_listing) {
                commonResponse.success(res, 200, jobopening_listing, 'Job Opening Listing');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobopening_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },
    /*
    *  All List Job Opening created by bdm
    */
    listJobOpeningBDM: async (req, res, next) => {
        try {

            let jobopening_listing = await JobOpeningService.listBDM(req.body);

            if (jobopening_listing) {
                commonResponse.success(res, 200, jobopening_listing, 'Job Opening Listing');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobopening_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
       *  Report download List Job Opening
       */
    reportDownloadListJobOpening: async (req, res, next) => {
        try {

            let jobopening_listing = await JobOpeningService.reportDownloadlist(req.body);

            if (jobopening_listing) {
                commonResponse.success(res, 200, jobopening_listing, 'Job Opening Listing');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobopening_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Get Detail Job Opening By Id
    */
    getJobOpeningDetails: async (req, res, next) => {
        try {
            let jobopening_details = await JobOpeningService.get(req.params.id);
            if (jobopening_details) {
                commonResponse.success(res, 200, jobopening_details, 'Job Opening Details');
            } else {
                if (jobopening_details == false) {
                    return commonResponse.customResponse(res, "User_Profile", 400, jobopening_details, "Job does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobopening_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Update Job Opening By Id
    */
    updateJobOpening: async (req, res, next) => {
        try {
            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            let user = req.user._id;

            let is_exist_job_opening = await JobOpeningService.is_exist_job_opening(id);

            if (is_exist_job_opening) {

                const { errors, isValid } = validateJobOpeningInput(req.body);

                let is_exist_opening_id = await JobOpeningService.is_exist(req.body.opening_id);

                if (is_exist_opening_id && isEmpty(errors.opening_id) && is_exist_opening_id._id != id) {
                    errors.opening_id = "Opening Id is Already Exist"
                }

                if (!isValid || !isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                let updateJobOpening = await JobOpeningService.update(id, req.body, is_exist_job_opening, user);


                if (updateJobOpening) {
                    commonResponse.success(res, 200, updateJobOpening, 'Job Opening Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateJobOpening, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "Job_Opening", 400, {}, "Job Opening does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Update Job Opening  Status
    */
    jobOpeningStatusChange: async (req, res, next) => {
        try {
            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            let user = req.user;

            let is_exist_job_opening = await JobOpeningService.is_exist_job_opening(id);

            if (is_exist_job_opening) {

                let updateJobOpeningStatus = await JobOpeningService.update_job_opening_status(id, req.body, user);


                if (updateJobOpeningStatus) {
                    commonResponse.success(res, 200, updateJobOpeningStatus, 'Job Opening Status Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateJobOpeningStatus, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "Job_Opening", 400, {}, "Job Opening does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  All List Category
    */
    listCategory: async (req, res, next) => {
        try {

            let category_listing = await JobOpeningService.listCategory();

            if (category_listing) {
                commonResponse.success(res, 200, category_listing, 'Category List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, category_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  All List Sub Category
    */
    listSubCategory: async (req, res, next) => {
        try {

            let sub_category_listing = await JobOpeningService.listSubCategory(req.body.category_code);

            if (sub_category_listing) {
                commonResponse.success(res, 200, sub_category_listing, 'Sub Category List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, sub_category_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Delete Job Opening By Id
    */
    deleteJobOpening: async (req, res, next) => {
        try {
            let id = req.params.id;
            let user = req.user._id;

            let is_exist_job_opening = await JobOpeningService.is_exist_job_opening(id);

            if (is_exist_job_opening) {

                let delete_jobopening = await JobOpeningService.delete(id, user, is_exist_job_opening);
                if (delete_jobopening) {
                    commonResponse.success(res, 200, delete_jobopening, 'Job Opening Deleted Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_jobopening, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "Job_Opening", 400, {}, "Job Opening does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  All List Account Name
    */
    listAccountName: async (req, res, next) => {
        try {
            let account_name_listing = await JobOpeningService.account_name();

            if (account_name_listing) {
                commonResponse.success(res, 200, account_name_listing, 'Account Name List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, account_name_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  All List Visa Type
    */
    listOfVisaType: async (req, res, next) => {
        try {
            let visa_type_listing = await JobOpeningService.visa_type_list();

            if (visa_type_listing) {
                commonResponse.success(res, 200, visa_type_listing, 'All Visa Type List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, visa_type_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
     *  Contact List for dropdown with first_name and last_name
     */
    getContactList: async (req, res, next) => {
        try {
            const { errors, isValid } = validateContactInput(req.body);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let contact_list_details = await JobOpeningService.contact_profile_list(req.body);

            if (contact_list_details) {
                commonResponse.success(res, 200, contact_list_details, 'All Contact Listing Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, contact_list_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  All List Account Owner
    */
    listAccountOwner: async (req, res, next) => {
        try {
            const { errors, isValid } = validateCompanyInput(req.body);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let account_owner_listing = await JobOpeningService.account_owner(req.body);

            if (account_owner_listing) {
                commonResponse.success(res, 200, account_owner_listing, 'Account Owner List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, account_owner_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  All List Account Owner
    */
    listPrimaryRecruit: async (req, res, next) => {
        try {

            const { errors, isValid } = validatePrimaryRecruitInput(req.body);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let primary_recruit_listing = await JobOpeningService.primary_recruit(req.body);

            if (primary_recruit_listing) {
                commonResponse.success(res, 200, primary_recruit_listing, 'Primary Recruit List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, primary_recruit_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  All Job Opning List with candidate skills wise
    */
    listJobOpeningCandidateSkillswise: async (req, res, next) => {
        try {

            if (!req.user || req.user.profile) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            let user = req.user;


            let job_opening_listing_candidate_skill_wise = await JobOpeningService.job_opening_candidate_skill(user);

            if (job_opening_listing_candidate_skill_wise) {
                commonResponse.success(res, 200, job_opening_listing_candidate_skill_wise, 'Job Opening Listing Candidate Skills Wise');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, job_opening_listing_candidate_skill_wise, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  All Category List with User wise
    */
    listOfCategoryUserwise: async (req, res, next) => {
        try {

            if (!req.user || req.user.qualification_details) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let category_list_user_wise = await JobOpeningService.category_list_user_wise(req.body);

            if (category_list_user_wise) {
                commonResponse.success(res, 200, category_list_user_wise, 'Category List User Wise');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, category_list_user_wise, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  Admin job assign to bdm
    */
    adminJobAssgin: async (req, res, next) => {
        try {
            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            const { errors, isValid } = validateJobAssignInput(req.body);
            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let user = req.user._id;
            let admin_job_assign = await JobOpeningService.admin_job_assign(req.body, user);

            if (admin_job_assign) {
                const opening = await JobOpeningService.is_exist(req.body.opening_id);
                const company = await CompanyModel.findById(opening.account_name);

                const content = {
                    opening_title: opening.opening_title,
                    company_name: company.company_name
                };
                let is_exist_footer_email_template = await EmailTemplate.find({ email_type: 'register_user_footer' });

                if (!is_exist_footer_email_template) {
                    is_exist_footer_email_template = { content: "Best Regards, Bluebix Customer Support" };
                }

                if (req.body.bdm_id) {
                    req.body.bdm_id.forEach(async el => {
                        const bdm = await UserServices.is_exist_user(el);
                        common.sendMailNotification('job_assigned', 'Job Assigned', el, bdm.display_name, bdm.login_email, is_exist_footer_email_template[0].content, true, content, req);
                    });
                }

                if (req.body.assigned_by_bdm) {
                    const bdm = await UserServices.is_exist_user(req.body.assigned_by_bdm);
                    content.assigned_by = 'bdm';
                    common.sendMailNotification('job_assigned', 'Job Assigned', bdm._id, bdm.display_name, bdm.login_email, is_exist_footer_email_template[0].content, true, content, req);
                }

                commonResponse.success(res, 200, admin_job_assign, 'Successfully Job Assign');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, admin_job_assign, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  All Bdm list which profile is bdm
    */
    allBdmUserList: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let all_bdm_list = await JobOpeningService.all_bdm_list();

            if (all_bdm_list) {
                commonResponse.success(res, 200, all_bdm_list, 'All Bdm User List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, all_bdm_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  All Recruiter list which profile is recruiter
    */
    allRecruiterUserList: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let all_recruiter_list = await JobOpeningService.all_recruiter_list();

            if (all_recruiter_list) {
                commonResponse.success(res, 200, all_recruiter_list, 'All Recruiter User List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, all_recruiter_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  Create Visa Type
    */
    createVisaType: async (req, res, next) => {
        try {

            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }

            // let user = req.user._id;

            // const { errors, isValid } = validateJobOpeningInput(req.body);

            // let is_exist_opening_id = await JobOpeningService.is_exist(req.body.opening_id);

            // if (is_exist_opening_id) {
            //     errors.opening_id = "Opening Id is Already Exist"
            // }

            // if (!isValid || !isEmpty(errors)) {
            //     return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            // }

            let visa_type_create = await JobOpeningService.save_visa_type(req.body);

            if (visa_type_create) {
                commonResponse.success(res, 200, visa_type_create, 'Visa Type Create Successfully ');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, visa_type_create, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Get Detail Visa Type By Id
    */
    getVisaTypeDetails: async (req, res, next) => {
        try {
            let visa_type_details = await JobOpeningService.get_details_visa_type(req.params.id);

            if (visa_type_details) {
                commonResponse.success(res, 200, visa_type_details, 'Visa Type Details');
            } else {
                if (visa_type_details == false) {
                    return commonResponse.customResponse(res, "User_Profile", 400, visa_type_details, "Job does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, visa_type_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
     *   Update Visa Type By Id
    */
    updateVisaTypeDetails: async (req, res, next) => {
        try {
            let id = req.params.id;

            // if (!req.user) {
            //     return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            // }
            // let user = req.user._id;

            // let is_exist_job_opening = await JobOpeningService.is_exist_job_opening(id);

            // if (is_exist_job_opening) {

            //     const { errors, isValid } = validateJobOpeningInput(req.body);

            //     let is_exist_opening_id = await JobOpeningService.is_exist(req.body.opening_id);

            //     if (is_exist_opening_id && isEmpty(errors.opening_id) && is_exist_opening_id._id != id) {
            //         errors.opening_id = "Opening Id is Already Exist"
            //     }

            //     if (!isValid || !isEmpty(errors)) {
            //         return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            //     }

            let updateVisaType = await JobOpeningService.update_visa_type_details(id, req.body);
            // let updateJobOpening = await JobOpeningService.update(id, req.body, is_exist_job_opening, user);


            if (updateVisaType) {
                commonResponse.success(res, 200, updateVisaType, 'Visa Type Updated Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateVisaType, 'Something went wrong, Please try again');
            }
            // } else {
            //     return commonResponse.customResponse(res, "Job_Opening", 400, {}, "Job Opening does not exist");
            // }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   send candidate details in mail to client when bdm submittes
   */
    sendCandidateMailToClient: async (req, company_id, opening_id, candidate_id, bdm_name, footer_content) => {
        company = await CompanyModel.findById(company_id);

        // apply condition based on company flag here
        if (company && company.is_email_send) {


            const jobOpening = await JobOpenings.find({ opening_id: opening_id }, { opening_id: 1, opening_title: 1, salary_range_from: 1, salary_range_to: 1, salary_type: 1, short_description: 1 });
            const candidate = await candidateServices.get(candidate_id);

            const send_mail = {
                name: company.company_name,
                content: { ...candidate[0], ...(jobOpening[0]._doc), ...{ bdm_name: (bdm_name) } },
                footer_content,
            };

            const mail_options = {
                filename: 'candidate_details',
                data: send_mail,
                subject: "Candidate Submitted from bdm",
                from_user_email: "test.knptech.2023@gmail.com",
                from_user_password: "qufezstbbfkkxhid",
                smtp_host: "smtp.gmail.com",
                smtp_port: 465,
                user: {
                    email: company.email_1
                }
            };

            if (candidate[0].attachments) {
                mail_options.attachments = [{
                    filename: candidate[0].attachments,
                    path: `public/upload/candidate/${candidate[0].attachments}`
                }]
            }
            await mail.send(mail_options, req);
        }
    },


    /*
     *   Create Candidate Submission by recruiter
    */
    createCandidateSubmissionByRecruiter: async (req, res, next) => {
        try {
            let candidate_submission_recruiter = await JobOpeningService.candidate_submission_by_recruiter(req.body);

            if (candidate_submission_recruiter) {
                let is_exist_footer_email_template = await EmailTemplate.find({ email_type: 'register_user_footer' });

                if (!is_exist_footer_email_template) {
                    is_exist_footer_email_template = { content: "Best Regards, Bluebix Customer Support" };
                }
                req.body.candidate_submission_by_recruiter.forEach(async el => {
                    const bdm = await UserServices.is_exist_user(el.bdm_id);

                    if (el.company_id && el.candidate_select_by_bdm) {
                        module.exports.sendCandidateMailToClient(req, el.company_id, el.opening_id, el.candidate_id, bdm.display_name, is_exist_footer_email_template[0].content);
                    }

                    const opening = (await JobOpenings.find({ opening_id: el.opening_id }))[0];
                    const candidate = await Candidate.findById(el.candidate_id);
                    const content = {
                        opening_id: el.opening_id,
                        opening_title: opening.opening_title,
                        candidate_name: candidate.first_name + candidate.last_name
                    };

                    // direct submission by bdm in that case no creator, so we dont attach anything to content
                    if (!el.candidate_select_by_bdm) {

                        // if candidate submitted by freelancer
                        if (el.freelancer_recruiter_id) {
                            const freelancer = await UserModel.findById(el.freelancer_recruiter_id);
                            content.created_by = 'Freelancer Recruiter';
                            content.creator_name = freelancer.first_name + freelancer.last_name;
                        } else {
                            const recruiter = await UserModel.findById(el.recruiter_id);
                            content.created_by = 'Recruiter';
                            content.creator_name = recruiter.first_name + recruiter.last_name;
                        }
                    }
                    common.sendMailNotification('candidate_submitted', 'Candidate Submitted', el.bdm_id, bdm.display_name, bdm.login_email, is_exist_footer_email_template[0].content, true, content, req);
                });
                commonResponse.success(res, 200, candidate_submission_recruiter, 'Candidate Submitted By Recruiter Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_submission_recruiter, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
     *   Create Candidate Submission by bdm
     */

    createCandidateSubmissionByBDM: async (req, res, next) => {
        try {
            let candidate_submission_bdm = await JobOpeningService.candidate_submission_by_bdm(req.body);

            if (candidate_submission_bdm) {
                let is_exist_footer_email_template = await EmailTemplate.find({ email_type: 'register_user_footer' });

                if (!is_exist_footer_email_template) {
                    is_exist_footer_email_template = { content: "Best Regards, Bluebix Customer Support" };
                }
                req.body.candidate_submission_by_bdm.forEach(async el => {
                    const bdm = await UserServices.is_exist_user(el.bdm_id);

                    const candidateSub = await CandidateSubmission.findById(el._id);
                    const candidate = await Candidate.findById(candidateSub.candidate_id);

                    if (el.company_id && el.submission_status == 'submit') {
                        module.exports.sendCandidateMailToClient(req, el.company_id, el.opening_id, candidateSub.candidate_id, bdm.display_name, is_exist_footer_email_template[0].content);
                    }

                    const opening = (await JobOpenings.find({ opening_id: el.opening_id }))[0];

                    const content = {
                        opening_id: el.opening_id,
                        opening_title: opening.opening_title,
                        candidate_name: candidate.first_name + candidate.last_name
                    };
                    common.sendMailNotification('candidate_submitted', 'Candidate Submitted', el.bdm_id, bdm.display_name, bdm.login_email, is_exist_footer_email_template[0].content, true, content, req);
                });

                commonResponse.success(res, 200, candidate_submission_bdm, 'Successfully Candidate Submission By Bdm');
            }
            else
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_submission_bdm, 'Something went wrong, Please try again');

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
     *   Candidate Submission List for recruiter
     */
    candidateSubmissionList: async (req, res, next) => {
        try {
            let candidate_submission_recruiter = await JobOpeningService.candidate_submission_listing(req.body);

            if (candidate_submission_recruiter) {
                commonResponse.success(res, 200, candidate_submission_recruiter, 'Candidate Submission Listing');
            } else {

                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_submission_recruiter, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
     *   Candidate Submission List for bdms to see history of previos candidate submitted by bdm
     */
    candidatesSubmissionByOtherBDM: async (req, res, next) => {
        try {
            let candidate_submission_recruiter = await JobOpeningService.candidate_submission_listing_other_bdm(req.body);

            if (candidate_submission_recruiter) {
                commonResponse.success(res, 200, candidate_submission_recruiter, 'Candidate Submission Listing');
            } else {

                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_submission_recruiter, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
     *   All Candidate List for Submission e.g. if candidate already submit so it's not showing in this list
     */
    allCandidateListForSubmission: async (req, res, next) => {
        try {
            let all_candidate_list_submission = await JobOpeningService.all_candidate_list_submission(req.body);

            if (all_candidate_list_submission) {
                commonResponse.success(res, 200, all_candidate_list_submission, 'All Candidate List For Submission');
            } else {

                return commonResponse.customResponse(res, "SERVER_ERROR", 400, all_candidate_list_submission, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
     *   Job Activity List by Opening_id
     */
    jobActivityLogList: async (req, res, next) => {
        try {
            let activity_log_list = await JobOpeningService.job_activity_log_list(req.body, req.user);

            if (activity_log_list) {
                commonResponse.success(res, 200, activity_log_list, 'Job Activity Log List');
            } else {

                return commonResponse.customResponse(res, "SERVER_ERROR", 400, activity_log_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
     *  Reject Candidate Submission List by Bdm 
     */
    candidateSubmissionRejectListByBDM: async (req, res, next) => {
        try {
            let reject_candidate_list = await JobOpeningService.reject_candidate_list_bdm(req.body);

            if (reject_candidate_list) {
                commonResponse.success(res, 200, reject_candidate_list, 'Reject Candidate List');
            } else {

                return commonResponse.customResponse(res, "SERVER_ERROR", 400, reject_candidate_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
     *  Hold Candidate Submission List by Bdm 
     */
    candidateSubmissionHoldListByBDM: async (req, res, next) => {
        try {
            let hold_candidate_list = await JobOpeningService.hold_candidate_list_bdm(req.body);

            if (hold_candidate_list) {
                commonResponse.success(res, 200, hold_candidate_list, 'Hold Candidate List');
            } else {

                return commonResponse.customResponse(res, "SERVER_ERROR", 400, hold_candidate_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },



    /*
    *   Submit Candidate List Opening Id Wise e.g. Candidate Select By Bdm
    */
    submitCandidateListOpeningIdWise: async (req, res, next) => {
        try {
            let submit_candidate_list = await JobOpeningService.submit_candidate_opening_id_wise(req.body, req.user);

            if (submit_candidate_list) {
                commonResponse.success(res, 200, submit_candidate_list, 'Submit Candidate List');
            } else {

                return commonResponse.customResponse(res, "SERVER_ERROR", 400, submit_candidate_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },



    /*
    *  Recruiter through Submission Candidate List for Bdm 
    */
    submissionCandidateListForBdm: async (req, res, next) => {
        try {
            let recruiter_submission_candidate_list = await JobOpeningService.recruiter_submission_candidate_list(req.body);

            if (recruiter_submission_candidate_list) {
                commonResponse.success(res, 200, recruiter_submission_candidate_list, 'Submission  Candidate List For BDM');
            } else {

                return commonResponse.customResponse(res, "SERVER_ERROR", 400, recruiter_submission_candidate_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  Candidate Re-Sent to Recruiter Candidate List By BDM
    */
    candidateSubmissionResubmitByBDMToRecruiter: async (req, res, next) => {
        try {
            let resend_candidate_list_recruiter = await JobOpeningService.resend_candidate_recruiter(req.body);

            if (resend_candidate_list_recruiter) {
                commonResponse.success(res, 200, resend_candidate_list_recruiter, 'Candidate Re-submission By Bdm');
            } else {

                return commonResponse.customResponse(res, "SERVER_ERROR", 400, resend_candidate_list_recruiter, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  Candidate Re-Sent to All Candidate List By Recruiter
    */
    candidateWithDrawByRecruiter: async (req, res, next) => {
        try {

            let candidate_withdraw_by_recruiter = await JobOpeningService.resend_candidate_to_all_candidate_list(req.body);

            if (candidate_withdraw_by_recruiter) {
                commonResponse.success(res, 200, candidate_withdraw_by_recruiter, 'Candidate Withdraw By Recruiter');
            } else {

                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_withdraw_by_recruiter, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    submitCandidateListByBDMRecruiterFreelancerIdWise: async (req, res, next) => {
        try {
            let submit_candidate_list = await JobOpeningService.submit_candidate_bdm_recruiter_freelance_id_wise(req.body);

            if (submit_candidate_list) {
                commonResponse.success(res, 200, submit_candidate_list, 'Submit Candidate List');
            } else {

                return commonResponse.customResponse(res, "SERVER_ERROR", 400, submit_candidate_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    listOfAssignments: async (req, res, next) => {
        try {

            let assignmentList = await JobOpeningService.assignmentList(req.body);

            if (assignmentList) {
                commonResponse.success(res, 200, assignmentList, 'List Of Assignment for Job');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, assignmentList, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Assignment List -> ", error);
            return next(error);
        }
    },


    listForAssignedBdm: async (req, res, next) => {
        try {
            let assignmentList = await JobOpeningService.assignedBDMList(req.body);
            if (assignmentList) {
                commonResponse.success(res, 200, assignmentList, 'List Of Job Assigned To Bdm');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, assignmentList, 'Something went wrong, Please try again');
            }
        }
        catch (error) {
            console.log("Assigned BDM -> ", error);
            return next(error);
        }
    },

    listForAssignedRecruiters: async (req, res, next) => {
        try {
            let assignmentList = await JobOpeningService.assignedRecruitersList(req.body);
            if (assignmentList) {
                commonResponse.success(res, 200, assignmentList, 'List Of Job Assigned To Bdm');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, assignmentList, 'Something went wrong, Please try again');
            }
        }
        catch (error) {
            console.log("Assigned BDM -> ", error);
            return next(error);
        }
    },
};