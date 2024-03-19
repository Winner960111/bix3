const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;


const employeeSchema = new Schema(
    {
        candidate_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate'
        },
        designation: {
            type: String,
        },
        organization: {
            type: String,
        },
        is_current_company: {
            type: Boolean
        },
        annual_salary_currency_type: {
            type: String
        },
        annual_salary: {
            type: Number
        },
        work_since_from_year: {
            type: String
        },
        work_since_from_month: {
            type: String
        },
        work_since_to_present: {
            type: String
        },
        work_since_to_year: {
            type: String
        },
        work_since_to_month: {
            type: String
        },
        location: {
            type: String
        },
        description: {
            type: String
        },
        description_job_profile: {
            type: String
        },
        notice_period: {
            type: String
        },

        //when candidate register through recruiter
        is_candidate_recruiter_by: {
            type: Number
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
        }
    },
);

employeeSchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });


const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;


