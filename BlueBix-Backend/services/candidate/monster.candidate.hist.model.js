const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Register
const monsterCandidateHistSchema = new Schema({
    textResumeID: {
        type: String,
        default: null
    },
    viewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

monsterCandidateHistSchema.plugin(softDelete, { index: 'deleted_at', deleted_at: true });


const Admin = mongoose.model("MonsterCandidateHist", monsterCandidateHistSchema);

module.exports = Admin;


