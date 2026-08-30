const Task = require('../models/taskModel')

exports.createTask = async(req, res) =>{
    try{
    const payload = {
      ...req.body,
      tags: typeof req.body.tags === "string"
        ? req.body.tags.split(",").map(t => t.trim()).filter(Boolean)
        : req.body.tags,
    };
    const newTask = await Task.create(payload);
    
        
        res.status(201).json({success: true , data : newTask} )
        console.log(res);
    }catch(error){
        console.error(error);
        res.status(400).json({success: false , error: error.message})
    }
}
       
// exports.getAllTasks = async(req , res) =>{
//     try{
//         const allTasks = await Task.find();
//         res.status(200).json({success: true , data : allTasks} )

//     }catch(error){
//         res.status(500).json({success: false , error: error.message})
//     }
// }       

exports.getSingletask = async(req , res) =>{
    try{
        const task = await Task.findById(req.params.id)
        if(!task) return res.status(404).json({success: false , error: "Could not find Task"})
        res.status(200).json({success: true , data : task} )

    }catch(error){
        console.error(error);
         res.status(500).json({success: false , error: error.message})
    }
}
       
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, error: "Could not find Task" });

        const isAdmin = req.user.role === "admin";
        const isOwner = task.assignee.toString() === req.user.id;

        if (isAdmin) {
            // Admin can edit anything, including reassigning
            const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json({ success: true, data: updated });
        }

        if (isOwner) {
            // Member can ONLY change status on their own task — nothing else
            const allowedUpdate = { status: req.body.status };
            const updated = await Task.findByIdAndUpdate(req.params.id, allowedUpdate, { new: true });
            return res.status(200).json({ success: true, data: updated });
        }

        // Not admin, not owner — no access to modify at all
        return res.status(403).json({ success: false, error: "You can only update your own tasks" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
    
exports.deleteTask = async(req , res) =>{
    try{
        const deleteTask = await Task.findByIdAndDelete(
            req.params.id 
        )

        if(!deleteTask) return res.status(404).json({success: false ,error: "Could not find Task"})
        
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

 exports.filterByQuery = async (req, res) => {
    try {
        const { status, priority, searchData } = req.query || req.body || {};
        const query = {
            ...(status && { status }),
            ...(priority && { priority }),
            ...(searchData && { taskTitle: { $regex: searchData, $options: 'i' } })
        };

        // FIX: populate assignee so the frontend gets { _id, fname, lname } instead of
        // just a raw ObjectId string it can't display as a name.
        const filteredTasks = await Task.find(query).populate("assignee", "fname lname email");

        res.status(200).json({ success: true, data: filteredTasks });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getSingletask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate("assignee", "fname lname email"); // FIX
        if (!task) return res.status(404).json({ success: false, error: "Could not find Task" });
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};       



