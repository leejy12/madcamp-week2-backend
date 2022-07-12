# 몰입 오목 (BackEnd)

### 2022 여름 몰입캠프 공통과제 2주차

---

# Authors

- KAIST 이준영 [leejy12]("https://github.com/leejy12")
- GIST 현재오 [hjo3736]("https://github.com/hjo3736")

---

## Technology

<table>
    <thead>
        <tr>
            <th>Category</th>
            <th>Tech</th>
            <th>Version</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan=3>Server</td>
            <td>Node</td>
            <td><code>v16.15.1</code></td>
        </tr>
        <tr>
            <td>npm</td>
            <td><code>8.11.0</code></td>
        </tr>
        <tr>
            <td>TypeScript</td>
            <td><code>Version 4.7.4</code></td>
        </tr>
        <tr>
            <td>DB</td>
            <td>MySQL</td>
            <td><code>Ver 14.14 Distrib 5.7.38</code></td>
        </tr>
        <tr>
            <td>OS</td>
            <td>Ubuntu</td>
            <td><code>18.04.6 LTS</code></td>
        </tr>
</table>

---

## Build & Run

Create a `.env` file with the following contents.

```
DB_PASSWORD=<password>
```

Install dependencies

```
npm install
```

Run the server

```
npm run dev
```

---

## API

Routing was done using [Express.js]("https://expressjs.com/"). See [API.md](https://github.com/leejy12/madcamp-week2-backend/blob/master/API.md) for details.

---

## DB

Table `users`.

```
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int(11)      | NO   | PRI | NULL    | auto_increment |
| email      | varchar(100) | NO   |     | NULL    |                |
| nickname   | varchar(30)  | NO   |     | NULL    |                |
| school     | varchar(30)  | NO   |     | NULL    |                |
| elo_rating | int(11)      | NO   |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+
```

Each row's `email` and `nickname` are unique.

---

## How the game works

### Game Matching

The game server keeps track of waiting players in a list `waitingPlayers` defined in `src/gameServer.ts`. Whenever a new player is added and the length of the list is even, pop the first two players and create a new Game is created between those two. Of the two players, the one who was added to the list first is Black i.e. goes first.

A game instance is represented by the class `OmokGame`. Each game is given a unique UUID and stored in a map data structure.

### Game Play

Each player take turns making moves. A move is represented by the class `OmokMove`. After each move, the game server determines the state of the game (0: not over, 1: player 1 won, 2: player 2 won, 3: draw). The result of each move is represented by the class `OmokMoveResult`. This gets serialized and sent to both players after each move. When a game is ended, ELO ratings of each player gets updated in the DB and notified to each player.
