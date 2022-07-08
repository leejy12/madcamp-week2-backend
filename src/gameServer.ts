import { WebSocketServer, WebSocket } from "ws";
import qs from "qs";
import { OmokPlayer, OmokGame } from "./omok.js";
import { v4 as uuidv4 } from "uuid";
import { IncomingMessage, Server } from "http";

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
        player1.webSocket.send(gameId);
        player2.webSocket.send(gameId);
        waitingPlayers.splice(0, 2);
      }
      console.log(waitingPlayers);

      websocketConnection.on("message", (message) => {});
    }
  );

  return websocketServer;
};