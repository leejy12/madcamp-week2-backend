import express, { Express } from "express";
import leaderboardRouter from "./routes/leaderboard.js";
import userRouter from "./routes/user.js";
import websockets from "./gameServer.js";

const app: Express = express();
const port: number = 80;

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}\n\n`);
});

websockets(server);

app.use("/leaderboard", leaderboardRouter);
app.use("/user", userRouter);
