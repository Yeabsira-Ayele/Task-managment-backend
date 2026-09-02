const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');



const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Make sure your .env key is named JWT_SECRET to match this (rename TOKEN_SECRET -> JWT_SECRET,
// or change this line to process.env.TOKEN_SECRET — just keep it consistent everywhere)

// userController.js

// Mirrors the frontend's registerSchema rules — min 8 chars, at least one
// uppercase letter, at least one number. Kept in sync manually since the
// backend can't import a frontend Zod schema directly.
const isPasswordStrong = (password) => {
    if (typeof password !== "string" || password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
};

exports.createUser = async (req, res) => {
    try {
        const { email, password, fname, lname, role } = req.body;

        if (!email || !password || !fname || !lname) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (!isPasswordStrong(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters and include an uppercase letter and a number",
            });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        const assignedRole = role === "admin" ? "admin" : "member";

        const newUser = await User.create({
            email,
            password: hashedPassword,
            fname,
            lname,
            role: assignedRole,
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: { id: newUser._id, fname: newUser.fname, lname: newUser.lname, email: newUser.email, role: newUser.role },
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("LOGIN ATTEMPT:", JSON.stringify({ email, password })); // TEMP

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });
        console.log("USER FOUND:", user ? user.email : null); // TEMP

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("PASSWORD MATCH:", isMatch); // TEMP
        

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

// GET /users — returns every signed-up user, used by the Teams page and the
// Assignee dropdown on NewTask. Password is excluded so hashes never leave the server.
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// UPDATE USER ROLE — admin only
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!["admin", "member"].includes(role)) {
            return res.status(400).json({ success: false, message: "Role must be 'admin' or 'member'" });
        }

        // FIX-forward guard: prevent an admin from demoting themselves and
        // accidentally locking themselves out of admin-only pages with no
        // other admin left to fix it.
        if (req.params.id === req.user.id && role !== "admin") {
            return res.status(400).json({ success: false, message: "You cannot change your own role" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            data: { id: user._id, fname: user.fname, lname: user.lname, email: user.email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE USER — admin only
exports.deleteUser = async (req, res) => {
    try {
        // Guard: prevent an admin from deleting their own account through this panel
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: "You cannot delete your own account" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Guard: prevent deleting the last remaining admin, which would leave
        // the workspace with no one able to manage users at all.
        if (user.role === "admin") {
            const adminCount = await User.countDocuments({ role: "admin" });
            if (adminCount <= 1) {
                return res.status(400).json({ success: false, message: "Cannot delete the last remaining admin" });
            }
        }

        await User.findByIdAndDelete(req.params.id);

        // NOTE: any tasks where this user is `assignee` now have a dangling
        // reference. The frontend already handles `assignee: null` gracefully
        // (shows "Unassigned") since .populate() returns null for a deleted ref —
        // no crash, but worth knowing tasks aren't auto-reassigned.
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// GET current logged-in user's own profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// UPDATE own name (not email — see note below)
exports.updateMe = async (req, res) => {
    try {
        const { fname, lname } = req.body;
        if (!fname || !lname) {
            return res.status(400).json({ success: false, message: "First and last name are required" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { fname, lname },
            { new: true }
        ).select("-password");

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// CHANGE own password — requires current password to confirm identity
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current and new password are required" });
        }
        if (!isPasswordStrong(newPassword)) {
    return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include an uppercase letter and a number",
    });
}

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};




// STEP 1 — request a reset link
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const user = await User.findOne({ email });

        // Always return the same generic message whether or not the email exists,
        // to prevent account enumeration.
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If that email is registered, a reset link has been sent.",
            });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

        try {
            await sendEmail(
                user.email,
                "Reset your password",
                `<p>You requested a password reset.</p>
                 <p><a href="${resetLink}">Click here to reset your password</a></p>
                 <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`
            );
        } catch (emailErr) {
            // Roll back the token so a failed send doesn't leave a dangling valid token
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            console.error("Failed to send reset email:", emailErr);
            return res.status(502).json({ success: false, message: "Could not send reset email. Please try again." });
        }

        // resetLink is NEVER returned in the response — it only goes out via email.
        res.status(200).json({
            success: true,
            message: "If that email is registered, a reset link has been sent.",
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// STEP 2 — submit new password using the token from the emailed link
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || !isPasswordStrong(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters and include an uppercase letter and a number",
            });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "This reset link is invalid or has expired" });
        }

        user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};