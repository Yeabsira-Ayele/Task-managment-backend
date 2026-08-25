const mongoose = require('mongoose'); // Fixed spelling


const taskSchema = new mongoose.Schema({
    titleName: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
    priority: { type: String, required: true }, 
    assignee: { type: String, required: true },
    dueDate: { type: Date, required: true },   
    tags: { type: [String], required: true },   
    filePath: { type: String }                 
} , {
    timestamps : true
});


module.exports = mongoose.model('Task', taskSchema);
