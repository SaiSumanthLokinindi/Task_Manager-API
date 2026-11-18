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
const port = process.env.PORT;

app.use(express.json());

// Manually increasing latency for testing purposes
app.use(function (req, res, next) {
  if (process.env.NODE_ENV === "dev") setTimeout(next, 2000);
  else next();
});

app.use(userRouter);
app.use(taskRouter);
app.use(tagRouter);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: process.env.NODE_ENV !== "dev" ? "tasky-do" : "",
    });

    console.log("Connected to MongoDB");

    const PORT = process.env.PORT;

    app.listen(port, "0.0.0.0", () => {
      console.log("Server is running on port", port);
    });
  } catch (err) {
    console.log("Server startup failed", err);
    process.exitCode = 1;
  }
};

startServer();
