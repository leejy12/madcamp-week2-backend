import { WebSocketServer, WebSocket } from "ws";
import qs from "qs";
import { OmokPlayer, OmokGame, OmokMove, OmokMoveResult, K } from "./omok.js";
import { v4 as uuidv4 } from "uuid";
import { IncomingMessage, Server } from "http";
import { connection } from "./connection.js";

let games = new Map<string, OmokGame>(); // { gameId: OmokGame }
let waitingPlayers: OmokPlayer[] = [];

export default async (expressServer: Server) => {
  const websocketServer = new WebSocketServer({
    noServer: true,
    path: "/websockets",
  });

  expressServer.on("upgrade", (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit("connection", websocket, request);
    });
  });

  websocketServer.on("connection", (websocketConnection: WebSocket, connectionRequest: IncomingMessage) => {
    const [_path, params]: string[] = connectionRequest?.url?.split("?") as string[];
    const connectionParams: qs.ParsedQs = qs.parse(params);

    // console.log(connectionParams);
    waitingPlayers.push(
      new OmokPlayer(
        connectionParams["nickname"] as string,
        parseInt(connectionParams["elo_rating"] as string),
        connectionParams["school"] as string,
        websocketConnection
      )
    );

    console.log(`${connectionParams["nickname"]} has connected!`);

    if (waitingPlayers.length % 2 === 1) {
      websocketConnection.send('{ "type": "waiting" }');
    } else {
      const player1 = waitingPlayers[waitingPlayers.length - 2];
      const player2 = waitingPlayers[waitingPlayers.length - 1];
      let game = new OmokGame(player1, player2);
      let gameId: string = uuidv4();

      console.log(gameId);

      games.set(gameId, game);

      player1.webSocket.send(
        `{ "type": "gameFound", "gameId": "${gameId}", "player": 1 , "opponent": { "nickname": "${player2.nickname}", "elo_rating": ${player2.elo_rating}, "school": "${player2.school}" }}`
      );
      player2.webSocket.send(
        `{ "type": "gameFound", "gameId": "${gameId}", "player": 2 , "opponent": { "nickname": "${player1.nickname}", "elo_rating": ${player1.elo_rating}, "school": "${player1.school}" }}`
      );

      waitingPlayers.splice(0, 2);
    }
    // console.log(waitingPlayers);

    websocketConnection.on("message", (message) => {
      /**
       * {
       *   "gameId": uuid,
       *   "player": 1 or 2,
       *   "row": int,
       *   "col": int
       * }
       */
      let move: OmokMove = JSON.parse(message.toString());
      let gameId: string = move["gameId"];
      let game: OmokGame = games.get(gameId) as OmokGame;
      let row: number = move["row"];
      let col: number = move["col"];

      console.log(`Player ${move["player"]} of game ${gameId} played move [${row}, ${col}]`);

      let moveResult: OmokMoveResult = games.get(gameId)?.makeMove(move) as OmokMoveResult;

      // concede
      if (row === -1 && col === -1) {
        moveResult.status = 3 - moveResult.player;
      }

      // game is not over yet
      if (moveResult.status === 0) {
        game.player1.webSocket.send(
          `{ "type": "moveResult", "moveResult": ${JSON.stringify(moveResult)}, "newRating": 0 }`
        );
        game.player2.webSocket.send(
          `{ "type": "moveResult", "moveResult": ${JSON.stringify(moveResult)}, "newRating": 0 }`
        );
      }
      // game is over
      else {
        let oldElo1 = game.player1.elo_rating;
        let oldElo2 = game.player2.elo_rating;
        let newElo1, newElo2, score1, score2: number;
        let expected1 = 1 / (1 + Math.pow(10, (oldElo2 - oldElo1) / 400));
        let expected2 = 1 / (1 + Math.pow(10, (oldElo1 - oldElo2) / 400));

        if (moveResult.status === 1) {
          score1 = 1;
          score2 = 0;
        } else if (moveResult.status === 2) {
          score1 = 0;
          score2 = 1;
        } else {
          score1 = score2 = 0.5;
        }

        newElo1 = Math.round(oldElo1 + K * (score1 - expected1));
        newElo2 = Math.round(oldElo2 + K * (score2 - expected2));

        game.player1.webSocket.send(
          `{ "type": "moveResult", "moveResult": ${JSON.stringify(moveResult)}, "newRating": ${newElo1.toString()} }`
        );
        game.player2.webSocket.send(
          `{ "type": "moveResult", "moveResult": ${JSON.stringify(moveResult)}, "newRating": ${newElo2.toString()} }`
        );

        connection.query(`UPDATE users SET elo_rating = ${newElo1} WHERE nickname = "${game.player1.nickname}";`);
        connection.query(`UPDATE users SET elo_rating = ${newElo2} WHERE nickname = "${game.player2.nickname}";`);

        games.delete(gameId);
      }
    });

    websocketConnection.on("close", (code, reason) => {
      console.log(`${reason.toString()} has disconnected!`);
      waitingPlayers = waitingPlayers.filter((p) => p.nickname != reason.toString());
    });
  });

  return websocketServer;
};
