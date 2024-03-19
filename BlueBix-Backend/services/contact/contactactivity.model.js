const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

const contactActivitySchema = new Schema(
    {
        activity_log:{
            type:String
        },
        // opening_id: {
        //     type: String,
        //     ref: 'jobopening'
        // },
        company_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Company'    
        },
        contact_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contact'
        },
        module:{
            type:String
        },
        title:{
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
            type: mongoose.Schema.Types.ObjectId,
        },
        updated_by:{
            type: mongoose.Schema.Types.ObjectId
        }

    },
);

contactActivitySchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });


const ContactActivity = mongoose.model("contact_activity", contactActivitySchema);

module.exports = ContactActivity;


