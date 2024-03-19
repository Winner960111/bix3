const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Register
const monsterCandidateSchema = new Schema({
    accessToken: {
        type: String,
        default: null
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    isCandidate: {
        type: String,
        default: '1'
    },
    textResumeID: {
        type: String,
        default: null
    },
    candidateDetails: {
        type: Object,
        default: null
    },
    document: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

monsterCandidateSchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });


const Admin = mongoose.model("MonsterCandidate", monsterCandidateSchema);

module.exports = Admin;


