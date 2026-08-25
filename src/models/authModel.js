const mongoose = require('mongoose') ;

const userSchema = new mongoose.Schema({
    fname: {type: string , required: true} ,
    lname: {type: string , required: true} ,
    email: {type: string , required: true} ,
    password: {type: string , required: true} ,
    position: {type: string , required: true}
})

model.exports = mongoose.model("user"  , userSchema) ;