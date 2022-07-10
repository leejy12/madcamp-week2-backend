import { Router } from "express";
import { connection } from "../connection.js";

const userRouter: Router = Router();

userRouter.get("/email/:email", (req, res) => {
  console.log(`GET /user/email/${req.params.email}`);
  connection.query(
    `SELECT email, nickname, school, elo_rating FROM users WHERE email = "${req.params.email}";`,
    (error, rows, fields) => {
      if (error) return res.status(500).send(error);
      if (rows.length === 1) res.send(rows);
      else res.status(404).send("NO");
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
        if (rows.length === 1) res.send("YES");
        else res.status(404).send("NO");
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
        // If it is a unique nickname, insert into database
        // Starting ELO rating is 1500
        connection.query(
          `INSERT INTO users VALUE(NULL, "${req.params.email}", "${req.params.nickname}", "${req.params.school}", 1500);`,
          (error, rows) => {
            if (error) res.status(500).send(error);
            else res.send("0");
          }
        );
      } else {
        // The user provided nickname already exists in database.
        res.status(400).send("1");
      }
    }
  );
});

userRouter.delete("/delete/email/:email", (req, res) => {
  connection.query(`DELETE FROM users WHERE email = "${req.params.email}"`, (error, result) => {
    if (error) res.status(500).send(error);
    else {
      if (result.affectedRows === 1) res.send("YES");
      else res.status(404).send("NO");
    }
  });
});

export default userRouter;
