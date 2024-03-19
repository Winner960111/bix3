const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Register
const companySchema = new Schema(
    {
        company_name: {
            type: String
        },
        access: {
            type: String
        },
        company_owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        category: {
            type: String
        },
        website: {
            type: String
        },
        status: {
            type: String,
            default: "In-Active",
        },
        company_code: {
            type: String
        },
        phone_number_1: {
            type: String
        },
        phone_number_2: {
            type: String
        },
        country: {
            type: String
        },
        state: {
            type: Number,
            ref: "State"
        },
        city: {
            type: Number,
            ref: "City"
        },
        street: {
            type: String
        },
        zip_code: {
            type: String
        },
        fax: {
            type: String
        },
        email_1: {          //this email also company email
            type: String,
            required: true,
        },
        email_2: {
            type: String
        },
        description: {
            type: String
        },
        industry_type: {
            type: String,
            ref: "Category"
        },
        employee_strength: {
            type: Number
        },
        product_services: {
            type: Array
        },
        password: {
            type: String
        },
        company_plan_status: {
            type: Number
        },
        reset_password_token: {
            type: String
        },
        reset_password_expires: {
            type: Date
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        assigned_to_bdm: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User'
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
        is_email_send: {
            type: Boolean,
            default: true
        }
    },
);

companySchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });


companySchema.virtual('company', {
    ref: 'candidate_submission',
    localField: '_id',
    foreignField: 'company_id',
    justOne: false
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;


