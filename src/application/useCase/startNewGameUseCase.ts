import { connectMySQL } from "../../infrastructure/connection";
import { firstTurn } from "../../domain/model/turn/turn";
import { Game } from "../../domain/model/game/game";
import { TurnRepository } from "../../domain/model/turn/turnRepository";
import { GameRepository } from "../../domain/model/game/gameRepository";

export class StartNewGameUseCase {
  constructor(
    private _gameRepository: GameRepository,
    private _turnRepository: TurnRepository
  ) {}
  async run() {
    const now = new Date();

    // mysqlとの連携
    const conn = await connectMySQL();

    try {
      await conn.beginTransaction();

      // gameテーブルの初期化
      const game = await this._gameRepository.save(
        conn,
        new Game(undefined, now)
      );

      if (!game.id) {
        throw new Error("game.id not exist");
      }

      // turnsテーブルの初期化
      const turn = firstTurn(game.id, now);

      await this._turnRepository.save(conn, turn);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}
