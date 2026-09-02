require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const MONGO_URI = process.env.MONGODB_URI;

const DEFAULT_ADMIN = {
  fname: "Super",
  lname: "Admin",
  email: process.env.ADMIN_EMAIL || "admin@example.com",
  password: process.env.ADMIN_PASSWORD || "Admin@123",
  role: "admin",
  status: "active",
};

async function createDefaultAdmin() {
  try {
    await mongoose.connect(MONGO_URI);

    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

    const admin = await User.create({
      fname: DEFAULT_ADMIN.fname,
      lname: DEFAULT_ADMIN.lname,
      email: DEFAULT_ADMIN.email,
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log("Default admin created:");
    console.log("Email:", admin.email);
    console.log("Password:", DEFAULT_ADMIN.password, "(change this after first login)");

    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

createDefaultAdmin();