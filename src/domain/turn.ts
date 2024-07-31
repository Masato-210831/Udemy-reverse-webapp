import { Board } from "./board";
import { Disc } from "./disc";
import { Move } from "./move";
import { Point } from "./point";

export class Turn {
  constructor(
    private _gameId: number,
    private _turnCount: number,
    private _nextDisc: Disc,
    private _move: Move | undefined,
    private _board: Board,
    private _endAt: Date
  ) {}

  placeNext(disc: Disc, point: Point): Turn {
    // 打とうとした石が、次の石ではない場合、置くことはできない
    if (disc !== this._nextDisc) {
      throw new Error('Invalid disc')
    }

    // 打ったdiscの情報
    const newMove = new Move(disc, point);

    // newMoveから次の盤面を作成
    const nextBoard = this._board.place(newMove);

    // 次のdisc
    // TODO 次の石がおけない場合はスキップする
    const nextDisc = disc === Disc.Dark ? Disc.Light : Disc.Dark;

    return new Turn(
      this._gameId,
      this._turnCount + 1,
      nextDisc,
      newMove,
      nextBoard,
      new Date()
    );
  }

  get gameId() {
    return this._gameId
  }

  get turnCount() {
    return this._turnCount
  }

  get nextDisc() {
    return this._nextDisc
  }

  get endAt() {
    return this._endAt
  }

  get board() {
    return this._board
  }

  get move() {
    return this._move
  }

}
