const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

const planHistorySchema = new Schema(
    {
        plan_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan'
        },
        plan_name:{
            type:String
        },
        candidate_view_limit: {
            type:Number
        },
        email_limit : {
            type:Number
        },
        job_opening_limit:{
            type:Number
        },
        plan_price:{
            type:Number
        },
        plan_duration:{
            type:String
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        // created_by:{
        //     type: mongoose.Schema.Types.ObjectId
        // },
        updated_at: {
            type: Date,
            default: Date.now
        },
        deleted_by:{
            type: mongoose.Schema.Types.ObjectId,
            default:null
        },
        
  },
);

planHistorySchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const PlanHistory = mongoose.model("plan_history", planHistorySchema);

module.exports = PlanHistory;


