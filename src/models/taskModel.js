const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskTitle: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
    priority: { type: String, required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    tags: { type: [String], required: true },
    attachments: { type: [String], default: [] },
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);