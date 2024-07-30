import { GameGateway } from "../dataaccess/gameGateway";
import { TurnGateway } from "../dataaccess/turnGateway";
import { MoveGateway } from "../dataaccess/moveGateway";
import { SquareGateway } from "../dataaccess/squareGateway";
import { connectMySQL } from "../dataaccess/connection";
import { DARK, LIGHT } from "./constants";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

class findLatestGameTurnByTurnCountOutput {
  constructor(
    private _turnCount: number,
    private _board: number[][],
    private _nextDisc: number | undefined,
    private _winnerDisc: number | undefined
  ) {}

  get turnCount() {
    return this._turnCount
  }

  get board() {
    return this._board
  }

  get nextDisc() {
    return this._nextDisc
  }

  get winnerDisc() {
    return this._winnerDisc
  }
}

export class TurnService {
  async findLatestGameTurnByTurnCount(turnCount: number): Promise<findLatestGameTurnByTurnCountOutput> {
    const conn = await connectMySQL();
    try {
      const gameRecord = await gameGateway.findLatest(conn);
      if (!gameRecord) {
        throw new Error("Latest game not found");
      }

      const turnRecord = await turnGateway.findForGameIdAndTurnCount(
        conn,
        gameRecord.id,
        turnCount
      );

      if (!turnRecord) {
        throw new Error("Specified turn not found");
      }

      const squareRecord = await squareGateway.findForTurnId(
        conn,
        turnRecord.id
      );

      const board = Array.from(Array(8)).map(() => Array.from(Array(8)));

      squareRecord.forEach((s) => {
        board[s.y][s.x] = s.disc;
      });

      return new findLatestGameTurnByTurnCountOutput(
        turnCount, board, turnRecord.nextDisc, undefined
      )
    } finally {
      conn.end();
    }
  }

  async registerTurn(turnCount: number, disc: number, x: number, y: number) {
    const conn = await connectMySQL();
    try {
      // 1つ前のターンを取得する
      const gameRecord = await gameGateway.findLatest(conn);
      if (!gameRecord) {
        throw new Error("Latest game not found");
      }

      const previousTurnCount = turnCount - 1;
      const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(
        conn,
        gameRecord.id,
        previousTurnCount
      );

      if (!previousTurnRecord) {
        throw new Error("Specified turn not found");
      }

      const squareRecord = await squareGateway.findForTurnId(
        conn,
        previousTurnRecord.id
      );
      // const squares = squaresSelectResult[0];

      const board = Array.from(Array(8)).map(() => Array.from(Array(8)));

      squareRecord.forEach((s) => {
        board[s.y][s.x] = s.disc;
      });

      // TODO 盤面におけるかチェックする

      // 石を置く
      board[y][x] = disc;

      // TODO ひっくり返す

      // ターンを保存する
      const nextDisc = disc === DARK ? LIGHT : DARK;
      const now = new Date();
      const turnRecord = await turnGateway.insert(
        conn,
        gameRecord.id,
        turnCount,
        nextDisc,
        now
      );

      await squareGateway.insertAll(conn, turnRecord.id, board);

      await moveGateway.insert(conn, turnRecord.id, disc, x, y);

      await conn.commit();
    } finally {
      conn.end();
    }
  }
}
