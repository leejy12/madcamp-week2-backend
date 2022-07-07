import { WebSocketServer } from "ws";
import queryString from "query-string";
import { OmokPlayer, OmokGame } from "./omok.js";
import { v4 as uuidv4 } from "uuid";

let games = {}; // { gameId: OmokGame }
let waitingPlayers = [];

export default async (expressServer) => {
  const websocketServer = new WebSocketServer({
    noServer: true,
    path: "/websockets",
  });

  expressServer.on("upgrade", (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit("connection", websocket, request);
    });
  });

  websocketServer.on("connection", (websocketConnection, connectionRequest) => {
    const [_path, params] = connectionRequest?.url?.split("?");
    const connectionParams = queryString.parse(params);

    // console.log(connectionParams);
    waitingPlayers.push(
      new OmokPlayer(
        connectionParams["nickname"],
        parseInt(connectionParams["elo_rating"]),
        websocketConnection
      )
    );

    if (waitingPlayers.length % 2 === 1) {
      websocketConnection.send("WAITING");
    } else {
      const player1 = waitingPlayers[waitingPlayers.length - 2];
      const player2 = waitingPlayers[waitingPlayers.length - 1];
      let game = new OmokGame(player1, player2);
      let gameId = uuidv4();
      console.log(gameId);
      games[gameId] = game;
      player1.webSocket.send(gameId);
      player2.webSocket.send(gameId);
      waitingPlayers.splice(0, 2);
    }
    console.log(waitingPlayers);

    websocketConnection.on("message", (message) => {});
  });

  return websocketServer;
};
