import { GameGateway } from "../dataaccess/gameGateway";
import { connectMySQL } from "../dataaccess/connection";
import { TurnRepository } from "../domain/turnRepository";
import { firstTurn} from "../domain/turn";

const gameGateway = new GameGateway();

const turnRepository = new TurnRepository();

export class GameService {
  async startNewGame() {
    const now = new Date();

    // mysqlとの連携
    const conn = await connectMySQL();

    try {
      await conn.beginTransaction();

      // gameテーブルの初期化
      const gameRecord = await gameGateway.insert(conn, now);

      // turnsテーブルの初期化
      const turn = firstTurn(gameRecord.id, now)

      await turnRepository.save(conn, turn);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}
