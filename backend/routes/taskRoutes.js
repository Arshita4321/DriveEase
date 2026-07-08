const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getTasks, createTask, updateTask, deleteTask, getEmployeeEmails } = require('../controllers/taskController');

// All task routes require login
router.use(protect);

// Admin-only routes
router.post('/', adminOnly, createTask);
router.delete('/:id', adminOnly, deleteTask);
router.get('/employee-emails', adminOnly, getEmployeeEmails);

// Shared routes (admin sees all, employee sees assigned)
router.get('/', getTasks);
router.put('/:id', updateTask);

module.exports = router;
