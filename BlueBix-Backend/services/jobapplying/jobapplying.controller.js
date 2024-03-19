const JobApplyingService = require("./jobapplying.services");
const { commonResponse, commonFunctions } = require("../../helper");
const validateJobApplyingInput = require("../../validations/admin/jobapplying/jobApplying");
const validateJobApplyingShortListCandidateInput = require("../../validations/admin/jobapplying/candidateShortList");
const isEmpty = require("../../validations/is-empty");



module.exports = {

    /*
    *  Create Job Applying
    */
    createJobApplying: async (req, res, next) => {
        try {

            if (!req.user || req.user.profile) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            const { errors, isValid } = validateJobApplyingInput(req.body);

            let is_exist_Candidate_Opening_id = await JobApplyingService.is_exist_Candidate_Opening_id(req.body);

            if (is_exist_Candidate_Opening_id) {
                errors.candidate_id = "Candidate already applied for this job post"
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let jobapplying_create = await JobApplyingService.save(req.body, user);

            if (jobapplying_create) {
                commonResponse.success(res, 200, jobapplying_create, 'Job Applying Successfully ');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobapplying_create, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  All List Job Applying
    */
    listOfJobApplying: async (req, res, next) => {
        try {

            // if(!req.user || req.user.role !='recruiter'){
            //     return commonResponse.customErrorResponse(res, 401,"Invalid User login","Invalid Login credential");
            // }


            let jobapplying_listing = await JobApplyingService.list(req.body);

            if (jobapplying_listing) {
                commonResponse.success(res, 200, jobapplying_listing, 'Job Applying Listing');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobapplying_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  Candidate Job Applying Profile Short List By Recruiter 
    */
    candidateProfileShortList: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            const { errors, isValid } = validateJobApplyingShortListCandidateInput(req.body);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let user = req.user._id;

            let candidate_profile_shortlist = await JobApplyingService.candidate_profile_shortlist(req.body, user);

            if (candidate_profile_shortlist) {
                commonResponse.success(res, 200, candidate_profile_shortlist, 'Candidate Profile Shortlist Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_profile_shortlist, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Get Detail Job Applying By Id
    */
    getJobApplyingDetails: async (req, res, next) => {
        try {

            let job_applying_details = await JobApplyingService.get(req.params.id);

            if (job_applying_details) {
                commonResponse.success(res, 200, job_applying_details, 'Candidate Job Applying Details');
            } else {
                if (job_applying_details == false) {
                    return commonResponse.customResponse(res, "User_Profile", 400, job_applying_details, "Candidate Job Applying does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, job_applying_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },




    /*
    *  Candidate Job Applying  List To Company 
    */
    listOfJobApplyingCandidateCompanyList: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            let jobapplied_candidate_list_company = await JobApplyingService.jobapplied_candidate_list_company(req.body, user);

            if (jobapplied_candidate_list_company) {
                commonResponse.success(res, 200, jobapplied_candidate_list_company, 'Job Applied Candidate Listing');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobapplied_candidate_list_company, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  Candidate Job Applying  List To Recruiter 
    */
    listOfJobApplyingCandidateRecruiterList: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            let jobapplied_candidate_list_recruiter = await JobApplyingService.jobapplied_candidate_list_recruiter(req.body, user);

            if (jobapplied_candidate_list_recruiter) {
                commonResponse.success(res, 200, jobapplied_candidate_list_recruiter, 'Job Applied Candidate Listing');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobapplied_candidate_list_recruiter, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *  Candidate Job Applying Candidate Wise Listing
    */
    listOfJobApplyingCandidateWiseList: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            let candidate_wise_job_applying_list = await JobApplyingService.jobapplied_candidate_wise_list(req.body, user);

            if (candidate_wise_job_applying_list) {
                commonResponse.success(res, 200, candidate_wise_job_applying_list, 'Job Applied Candidate Wise Listing');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, candidate_wise_job_applying_list, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    }

};