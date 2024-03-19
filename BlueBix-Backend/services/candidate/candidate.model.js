const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');




const Schema = mongoose.Schema;

//All Type User Register
const candidateSchema = new Schema(
    {
        first_name: {
            type: String,
        },
        middle_name: {
            type: String,
        },
        last_name: {
            type: String,
        },
        // display_name : {
        //     type:String,
        // },
        email: {          //this email also company email
            type: String,
            required: true,
        },
        mobile: {
            type: String,
        },
        password: {
            type: String
        },
        status: {
            type: String,
            // default:"In-Active",
        },
        total_work_exp_year: {
            type: String
        },
        total_work_exp_month: {
            type: String
        },
        attachments: {
            type: String
        },
        profile_summary: {
            type: String
        },
        date_of_birth: {
            type: Date
        },
        gender: {
            type: String
        },
        home_town: {
            type: String
        },
        permanent_address: {
            type: String
        },
        area_pin_code: {
            type: String
        },
        job_category: {
            type: String,
            ref: "Category"
        },
        role: {
            type: String
        },
        desired_job_type: {
            type: String
        },
        desired_employment_type: {
            type: String
        },
        desired_shift: {
            type: String
        },
        current_location: {
            type: String
        },
        key_skills: {
            type: Array
        },
        current_ctc: {
            type: Number
        },
        desired_location: {
            type: String
        },
        profile_image: {
            type: String
        },
        profile_strength: {
            type: Number
        },
        notes: {
            type: String
        },
        // phone: {
        //     type: String,
        // },
        // country:{
        //     type:String
        // },
        // state:{
        //     type:String
        // },
        // city:{
        //     type:String
        // },
        // address:{
        //     type:String
        // },
        // preferred_location_1:{
        //     type:String
        // },  
        // preferred_location_2:{
        //     type:String
        // },  
        // postal_code:{
        //     type:String
        // },
        // skype_id:{
        //     type:String
        // },
        // linkedIn_id:{
        //     type:String
        // },
        // sourced_from:{
        //     type:String
        // },
        // source_information:{
        //     type:String
        // },
        // sourcing:{
        //     type:String
        // },
        // sourced_by:{
        //     type:String
        // },
        // available_from:{
        //     type:Date
        // },  
        // notice_period:{
        //     type:String
        // },  
        // fax:{
        //     type:String
        // },  
        // license_no:{
        //     type:String
        // },  
        // passport_no:{
        //     type:String
        // },  
        // visa_status:{
        //     type:String
        // },  
        // date_of_birth:{
        //     type:Date
        // },  
        // employment_type:{
        //     type:String
        // },  
        // candidate_status:{
        //     type:String
        // },  
        // clearance:{
        //     type:String
        // },  
        // description:{
        //     type:String
        // },  
        // gender:{
        //     type:String
        // },  
        // father_name :{
        //     type:String
        // },  
        // mother_name :{
        //     type:String
        // },  
        // nationality :{
        //     type:String
        // },  
        // hobbies :{
        //     type:String
        // },  
        // marital_status :{
        //     type:String
        // },  
        // priority :{
        //     type:String
        // },  
        // candidate_category :{
        //     type:String
        // }, 
        // sub_category:{
        //     type:String
        // },  
        // number_of_jobs_changed:{
        //     type:String
        // }, 
        // current_job_designation:{
        //     type:String
        // },
        // current_employer:{
        //     type:String
        // }, 

        // gap_period:{
        //     type:String
        // }, 
        // relevant_experience :{
        //     type:String
        // }, 
        // current_pay_rate:{
        //     type:String
        // }, 
        // expected_pay_rate:{
        //     type:String
        // }, 
        // marketing_bill_rate:{
        //     type:String
        // }, 
        // job_title:{
        //     type:String
        // }, 
        // objectives:{
        //     type:String
        // }, 
        // achievements:{
        //     type:String
        // }, 
        // references:{
        //     type:String
        // }, 
        // resume_title :{
        //     type:String
        // }, 
        // resume_file_name :{
        //     type:String
        // }, 
        // qualification :{
        //     type:String
        // }, 
        // languages_known :{
        //     type:String
        // }, 
        // skills:{
        //     type:String
        // }, 
        // notes :{
        //     type:String
        // },

        //when candidate register through recruiter
        is_candidate_recruiter_by: {
            type: Number
        },
        reset_password_token: {
            type: String
        },
        reset_password_expires: {
            type: Date
        },
        email_token: {
            type: String
        },
        isVerified: {
            type: Boolean
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
        created_by: {
            type: mongoose.Schema.Types.ObjectId
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        isCandidate: {
            type: String,
            default: '1'
        },
        textResumeID: {
            type: String,
            default: null
        },
        candidateDetails: {
            type: Object,
            default: null
        },
        document: {
            type: String,
            default: null
        },
        isMonsterCandidate: {
            type: String,
            default: '0'
        }
    },
);

candidateSchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });

// candidateSchema.eachPath((pathname, schematype) => {
//     // Prints twice:
//     // name SchemaString { ... }
//     // registeredAt SchemaDate { ... }
//     pathname.deleted = false
//     // console.log("pathname", pathname);
//     // console.log("schematype", schematype);
//   });

candidateSchema.virtual('employees', {
    ref: 'Employee',
    localField: '_id',
    foreignField: 'candidate_id',
    justOne: false
});

candidateSchema.virtual('candidate_it_skills', {
    ref: 'Candidate_IT_Skills',
    localField: '_id',
    foreignField: 'candidate_id',
    justOne: false
});
candidateSchema.virtual('candidate_qualifications', {
    ref: 'Candidate_Qualification',
    localField: '_id',
    foreignField: 'candidate_id',
    justOne: false
});

candidateSchema.virtual('category', {
    ref: 'Category',
    localField: 'job_category',
    foreignField: 'code',
    justOne: false
});

// candidateSchema.get('attachments', 'http://65.2.80.142/Bluebix/backend/public/upload/candidate/'+ this.attachments, { getters: false }); 

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;


