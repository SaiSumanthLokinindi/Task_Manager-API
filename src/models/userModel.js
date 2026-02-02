const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./taskModel");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Email is invalid");
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      trim: true,
      validate(value) {
        if (value.includes("password"))
          throw new Error("Password contains the word 'password'");
      },
    },
    tokens: [
      {
        token: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.toJSON = function () {
  const user = this;
  const { name, email } = user.toObject();
  return { name, email };
};

//Hash the plain text password before saving
userSchema.pre("save", async function () {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

//Delete user tasks when user is removed
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const user = this;
    await Task.deleteMany({ owner: user._id });
  },
);

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("user does not exist", { cause: { code: "LU" } });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw new Error("incorrect password", { cause: { code: "LP" } });
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
