const mongoose = require("mongoose");
const taskUtils = require("../utils/taskUtils");

const StatusSchema = mongoose.Schema({
  completed: {
    type: Boolean,
    default: false,
  },
  completedOn: {
    type: Date,
    default: null,
  },
});

const skipValidation = true;

const taskSchema = mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: StatusSchema,
    scheduleDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
      validate(value) {
        if (skipValidation) return;
        if (new Date(value) < new Date())
          throw new Error("due date cannot be in the past");
      },
    },
    tags: {
      type: [String],
      index: true,
      default: [],
      lowercase: true,
      trim: true,
    },
    priority: {
      type: Number,
      enum: [0, 1, 2, 3, 4],
      default: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.methods.toJSON = function () {
  const task = this;
  return taskUtils.getTaskData(task.toObject());
};

taskSchema.index({ owner: 1, tags: 1 });
taskSchema.index({ owner: 1, priority: 1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
