import { connectMySQL } from "../../infrastructure/connection";
import { firstTurn } from "../../domain/model/turn/turn";
import { GameMySQLRepository } from "../../infrastructure/repository/game/gameMySQLRepository";
import { Game } from "../../domain/model/game/game";
import { TurnMySQLRepository } from "../../infrastructure/repository/turn/turnMySQLRepository";

const gameRepository = new GameMySQLRepository();

const turnRepository = new TurnMySQLRepository();

export class GameService {
  async startNewGame() {
    const now = new Date();

    // mysqlとの連携
    const conn = await connectMySQL();

    try {
      await conn.beginTransaction();

      // gameテーブルの初期化
      const game = await gameRepository.save(conn, new Game(undefined, now));

      if (!game.id) {
        throw new Error("game.id not exist");
      }

      // turnsテーブルの初期化
      const turn = firstTurn(game.id, now);

      await turnRepository.save(conn, turn);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}
