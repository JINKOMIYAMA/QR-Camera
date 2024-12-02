const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// 実行ファイルかソースコードかを判断してパスを設定
const distPath = process.pkg 
  ? path.join(process.execPath, '..', 'dist')
  : path.join(__dirname, 'dist');

// 静的ファイルの提供設定
app.use(express.static(distPath));

// SPAのルーティング対応
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// サーバー起動とブラウザを開く
app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
    // Windowsのデフォルトブラウザでページを開く
    exec(`start http://localhost:${PORT}`);
}); 