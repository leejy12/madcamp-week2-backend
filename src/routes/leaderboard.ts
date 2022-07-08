import { Router } from "express";
import { connection } from "../connection.js";

const leaderboardRouter: Router = Router();

leaderboardRouter.get("/", (req, res) => {
  connection.query(
    "SELECT nickname, school, elo_rating FROM users ORDER BY elo_rating DESC LIMIT 20;",
    (error, rows, fields) => {
      if (error) res.status(500).send(error);
      else res.send(rows);
    }
  );
});

leaderboardRouter.get("/school/:school", (req, res) => {
  connection.query(
    `SELECT nickname, school, elo_rating FROM users WHERE school LIKE "${req.params.school}" ORDER BY elo_rating DESC LIMIT 20;`,
    (error, rows, fields) => {
      if (error) res.status(500).send(error);
      if (rows.length === 0) res.status(404).send("NO");
      else res.send(rows);
    }
  );
});

export default leaderboardRouter;
