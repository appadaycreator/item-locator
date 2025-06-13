# 📦 どこに置いたっけ？持ち物ロケーター

探し物の時間をゼロに！家中の持ち物をスマホで簡単管理できる無料のWebアプリです。

[![Deploy Status](https://img.shields.io/badge/deploy-GitHub%20Pages-success)](https://appadaycreator.github.io/item-locator/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen.svg)](https://appadaycreator.github.io/item-locator/)

## 🌟 特徴

### 📱 基本機能
- **階層型収納管理**: 部屋→家具→引き出しのような階層構造で管理
- **高速検索**: アイテム名、場所、タグで瞬時に検索
- **写真登録**: 視覚的に分かりやすく管理
- **QRコード生成**: 収納場所にQRコードを貼って素早くアクセス

### 🎮 ゲーミフィケーション
- **XPシステム**: アイテム登録でXPを獲得
- **実績システム**: 7種類の実績を解除
- **デイリーミッション**: 毎日の目標でモチベーション維持
- **ランキング**: 他のユーザーと競争

### 🔧 高度な機能
- **音声検索・入力**: 話しかけるだけで検索・登録
- **バーコードスキャン**: 商品バーコードで簡単登録
- **統計分析**: 使用パターンを可視化
- **PWA対応**: オフラインでも使用可能

## 🚀 使い方

### インストール不要！
ブラウザで以下のURLにアクセスするだけ：
```
https://appadaycreator.github.io/item-locator/
```

### ホーム画面に追加（スマートフォン）
1. Safariまたはchromeでサイトにアクセス
2. 共有ボタンをタップ
3. 「ホーム画面に追加」を選択

## 💻 開発者向け

### ローカル開発
```bash
git clone https://github.com/appadaycreator/item-locator.git
cd item-locator
# ローカルサーバーを起動（VSCode Live Server推奨）
```

### 技術スタック
- Pure JavaScript (ES6+)
- PWA (Progressive Web App)
- LocalStorage API
- Web Speech API
- Chart.js
- QRCode.js

### ファイル構成
```
item-locator/
├── index.html         # メインアプリケーション
├── manifest.json      # PWA設定
├── sw.js             # Service Worker
├── sitemap.xml       # サイトマップ
├── robots.txt        # クローラー設定
├── icon-192.png      # PWAアイコン
├── icon-512.png      # PWAアイコン
├── favicon.png       # ファビコン
├── ogp.png          # OGP画像
└── README.md        # このファイル
```

## 📈 今後の開発予定

- [ ] 3D収納マップ表示
- [ ] 家族間でのデータ共有
- [ ] AIによる収納場所提案
- [ ] バックアップ・復元機能
- [ ] 多言語対応

## 🤝 貢献

プルリクエストを歓迎します！
1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

MITライセンスのもとで公開されています。詳細は[LICENSE](LICENSE)をご覧ください。

## 👏 謝辞

このアプリは30日連続開発チャレンジの一環として作成されました。
- アイコン: Emoji
- チャート: [Chart.js](https://www.chartjs.org/)
- QRコード: [QRCode.js](https://davidshimjs.github.io/qrcodejs/)

## 📞 お問い合わせ

- Twitter: [@appadaycreator](https://twitter.com/appadaycreator)
- Issues: [GitHub Issues](https://github.com/appadaycreator/item-locator/issues)

---

Made with ❤️ by AppADayCreator