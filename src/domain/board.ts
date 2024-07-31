import { Disc } from "./disc";
import { Move } from "./move";

export class Board {
  constructor(private _discs: Disc[][]) {}
  
  place(move: Move): Board {
    // TODO 盤面におけるかチェック
    const newDisc = this._discs.map(line => {
      return line.map(disc => disc)
    })

    // 石を置く
    newDisc[move.point.y][move.point.x] = move.disc

    // ひっくり返す
    return new Board(newDisc)
  }

  get discs() {
    return this._discs
  }
}