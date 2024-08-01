import { DomainError } from "../../error/domainError";
import { WinnerDisc } from "../gameResult/winnerDisc";
import { Board, initialBoard } from "./board";
import { Disc } from "./disc";
import { Move } from "./move";
import { Point } from "./point";

export class Turn {
  constructor(
    private _gameId: number,
    private _turnCount: number,
    private _nextDisc: Disc | undefined,
    private _move: Move | undefined,
    private _board: Board,
    private _endAt: Date
  ) {}

  placeNext(disc: Disc, point: Point): Turn {
    // 打とうとした石が、次の石ではない場合、置くことはできない
    if (disc !== this._nextDisc) {
      throw new DomainError("SelectedDiscIsNotNextDisc", 'Selected disc is not next disc ')
    }

    // 打ったdiscの情報
    const newMove = new Move(disc, point);

    // newMoveから次の盤面を作成
    const nextBoard = this._board.place(newMove);

    // 次のdiscい場合はスキップする
    const nextDisc = this.decideNextDisc(nextBoard, disc)

    return new Turn(
      this._gameId,
      this._turnCount + 1,
      nextDisc,
      newMove,
      nextBoard,
      new Date()
    );
  }

  gameEnd(): boolean {
    return this.nextDisc === undefined
  }

  winnerDisc(): WinnerDisc {
    const darkCount = this._board.count(Disc.Dark)
    const LightCount = this._board.count(Disc.Light)

    if (darkCount === LightCount) {
      return WinnerDisc.Draw
    } else if (darkCount > LightCount) {
      return WinnerDisc.Dark
    }  else {
      return WinnerDisc.Light
    }

  }

  private decideNextDisc(board: Board, previousDisc: Disc): Disc | undefined {
    const existDarkValidMove = board.existValidMove(Disc.Dark)
    const existLightValidMove = board.existValidMove(Disc.Light)

    if (existDarkValidMove && existLightValidMove) {
      // 両方の石が置ける
      return previousDisc === Disc.Dark ? Disc.Light : Disc.Dark
    } else if (!existDarkValidMove && !existLightValidMove) {
      // 両方の石が置けない
      return undefined
    } else if (existDarkValidMove) {
      return Disc.Dark
    } else {
      return Disc.Light
    }


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

export function firstTurn(gameId: number, endAt: Date) {
  return new Turn(
    gameId,
    0,
    Disc.Dark,
    undefined,
    initialBoard,
    endAt
  )
}
