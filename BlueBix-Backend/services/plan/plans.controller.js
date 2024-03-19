const PlanService = require("./plans.services");
const { commonResponse, commonFunctions } = require("../../helper");
const validatePlanInput = require("../../validations/admin/plan/plan");
// const validateJobApplyingShortListCandidateInput = require("../../validations/admin/jobapplying/candidateShortList");
const isEmpty = require("../../validations/is-empty");



module.exports = {

    /*
    *  Create Plan
    */
    createPlan: async (req, res, next) => {
        try {
            
            if(!req.user){
                return commonResponse.customErrorResponse(res, 401,"Invalid User login","Invalid Login credential");
            }

            let user = req.user;           

            const { errors, isValid } = validatePlanInput(req.body);

            let is_exist_plan_name = await PlanService.is_exist_Plan_Name(req.body.plan_name);

            if (is_exist_plan_name) {
                errors.plan_name = "Plan Name is already Exist"
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422,"Something went wrong",errors);
            }

            let plan_create = await PlanService.save(req.body,user);
            
            if (plan_create) {
                commonResponse.success(res, 200, plan_create, 'Plan Create Successfully ');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, plan_create, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },



    /*
    *   All Plan List
    */
    allPlanList: async (req, res, next) => {
        try {
            let all_plan_list_details = await PlanService.plan_list();

            if (all_plan_list_details) {
                commonResponse.success(res, 200, all_plan_list_details, 'All Plan List');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, all_plan_list_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Get Plan Detail By Id
    */
    getPlanDetails: async (req, res, next) => {
        try {
            let plan_details = await PlanService.get(req.params.id);
            if (plan_details) {
                commonResponse.success(res, 200, plan_details, 'Plan Details');
            } else {
                if (plan_details == false) {
                    return commonResponse.customResponse(res, "Plan", 400, plan_details, "Plan does not exist");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, plan_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Update Plan Details  By Id
    */
    updatePlanDetail: async (req, res, next) => {
        try {
            let id = req.params.id;

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }
            let user = req.user._id;

            let is_exist_plan = await PlanService.is_exist_plan(id);

            if (is_exist_plan) {

                const { errors, isValid } = validatePlanInput(req.body);

                let is_exist_plan_name = await PlanService.is_exist_Plan_Name(req.body.plan_name);

                if (is_exist_plan_name && isEmpty(errors.plan_name) && is_exist_plan_name._id != id) {
                    errors.plan_name = "Plan Name is already Exist"
                }

                // let is_exist_opening_id = await PlanService.is_exist(req.body.opening_id);

                // if (is_exist_opening_id && isEmpty(errors.opening_id) && is_exist_opening_id._id != id) {
                //     errors.opening_id = "Opening Id is Already Exist"
                // }

                if (!isValid || !isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                let updatePlanDetails = await PlanService.update(id, req.body, is_exist_plan, user);


                if (updatePlanDetails) {
                    commonResponse.success(res, 200, updatePlanDetails, 'Plan Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updatePlanDetails, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "Plan", 400, {}, "Plan does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },




}