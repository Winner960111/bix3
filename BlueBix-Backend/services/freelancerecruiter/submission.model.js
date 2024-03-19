const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

const freelancerSubmissionSchema = new Schema(
    {
        opening_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'jobopening',
            required: true
        },
        freelancer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        candidate_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate',
            required: true
        },
        job_work_application_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'JobWorkApplication',
            required: true
        },

        
        //if candidate_select_by_bdm is 1 so it's select by bdm and also recruiter 
        //if candidate_select_by_bdm is 0 so it's select by only recruiter
        // candidate_select_by_bdm: {
        //     type:Number
        // },

        //status :- submission it's by recruiter
        //status :- submit it's by bdm
        //status :- reject it's by bdm
        submission_status:{
            type:String,
            required: true
        },

        created_at: {
            type: Date,
            default: Date.now
        },
        updated_at: {
            type: Date,
            default: Date.now
        }

    },
);

// candidateSubmissionSchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });


const FreelancerSubmission = mongoose.model("freelance_submission", freelancerSubmissionSchema);

module.exports = FreelancerSubmission;


