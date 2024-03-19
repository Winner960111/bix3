const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Register
const stateSchema = new Schema(
    {
       code:{
          type:Number
       },
       state:{
          type:String
       }
    },
);

// stateSchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const State = mongoose.model("State", stateSchema);

module.exports = State;


