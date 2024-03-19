const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

// job work application
const jobworkSchema = new Schema(
    {
        freelance_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        opening_id: {
            type: String,
            ref: 'jobopening'
        },
        bdm_id: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User'
        },
        job_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "jobopening",
        },
        job_work_status: {
            type: String,
        },
        note: {
            type: String,
        },
        status: {
            type: String,
            // required:true,
        },
        created_at: {
            type: Date,
            default: Date.now
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
        },
    },
);

jobworkSchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });

const Admin = mongoose.model("JobWorkApplication", jobworkSchema);

module.exports = Admin;


