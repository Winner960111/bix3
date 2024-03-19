const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//Candidate Job Save for future apply
const jobSavedSchema = new Schema(
    {
        company_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
        },
        job_opening_id:{
            type: String,
            ref: 'jobopening',
            required:true
        },
        opening_title:{
            type: String
        },
        candidate_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate',
            required:true
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        created_by:{
            type: mongoose.Schema.Types.ObjectId,
        },
        updated_at: {
            type: Date,
            default: Date.now
        },
        updated_by:{
            type: mongoose.Schema.Types.ObjectId
        },
        deleted_by:{
            type: mongoose.Schema.Types.ObjectId,
            default:null
        }       
  },
);


jobSavedSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const JobSaved = mongoose.model("jobsave", jobSavedSchema);

module.exports = JobSaved;


