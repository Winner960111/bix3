const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

const planAssignSchema = new Schema(
    {
        company_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },
        plan_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan'
        },
        plan_history_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'plan_history'
        },
        plan_assign_name:{
            type:String
        },
        company_candidate_view_count: {
            type:Number
        },
        company_email_limit_count : {
            type:Number
        },
        company_job_opening_count:{
            type:Number
        },
        candidate_view_list:{
            type:Array
        },
        company_plan_price:{
            type:Number
        },
        plan_start_date:{
             type:Date
        },
        plan_end_date:{
             type:Date 
        },
        plan_assign_duration:{
             type:String
        },
        plan_assign_status:{
            type:String
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        created_by:{
            type: mongoose.Schema.Types.ObjectId
        },
        updated_at: {
            type: Date,
            default: Date.now
        },
        updated_by:{
            type: mongoose.Schema.Types.ObjectId
        },
        deleted_by:{
            type: mongoose.Schema.Types.ObjectId,
            default:null
        },
        
  },
);

planAssignSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const PlanAssign = mongoose.model("Plan_Assign", planAssignSchema);

module.exports = PlanAssign;


