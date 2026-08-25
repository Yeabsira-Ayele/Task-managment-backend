const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController')

router.post("/task" , taskController.createTask) ;

router.get("/task/:id" , taskController.getSingletask) ;
router.get("/task" , taskController.getAllTasks) ;
router.get("/task" , taskController.filterByQuery) ;

router.delete("/task/:id" , taskController.deleteTask) ;

router.patch("/task/:id" , taskController.updateTask);

module.exports = router ;