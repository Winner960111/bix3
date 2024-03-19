const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Register
const candidateAttachmentSchema = new Schema(
    {
        candidate_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate', 
        },
        file:{
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
        }
  },
);

candidateAttachmentSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const CandidateAttachment = mongoose.model("Candidate_Attachment", candidateAttachmentSchema);

module.exports = CandidateAttachment;


