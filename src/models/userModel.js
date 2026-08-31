const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    status: { type: String, enum: ["pending", "active", "suspended"], default: "pending" },
    resetPasswordToken: { type: String, default: undefined },
    resetPasswordExpires: { type: Date, default: undefined },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);