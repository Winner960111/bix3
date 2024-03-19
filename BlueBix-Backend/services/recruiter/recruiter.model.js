const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Register
const recruiterSchema = new Schema(
    {
        first_name:{
            type:String,
        },
        last_name: {
            type:String,
        },
        display_name : {
            type:String,
        },
        email : {          //this email also company email
            type:String,
            required: true,
        },
        alternative_email : {
            type:String,
        },
        phone_number_home: {
            type: String,
        },
        contact_number: {
            type: String,
        },
        password:{
            type:String,
            required:true,
        },
        profile:{
            type:String,
        },
        role:{
            type:String,
            required:true,
        },      
        current_location:{
            type: String,
        },
        status: {
            type:String,
            default:"In-Active",
        },
        reset_password_token:{
            type:String
        },
        reset_password_expires: {
            type: Date
        },
        created_at: {
            type: Date,
            default: Date.now()
        },
        updated_at: {
            type: Date,
            default: Date.now()
        },
        updated_by:{
            type: mongoose.Schema.Types.ObjectId
        },
        deleted_by:{
            type: mongoose.Schema.Types.ObjectId,
            default:null
        }
        // reporting_manager:{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User'
        // }
  },
);

recruiterSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });

const Recruiter = mongoose.model("Recruiter", recruiterSchema);

module.exports = Recruiter;


