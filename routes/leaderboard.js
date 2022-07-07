import { Router } from "express";
import { connection } from "../connection.js";

const leaderboardRouter = Router();

leaderboardRouter.get("/", (req, res) => {
  connection.query(
    "SELECT nickname, school, elo_rating FROM users ORDER BY elo_rating DESC LIMIT 20;",
    (error, rows, fields) => {
      res.send(rows);
    }
  );
});

leaderboardRouter.get("/school/:school", (req, res) => {
  connection.query(
    `SELECT nickname, school, elo_rating FROM users WHERE school LIKE "${req.params.school}" ORDER BY elo_rating DESC LIMIT 20;`,
    (error, rows, fields) => {
      res.send(rows);
    }
  );
});

export default leaderboardRouter;
