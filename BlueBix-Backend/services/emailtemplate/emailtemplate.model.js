const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

// job work application
const emailTemplateSchema = new Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        email_type:{
            type:String,
            required: true
        },
        content: {
            type:String,
            required:true,
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
  },
);

// jobworkSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });

const EmailTemplate = mongoose.model("emailtemplate", emailTemplateSchema);

module.exports = EmailTemplate;


