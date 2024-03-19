const mongoose = require("mongoose");
let softDelete = require('mongoosejs-soft-delete');

const Schema = mongoose.Schema;

//All Type User Register
const subcategorySchema = new Schema(
    {
        category_code:{
            type:String,
        },
        sub_category:[
            {
                category_code:{ type : String},
                sub_category_id : { type : Number},
                sub_category_name : { type : String}
            }
        ]
  },
);

// subcategorySchema.plugin(softDelete,{ index: 'deleted_at', deleted_at: true });

const SubCategories = mongoose.model("SubCategory", subcategorySchema);

module.exports = SubCategories;


