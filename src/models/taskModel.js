const mongoose = require("mongoose");
const taskUtils = require("../utils/taskUtils");
const Tag = require("./tagModel");

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
      type: [
        {
          type: String,
          lowercase: true,
          trim: true,
        },
      ],
      index: true,
      default: [],
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

taskSchema.pre("save", async function () {
  const task = this;

  // If tags are modified
  if (task.isModified("tags")) {
    const newTags = task.tags || [];
    let oldTags = [];

    // If this is an update (not a brand new task), find the previous tags
    if (!task.isNew) {
      oldTags = await Task.findById(task._id, { tags: 1 });
    }

    // calculate the difference between new and old tags
    const addedTags = newTags.filter((newTag) => !oldTags.includes(newTag));
    const removedTags = oldTags.filter((oldTag) => !newTags.includes(oldTag));

    const bulkOps = [];

    addedTags.forEach((tag) => {
      bulkOps.push({
        updateOne: {
          filter: {
            owner: task.owner,
            name: tag,
          },
          update: {
            $inc: { count: 1 },
          },
          upsert: true,
        },
      });
    });

    removedTags.forEach((tag) => {
      bulkOps.push({
        updateOne: {
          filter: {
            owner: task.owner,
            name: tag,
          },
          update: {
            $inc: { count: -1 },
          },
        },
      });
    });

    try {
      await Tag.bulkWrite(bulkOps);
    } catch (e) {
      console.log("Failed to update tags count on task save", e);
    }
  }
});

taskSchema.post("findOneAndDelete", async function (task) {
  if (task.tags?.length > 0) {
    try {
      await Tag.updateMany(
        {
          owner: task.owner,
          name: { $in: task.tags },
        },
        {
          $inc: { count: -1 },
        },
      );
    } catch (e) {
      console.log("Failed to update tags count on task deletion", e);
    }
  }
});

taskSchema.index({ owner: 1, tags: 1 });
taskSchema.index({ owner: 1, priority: 1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
