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
    res.status(400).send(e);
  }
});

router.get("/task", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id }, null, {
      sort: { createdAt: 1 },
    });
    if (!tasks) return res.status(404).send();
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

/**
 * Returns combination of tasks for a particular day
 * Tasks that are scheduled for a date
 * Tasks that do not have scheduled date or general tasks and are not completed
 * TODO: Tasks that are recurring for a particular date
 */
router.get("/task/myday", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      owner: req.user._id,
      $or: [
        { scheduleDate: { $exists: false } },
        {
          scheduleDate: {
            $exists: true,
            $ne: null,
            $eq: taskUtils.getTodayDate(),
          },
        },
      ],
    });
    if (!tasks) return res.status(404).send();
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
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
    });

    res.status(200).send(overdueTasks);
  } catch (e) {
    res.status(500);
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
        $gt: taskUtils.getTodayDate(),
        $lte: taskUtils.getDateAfterAWeek(),
      },
    });
    res.status(200).send(upcomingTasks);
  } catch (e) {
    res.status(500).send({
      error: e && e.message ? e.message : "Internal Server Error",
    });
  }
});

router.get("/task", auth, async (req, res) => {
  const query = { owner: req.user._id };

  if (req.query.tag) {
    query.tags = req.query.tag;
  }

  try {
    const tasks = await Task.find(query, null, { sort: { createdAt: 1 } });
    if (!tasks) return res.status(404).send();
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/task/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send(task);
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
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
    res.status(500).send(e);
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
    res.status(500).send(e);
  }
});

module.exports = router;
