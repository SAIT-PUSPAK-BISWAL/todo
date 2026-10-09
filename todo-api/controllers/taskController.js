const Task = require("../models/task");

// ➕ Create Task
exports.createTask = async (req, res) => {
  try {
    const task = new Task({ ...req.body, userId: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 📋 Get Tasks (only current user)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });  // ✅ filter
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Task (only if owned)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, // ✅ check ownership
      req.body,
      { new: true }
    );
    if (!task) return res.status(403).json({ message: "Not allowed" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ❌ Delete Task (only if owned)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id }); // ✅ check ownership
    if (!task) return res.status(403).json({ message: "Not allowed" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
