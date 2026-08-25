const express  = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const mongoose = require('mongoose');

dotenv.config() ;
const PORT = Number(process.env.PORT) || 5000 ;

const app = express()
app.use(express.json());



app.get("/" , (req , res)=>{
    res.json({
        message : "TMS server is running"
    })
})

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
     console.log("Connected smoothly to the taskM database!");
     
    app.listen(PORT , ()=>{
    console.log(`TMSBProject runing on ${PORT}`) ;
    
    });
     }) 
  .catch((error) => console.error("MongoDB connection failed:", error.message));


