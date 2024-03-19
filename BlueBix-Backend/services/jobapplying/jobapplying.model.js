const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//Admin,BDM,Recruiter Create Job Opening
const jobApplyingSchema = new Schema(
    {
        company_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
        },
        job_opening_id: {
            type: String,
            ref: 'jobopening',
            required: true
        },
        opening_title: {
            type: String
        },
        candidate_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate',
            required: true
        },
        recruiter_id: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
        },
        //Profile Submit default value 1 means candidate apply for job
        profile_submit: {
            type: Number
        },
        // Profile Shortlist value 1 means recruiter shortlist candidate for job post and value 0 means candidate rejected
        profile_shortlist: {
            type: Number
        },
        interview_schedule: {
            type: Number
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
        },
        updated_at: {
            type: Date,
            default: Date.now
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId
        },
        deleted_by: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        }
    },
);


jobApplyingSchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });


const JobApplyings = mongoose.model("jobapplying", jobApplyingSchema);

module.exports = JobApplyings;


