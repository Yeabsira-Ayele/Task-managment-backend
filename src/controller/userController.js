const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
// Make sure your .env key is named JWT_SECRET to match this (rename TOKEN_SECRET -> JWT_SECRET,
// or change this line to process.env.TOKEN_SECRET — just keep it consistent everywhere)

exports.createUser = async (req, res) => {
    try {
        const { email, password, fname, lname } = req.body;

        if (!email || !password || !fname || !lname) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const newUser = await User.create({
            email,
            password: hashedPassword,
            fname,
            lname,
        });

        const token = signToken(newUser);

        res.status(201).json({
            success: true,
            token,
            user: { id: newUser._id, fname: newUser.fname, lname: newUser.lname, email: newUser.email, role: newUser.role },
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // FIX: use the same signToken() helper as createUser — sends only
        // { id, role }, never the password hash, and expires after 7 days
        // like the register flow does.
        const token = signToken(user);

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token, // FIX: renamed from "accessToken" to "token" to match createUser's
                   // response shape — your frontend authStore reads res.data.token
                   // for both login and register, so this must be consistent.
            user: { id: user._id, fname: user.fname, lname: user.lname, email: user.email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};