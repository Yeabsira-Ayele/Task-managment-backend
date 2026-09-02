const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const helmet = require("helmet");
const bcrypt = require('bcryptjs');
const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']); 

dotenv.config();

const taskRouter = require('./routes/taskRoute');
const userRouter = require('./routes/userRoute');
const User = require('./models/userModel');

const PORT = Number(process.env.PORT) || 5000;

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json());

const allowedOrigins = [
    process.env.FRONTEND_URL, 
    "http://localhost:5173",  
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

app.use('/api', taskRouter);
app.use('/api', userRouter);

app.get("/", (req, res) => {
    res.json({ message: "TMS server is running" });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Something went wrong" });
});

// Creates a default admin account on startup if one doesn't already exist.
// Reads credentials from ADMIN_EMAIL / ADMIN_PASSWORD in .env, falling back
// to admin@example.com / Admin@123 if unset. Safe to leave in permanently —
// it checks for an existing match before inserting, so it won't duplicate.
async function ensureDefaultAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

        const existing = await User.findOne({ email: adminEmail });
        if (existing) {
            console.log("Default admin already exists:", adminEmail);
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = await User.create({
            fname: "Super",
            lname: "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            status: "active",
        });

        console.log("Default admin created:", admin.email);
    } catch (err) {
        console.error(" Failed to create default admin:", err.message);
    }
}

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected smoothly to the taskM database!");
        await ensureDefaultAdmin();
        app.listen(PORT, () => {
            console.log(`TMSBProject running on ${PORT}`);
        });
    })
    .catch((error) => console.error("MongoDB connection failed:", error.message));

module.exports = app;