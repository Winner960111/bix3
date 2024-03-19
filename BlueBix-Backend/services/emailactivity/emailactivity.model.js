const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const emailActivitySchema = new Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        email_type: {
            type: String,
        },
        description: {
            type: String,
        },
        status: {
            type: Boolean
        },
        created_at: {
            type: Date,
            default: Date.now()
        },
        updated_at: {
            type: Date,
            default: Date.now()
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId
        }
    }
);

const EmailActivity = mongoose.model('emailactivity', emailActivitySchema);

module.exports = EmailActivity;