const express = require("express");
const cors = require("cors");
require("./db/mongoose");
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server is running on port", port);
});
