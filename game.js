export const boardSize = 11;

export class OmokBoard {
  constructor() {
    this.board = Array(boardSize)
      .fill()
      .map(() => Array(boardSize).fill(0));
  }
}

export class OmokGame {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = OmokBoard();
    console.log(this);
  }
}
