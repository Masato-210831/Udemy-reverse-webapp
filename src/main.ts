import express from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql, { ResultSetHeader } from "mysql2/promise";

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
  const conn = await mysql.createConnection({
    host: "localhost",
    database: "reversi",
    user: "reversi",
    password: "password",
  });

  try {
    await conn.beginTransaction();

    // gameテーブルの初期化
    const gameInsertResult = await conn.execute<mysql.ResultSetHeader>(
      "insert into games (started_at) values (?)",
      [now]
    );

    const gameId = gameInsertResult[0].insertId

    // turnsテーブルの初期化
    const turnInsertResult = await conn.execute<ResultSetHeader>(
      "insert into turns (game_id, turn_count, next_disc ,end_at) values (?, ?, ?, ?)", [gameId, 0, DARK, now]
    )
    
    const turnId = turnInsertResult[0].insertId

    // マス目の数を累積で数える
    const squareCount = INITIAL_BOARD.map(line => line.length).reduce(
      (v1, v2) => v1 + v2, 0
    )

    const squaresInsertSql = 'insert into squares (turn_id, x, y, disc) values ' + Array.from(Array(squareCount)).map(() => '(?, ?, ?, ?)').join(', ')

    // squaresInsertSqlの64の(?,?,?,?)に入るvaluesの配列を定義
    const squaresInsertValues: any[] = []
    INITIAL_BOARD.forEach((line, y) => {
      line.forEach((disc, x) => {
        squaresInsertValues.push(turnId)
        squaresInsertValues.push(x)
        squaresInsertValues.push(y)
        squaresInsertValues.push(disc)
      })
    })

    await conn.execute(squaresInsertSql, squaresInsertValues)
     

    await conn.commit();
  } finally {
    await conn.end();
  }

  res.status(201).end();
});

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
