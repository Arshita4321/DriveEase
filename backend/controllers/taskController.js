const Task = require('../models/Task');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc Get all tasks (admin) or tasks assigned to me (employee)
// @route GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const query = {};
    // Employees only see tasks assigned to them
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    }
    if (req.query.status) query.status = req.query.status;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// @desc Create task and assign to multiple employees (bulk assign)
// @route POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, emails, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    // Resolve employee IDs from emails
    let assignedTo = [];
    if (emails && emails.length > 0) {
      const employees = await User.find({
        email: { $in: emails },
        role: { $in: ['employee', 'admin'] },
      });
      assignedTo = employees.map((e) => e._id);
    }

    const task = await Task.create({
      title,
      description: description || '',
      assignedTo,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
    });

    // Notify each assigned employee
    for (const userId of assignedTo) {
      await createNotification({
        userId,
        title: 'New Task Assigned',
        message: `You have been assigned: "${title}"`,
        type: 'system',
        link: '/employee',
      });
    }

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// @desc Update task status
// @route PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const { status, priority, title, description } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, priority, title, description },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// @desc Delete task
// @route DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc Get employee emails (for bulk assign dropdown)
// @route GET /api/tasks/employee-emails
const getEmployeeEmails = async (req, res, next) => {
  try {
    const employees = await User.find({ role: { $in: ['employee', 'admin'] } })
      .select('name email')
      .sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getEmployeeEmails };
