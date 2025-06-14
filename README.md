# 📦 どこに置いたっけ？持ち物ロケーター

探し物の時間をゼロに！持ち物の場所を階層管理できる無料のPWAアプリケーションです。

[![Deploy Status](https://img.shields.io/badge/deploy-GitHub%20Pages-success)](https://appadaycreator.github.io/item-locator/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen.svg)](https://appadaycreator.github.io/item-locator/)

## 🌟 特徴

### 📱 基本機能
- **階層型収納管理**: 部屋→家具→引き出しのような階層構造で管理
- **高速検索**: アイテム名、場所、タグで瞬時に検索
- **写真登録**: カメラや画像ファイルから取り込んで視覚的に管理
- **QRコード生成**: 収納場所にQRコードを貼って素早くアクセス

### 🎮 ゲーミフィケーション
- **XPシステム**: アイテム登録でXPを獲得
- **実績システム**: 7種類の実績を解除
- **デイリーミッション**: 毎日の目標でモチベーション維持
- **ランキング**: 他のユーザーと競争

### 🔧 高度な機能
- **音声検索・入力**: 話しかけるだけで検索・登録
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
- Webフォーム: [お問い合わせページ](contact.html) (GitHub Issue を自動生成)

---

Made with ❤️ by AppADayCreator

## 機能概要

### 1. アイテム管理
- 階層構造での収納場所管理
  - 親カテゴリ（例：リビング、寝室）
  - 子カテゴリ（例：棚、引き出し）
  - 詳細位置（例：2段目左側）
- アイテム情報の登録
  - アイテム名
  - 収納場所
  - メモ（任意）
  - 登録日時
  - 階層場所は「/」区切りで入力可能（例：押入れ/ダンボール①/服）

### 2. 検索機能
- リアルタイム検索
- アイテム名での検索
- メモ内容での検索

### 3. データ管理
- ローカルストレージでのデータ保存
- オフライン対応
- データのエクスポート/インポート機能

### 4. 共有機能
- QRコード生成
  - 収納場所ごとのQRコード
  - アイテム情報の共有
- SNSシェア
  - Twitter
  - LINE
  - Facebook
- 友達との比較機能
  - 登録アイテム数の比較
  - 整理整頓レベルの共有

### 5. 統計情報
- 登録アイテム数
- 収納場所数
- 使用履歴

## 技術仕様

### フロントエンド
- HTML5
- CSS3
  - Flexbox
  - Grid
  - レスポンシブデザイン
- JavaScript (ES6+)
  - モジュールパターン
  - 非同期処理
  - ローカルストレージAPI

### PWA機能
- Service Worker
  - キャッシュ管理
  - オフライン対応
- Web App Manifest
  - アプリケーション情報
  - アイコン設定
- インストール機能

### データ構造

#### アイテム情報
```javascript
{
  id: number,          // 一意のID
  name: string,        // アイテム名
  image: string,       // Base64画像データ（任意）
  memo: string,        // メモ（任意）
  parent: string,      // 親カテゴリ
  detail: string,      // 詳細位置
  createdAt: string    // 登録日時（ISO形式）
}
```

#### 収納場所情報
```javascript
{
  [parentLocation: string]: {
    [detailLocation: string]: Item[]
  }
}
```

#### 履歴情報
```javascript
{
  action: string,      // 'add' | 'search'
  item?: Item,         // アイテム情報（追加時）
  query?: string,      // 検索クエリ（検索時）
  results?: number,    // 検索結果数（検索時）
  timestamp: string    // 実行日時（ISO形式）
}
```

## セットアップ手順

1. リポジトリのクローン
```bash
git clone https://github.com/appadaycreator/item-locator.git
cd item-locator
```

2. 依存パッケージのインストール
```bash
npm install
```

3. 画像ファイルの生成
```bash
node convert-images.js
```

4. ローカルサーバーでの実行
```bash
# Pythonの場合
python -m http.server 8000

# Node.jsの場合
npx serve
```

5. ブラウザでアクセス
```
http://localhost:8000
```

## デプロイ

GitHub Pagesを使用してデプロイします：

1. リポジトリの設定
   - Settings > Pages
   - Source: main branch
   - フォルダ: / (root)

2. デプロイの確認
   - https://appadaycreator.github.io/item-locator/

## プライバシーポリシー

詳細な内容は[プライバシーポリシー](privacy.html)をご覧ください。

- すべてのデータはローカルストレージに保存
- 外部サーバーへのデータ送信なし
- アクセス解析のみGoogle Analyticsを使用

## 免責事項

- 本サービスは無料で提供
- データのバックアップはユーザー自身で管理
- サービスの変更・終了の可能性あり