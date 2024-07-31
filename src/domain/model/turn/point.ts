
// 最初は引用が多いPointクラスから作成
export class Point {
  constructor(private _x: number, private _y: number) {}

  get x() {
    return this._x
  }

  get y() {
    return this._y
  }
}