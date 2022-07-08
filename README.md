# 오목 (BackEnd)

### 몰입캠프 공통과제 2주차

---

## Authors

[leejy12]("https://github.com/leejy12")

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
            <td rowspan=3>서버</td>
            <td>Node</td>
            <td><code>v16.15.1</code></td>
        </tr>
        <tr>
            <td>npm</td>
            <td><code>8.11.0</code></td>
        </tr>
        <tr>
            <td>TypeScript</td>
            <td><code>Version 2.7.2</code></td>
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

Note: `error` is the error message returned by MySQL.

---

```
GET /user/login/email/<email>
```

### Description

Checks if `<email>` is already registered.

### Response

| Status Code | Response | Description                           |
| ----------- | -------- | ------------------------------------- |
| 200         | "YES"    | `<email>` is already in the database. |
| 404         | "NO"     | `<email>` is not in the database.     |
| 500         | `error`  | Internal Server Error                 |

---

```
POST /user/signup/email/<email>/nickname/<nickname>/school/<school>
```

### Description

Sign up a new user. `<nickname>` must not be in the database at the time of signup.

### Response

| Status Code | Response | Description                                  |
| ----------- | -------- | -------------------------------------------- |
| 200         | "0"      | Signup was successful.                       |
| 400         | "1"      | `<nickname>` already exists in the database. |
| 500         | `error`  | Internal Server Error                        |

---

```
GET /user/email/<email>
```

### Description

Get user information by `<email>`.

### Response

| Status Code | Response                                                                                                              | Description                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 200         | <pre>[<br> {<br> "email": string,<br> "nickname: string, <br> "school": string<br> "elo_rating": int<br> }<br>]</pre> | Information retrieval was successful. The response is a JSON array with one JSON object. |
| 404         | "NO"                                                                                                                  | `<email>` is not in the database.                                                        |
| 500         | `error`                                                                                                               | Internal Server Error                                                                    |
