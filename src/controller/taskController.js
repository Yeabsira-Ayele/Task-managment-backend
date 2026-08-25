const Task = require('../models/taskModel')

exports.createTask = async(req, res) =>{
    try{
        const newTask = await Task.create(req.body);
        
        res.status(201).json({success: true , data : newTask} )
    }catch(error){
        res.status(400).json({success: false , error: error.message})
    }
}
       
exports.getAllTasks = async(req , res) =>{
    try{
        const allTasks = await Task.find();
        res.status(200).json({success: true , data : allTasks} )

    }catch(error){
        res.status(500).json({success: false , error: error.message})
    }
}       

exports.getSingletask = async(req , res) =>{
    try{
        const task = await Task.findById(req.params.id)
        if(!task) return res.status(404).json({success: false , error: "Could not find Task"})
        res.status(200).json({success: true , data : task} )

    }catch(error){
         res.status(500).json({success: false , error: error.message})
    }
}
       
exports.updateTask = async (req , res) =>{
    try{
       const updatedtask = await Task.findByIdAndUpdate(
        req.params.id , req.body , {new : true}
       )
        if(!updatedtask) return res.status(404).json({success: false , data: " Could not find Task"})
       
        res.status(200).json({success: true , data: updatedtask})
    }catch(error){
        res.status(500).json({success: true , error : error.message} )
    }
}
    
exports.deleteTask = async(req , res) =>{
    try{
        const deleteTask = await Task.findByIdAndDelete(
            req.params.id 
        )

        if(!deleteTask) return res.status(404).json({success: false ,data: "Could not find Task"})
        
            res.status(200).json({success: true , data: "task deleted successfully"})
    }catch(error){
        res.status(500).json({success: false , error : error.message} )
    }
}      

exports.filterByQuery = async (req, res) => {
    try {
        // Look in req.query (for GET requests) OR fallback to req.body (for POST requests)
        const { status, priority, searchData } = req.query || req.body || {};

        const query = {
            ...(status && { status }),
            ...(priority && { priority }),
            ...(searchData && { taskTitle: { $regex: searchData, $options: 'i' } })
        };

        const filteredTasks = await Task.find(query);
         
        res.status(200).json({ success: true, data: filteredTasks });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

        



