const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

const jobActivitySchema = new Schema(
    {
        activity_log:{
            type:String
        },
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
        company_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },
       freelance_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        updated_at: {
            type: Date,
            default: Date.now
        },
        created_by:{
            type: mongoose.Schema.Types.ObjectId,
        },
        updated_by:{
            type: mongoose.Schema.Types.ObjectId
        }

    },
);

jobActivitySchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });


const JobActivity = mongoose.model("job_activity", jobActivitySchema);

module.exports = JobActivity;


