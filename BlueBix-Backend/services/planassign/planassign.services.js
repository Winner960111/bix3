const PlanAssignModel = require("./planassign.model");
const PlanModel = require("../plan/plans.model");
const PlanHistoryModel = require("../plan/planhistory.model");
const CompanyModel = require("../company/company.model");
const isEmpty = require("../../validations/is-empty");
const { commonResponse } = require("../../helper");
const mongoose = require("mongoose");
const moment = require("moment")



/*
*  Check Company has already Purchase Plan
*/
exports.is_exist_Company_Plan = async (company_id) => {
    try {
        let company_plan = await PlanAssignModel.findOne({ company_id: company_id, plan_assign_status: 'Active' }).lean();
        if (!company_plan) {
            return false;
        }
        return company_plan;
    } catch (error) {
        console.error("Error : ", error);
    }
};




/*
*  Plan Assign to Company
*/
exports.save = async (reqbody, user) => {
    try {

        let startDate = moment().format('YYYY-MM-DD');

        let plan_history_details = await PlanHistoryModel.findOne({ plan_id: reqbody.plan_id }).sort({ created_at: -1 }).limit(1)

        let plan_assign_create = {};

        if (plan_history_details.plan_duration) {

            let plan_duration_in_month = plan_history_details.plan_duration.split(" ")[0]

            //return plan_end_date
            let end_date = moment(startDate).add(plan_duration_in_month, 'M').format('YYYY-MM-DD')
            plan_assign_create.plan_end_date = end_date
        }

        plan_assign_create.plan_id = reqbody.plan_id,
            plan_assign_create.plan_history_id = plan_history_details._id,
            plan_assign_create.company_id = reqbody.company_id,
            plan_assign_create.plan_assign_name = plan_history_details.plan_name,
            plan_assign_create.company_candidate_view_count = plan_history_details.candidate_view_limit,
            plan_assign_create.company_email_limit_count = plan_history_details.email_limit,
            plan_assign_create.company_job_opening_count = plan_history_details.job_opening_limit,
            plan_assign_create.company_plan_price = plan_history_details.plan_price,
            plan_assign_create.plan_start_date = startDate,
            plan_assign_create.plan_assign_duration = plan_history_details.plan_duration,
            plan_assign_create.plan_assign_status = 'Active',
            plan_assign_create.created_at = Date.now()
        plan_assign_create.updated_at = Date.now()
        plan_assign_create.created_by = user._id
        plan_assign_create.updated_by = user._id


        let create_plan_assign = await PlanAssignModel.create(plan_assign_create);

        if (create_plan_assign) {
            let company_assign_plan = await CompanyModel.updateOne({ _id: reqbody.company_id }, { company_plan_status: 1 })
        }

        return create_plan_assign
    } catch (error) {
        console.error("Error : ", error);
    }
};

