const mongoose = require("mongoose");
const validator = require("validator");
const connectionURL = process.env.MONGODB_URL;

mongoose
  .connect(connectionURL)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((e) => console.log("Error connecting to MongoDB:", e.message));
