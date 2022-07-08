import { WebSocket } from "ws";

export const boardSize = 11;

export class OmokPlayer {
  nickname: string;
  elo_rating: number;
  webSocket: WebSocket;

  constructor(nickname: string, elo_rating: number, webSocket: WebSocket) {
    this.nickname = nickname;
    this.elo_rating = elo_rating;
    this.webSocket = webSocket;
  }
}

export class OmokBoard {
  board: number[][];

  constructor() {
    this.board = new Array(boardSize)
      .fill(0)
      .map(() => new Array(boardSize).fill(0));
  }
}

export class OmokGame {
  player1: OmokPlayer;
  player2: OmokPlayer;
  board: OmokBoard;

  constructor(player1: OmokPlayer, player2: OmokPlayer) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new OmokBoard();
  }

  reset() {
    this.board = new OmokBoard();
  }
}
