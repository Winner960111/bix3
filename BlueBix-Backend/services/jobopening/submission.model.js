const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

const candidateSubmissionSchema = new Schema(
    {
        opening_id: {
            type: String,
            ref: 'jobopening'
        },
        recruiter_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        bdm_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        candidate_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate'
        },
        company_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },
        freelancer_recruiter_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        is_company_view_submission: {
            type: Number,
            default: 1,
        },
        is_bdm_view_submission: {
            type: Number,
            default: 1,
        },

        //if candidate_select_by_bdm is 1 so it's select by bdm and also recruiter 
        //if candidate_select_by_bdm is 0 so it's select by only recruiter
        // candidate_select_by_bdm: {
        //     type:Number
        // },

        //status :- submission it's by recruiter
        //status :- submit it's by bdm
        //status :- reject it's by bdm
        submission_status: {
            type: String
        },
        //candidate_select_by_bdm :1 means bdm through candidate only submit not reject,hold,place,interview
        candidate_select_by_bdm: {
            type: Number
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

candidateSubmissionSchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });


const CandidateSubmission = mongoose.model("candidate_submission", candidateSubmissionSchema);

module.exports = CandidateSubmission;


