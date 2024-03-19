const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

const citySchema = new Schema(
    {
       code:{
          type:Number
       },
       city:{
           type:String
       },
       state_id:{
          type:Number
       }
    },
);

// stateSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const City = mongoose.model("City", citySchema);

module.exports = City;


