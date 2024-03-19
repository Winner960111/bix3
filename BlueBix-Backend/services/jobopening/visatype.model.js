const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

const visatypeSchema = new Schema(
    {
        label:{
            type:String,
        },
        value: {
            type:String,
        }
  },
);

visatypeSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const Visatype = mongoose.model("visa_type", visatypeSchema);

module.exports = Visatype;


