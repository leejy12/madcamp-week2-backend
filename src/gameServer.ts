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

  websocketServer.on(
    "connection",
    (websocketConnection: WebSocket, connectionRequest: IncomingMessage) => {
      const [_path, params]: string[] = connectionRequest?.url?.split("?") as string[];
      const connectionParams: qs.ParsedQs = qs.parse(params);

      // console.log(connectionParams);
      waitingPlayers.push(
        new OmokPlayer(
          connectionParams["nickname"] as string,
          parseInt(connectionParams["elo_rating"] as string),
          websocketConnection
        )
      );

      if (waitingPlayers.length % 2 === 1) {
        websocketConnection.send("WAITING");
      } else {
        const player1 = waitingPlayers[waitingPlayers.length - 2];
        const player2 = waitingPlayers[waitingPlayers.length - 1];
        let game = new OmokGame(player1, player2);
        let gameId: string = uuidv4();

        console.log(gameId);

        games.set(gameId, game);

        player1.webSocket.send(`{ "gameId": ${gameId}, "player": 1 }`);
        player2.webSocket.send(`{ "gameId": ${gameId}, "player": 2 }`);

        waitingPlayers.splice(0, 2);
      }
      // console.log(waitingPlayers);

      websocketConnection.on("message", (message) => {
        let move: OmokMove = JSON.parse(message.toString());
        let gameId: string = move["gameId"];
        let game: OmokGame = games.get(gameId) as OmokGame;

        console.log(
          `Player ${move["player"]} of game ${gameId} played move [${move["row"]}, ${move["col"]}]`
        );

        // websocketConnection.send(move["gameId"]);
        let moveResult: OmokMoveResult = games.get(gameId)?.makeMove(move) as OmokMoveResult;
        game.player1.webSocket.send(JSON.stringify(moveResult));
        game.player2.webSocket.send(JSON.stringify(moveResult));

        if (moveResult.status !== 0) {
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

          game.player1.webSocket.send(newElo1.toString());
          game.player2.webSocket.send(newElo2.toString());

          connection.query(
            `UPDATE users SET elo_rating = ${newElo1} WHERE nickname = "${game.player1.nickname}";`
          );
          connection.query(
            `UPDATE users SET elo_rating = ${newElo2} WHERE nickname = "${game.player2.nickname}";`
          );
        }
      });
    }
  );

  return websocketServer;
};
