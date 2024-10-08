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
        taskUtils.filterData(["owner", "__v"], task["_doc"])
      )
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
    "category",
    "dueDate",
    "description",
    "label",
    "priority",
    "scheduleDate",
    "status",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
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
