const express = require("express");
const router = express.Router();
const Task = require("../models/taskModel");
const auth = require("../middleware/auth");
const taskUtils = require("../utils/taskUtils");

router.post("/task", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.send(
      taskUtils.getTaskData(
        taskUtils.filterData(["owner", "__v"], task["_doc"]),
      ),
    );
  } catch (e) {
    console.error("Error creating task", e);
    res.status(400).send({ error: "Failed to create task" });
  }
});

// Add bulk tasks data at once
router.post("/tasks/bulk", auth, async (req, res) => {
  try {
    const tasks = req.body.map((task) => {
      return { ...task, owner: req.user._id };
    });

    const savedTasks = await Task.create(tasks);
    res.send(
      savedTasks.map((task) =>
        taskUtils.getTaskData(
          taskUtils.filterData(["owner", "__v"], task["_doc"]),
        ),
      ),
    );
  } catch (e) {
    console.error("Error creating bulk tasks", e);
    res.status(400).send({ error: "Failed to create bulk tasks" });
  }
});

// Duplicate route removed (merged with line 98)

/**
 * Returns combination of tasks for a particular day
 * Tasks that are scheduled for a date
 * Tasks that do not have scheduled date or general tasks and are not completed
 * TODO: Tasks that are recurring for a particular date
 */
router.get("/task/myday", auth, async (req, res) => {
  try {
    const myDayTasks = await Task.find({
      owner: req.user._id,
      $or: [
        { scheduleDate: null },
        {
          scheduleDate: {
            $gte: taskUtils.getTodayDate(),
            $lte: taskUtils.getEndOfToday(),
          },
        },
      ],
    }).lean();

    res.status(200).send(taskUtils.formatTaskData(myDayTasks));
  } catch (e) {
    console.error("Error fetching my day tasks", e);
    res.status(500).send({ error: "Failed to fetch my day tasks" });
  }
});

/**
 * Returns tasks that are overdue as of today
 */
router.get("/task/overdue", auth, async (req, res) => {
  try {
    const overdueTasks = await Task.find({
      owner: req.user._id,
      dueDate: { $lt: taskUtils.getTodayDate() },
      "status.completed": false,
    }).lean();

    res.status(200).send(taskUtils.formatTaskData(overdueTasks));
  } catch (e) {
    console.error("Error fetching overdue tasks", e);
    res.status(500).send({ error: "Failed to fetch overdue tasks" });
  }
});

/**
 * Returns tasks that are upcoming within a week from today
 */
router.get("/task/upcoming", auth, async (req, res) => {
  try {
    const upcomingTasks = await Task.find({
      owner: req.user._id,
      scheduleDate: {
        $gt: taskUtils.getEndOfToday(),
        $lte: taskUtils.getDateAfterAWeek(),
      },
    }).lean();
    res.status(200).send(taskUtils.formatTaskData(upcomingTasks));
  } catch (e) {
    console.error("Error fetching upcoming tasks", e);
    res.status(500).send({ error: "Failed to fetch upcoming tasks" });
  }
});

/**
 * Return recently completed tasks of user sorted by most recently completed
 */
router.get("/task/recentlyCompleted", auth, async (req, res) => {
  try {
    const recentlyCompletedTasks = await Task.find({
      owner: req.user._id,
      "status.completed": { $eq: true },
    })
      .sort({
        "status.completedOn": -1,
      })
      .lean();

    res.status(200).send(taskUtils.formatTaskData(recentlyCompletedTasks));
  } catch (e) {
    console.error("Error fetching recently completed tasks", e);
    res.status(500).send({ error: "Failed to fetch recently completed tasks" });
  }
});

router.get("/task", auth, async (req, res) => {
  const query = { owner: req.user._id };

  if (req.query.tag) {
    query.tags = req.query.tag;
  }

  try {
    const tasks = await Task.find(query, null, { sort: { createdAt: 1 } });
    res.send(tasks);
  } catch (e) {
    console.error("Error fetching tasks", e);
    res.status(500).send({ error: "Failed to fetch tasks" });
  }
});

router.get("/task/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    console.error("Error fetching task", e);
    res.status(500).send({ error: "Failed to fetch task" });
  }
});

router.patch("/task/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "tags",
    "dueDate",
    "description",
    "label",
    "priority",
    "scheduleDate",
    "status",
  ];

  let isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (req.body.status && req.body.status.hasOwnProperty("completedOn")) {
    isValidOperation = false;
  } else if (req.body.status && req.body.status.hasOwnProperty("completed")) {
    if (req.body.status.completed === true) {
      req.body.status.completedOn = new Date();
    } else {
      req.body.status.completedOn = null;
    }
  }

  if (!isValidOperation)
    return res.status(400).send({ error: "Invalid Updates!" });
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send();
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();
    res.send(task);
  } catch (e) {
    console.error("Error updating task", e);
    res.status(500).send({ error: "Failed to update task" });
  }
});

router.delete("/task/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    console.error("Error deleting task", e);
    res.status(500).send({ error: "Failed to delete task" });
  }
});

// Bulk delete multiple tasks from given array of ids
router.delete("/tasks/bulk", auth, async (req, res) => {
  try {
    const taskIds = req.body.ids;
    const result = await Task.deleteMany({
      _id: { $in: taskIds },
      owner: req.user._id,
    });

    res.send({ deleteCount: result.deletedCount });
  } catch (e) {
    console.error("Error deleting bulk tasks", e);
    res.status(500).send({ error: "Failed to delete bulk tasks" });
  }
});

module.exports = router;
