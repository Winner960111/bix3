const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Register
const interviewScheduleSchema = new Schema(
    {
        date_of_interview:{
            type: Date,
        },
        duration:{
            type: String      
        },
        interview_type:{
            type: String      
        },
        time_of_interview:{
            type: String   
        },
        comment:{
            type: String
        },
        status: {
            type:String,
        },
        opening_id:{
            type: String,
            ref: "jobopening"
        },
        candidate_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
        },
        submission_id:{
            type:  mongoose.Schema.Types.ObjectId,
            ref: "candidate_submission",
        },
        bdm_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        company_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        recruiter_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        freelancer_recruiter_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        message:{
            type: String
        },
        is_company_view_message:{
            type:Number,
            default:1,
        },
        created_at: {
            type: Date,
            default: Date.now
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
        }
  },
);

interviewScheduleSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });

const Interviewschedul = mongoose.model("interviewschedule", interviewScheduleSchema);

module.exports = Interviewschedul;


