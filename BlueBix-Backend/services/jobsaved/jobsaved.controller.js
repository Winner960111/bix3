const JobSavedService = require("./jobsaved.services");
const { commonResponse, commonFunctions } = require("../../helper");
const validateJobApplyingInput = require("../../validations/admin/jobapplying/jobApplying");
const validateJobApplyingShortListCandidateInput = require("../../validations/admin/jobapplying/candidateShortList");
const isEmpty = require("../../validations/is-empty");



module.exports = {

    /*
    *  Candidate Job Saved
    */

    createJobSaved: async (req, res, next) => {
        try {

            if (!req.user || req.user.profile) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            const { errors, isValid } = validateJobApplyingInput(req.body);

            let is_exist_Candidate_Opening_id = await JobSavedService.is_exist_Candidate_Opening_id(req.body);

            if (is_exist_Candidate_Opening_id) {
                errors.candidate_id = "Candidate already saved this job post"
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let jobsaved_create = await JobSavedService.save(req.body, user);

            if (jobsaved_create) {
                commonResponse.success(res, 200, jobsaved_create, 'Job Saved Successfully ');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobsaved_create, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  All List Job Saved
    */
    listOfJobSaved: async (req, res, next) => {
        try {

            if (!req.user || req.user.profile) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user._id;

            let jobsaved_listing = await JobSavedService.list(user);

            if (jobsaved_listing) {
                commonResponse.success(res, 200, jobsaved_listing, 'Job Saved Listing');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobsaved_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    }


};