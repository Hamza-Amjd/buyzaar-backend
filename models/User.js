const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    verified:{
        type: Boolean,
        default:false
    },
    verificationToken:String,
    date:{
        type: Date,
        default: Date.now
    },
    address:[
        {
            name:String,
            mobileNo:String,
            streetAddress:String,
            city:String,
            country:String,
            postalCode:String
        }
    ],
    cart:[{
      title: String,
        price:Number,
        image: String,
        description:String,
        category:String,
        quantity:Number,
        rating:{rate:String}
}],
    Order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },

  });
  const User = mongoose.model('user', UserSchema);
  module.exports = User;