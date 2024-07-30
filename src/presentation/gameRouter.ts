import express from 'express'
import { GameGateway } from '../dataaccess/gameGateway';
import { TurnGateway } from '../dataaccess/turnGateway';
import { SquareGateway } from '../dataaccess/squareGateway';
import { connectMySQL } from '../dataaccess/connection';
import { INITIAL_BOARD, DARK } from '../application/constants';

export const gameRouter = express.Router()

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();


gameRouter.post("/api/games", async (req, res) => {
  const now = new Date();

  // mysqlとの連携
  const conn = await connectMySQL();

  try {
    await conn.beginTransaction();

    // gameテーブルの初期化
    const gameRecord = await gameGateway.insert(conn, now);

    // turnsテーブルの初期化
    const turnRecord = await turnGateway.insert(
      conn,
      gameRecord.id,
      0,
      DARK,
      now
    );

    await squareGateway.insertAll(conn, turnRecord.id, INITIAL_BOARD);

    await conn.commit();
  } finally {
    await conn.end();
  }
  res.status(201).end();
});