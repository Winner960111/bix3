const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;


const smtpSchema = new Schema(
    {
        email_type:{
           type:String
        },
        email_protocol:{
           type:String
        },
        email_encryption:{
            type: String      
        },
        smtp_host:{
            type: String      
        },
        smtp_port:{
            type: Number
        },
        email:{
            type: String      
        },
        user_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        // smtp_user_name:{
        //     type: String   
        // },
        smtp_password:{
            type: String   
        },
        email_charset: {
            type:String
        },
        email_signature:{
            type: String 
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
            type: mongoose.Schema.Types.ObjectId
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

smtpSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


// companySchema.virtual('company', {
//     ref: 'candidate_submission',
//     localField: '_id',
//     foreignField: 'company_id',
//     justOne: false
//   });

const Smtp = mongoose.model("smtp", smtpSchema);

module.exports = Smtp;


