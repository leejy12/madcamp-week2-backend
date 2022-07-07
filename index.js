import express from "express";
import leaderboardRouter from "./routes/leaderboard.js";
import userRouter from "./routes/user.js";

const port = 80;
const app = express();

app.use("/leaderboard", leaderboardRouter);
app.use("/user", userRouter);

app.listen(port, () => {
  console.log(`Omok listening on port ${port}`);
});
