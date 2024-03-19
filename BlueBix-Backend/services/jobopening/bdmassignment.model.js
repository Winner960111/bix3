const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');
const Schema = mongoose.Schema;

//Admin,BDM,Recruiter Create Job Opening
const bdmAssignmentSchema = new Schema(
    {
        opening_id: {
            type: String,
            required: true,//Unique
        },

        assigned_bdm: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User'
        },
        assigned_recruiter: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User'
        },
        assigned_freelancer: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
        },
        created_at: {
            type: Date,
            default: Date.now()
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updated_at: {
            type: Date,
            default: Date.now()
        },
    },
);

bdmAssignmentSchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });

const BdmAssignment = mongoose.model("bdm_assignment", bdmAssignmentSchema);

module.exports = BdmAssignment;


