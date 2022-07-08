import { WebSocket } from "ws";

/**
 * Number of rows and column on the board. Must be at least 5.
 */
export const boardSize = 11;

/**
 * K-factor of ELO rating system.
 */
export const K = 20;

/**
 * This interface describes a single move made by a player.
 *
 * `gameId`: UUID of the OmokGame
 *
 * `player`: Player number (either 1 or 2)
 *
 * `row`   : Row of the piece placed by player
 *
 * `col`   : Column of the piece placed by player
 */
export interface OmokMove {
  gameId: string;
  player: number;
  row: number;
  col: number;
}

/**
 * This class is used to describe the result of the latest OmokMove

 * `player`: The player who made the latest move (either 1 or 2)
 *
 * `row`   : Row of position of the latest piece
 *
 * `col`   : Column of position of the latest piece
 *
 * `status`: Status of the game \
 *           0 : Game is not over yet. \
 *           1 : Player 1 won.         \
 *           2 : Player 2 won.         \
 *           3 : Draw
 */
export class OmokMoveResult {
  player: number;
  row: number;
  col: number;
  status: number;

  constructor(player: number, row: number, col: number, winner: number) {
    this.player = player;
    this.row = row;
    this.col = col;
    this.status = winner;
  }
}

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

type OmokBoard = number[][];

function makeNewOmokBoard() {
  return Array(boardSize)
    .fill(0)
    .map(() => new Array(boardSize).fill(0));
}

export class OmokGame {
  player1: OmokPlayer;
  player2: OmokPlayer;
  currentPlayer: number;
  board: OmokBoard;

  constructor(player1: OmokPlayer, player2: OmokPlayer) {
    this.player1 = player1;
    this.player2 = player2;
    this.currentPlayer = 1;
    this.board = makeNewOmokBoard();
  }

  makeMove(move: OmokMove): OmokMoveResult {
    // this logic should be handled in the client.
    if (this.currentPlayer === move.player && this.board[move.row][move.col] === 0) {
      this.board[move.row][move.col] = move.player;
      this.currentPlayer = 3 - this.currentPlayer;

      for (let i: number = 0; i < boardSize; i++) {
        console.log(this.board[i].join(""));
      }
      console.log();

      return new OmokMoveResult(move.player, move.row, move.col, this.checkWinner());
    } else {
      throw 1;
    }
  }

  contiguousFive(arr: number[]): number {
    let changePos: number[] = [0];
    let segLength: number[] = [];

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== arr[i + 1]) changePos.push(i + 1);
    }
    changePos.push(arr.length);

    for (let i = 0; i < arr.length - 1; i++) {
      segLength.push(changePos[i + 1] - changePos[i]);
    }

    for (let i = 0; i < segLength.length; i++) {
      if (segLength[i] === 5 && arr[changePos[i]] !== 0) return arr[changePos[i]];
    }

    return 0;
  }

  /**
   * Checks the board to determine the game status and returns it.
   * @returns status of the game
   *
   * 0: Game is not over yet. \
   * 1: Player 1 won.         \
   * 2: Player 2 won.         \
   * 3: Draw.
   */
  checkWinner(): number {
    // Check horizontally
    for (let r = 0; r < boardSize; r++) {
      let x = this.contiguousFive(this.board[r]);
      if (x === 1 || x === 2) return x;
    }

    // Check vertically
    for (let c = 0; c < boardSize; c++) {
      let column: number[] = [];
      for (let r = 0; r < boardSize; r++) {
        column.push(this.board[r][c]);
      }
      let x = this.contiguousFive(column);
      if (x === 1 || x === 2) return x;
    }

    // Check diagonally (/ direction)
    for (let n = 4; n < boardSize; n++) {
      let diag: number[] = [];
      for (let i = 0; i <= n; i++) {
        diag.push(this.board[i][n - i]);
      }
      let x = this.contiguousFive(diag);
      if (x === 1 || x === 2) return x;
    }
    for (let i = 1; i <= boardSize - 5; i++) {
      let diag: number[] = [];
      for (let j = i; j <= boardSize - 1; j++) {
        diag.push(this.board[j][boardSize - j + i - 1]);
      }
      let x = this.contiguousFive(diag);
      if (x === 1 || x === 2) return x;
    }

    // Check diagonally (\ direction)
    for (let i = 0; i <= boardSize - 5; i++) {
      let diag: number[] = [];
      for (let j = i; j <= boardSize - 1; j++) {
        diag.push(this.board[j - i][j]);
      }
      let x = this.contiguousFive(diag);
      if (x === 1 || x === 2) return x;
    }
    for (let i = 1; i <= boardSize - 5; i++) {
      let diag: number[] = [];
      for (let j = i; j <= boardSize - 1; j++) {
        diag.push(this.board[j][j - i]);
      }
      let x = this.contiguousFive(diag);
      if (x === 1 || x === 2) return x;
    }

    return 0;
  }

  reset() {
    this.board = makeNewOmokBoard();
  }
}
