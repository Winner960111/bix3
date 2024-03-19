const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');




const Schema = mongoose.Schema;

//All Type User Register
const qualificationSchema = new Schema(
    {
        candidate_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate'
        },
        qualification:{
            type: String,
        },
        course:{
            type: String,
        }, 
        course_type:{
            type: String,
        }, 
        specialization:{
            type: String,
        },             
        university:{
            type: String,
        },             
        passing_year: {
            type: String,
        },
        // qualification_details: [
        //     {
        //         qualification:{
        //             type: String,
        //         },             
        //         course:{
        //             type: String,
        //         },             
        //         course_type:{
        //             type: String,
        //         },             
        //         specialization:{
        //             type: String,
        //         },             
        //         university:{
        //             type: String,
        //         },             
        //         passing_year: {
        //             type: String,
        //         }
                
        //     }
        // ],


        // qualification_details: [
        //     {
        //         university:{
        //             type: String,
        //         },             
        //         degree: {
        //             type: String,
        //         },
        //         year: {
        //             type: String,
        //         }
                
        //     }
        // ],

        
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

qualificationSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const Candidate_Qualification = mongoose.model("Candidate_Qualification", qualificationSchema);

module.exports = Candidate_Qualification;


