const PlanAssginService = require("./planassign.services");
const { commonResponse, commonFunctions } = require("../../helper");
const validatePlanAssignInput = require("../../validations/admin/planassign/planAssign");
// const validateJobApplyingShortListCandidateInput = require("../../validations/admin/jobapplying/candidateShortList");
const isEmpty = require("../../validations/is-empty");



module.exports = {

    /*
    *  Create Plan Assign
    */
    createPlanAssign: async (req, res, next) => {
        try {
            
            if(!req.user){
                return commonResponse.customErrorResponse(res, 401,"Invalid User login","Invalid Login credential");
            }

            let user = req.user;           

            const { errors, isValid } = validatePlanAssignInput(req.body);

            let is_exist_Company_with_plan = await PlanAssginService.is_exist_Company_Plan(req.body.company_id);

            if (is_exist_Company_with_plan) {
                errors.company_id = "Company has already purchase Plan"
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422,"Something went wrong",errors);
            }

            let plan_assign_create = await PlanAssginService.save(req.body,user);
            
            if (plan_assign_create) {
                commonResponse.success(res, 200, plan_assign_create, 'Plan Assign Create Successfully ');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, plan_assign_create, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    



}