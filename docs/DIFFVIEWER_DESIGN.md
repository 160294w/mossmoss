# 📐 DiffViewer - 設計ドキュメント

## 🎯 概要

ultrathink diffツールは、2つのテキストを比較し、差分を視覚的にサイドバイサイドで表示するWebアプリケーションです。WinMergeやMeldのようなデスクトップアプリケーションのWeb版を目指します。

## 🏗️ アーキテクチャ

### システム構成図

```
┌─────────────────────────────────────────────────┐
│              DiffViewer Component               │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         DiffToolbar (ヘッダー)           │  │
│  │  ・オプション設定                        │  │
│  │  ・スワップ/クリアボタン                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │       DiffInput (入力エリア)             │  │
│  │  ┌──────────────┬──────────────┐        │  │
│  │  │ 左テキスト   │ 右テキスト   │        │  │
│  │  │ (Original)   │ (Modified)   │        │  │
│  │  └──────────────┴──────────────┘        │  │
│  └──────────────────────────────────────────┘  │
│                      ↓                          │
│                 useDiff Hook                    │
│              (差分計算エンジン)                 │
│                      ↓                          │
│  ┌──────────────────────────────────────────┐  │
│  │      DiffDisplay (差分表示エリア)        │  │
│  │  ┌──────────────┬──────────────┐        │  │
│  │  │ 左ペイン     │ 右ペイン     │        │  │
│  │  │ (削除/変更)  │ (追加/変更)  │        │  │
│  │  └──────────────┴──────────────┘        │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         DiffStats (統計情報)             │  │
│  │  ・追加行数、削除行数、変更行数          │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### データフロー

```
ユーザー入力（左/右テキスト）
        ↓
  State管理（useState）
        ↓
  useDiff Hook
        ↓
  diffライブラリ（行単位比較）
        ↓
  整形済み差分データ
        ↓
  DiffDisplay コンポーネント
        ↓
  画面表示（サイドバイサイド）
```

## 📦 コンポーネント設計

### 1. DiffViewer.tsx（親コンポーネント）

**役割**: 全体の状態管理とレイアウト

**State**:
```typescript
interface DiffViewerState {
  leftText: string;      // 左側のテキスト
  rightText: string;     // 右側のテキスト
  ignoreWhitespace: boolean;  // 空白無視オプション
  ignoreCase: boolean;   // 大文字小文字無視オプション
}
```

**主な機能**:
- テキスト入力の管理
- オプション設定の管理
- 子コンポーネントへのデータ配信

### 2. useDiff Hook（カスタムフック）

**役割**: 差分計算のビジネスロジック

**入力**:
```typescript
interface UseDiffProps {
  leftText: string;
  rightText: string;
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}
```

**出力**:
```typescript
interface DiffResult {
  lines: DiffLine[];     // 整形済み差分データ
  stats: DiffStats;      // 統計情報
}

interface DiffLine {
  leftLineNumber: number | null;  // 左側の行番号
  rightLineNumber: number | null; // 右側の行番号
  content: string;                // 行の内容
  type: 'added' | 'removed' | 'modified' | 'normal';
}

interface DiffStats {
  addedLines: number;    // 追加行数
  removedLines: number;  // 削除行数
  modifiedLines: number; // 変更行数
  totalLines: number;    // 総行数
}
```

**アルゴリズム**:
1. 入力テキストを行単位で分割
2. オプションに応じて前処理（空白除去、小文字変換）
3. `diff`ライブラリで差分計算
4. 結果を`DiffLine`形式に整形
5. 統計情報を集計

### 3. DiffDisplay コンポーネント

**役割**: サイドバイサイドで差分を表示

**Props**:
```typescript
interface DiffDisplayProps {
  diffResult: DiffResult;
}
```

**レイアウト**:
```html
<div class="grid grid-cols-2 gap-px bg-gray-200">
  <div class="left-pane">
    <!-- 各行をループ -->
    <DiffLine ... />
  </div>
  <div class="right-pane">
    <DiffLine ... />
  </div>
</div>
```

### 4. DiffLine コンポーネント

**役割**: 個別の差分行を表示

**Props**:
```typescript
interface DiffLineProps {
  lineNumber: number | null;  // 行番号（null = 空行）
  content: string;
  type: 'added' | 'removed' | 'modified' | 'normal';
  side: 'left' | 'right';
}
```

**表示ルール**:
| type     | 左ペイン | 右ペイン | 背景色   |
|----------|---------|---------|---------|
| added    | 空行     | 表示     | 緑       |
| removed  | 表示     | 空行     | 赤       |
| modified | 旧内容   | 新内容   | 黄       |
| normal   | 表示     | 表示     | 白/灰    |

## 🎨 UI設計

### カラーパレット

```typescript
const colorScheme = {
  light: {
    added: 'bg-green-50 border-l-4 border-green-500 text-green-900',
    removed: 'bg-red-50 border-l-4 border-red-500 text-red-900',
    modified: 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900',
    normal: 'bg-white text-gray-900',
    lineNumber: 'text-gray-500 bg-gray-100',
  },
  dark: {
    added: 'dark:bg-green-900/20 dark:border-green-400 dark:text-green-100',
    removed: 'dark:bg-red-900/20 dark:border-red-400 dark:text-red-100',
    modified: 'dark:bg-yellow-900/20 dark:border-yellow-400 dark:text-yellow-100',
    normal: 'dark:bg-gray-800 dark:text-gray-100',
    lineNumber: 'dark:text-gray-400 dark:bg-gray-900',
  }
};
```

### レスポンシブ対応

- **デスクトップ（1024px以上）**: サイドバイサイド表示（grid-cols-2）
- **タブレット（768px〜1023px）**: サイドバイサイド表示（小さいフォント）
- **モバイル（767px以下）**: 将来的に統合ビューに切替（Phase 2）

### アクセシビリティ

- **行番号**: `aria-label="Line 5"` で読み上げ対応
- **差分タイプ**: `aria-label="Added line"` で状態を明示
- **キーボード操作**: Tab順序を適切に設定

## 🔧 技術仕様

### 使用ライブラリ

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| diff | ^5.2.0 | 差分計算アルゴリズム |
| react | ^18.3.1 | UIフレームワーク |
| tailwindcss | ^3.4.15 | スタイリング |

### diffライブラリの使い方

```typescript
import * as Diff from 'diff';

// 行単位の差分
const changes = Diff.diffLines(oldText, newText);

// 各changeオブジェクトの構造
interface Change {
  value: string;      // 差分の内容
  added?: boolean;    // 追加された場合true
  removed?: boolean;  // 削除された場合true
  count?: number;     // 行数
}
```

### パフォーマンス最適化

**MVP段階**:
- `useMemo`で差分計算結果をキャッシュ
- 入力が変わらない限り再計算しない

```typescript
const diffResult = useMemo(() => {
  return calculateDiff(leftText, rightText, options);
}, [leftText, rightText, options]);
```

**将来の最適化（Phase 2以降）**:
- 仮想スクロール（react-window）
- Web Workerでの非同期計算
- デバウンス処理

## 📊 状態管理戦略

### Phase 1（MVP）: ローカルState

```typescript
// DiffViewer.tsx内
const [leftText, setLeftText] = useState('');
const [rightText, setRightText] = useState('');
const [options, setOptions] = useState({
  ignoreWhitespace: false,
  ignoreCase: false
});
```

**理由**: シンプルで十分、オーバーエンジニアリングを避ける

### Phase 2以降: Context API（オプション）

複数タブや履歴機能を追加する場合は、Context APIを検討。

## 🧪 テスト戦略

### 単体テスト

```typescript
// useDiff.test.ts
describe('useDiff', () => {
  it('should detect added lines', () => {
    const left = 'line1\nline2';
    const right = 'line1\nline2\nline3';
    const result = calculateDiff(left, right);
    expect(result.stats.addedLines).toBe(1);
  });
});
```

### ビジュアルテスト

実際にブラウザで以下をテスト:
- 空白文字の扱い
- ダークモード切替
- レスポンシブ表示

## 🚀 実装フェーズ

### Phase 1: MVP（今回実装）

- ✅ 基本的なサイドバイサイド表示
- ✅ 行単位の差分検出
- ✅ 追加/削除/変更のハイライト
- ✅ 基本オプション（空白無視、大文字小文字無視）
- ✅ 統計情報表示

### Phase 2: 標準機能

- 統合ビュー（Unified View）
- 文字単位の差分
- スクロール同期
- 履歴保存
- ファイルドラッグ&ドロップ

### Phase 3: 高度な機能

- シンタックスハイライト
- JSON専用モード
- 仮想スクロール
- エクスポート機能

## 📝 コーディング規約

### ファイル命名規則

- コンポーネント: PascalCase（例: `DiffViewer.tsx`）
- フック: camelCase + useプレフィックス（例: `useDiff.ts`）
- 型定義: PascalCase（例: `DiffLine`, `DiffStats`）

### TypeScript型定義

すべての関数、Props、Stateに明示的な型を定義:

```typescript
// ✅ Good
interface DiffLineProps {
  lineNumber: number | null;
  content: string;
  type: DiffType;
}

// ❌ Bad
function DiffLine(props: any) { ... }
```

### コメント規約

複雑なロジックには日本語コメントを付ける:

```typescript
// 空白を無視する場合、各行から空白文字を除去してから比較
const processedLeft = ignoreWhitespace
  ? leftText.split('\n').map(line => line.trim())
  : leftText.split('\n');
```

## 🔗 参考資料

- [diff ライブラリドキュメント](https://github.com/kpdecker/jsdiff)
- [WinMerge](https://winmerge.org/) - UIリファレンス
- [Meld](https://meldmerge.org/) - UIリファレンス
- [React Hook最適化](https://react.dev/reference/react/useMemo)

---

**作成日**: 2025-11-29
**バージョン**: 1.0 (MVP)
**次回更新予定**: Phase 2実装時
