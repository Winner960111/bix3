const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Role
const roleSchema = new Schema(
    {
        role_name:{
            type:String,
        },
        status: {
            type:String,
            default:"Active",
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        updated_at: {
            type: Date,
            default: Date.now
        },
       

  },
);

roleSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });

const Roles = mongoose.model("Role", roleSchema);

module.exports = Roles;


