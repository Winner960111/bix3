const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');




const Schema = mongoose.Schema;

//All Type User Register
const itskillsSchema = new Schema(
    {
        candidate_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate'
        },
        skill:{
            type: String,
        },
        version:{
            type: String,
        }, 
        last_used:{
            type: String,
        }, 
        experience:{
            type: String,
        }, 
        
        //when candidate register through recruiter
        is_candidate_recruiter_by:{
            type:Number
        },
        created_at: {
            type: Date,
            default: Date.now
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

itskillsSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const Candidate_IT_Skills = mongoose.model("Candidate_IT_Skills", itskillsSchema);

module.exports = Candidate_IT_Skills;


