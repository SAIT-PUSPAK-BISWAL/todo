
const mongoose = require("mongoose");
const Task = require("../models/task");

// Allowed task fields
const getTaskUpdates = (body) => {
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, "title")) {
    updates.title = body.title;
  }

  if (Object.prototype.hasOwnProperty.call(body, "description")) {
    updates.description = body.description;
  }

  if (Object.prototype.hasOwnProperty.call(body, "completed")) {
    updates.completed = body.completed;
  }

  return updates;
};

// Create Task
exports.createTask = async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Description must be a string"
      });
    }

    if (
      completed !== undefined &&
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        message: "Completed must be a boolean"
      });
    }

    const task = new Task({
      title: title.trim(),
      description: description === undefined ? "" : description,
      completed: completed === undefined ? false : completed,
      userId: req.user.id
    });

    await task.save();

    return res.status(201).json(task);
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task data"
      });
    }

    console.error("Create task error:", err.message);

    return res.status(500).json({
      message: "Server error while creating task"
    });
  }
};

// Get tasks belonging to the authenticated user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user.id
    });

    return res.json(tasks);
  } catch (err) {
    console.error("Get tasks error:", err.message);

    return res.status(500).json({
      message: "Server error while retrieving tasks"
    });
  }
};

// Update a task belonging to the authenticated user
exports.updateTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    const updates = getTaskUpdates(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid task fields provided"
      });
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, "title") &&
      (typeof updates.title !== "string" || !updates.title.trim())
    ) {
      return res.status(400).json({
        message: "Task title cannot be empty"
      });
    }

    if (typeof updates.title === "string") {
      updates.title = updates.title.trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, "description") &&
      typeof updates.description !== "string"
    ) {
      return res.status(400).json({
        message: "Description must be a string"
      });
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, "completed") &&
      typeof updates.completed !== "boolean"
    ) {
      return res.status(400).json({
        message: "Completed must be a boolean"
      });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    return res.json(task);
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task data"
      });
    }

    console.error("Update task error:", err.message);

    return res.status(500).json({
      message: "Server error while updating task"
    });
  }
};

// Delete a task belonging to the authenticated user
exports.deleteTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    return res.json({
      message: "Task deleted"
    });
  } catch (err) {
    console.error("Delete task error:", err.message);

    return res.status(500).json({
      message: "Server error while deleting task"
    });
  }
};
