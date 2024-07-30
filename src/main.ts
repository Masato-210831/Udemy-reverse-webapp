import express from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql, { ResultSetHeader } from "mysql2/promise";
import { GameGateway } from "./dataaccess/gameGateway";

// 最初の盤面
const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const INITIAL_BOARD = [
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, DARK, LIGHT, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, LIGHT, DARK, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
];

const PORT = 3000;

const app = express();

// 開発中のログの出力
app.use(morgan("dev"));
// 静的ファイルの定義:localhost:3000でindex.htmlが表示される
app.use(express.static("static", { extensions: ["html"] }));
app.use(express.json())

const gameGateway = new GameGateway()

// エンドポイントの定義
app.get("/api/hello", async (req, res) => {
  res.json({
    message: "Hello Express",
  });
});

app.get("/api/error", async (req, res) => {
  throw new Error("Error endpoint");
});

app.post("/api/games", async (req, res) => {
  const now = new Date();

  // mysqlとの連携
  const conn = await connectMySQL();

  try {
    await conn.beginTransaction();

    // gameテーブルの初期化
    const gameRecord = await gameGateway.insert(conn, now);

    // turnsテーブルの初期化
    const turnInsertResult = await conn.execute<ResultSetHeader>(
      "insert into turns (game_id, turn_count, next_disc ,end_at) values (?, ?, ?, ?)",
      [gameRecord.id, 0, DARK, now]
    );

    const turnId = turnInsertResult[0].insertId;

    // マス目の数を累積で数える
    const squareCount = INITIAL_BOARD.map((line) => line.length).reduce(
      (v1, v2) => v1 + v2,
      0
    );

    const squaresInsertSql =
      "insert into squares (turn_id, x, y, disc) values " +
      Array.from(Array(squareCount))
        .map(() => "(?, ?, ?, ?)")
        .join(", ");

    // squaresInsertSqlの64の(?,?,?,?)に入るvaluesの配列を定義
    const squaresInsertValues: any[] = [];
    INITIAL_BOARD.forEach((line, y) => {
      line.forEach((disc, x) => {
        squaresInsertValues.push(turnId);
        squaresInsertValues.push(x);
        squaresInsertValues.push(y);
        squaresInsertValues.push(disc);
      });
    });

    await conn.execute(squaresInsertSql, squaresInsertValues);

    await conn.commit();
  } finally {
    await conn.end();
  }
  res.status(201).end();
});

// この書き方はexpressのルール
app.get("/api/games/latest/turns/:turnCount", async (req, res) => {
  // turnCountの取得
  const turnCount = parseInt(req.params.turnCount);

  const conn = await connectMySQL();
  try {
    const gameRecord = await gameGateway.findLatest(conn)
    if (!gameRecord) {
      throw new Error('Latest game not found')
    }

    const turnSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "select id, game_id, turn_count, next_disc, end_at from turns where game_id = ? and turn_count = ?",
      [gameRecord.id, turnCount]
    );

    const turn = turnSelectResult[0][0];

    const squaresSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "select id, turn_id, x, y, disc from squares where turn_id = ?",
      [turn["id"]]
    );
    const squares = squaresSelectResult[0];

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));

    squares.forEach((s) => {
      squares.forEach((s) => (board[s.y][s.x] = s.disc));
    });

    const responseBody = {
      turnCount,
      board,
      nextDisc: turn["next_disc"],
      // TODO 決着がついている場合、game_resultsテーブルから取得する
      winnerDisc: null,
    };

    res.json(responseBody);
  } finally {
    conn.end();
  }
});

app.post('/api/games/latest/turns', async (req, res) => {
  const turnCount = parseInt(req.body.turnCount)
  const disc = parseInt(req.body.move.disc)
  const x = parseInt(req.body.move.x)
  const y = parseInt(req.body.move.y)

  // 1つ前のターンを取得する
  const conn = await connectMySQL();
  try {
    const gameRecord = await gameGateway.findLatest(conn)
    if (!gameRecord) {
      throw new Error('Latest game not found')
    }

    const previousTurnCount = turnCount - 1
    const turnSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "select id, game_id, turn_count, next_disc, end_at from turns where game_id = ? and turn_count = ?",
      [gameRecord.id, previousTurnCount]
    );

    const turn = turnSelectResult[0][0];

    const squaresSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "select id, turn_id, x, y, disc from squares where turn_id = ?",
      [turn["id"]]
    );
    const squares = squaresSelectResult[0];

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));

    squares.forEach((s) => {
      squares.forEach((s) => (board[s.y][s.x] = s.disc));
    });


    // TODO 盤面におけるかチェックする
  
    // 石を置く
    board[y][x] = disc
    
  
    // TODO ひっくり返す
  
    // ターンを保存する
    const nextDisc = disc === DARK ? LIGHT : DARK
    const now = new Date()
    const turnInsertResult = await conn.execute<ResultSetHeader>(
      "insert into turns (game_id, turn_count, next_disc ,end_at) values (?, ?, ?, ?)",
      [gameRecord.id, turnCount, nextDisc, now]
    );

    const turnId = turnInsertResult[0].insertId;

    // マス目の数を累積で数える
    const squareCount = board.map((line) => line.length).reduce(
      (v1, v2) => v1 + v2,
      0
    );

    const squaresInsertSql =
      "insert into squares (turn_id, x, y, disc) values " +
      Array.from(Array(squareCount))
        .map(() => "(?, ?, ?, ?)")
        .join(", ");

    const squaresInsertValues: any[] = [];
    board.forEach((line, y) => {
      line.forEach((disc, x) => {
        squaresInsertValues.push(turnId);
        squaresInsertValues.push(x);
        squaresInsertValues.push(y);
        squaresInsertValues.push(disc);
      });
    });

    await conn.execute(squaresInsertSql, squaresInsertValues);

    await conn.execute('insert into moves (turn_id, disc, x, y) values (?, ?, ?, ?)', [turnId, disc, x, y])

    await conn.commit();

  } finally {
    conn.end();
  }


  res.status(201).end()

})

// エラーが発生したら実行
app.use(errorHandler);

// ポート番号の指定
// サーバーを起動 -> コールバック関数でメッセージを出力
app.listen(PORT, () => {
  console.log(`Reversi application started: http://localhost:${PORT}`);
});

// これらの引数を受け取る定義でエラーハンドリリングミドルウェアと認識される。
function errorHandler(
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) {
  // エラーログの出力
  console.log("Unexpected error occurred", err);

  // ページの表示(Response)
  res.status(500).send({
    message: "Unexpected error occurred",
  });
}

// db接続の関数
async function connectMySQL() {
  return await mysql.createConnection({
    host: "localhost",
    database: "reversi",
    user: "reversi",
    password: "password",
  });
}
