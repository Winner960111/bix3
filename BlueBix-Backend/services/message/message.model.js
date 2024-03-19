const mongoose = require("mongoose");
let softDelete = require("mongoosejs-soft-delete");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  title: {
    type: String,
  },
  message: {
    type: String,
  },
  candidate_id: {
    type: mongoose.Types.ObjectId,
    ref: "Candidate",
  },
  company_id: {
    type: mongoose.Types.ObjectId,
    ref: "Company",
  },
  opening_id: {
    type: String,
  },
  user_id: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  contact_id: {
    type: mongoose.Types.ObjectId,
    ref: "Contact",
  },
  user_role: {
    type: String,
    default: "",
  },
  is_view_message_user: {
    type: Number,
    default: 1,
  },
  is_view_message_candidate: {
    type: Number,
    default: 1,
  },
  is_view_message_company: {
    type: Number,
    default: 1,
  },
  is_view_message_contact: {
    type: Number,
    default: 1,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.plugin(softDelete, { index: "deleted_at", deleted_at: true });

const Message = mongoose.model("message", messageSchema);

module.exports = Message;
