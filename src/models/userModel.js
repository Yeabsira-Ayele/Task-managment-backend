const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname: { type: String, required: true },   // FIX: "string" -> "String"
    lname: { type: String, required: true },   // FIX: "string" -> "String"
    email: { type: String, required: true, unique: true }, // FIX: "string" -> "String"
    password: { type: String, required: true }, // FIX: "string" -> "String"
    role: { type: String, enum: ["admin", "member"], default: "member" }, // FIX: "string" -> "String"
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema); 