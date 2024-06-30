const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const userRouter = require("./routes/userRoutes");
const workoutRouter = require("./routes/workoutRoutes");
const taskRouter = require("./routes/taskRoutes")
const mealsRouter = require("./routes/mealsRoute")
const smoothiesRouter = require("./routes/smoothiesRoute")
const fastingplanRouter = require("./routes/fastingplanRoute")
const healthscoreRouter = require("./routes/healthscoreRoute")
const planRouter = require("./routes/planRoute")
const myProgressMonitorRouter = require("./routes/progressMonitorRoute");
const stepCountRouter = require("./routes/stepCounterRoute");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/workouts", workoutRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/meals", mealsRouter);
app.use("/api/v1/smoothies", smoothiesRouter)
app.use("/api/v1/fastingplan", fastingplanRouter)
app.use("/api/v1/healthscore", healthscoreRouter)
app.use("/api/v1/plans", planRouter)
app.use("/api/v1/myProgress", myProgressMonitorRouter);
app.use("/api/v1/stepCounter", stepCountRouter);


module.exports = app;
