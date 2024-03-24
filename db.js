const mongoose = require('mongoose');
mongoose.set('strictQuery',false)
// const mongoURI = "mongodb://127.0.0.1:27017/shop"
const mongoURI = "mongodb+srv://hamzaamjad:hamzaamjad@cluster0.fc3iuap.mongodb.net/shopapp?retryWrites=true&w=majority"
const connectToMongo=()=>{
    mongoose.connect(mongoURI);
    console.log("connected to mongo");
}

module.exports = connectToMongo;