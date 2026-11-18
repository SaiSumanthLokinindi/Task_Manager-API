const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");
const tagRouter = require("./routers/tagRouter");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.0.110:5173"],
  }),
);

const isDevENV = process.env.NODE_ENV === "dev";

app.use(express.json());

// Manually increasing latency for testing purposes
app.use(function (req, res, next) {
  if (isDevENV) setTimeout(next, 2000);
  else next();
});

app.use(userRouter);
app.use(taskRouter);
app.use(tagRouter);

const startServer = async () => {
  const mongoDBURL = isDevENV
    ? process.env.MONGODB_URL_DEV
    : process.env.MONGODB_URL_PROD;

  try {
    await mongoose.connect(mongoDBURL, {
      dbName: !isDevENV ? "tasky-do" : "",
    });

    console.log("Connected to MongoDB");

    const PORT = process.env.PORT;

    app.listen(PORT, "0.0.0.0", () => {
      console.log("Server is running on port", PORT);
    });
  } catch (err) {
    console.log("Server startup failed", err);
    process.exitCode = 1;
  }
};

startServer();
