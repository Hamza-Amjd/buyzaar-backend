const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId:{
         type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
    },
    products:[{
      title: String,
        price:Number,
        image: String,
        description:String,
        category:String,
        quantity:Number,
        rating:{rate:String}
}],
    totalPrice:{
      type: Number,
      required:true
    },
    shippingAddress: {
      name: {
        type: String,
        required: true,
      },
      mobileNo: {
        type: String,
        required: true,
      },
      streetAddress: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      country:{
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    orderStatus:{
      type: String,
    }
  },
  { timestamps: true }
);
const Order=mongoose.model("Order", orderSchema);
module.exports = Order;
