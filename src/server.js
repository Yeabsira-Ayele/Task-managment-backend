const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const helmet = require("helmet");

dotenv.config();

const taskRouter = require('./routes/taskRoute');
const userRouter = require('./routes/userRoute');

const PORT = Number(process.env.PORT) || 5000;

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
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

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected smoothly to the taskM database!");
        app.listen(PORT, () => {
            console.log(`TMSBProject running on ${PORT}`);
        });
    })
    .catch((error) => console.error("MongoDB connection failed:", error.message));

module.exports = app;