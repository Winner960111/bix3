const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//Admin,BDM,Recruiter Create Job Opening
const jobOpeningSchema = new Schema(
    {
        account_name: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        },
        contact_name: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Contact',
            // type:String,
            required: false
        },
        opening_title: {
            type: String,
            required: true
        },
        opening_id: {
            type: String,
            required: true,//Unique
        },
        // account_owner:{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',   
        //     required:true       
        // },
        // account_primary_recruit: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',   
        //     required:true   
        // },
        // access: {
        //     type: String,
        //     required:true,
        // },
        // assign_more_recruits:{
        //     type:[mongoose.Schema.Types.ObjectId],
        //     ref: 'User'
        // },
        // end_client:{
        //     type:Number,    
        //     required:true,
        // },
        required_skills: {
            type: Array,
            required: true,
        },
        required_experience: {
            type: Number,
            required: true
        },
        // bill_rate:{
        //     type:Number,
        //     required:false
        // },
        // bill_currency:{
        //     type:Number,
        //     required:false          
        // },
        // bill_type:{
        //     type: String,
        //     required:false      
        // },

        // pay_rate: {
        //     type:Number,
        //     required:false,
        // },
        pay_currency: {
            type: Number,
            required: false,
        },
        pay_type: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
        state: {
            type: Number,
            ref: "State"
        },
        city: {
            type: Number,
            ref: "City"
        },
        zip_code: {
            type: Number,
            required: false,
        },
        number_of_openings: {
            type: Number,
            required: true,
        },
        max_resumes_allowed: {
            type: Number,
            required: false,
        },
        local_indicator: {
            type: Array,
            required: false,
        },
        security_clearance: {
            type: String,
            required: false,
        },
        job_description: {
            type: String,
            required: true,
        },
        short_description: {
            type: String
        },
        duration: {
            type: String,
            required: false,
        },
        category: {
            type: String,
            ref: "Category",
        },
        sub_category: {
            type: String,
            ref: "SubCategory",
            // required:false,
        },
        employment_type: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: 'active',
        },
        experience_level: {
            type: String,
            required: true,
        },
        // position_type:{
        //     type:String,
        //     required:false,
        // },
        interview_type: {
            type: String,
            required: true,
        },
        visa_type: {
            type: Array,
            ref: 'visa_type'
            // required:true,
        },
        project_start_date: {
            type: Date,
            required: false,
        },
        project_close_date: {
            type: Date,
            required: false,
        },
        notes: {
            type: String,
            required: false,
        },
        attachments: {
            type: String,
            required: false,
        },
        role: {
            type: String,
        },
        salary_range_from: {
            type: Number,
        },
        salary_range_to: {
            type: Number,
        },
        currency: {
            type: String
        },
        salary_type: {
            type: String
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            // ref: 'User',
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
        },
        // created_by_user_name:{
        //     type:String,
        // },
        updated_at: {
            type: Date,
            default: Date.now
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId
        },
        // updated_by_user_name:{
        //     type: String
        // },
        deleted_by: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        }
    },
);


jobOpeningSchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });


const JobOpenings = mongoose.model("jobopening", jobOpeningSchema);

module.exports = JobOpenings;


