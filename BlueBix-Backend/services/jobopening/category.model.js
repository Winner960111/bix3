const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Register
const categorySchema = new Schema(
    {
        code:{
            type:String,
        },
        name: {
            type:String,
        }
  },
);

// categorySchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });


const Categories = mongoose.model("Category", categorySchema);

module.exports = Categories;


