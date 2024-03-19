const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Register
const userSchema = new Schema(
    {
        first_name:{
            type:String,
            required:true
        },
        last_name: {
            type:String,
            required:true
        },
        display_name : {
            type:String,
            required:true
        },
        default:{
            type:String,
            // required:true
        },
        login_email : { 
            type:String,
            // required: true,
        },
        email : {
            type:String,
            // required: true,
        },
        alternate_email : {
            type:String,
        },
        phone_home: {
            type: String,
        },
        phone_work: {
            type: String,
        },
        mobile: {
            type: String,
        },
        reporting_manager :{
            type: [mongoose.Schema.Types.ObjectId],
            ref:'User'
        },
        profile:{
            type:Array,
            required:true,
        },
        current_location:{
            type: String,
        },
        password:{
            type:String        
        },
        profile_picture :{
            type:String
        },
        assigned_role:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Role'
        }, 
        status: {
            type:String,
            // required:true,
        },
        reset_password_token:{
            type:String
        },
        reset_password_expires: {
            type: Date
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
        },
        candidate_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
  },
);

userSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const Admin = mongoose.model("User", userSchema);

module.exports = Admin;


