import { Router } from "express";
import { connection } from "../connection.js";

const userRouter: Router = Router();

userRouter.get("/email/:email", (req, res) => {
  connection.query(
    `SELECT email, nickname, school, elo_rating FROM users WHERE email = "${req.params.email}";`,
    (error, rows, fields) => {
      if (error) return res.status(500).send(error);
      else res.send(rows);
    }
  );
});

userRouter.get("/login/email/:email", (req, res) => {
  connection.query(
    `SELECT id FROM users WHERE email LIKE "${req.params.email}";`,
    (error, rows, fields) => {
      if (error) {
        return res.status(500).send(error);
      } else {
        if (rows.length == 1) res.send("YES");
        else res.send("NO");
      }
    }
  );
});

userRouter.post("/signup/email/:email/nickname/:nickname/school/:school", (req, res) => {
  // First if there is a duplicate nickname
  connection.query(
    `SELECT id FROM users WHERE nickname = "${req.params.nickname}"`,
    (error, rows, fields) => {
      if (rows.length === 0) {
        // If it is a unique id, insert into database
        connection.query(
          `INSERT INTO users VALUE(NULL, "${req.params.email}", "${req.params.nickname}", "${req.params.school}", 1000);`,
          (error, rows) => {
            if (rows !== undefined) res.send("0");
            else res.send("1");
          }
        );
      } else {
        res.send("2");
      }
    }
  );
});

export default userRouter;
