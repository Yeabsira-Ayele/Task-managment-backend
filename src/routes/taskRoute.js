const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController')
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post("/task" , requireAuth , requireAdmin ,taskController.createTask) ;

router.get("/task/:id" ,requireAuth, taskController.getSingletask) ;

router.get("/task" , taskController.filterByQuery) ;

router.delete("/task/:id" , requireAuth, requireAdmin , taskController.deleteTask) ;

router.patch("/task/:id" ,requireAuth , taskController.updateTask);

module.exports = router ;