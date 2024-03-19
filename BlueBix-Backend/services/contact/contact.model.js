const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Register
const contactSchema = new Schema(
    {
        company_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Company'    
        },
        // contact_owner:{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref:'User'    
        // },
        access:{
            type:String
        },
        display_name:{
            type:String
        },
        first_name:{
            type: String      
        },
        last_name:{
            type: String   
        },
        phone: {
            type:String
        },
        // other_phone:{
        //     type: String 
        // },
        mobile:{
            type: String 
        },
        fax:{
            type: String 
        },
        email:{
            type: String 
        },
        alternative_email:{
            type: String 
        },
        skype_id:{
            type: String 
        },
        twitter_id:{
            type: String 
        },
        contact_status:{
            type: String 
        },
        category:{
            type: String 
        },
        country:{
            type: String 
        },
        state:{
            type: Number 
        },
        city:{
            type: Number 
        },
        street_1:{
            type: String 
        },
        street_2:{
            type: String 
        },
        zip_code:{
            type: String 
        },
        description:{
            type:String
        },
        password:{
            type:String
        },
          type:{
            type:String
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
        },
        // job_category:{
        //     type:String,
        //     ref:'Category'
        // }
         // password:{
        //     type:String
        // },      
        // reset_password_token:{
        //     type:String
        // },
        // reset_password_expires: {
        //     type: Date
        // },
  },
);

contactSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });

// contactSchema.virtual('demo', {
//     ref: 'Category',
//     localField: 'job_category',
//     foreignField: 'code',
//     justOne: false
//   });


const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;


