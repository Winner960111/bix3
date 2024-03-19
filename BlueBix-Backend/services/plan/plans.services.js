const PlanModel = require("./plans.model");
const PlanHistoryModel = require("./planhistory.model");
const isEmpty = require("../../validations/is-empty");
const { commonResponse } = require("../../helper");
const mongoose = require("mongoose");




/*
*  Check Plan Name already Exist
*/
exports.is_exist_Plan_Name = async (plan_name) => {
    try {
        let plan_name_exist = await PlanModel.findOne({ plan_name: plan_name }).lean();
        if (!plan_name_exist) {
            return false;
        }
        return plan_name_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check Plan Exist
*/
exports.is_exist_plan = async (id) => {
    try {
        let plan_exist = await PlanModel.findOne({ _id: id }).lean();
        if (!plan_exist) {
            return false;
        }
        return plan_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Plan Create
*/
exports.save = async (reqbody, user) => {
    try {


        let plan_create = {};

        plan_create.plan_name = reqbody.plan_name,
            plan_create.candidate_view_limit = reqbody.candidate_view_limit,
            plan_create.email_limit = reqbody.email_limit,
            plan_create.job_opening_limit = reqbody.job_opening_limit,
            plan_create.plan_price = reqbody.plan_price,
            plan_create.plan_duration = reqbody.plan_duration,
            plan_create.created_at = Date.now()
        plan_create.updated_at = Date.now()
        plan_create.created_by = user._id
        plan_create.updated_by = user._id


        let create_plan = await PlanModel.create(plan_create);

        if (create_plan) {

            const planhistory = new PlanHistoryModel({
                plan_id: create_plan._id,
                plan_name: create_plan.plan_name,
                candidate_view_limit: create_plan.candidate_view_limit,
                job_opening_limit: create_plan.job_opening_limit,
                email_limit: create_plan.email_limit,
                plan_price: create_plan.plan_price,
                plan_duration: create_plan.plan_duration,
                created_at: Date.now(),
                updated_at: Date.now()
                // created_by: create_plan.created_by,
            });

            let plan_history_create = await planhistory.save();
        }
        return create_plan
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  All Plan List Details
*/
exports.plan_list = async (id) => {
    try {

        let plan_list_details = await PlanModel.find({ deleted: false });

        if (!plan_list_details) {
            return false;
        }
        return plan_list_details;


    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Get Plan Detail By Id
*/
exports.get = async (id) => {
    try {

        let plan_details = await PlanModel.findOne({ _id: id });

        if (!plan_details) {
            return false;
        }
        return plan_details;


    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Admin,BDM,Recruiter Update Job Opening 
*/
exports.update = async (id, reqbody, is_exist_plan, user) => {
    try {

        let update_plan = {};


        update_plan.plan_name = reqbody.plan_name,
            update_plan.candidate_view_limit = reqbody.candidate_view_limit,
            update_plan.email_limit = reqbody.email_limit,
            update_plan.job_opening_limit = reqbody.job_opening_limit,
            update_plan.plan_price = reqbody.plan_price,
            update_plan.plan_duration = reqbody.plan_duration,
            update_plan.updated_at = Date.now()
        update_plan.updated_by = user


        let plan_update = await PlanModel.updateOne({ _id: id }, update_plan).lean();

        if (plan_update) {

            const planhistory = new PlanHistoryModel({
                plan_id: id,
                plan_name: reqbody.plan_name,
                candidate_view_limit: reqbody.candidate_view_limit,
                job_opening_limit: reqbody.job_opening_limit,
                email_limit: reqbody.email_limit,
                plan_price: reqbody.plan_price,
                plan_duration: reqbody.plan_duration,
                created_at: Date.now(),
                updated_at: Date.now()
            });

            let plan_history_create = await planhistory.save();

        }

        return plan_update
    } catch (error) {
        console.error("Error : ", error);
    }
};