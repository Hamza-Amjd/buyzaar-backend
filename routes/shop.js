const express = require('express');
const User = require('../models/User');
const router = express.Router();
const Order = require('../models/order');
const items = require('../models/items');

router.post('/addresses',async (req, res) => {

  try {
    const userId = req.body.userId;
    const address=req.body.address;
    const user = await User.findById(userId)
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    user.address.push(address)

    await user.save();
    res.status(200).json({message:"Address added"})
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

router.get('/addresses/:userId',  async (req, res) => {

  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    const addresses=user.address;
    res.status(200).json(addresses)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


router.post('/order',async (req, res) => {
  try {
    const {userId,cart,totalPrice,shippingAddress,paymentMethod} = req.body
    
    const user = await User.findById(userId)
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    const products =cart.map((item)=>({
       _id:item._id,
        title:item.title,
        price:item.price,
        image:item.image,
        description:item.description,
        category:item.category,
        soldQuantity:item.soldQuantity,
        rating :{rate:item.rating.rate},
        quantity:item.quantity,
      }))
      products.map(async(product)=> { 
        const newItem={}
        newItem.soldQuantity = product.soldQuantity?product.soldQuantity + product.quantity:product.quantity;
        await items.findByIdAndUpdate(product._id, { $set: newItem }, { new: true })})
    const order= await Order({
       userId:userId,
       products:products,
       totalPrice:totalPrice,
       shippingAddress:shippingAddress,
       paymentMethod: paymentMethod,
    })
    
    await order.save();
    res.status(200).json({message:"Order Placed"})
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

router.get('/order/:userId',  async (req, res) => {

    try {
      const userId = req.params.userId;
      const user = await User.findById(userId)
      if(!user){
        return res.status(404).json({message:"User not found"})
      }
      const orders=await Order.find({userId:userId});
      if(!orders || orders.length==0){
        res.status(404).json({message:'no orders found'})
      }
      res.status(200).json({orders})
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })

router.post('/addtocart',async (req, res) => {

  try {
    const userId = req.body.userId;
    const cart=req.body.cart;
    const user = await User.findById(userId)
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    
    const newCart =cart.map((item)=>({
      title:item.title,
      price:item.price,
      image:item.image,
      description:item.description,
      category:item.category,
      rating :{rate:item.rating.rate},
      quantity:item.quantity
    }))
    user.cart=newCart
    await user.save();
    res.status(200).json({message:"item added in cart"})
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

router.get('/cart/:userId',  async (req, res) => {

  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    const cart=user.cart;
    res.status(200).json(cart)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})
module.exports = router