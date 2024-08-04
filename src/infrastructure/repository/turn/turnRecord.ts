export class TurnRecord {
  constructor(
    private _id: number,
    private _game_id: number,
    private _turn_count: number,
    private _next_disc: number | undefined,
    private _end_at: Date
  ){}

  get id() {
    return this._id
  }

  get nextDisc() {
    return this._next_disc
  }

  get endAt() {
    return this._end_at
  }
}