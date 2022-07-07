import express from "express";
import leaderboardRouter from "./routes/leaderboard.js";
import userRouter from "./routes/user.js";
import gameRouter from "./routes/game.js";
import websockets from "./gameServer.js";

const app = express();
const port = 80;

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}\n\n`);
});

websockets(server);

app.use("/leaderboard", leaderboardRouter);
app.use("/user", userRouter);
app.use("/game", gameRouter);
