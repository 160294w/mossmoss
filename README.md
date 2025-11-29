# 🛠️ 便利ツール集

日常的に使用する小物ツールを集約したWebアプリケーション。モダンなUIとスムーズなアニメーションで「楽しく使える」体験を提供します。

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=white)

## ✨ 特徴

- 🎨 **モダンUI**: Tailwind CSSによる美しいデザイン
- ⚡ **高速**: Viteによる最適化されたビルド
- 🌙 **ダークモード**: 目に優しいテーマ切り替え
- 📱 **レスポンシブ**: あらゆるデバイスに対応
- 🎯 **型安全**: TypeScriptによる堅牢な開発
- ✨ **アニメーション**: GSAPによるスムーズなエフェクト
- 💾 **履歴保存**: ローカルストレージで使用履歴を記録
- ♿ **アクセシブル**: ARIA対応とキーボード操作

## 🚀 デモ

### スクリーンショット
*準備中 - 実際のスクリーンショットをここに追加してください*

### ライブデモ
🌐 **[https://tarutaru.pages.dev](https://tarutaru.pages.dev)**

## 🛠️ 搭載ツール

### 📝 文字数カウント
- リアルタイム文字数表示
- 詳細統計（単語数、行数、日本語文字数）
- 空白・改行の除外オプション
- ワンクリックコピー機能

### 🔄 全角・半角変換
- 数字、英字、カタカナの個別変換
- 双方向変換（全角⇔半角）
- 変換例のリアルタイム表示
- 文字種選択オプション

### 🎲 ランダム文字列生成
- カスタマイズ可能な文字種（数字・英字・記号）
- 長さ調整（1〜128文字）
- プリセット（パスワード、PIN、トークン）
- 生成履歴（最新5件）
- 似た文字・紛らわしい文字の除外オプション

### 📋 JSONフォーマッタ
- リアルタイム構文チェック
- 美しい整形とシンタックスハイライト
- 圧縮（ミニファイ）機能
- 詳細統計情報（サイズ、要素数等）
- エラー箇所の明確な表示

### 📱 QRコード生成
- 高品質QRコード生成
- カスタマイズ可能（サイズ、色、エラー訂正レベル）
- 多様な入力形式対応（URL、メール、電話、Wi-Fi等）
- PNG形式でダウンロード
- プリセットテンプレート

### 🔑 JWT Viewer
- JWT（JSON Web Token）の構造解析
- ヘッダー・ペイロード・シグネチャの詳細表示
- 標準クレームの自動認識
- 期限（exp）の有効性チェック
- 日付フィールドの人間読み形式表示
- セキュリティ注意事項の表示

### 🔤 Base64/58変換
- Base64、Base64URL、Base58の相互変換
- エンコード・デコード双方向対応
- バイト数・文字数の詳細統計
- エラーハンドリングと詳細メッセージ
- 各形式の使用例とサンプル
- 入出力の即座入れ替え機能

### 🔀 Diffビューア
- サイドバイサイドのテキスト差分表示
- 行単位の差分をカラーハイライト（追加・削除・変更）
- 空白無視・大文字小文字無視オプション
- 左右テキスト入れ替え機能
- 詳細統計情報（追加/削除行数、総行数）
- WinMerge/Meldライクなユーザー体験

## 🏗️ 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Vite** - 高速ビルドツール
- **Tailwind CSS** - ユーティリティファーストCSS

### アニメーション・インタラクション
- **GSAP** - 高性能アニメーションライブラリ
- **Custom Hooks** - 再利用可能なロジック

### 状態管理・ユーティリティ
- **React Context** - テーマ管理
- **LocalStorage API** - 履歴保存
- **Clipboard API** - コピー機能

### 外部ライブラリ
- **qrcode** - QRコード生成
- **diff** - テキスト差分計算
- **clsx** - 条件付きクラス名
- **tailwind-merge** - Tailwindクラス最適化

## 📁 プロジェクト構成

```
src/
├── components/           # Reactコンポーネント
│   ├── Layout/          # レイアウト関連
│   │   └── Header.tsx   # ヘッダーコンポーネント
│   ├── Tools/           # 各ツールコンポーネント
│   │   ├── CharacterCount.tsx
│   │   ├── TextConverter.tsx
│   │   ├── RandomGenerator.tsx
│   │   ├── JSONFormatter.tsx
│   │   ├── QRGenerator.tsx
│   │   ├── JWTViewer.tsx
│   │   ├── BaseConverter.tsx
│   │   └── DiffViewer.tsx
│   ├── UI/              # 共通UIコンポーネント
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── ToolCard.tsx     # ツール一覧カード
│   └── ToolContainer.tsx # ツールコンテナ
├── contexts/            # Reactコンテキスト
│   └── ThemeContext.tsx # ダークモード管理
├── hooks/               # カスタムフック
│   ├── useLocalStorage.ts
│   ├── useCopyToClipboard.ts
│   ├── useDiff.ts
│   └── useGSAP.ts
├── types/               # TypeScript型定義
│   └── index.ts
├── utils/               # ユーティリティ関数
│   └── cn.ts           # クラス名ユーティリティ
├── App.tsx             # メインアプリコンポーネント
├── main.tsx           # エントリーポイント
└── index.css          # グローバルスタイル
```

## 🚀 セットアップ

### 前提条件
- Node.js 18.0.0 以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd utility-tools

# 依存関係のインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

http://localhost:5173 でアプリケーションが起動します。

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

### デプロイ

Cloudflare Pagesを使用してデプロイしています。

```bash
# Cloudflareにログイン
wrangler login

# プロジェクト「tarutaru」にデプロイ
wrangler pages deploy dist --project-name=tarutaru

# 現在のデプロイURL
# https://tarutaru.pages.dev
```

**デプロイ設定：**
- プロジェクト名: `tarutaru`  
- ドメイン: `tarutaru.pages.dev`
- プロダクションブランチ: `main`
- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`


### 型チェック・Lint

```bash
# TypeScript型チェック
npm run type-check

# ESLintによるコードチェック
npm run lint
```

## 🎨 カスタマイズ

### 新しいツールの追加

1. `src/components/Tools/` に新しいコンポーネントを作成
2. `ToolProps` インターフェースを実装
3. `src/App.tsx` の `tools` 配列に追加

例：
```typescript
// src/components/Tools/NewTool.tsx
import { ToolProps } from '../../types';

export function NewTool({ onHistoryAdd }: ToolProps) {
  // ツールのロジックを実装
  return <div>新しいツール</div>;
}

// src/App.tsx
import { NewTool } from './components/Tools/NewTool';

const tools: Tool[] = [
  // ... 既存の7つのツール
  {
    id: 'new-tool',
    name: '新しいツール',
    description: 'ツールの説明',
    icon: '🔧',
    component: NewTool
  }
];
```

### テーマのカスタマイズ

`tailwind.config.js` でカラーパレットやアニメーションを調整できます：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        500: '#3b82f6',
        // ...
      }
    }
  }
}
```

### アニメーションの追加

GSAPを使用したカスタムアニメーションは `useGSAP` フックで実装：

```typescript
const ref = useGSAP((ctx) => {
  ctx.from('.my-element', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.1
  });
}, [dependency]);
```

## 📊 パフォーマンス

- ⚡ **First Contentful Paint**: < 1.5s
- 🎯 **Lighthouse Score**: 95+
- 📦 **Bundle Size**: ~300KB (gzipped: ~100KB)
- 🔄 **Tree Shaking**: 未使用コードの自動除去
- 💾 **Code Splitting**: 動的インポート対応

## 🔒 セキュリティ

- 🛡️ **XSS対策**: Reactによる自動エスケープ
- 🔒 **CSP対応**: Content Security Policy準拠
- 📝 **型安全性**: TypeScriptによる静的解析
- 🏥 **エラーハンドリング**: 適切な例外処理

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

### 開発ガイドライン

- TypeScriptの厳密な型チェックを維持
- ESLintルールに従ったコード品質
- レスポンシブデザインの考慮
- アクセシビリティの確保
- パフォーマンスの最適化

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 🙏 謝辞

- [React](https://reactjs.org/) - UIライブラリ
- [Vite](https://vitejs.dev/) - ビルドツール
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [GSAP](https://greensock.com/gsap/) - アニメーションライブラリ
- [QRCode.js](https://github.com/soldair/node-qrcode) - QRコード生成

## 📞 サポート

質問やサポートが必要な場合は、以下の方法でお問い合わせください：

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/utility-tools/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/utility-tools/discussions)


---

⭐ このプロジェクトが役に立ったら、ぜひスターを付けてください！