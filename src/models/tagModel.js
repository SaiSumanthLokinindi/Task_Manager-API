const mongoose = require("mongoose");

const TagSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  count: {
    type: Number,
    default: 0,
  },
});

TagSchema.index({ owner: 1, name: 1 }, { unique: true });
TagSchema.index({ owner: 1, count: -1 });

const Tag = mongoose.model("Tag", TagSchema);

module.exports = Tag;
