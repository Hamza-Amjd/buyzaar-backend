const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const itemSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category:String,
    fileKey: String,
    rating: {
      rate:{
        type: String
      }
    },
    quantity:{
      type:Number
    }
  },
  { timestamps: true }
);

const items = mongoose.model("items", itemSchema);
module.exports =items;
