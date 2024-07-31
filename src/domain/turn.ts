import { Board } from "./board";
import { Move } from "./move";

export class Turn {
  constructor(
    private _gameId: number,
    private _turnCount: number,
    private _nextDisc: number,
    private _move: Move | undefined,
    private _board: Board,
    private _endAt: Date
  ) {}
}
