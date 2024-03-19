const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

const planSchema = new Schema(
    {
        plan_name:{
            type:String,
            required:true
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
        // plan_status:{
        //     type:String
        // },
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

planSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;


