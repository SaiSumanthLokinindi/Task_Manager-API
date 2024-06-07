const mongoose = require("mongoose");

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
    completed: {
      type: Boolean,
      default: false,
    },
    scheduleDate: {
      type: Date,
    },
    deadline: {
      type: Date,
      validate(value) {
        if (new Date(value) < new Date())
          throw new Error("Deadline cannot be in the past");
      },
    },
    category: {
      type: String,
      default: "general",
    },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low", "general"],
      default: "general",
    },
    repeating: {
      type: mongoose.Mixed,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
