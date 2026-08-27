// server.js or app.js
const express  = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const mongoose = require('mongoose');

dotenv.config() ;

// 1. Import router
const taskRouter = require('./routes/taskRoute'); 
const userRouter = require('./routes/userRoute'); 


const PORT = Number(process.env.PORT) || 5000 ;

const app = express()
app.use(express.json());
app.use(cors());

// 2. REGISTER THE ROUTER HERE (Before app.listen and before any general route mappings)
app.use('/api', taskRouter);
app.use('/api', userRouter);

// 3. Static or basic testing endpoints
app.get("/" , (req , res)=>{
    res.json({ message : "TMS server is running" })
});

// 4. Connect and listen
mongoose.connect(process.env.MONGODB_URI )
  .then(() => {
      console.log("Connected smoothly to the taskM database!");
      app.listen(PORT , ()=>{
          console.log(`TMSBProject running on ${PORT}`) ;
      });
  }) 
  .catch((error) => console.error("MongoDB connection failed:", error.message));
