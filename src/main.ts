import express from "express";
import morgan from "morgan";
import "express-async-errors";

const PORT = 3000;

const app = express();

// 開発中のログの出力
app.use(morgan("dev"));

// エンドポイントの定義
app.get("/api/hello", async (req, res) => {
  res.json({
    message: "Hello Express",
  });
});

app.get("/api/error", async (req, res) => {
  throw new Error("Error endpoint");
});

// エラーが発生したら実行
app.use(errorHandler);

// ポート番号の指定
// サーバーを起動 -> コールバック関数でメッセージを出力
app.listen(PORT, () => {
  console.log(`Reversi application started: http://localhost:${PORT}`);
});

// これらの引数を受け取る定義でエラーハンドリリングミドルウェアと認識される。
function errorHandler(err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) {
  // エラーログの出力
  console.log("Unexpected error occurred", err);

  // ページの表示(Response)
  res.status(500).send({
    message: "Unexpected error occurred",
  });
}