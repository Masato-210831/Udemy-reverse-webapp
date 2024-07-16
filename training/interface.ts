const STONE = 0
const PAPER = 1
const SCISSORS = 2

interface HandGenerator {
  generator():number
}

class RandomHandGenerator implements HandGenerator {
  generator(): number {
    return Math.floor(Math.random()*3)
  }

  generateArray(): number[] {
    return []
  }
}


class Janken {
  play(handGenerator: HandGenerator) {
    const computerHand = handGenerator.generator()

    console.log(`computerHand = ${computerHand}`)

    //勝敗
  }
}

const generator = new RandomHandGenerator()
const janken = new Janken();
janken.play(generator)

class stoneHandGenerator implements HandGenerator {
  generator():number {
    return STONE
  }
}


const generator2 = new stoneHandGenerator()
janken.play(generator2)