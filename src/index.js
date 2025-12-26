const express = require("express");
const cors = require("cors");
require("./db/mongoose");
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.0.120:5173"],
  })
);
const port = process.env.PORT;

app.use(express.json());

// Manually increasing latency for testing purposes
app.use(function (req, res, next) {
  setTimeout(next, 2000);
});

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server is running on port", port);
});
