const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
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
      enum: ["critical", "high", "medium", "low"],
      default: "low",
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
