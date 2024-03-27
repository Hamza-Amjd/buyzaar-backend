const express = require('express');
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'hamza';

// function to send email
const sendVerificationEmail=async(email,verificationToken)=>{
  const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:"hamzahumpty1@gmail.com",
      pass:"yurhzjgxpdmqampn"
    }
  })
  //compose email message
  const mailOptions={
    from:"ShopX.com",
    to:email,
    subject:"Email Verification",
    text:`Please click the link to verify email : https://shopro-backend.vercel.app/api/auth/verify/${verificationToken}`
  };
  try {
    await transporter.sendMail(mailOptions)
    console.log("verification email sent succesfully")
  } catch (error) {
    console.log("Error sending verification email",error)
  }
}

// Endpoint for email verification
router.get('/verify/:token',async(req,res)=>{
  try {
    const token= req.params.token;
    const user =await User.findOne({verificationToken:token})
    if(!user){
      return res.status(404).json({message:"invalid verification token"})
    }
    user.verified=true;
    user.verificationToken=undefined;

    await user.save();
    res.status(200).json({message:"Email verified"})
  } catch (error) {
    res.status(500).json({message:"Email verification Failed"})
  }
})
// ROUTE 1: Create a User using: POST "/api/auth/register". No login required
router.post('/register', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
  body('confirmPassword', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  // If there are errors, return Bad request and the errors
  let success=false
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  try {
    // Check whether the user with this email exists already
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({success, error: "Sorry a user with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    newUser = await User({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
    });

    //generate verification token
    newUser.verificationToken=crypto.randomBytes(20).toString('hex');

    //save user to database
    await newUser.save();

    //send verification email to the user
    sendVerificationEmail(newUser.email,newUser.verificationToken);

    res.status(201).json({message:"Registration successful. Please check your email for verification."});

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success=false
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success,error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ success,error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success=true;
    res.json({success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});


// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser,  async (req, res) => {

  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})



module.exports = router