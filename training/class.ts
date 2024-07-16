class Fraction {
  constructor(private _numerator: number, private _denominator: number) {}

  toString(): string {
    return  `${this._numerator}/${this._denominator}`
  }

  add(other:Fraction): Fraction {
    // thisとotherは別々のインスタンスだが、同じFractionクラスなので、privateプロパティにアクセスできる。
    const resultNumerator = this._numerator * other._numerator + this._denominator * other._denominator
    const resultDenominator = this._denominator * other._denominator 

    return new Fraction(resultNumerator, resultDenominator)
  }

  // getterを使用することで外部からのプロパティ変更を防ぎながら、プロパティの参照ができる
  get numerator() {
    return this._numerator;
  }

  set numerator(v: number) {
    this._numerator = v;
    console.log(this._numerator);
  }

  // 原則、getterもsetterと同じ名前を使用する
  get denominator() {
    return this._denominator;
  }
}

const f1 = new Fraction(1, 2);
console.log(f1.numerator);
console.log(f1.denominator);

f1.numerator = 500;

const f2 = new Fraction(1, 3)
console.log(f2.toString())

const results = f1.add(f2)
console.log(results.toString())
