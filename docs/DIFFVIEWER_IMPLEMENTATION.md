# 📚 DiffViewer - 実装ガイド（初学者向け）

このドキュメントは、DiffViewerツールの実装について、プログラミング初学者でも理解できるように詳しく説明します。

## 📁 ファイル構成

```
src/
├── hooks/
│   └── useDiff.ts              # 差分計算ロジック（カスタムフック）
├── components/
│   └── Tools/
│       └── DiffViewer.tsx      # 画面表示とUI（メインコンポーネント）
├── contexts/
│   └── LanguageContext.tsx     # 多言語対応（日本語・英語の翻訳）
└── App.tsx                     # ツール登録（アプリ全体の設定）

docs/
├── DIFFVIEWER_DESIGN.md        # 設計ドキュメント（なぜこう作ったか）
└── DIFFVIEWER_IMPLEMENTATION.md # このファイル（どう実装したか）
```

---

## 🔧 1. useDiff.ts - 差分計算のロジック

### 📝 このファイルの役割

**「2つのテキストを比較して、どこが違うかを計算する」**ためのロジックです。

Reactでは、このようなビジネスロジックを**カスタムフック**という形で切り出すことで、コンポーネントから独立した再利用可能な機能にできます。

### 💡 主要な型定義

#### DiffType（差分のタイプ）

```typescript
export type DiffType = 'added' | 'removed' | 'modified' | 'normal';
```

| タイプ | 意味 | 表示色 |
|--------|------|--------|
| `added` | 追加された行 | 緑 |
| `removed` | 削除された行 | 赤 |
| `modified` | 変更された行 | 黄 |
| `normal` | 変更なし | 白/灰 |

**初学者メモ**: TypeScriptの`type`は、「この変数にはこれらの値しか入らない」という制約を定義できます。これにより、誤った値を設定するミスを防げます。

#### DiffLine（1行分の差分情報）

```typescript
export interface DiffLine {
  leftLineNumber: number | null;   // 左側の行番号（ない場合はnull）
  rightLineNumber: number | null;  // 右側の行番号（ない場合はnull）
  content: string;                 // 行の内容（テキスト）
  type: DiffType;                  // 差分のタイプ
}
```

**例**: 追加された行の場合
```typescript
{
  leftLineNumber: null,      // 左側には存在しない
  rightLineNumber: 5,        // 右側の5行目
  content: "console.log('新しい行');",
  type: 'added'
}
```

**初学者メモ**: `number | null`は、「数値またはnull」という意味です。行番号がない場合（空行）はnullになります。

#### DiffStats（統計情報）

```typescript
export interface DiffStats {
  addedLines: number;     // 追加された行数
  removedLines: number;   // 削除された行数
  modifiedLines: number;  // 変更された行数（今回のMVPでは未使用）
  totalLines: number;     // 総行数
}
```

### 🎯 主要な関数

#### 1. preprocessText（前処理関数）

```typescript
function preprocessText(text: string, options: UseDiffOptions): string {
  let processed = text;

  // 大文字小文字を無視する場合、すべて小文字に変換
  if (options.ignoreCase) {
    processed = processed.toLowerCase();
  }

  // 空白を無視する場合、各行から前後の空白を除去
  if (options.ignoreWhitespace) {
    processed = processed
      .split('\n')          // 改行で分割して配列にする
      .map(line => line.trim())  // 各行の前後空白を削除
      .join('\n');          // 改行で再結合
  }

  return processed;
}
```

**わかりやすく言うと**:
- `ignoreCase: true`なら → 「Hello」も「hello」も同じ扱いにする
- `ignoreWhitespace: true`なら → 「  hello  」と「hello」を同じ扱いにする

**初学者メモ**:
- `.split('\n')` = 文字列を改行で区切って配列にする
- `.map(関数)` = 配列の各要素に関数を適用する
- `.trim()` = 文字列の前後の空白を削除
- `.join('\n')` = 配列を改行で結合して文字列に戻す

#### 2. calculateDiff（差分計算のメインロジック）

```typescript
function calculateDiff(
  leftText: string,       // 左側（元のテキスト）
  rightText: string,      // 右側（新しいテキスト）
  options: UseDiffOptions = {}
): DiffResult {
```

**処理の流れ**:

1. **前処理**: オプションに応じてテキストを加工
   ```typescript
   const processedLeft = preprocessText(leftText, options);
   const processedRight = preprocessText(rightText, options);
   ```

2. **差分計算**: `diff`ライブラリを使って差分を計算
   ```typescript
   const changes = Diff.diffLines(processedLeft, processedRight);
   ```

   **diffライブラリの結果**:
   ```typescript
   [
     { value: "line1\nline2\n", added: undefined, removed: undefined },  // 変更なし
     { value: "line3\n", removed: true },                                // 削除
     { value: "line3-new\n", added: true }                              // 追加
   ]
   ```

3. **結果の整形**: 各changeを`DiffLine`形式に変換
   ```typescript
   changes.forEach((change) => {
     const changeLines = change.value.split('\n');

     changeLines.forEach((content) => {
       if (change.added) {
         // 追加行の処理
         lines.push({
           leftLineNumber: null,              // 左側にはない
           rightLineNumber: rightLineNumber++, // 右側の行番号を付与
           content,
           type: 'added',
         });
         stats.addedLines++;
       } else if (change.removed) {
         // 削除行の処理
         lines.push({
           leftLineNumber: leftLineNumber++,  // 左側の行番号を付与
           rightLineNumber: null,             // 右側にはない
           content,
           type: 'removed',
         });
         stats.removedLines++;
       } else {
         // 変更なし（通常の行）
         lines.push({
           leftLineNumber: leftLineNumber++,
           rightLineNumber: rightLineNumber++,
           content,
           type: 'normal',
         });
       }
     });
   });
   ```

   **初学者メモ**: `leftLineNumber++`は「現在の値を使ってから1増やす」という意味です。

#### 3. useDiff（カスタムフック - 外部から使う関数）

```typescript
export function useDiff(
  leftText: string,
  rightText: string,
  options: UseDiffOptions = {}
): DiffResult {
  return useMemo(() => {
    return calculateDiff(leftText, rightText, options);
  }, [leftText, rightText, options.ignoreWhitespace, options.ignoreCase]);
}
```

**useMemoとは？**

Reactの最適化機能で、「依存する値が変わらない限り、前回の計算結果を再利用する」という仕組みです。

**例えば**:
- 左テキストが「Hello」、右テキストが「World」の場合、一度差分を計算
- 次に画面が再描画されても、テキストが変わってなければ計算せず、前回の結果を返す
- テキストが変わったら、再計算する

**初学者メモ**: 差分計算は重い処理なので、不要な再計算を避けることでパフォーマンスが向上します。

---

## 🎨 2. DiffViewer.tsx - UIコンポーネント

### 📝 このファイルの役割

**「画面にテキスト入力欄と差分表示を表示する」**部分です。

### 🧩 コンポーネントの構成

DiffViewer.tsxは大きく2つのコンポーネントで構成されています：

1. **DiffLineComponent** - 1行分の差分を表示する小さなコンポーネント
2. **DiffViewer** - 全体を統括するメインコンポーネント

#### 1. DiffLineComponent（差分行の表示）

```typescript
function DiffLineComponent({ line, side }: DiffLineComponentProps) {
  // 左側か右側か、どちらの行番号を表示するか決める
  const lineNumber = side === 'left' ? line.leftLineNumber : line.rightLineNumber;

  // この行を表示すべきかどうか
  const shouldDisplay =
    side === 'left' ? line.leftLineNumber !== null : line.rightLineNumber !== null;
```

**表示ルール**:

| 差分タイプ | 左ペイン | 右ペイン |
|----------|---------|---------|
| added | 空行（グレー背景） | 内容を表示（緑背景） |
| removed | 内容を表示（赤背景） | 空行（グレー背景） |
| normal | 内容を表示（白背景） | 内容を表示（白背景） |

**色の適用**:

```typescript
const getColorClasses = (type: DiffType): string => {
  const colorMap = {
    added: 'bg-green-50 border-l-4 border-green-500 dark:bg-green-900/20 dark:border-green-400',
    removed: 'bg-red-50 border-l-4 border-red-500 dark:bg-red-900/20 dark:border-red-400',
    // ...
  };
  return colorMap[type];
};
```

**初学者メモ**:
- `bg-green-50` = Tailwind CSSのクラス名（薄い緑の背景）
- `border-l-4` = 左ボーダー4px
- `dark:bg-green-900/20` = ダークモード時の背景色（透明度20%）

**HTMLの構造**:

```typescript
<div className="flex">
  {/* 行番号エリア */}
  <div className="w-12 px-2 text-right">
    {lineNumber || ''}
  </div>

  {/* 行の内容エリア */}
  <div className="flex-1 px-3 py-1">
    {content || ' '}
  </div>
</div>
```

#### 2. DiffViewer（メインコンポーネント）

##### State管理

```typescript
const [leftText, setLeftText] = useState('');      // 左側のテキスト
const [rightText, setRightText] = useState('');    // 右側のテキスト
const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);  // 空白無視
const [ignoreCase, setIgnoreCase] = useState(false);  // 大文字小文字無視
```

**初学者メモ**: `useState`は、Reactでデータを管理するための基本的な機能です。
- `leftText` = 現在の値
- `setLeftText` = 値を更新する関数

##### useDiffフックの使用

```typescript
const { lines, stats } = useDiff(leftText, rightText, {
  ignoreWhitespace,
  ignoreCase,
});
```

**これで何が起きるか**:
1. `leftText`や`rightText`が変わると、自動的に差分が再計算される
2. `lines`に差分の行データ、`stats`に統計情報が入る

##### イベントハンドラー

```typescript
// 左右のテキストを入れ替える
const handleSwap = () => {
  const temp = leftText;
  setLeftText(rightText);
  setRightText(temp);
};

// すべてクリア
const handleClear = () => {
  setLeftText('');
  setRightText('');
};
```

**初学者メモ**: これらの関数は、ボタンがクリックされたときに呼ばれます。

##### UIの構造

```typescript
<div className="space-y-6">
  {/* 1. ヘッダー（ツールバー） */}
  <div className="flex items-center gap-4">
    <label>
      <input type="checkbox" checked={ignoreWhitespace} ... />
      空白を無視
    </label>
    <Button onClick={handleSwap}>入れ替え</Button>
    <Button onClick={handleClear}>クリア</Button>
  </div>

  {/* 2. 入力エリア */}
  <div className="grid grid-cols-2 gap-4">
    <textarea value={leftText} onChange={(e) => setLeftText(e.target.value)} />
    <textarea value={rightText} onChange={(e) => setRightText(e.target.value)} />
  </div>

  {/* 3. 統計情報 */}
  <div className="flex gap-4">
    <span>追加: {stats.addedLines} 行</span>
    <span>削除: {stats.removedLines} 行</span>
  </div>

  {/* 4. 差分表示エリア */}
  <div className="grid grid-cols-2 gap-px">
    {/* 左ペイン */}
    <div>
      {lines.map((line, index) => (
        <DiffLineComponent key={`left-${index}`} line={line} side="left" />
      ))}
    </div>

    {/* 右ペイン */}
    <div>
      {lines.map((line, index) => (
        <DiffLineComponent key={`right-${index}`} line={line} side="right" />
      ))}
    </div>
  </div>
</div>
```

**初学者メモ**:
- `.map()` = 配列の各要素に対してコンポーネントを生成
- `key={...}` = Reactが各要素を識別するための一意のキー（必須）

---

## 🌐 3. App.tsx - ツールの登録

### DiffViewerをアプリに追加する手順

#### 1. アイコンのインポート

```typescript
import { GitCompareArrows } from 'lucide-react';
```

**lucide-react**: 美しいアイコンライブラリ。`GitCompareArrows`は「差分比較」を表すアイコンです。

#### 2. コンポーネントのインポート

```typescript
import { DiffViewer } from './components/Tools/DiffViewer';
```

#### 3. toolsConfig配列に追加

```typescript
const toolsConfig = [
  // ... 既存のツール
  {
    id: 'diff-viewer',                        // ツールの一意なID
    nameKey: 'tool.diffViewer.name',          // 翻訳キー（名前）
    descriptionKey: 'tool.diffViewer.description',  // 翻訳キー（説明）
    icon: GitCompareArrows,                   // アイコン
    iconColor: 'text-cyan-600',               // アイコンの色
    component: DiffViewer,                    // コンポーネント
    category: 'development'                   // カテゴリ
  },
];
```

---

## 🌍 4. LanguageContext.tsx - 多言語対応

### 翻訳の追加

#### 日本語（ja）

```typescript
ja: {
  'tool.diffViewer.name': 'Diffビューア',
  'tool.diffViewer.description': 'テキストの差分をサイドバイサイドで表示',
}
```

#### 英語（en）

```typescript
en: {
  'tool.diffViewer.name': 'Diff Viewer',
  'tool.diffViewer.description': 'Side-by-side text comparison',
}
```

**初学者メモ**: `t('tool.diffViewer.name')`のように使うと、現在の言語設定に応じて適切な翻訳が表示されます。

---

## 🧪 5. 動作確認の方法

### ビルドして確認

```bash
# 1. ビルド（TypeScriptをJavaScriptに変換）
npm run build

# 2. 開発サーバーで確認
npm run dev
```

### テストケース

1. **基本的な差分**
   - 左: `Hello\nWorld`
   - 右: `Hello\nReact`
   - 期待結果: 2行目が黄色（変更）

2. **追加行**
   - 左: `Line1`
   - 右: `Line1\nLine2`
   - 期待結果: 2行目が緑（追加）

3. **削除行**
   - 左: `Line1\nLine2`
   - 右: `Line1`
   - 期待結果: 左ペインに2行目が赤（削除）

4. **空白無視**
   - 左: `  Hello  `
   - 右: `Hello`
   - オプション: 空白を無視 = ON
   - 期待結果: 差分なし

---

## 🎓 学習ポイント

### このプロジェクトで学べること

1. **カスタムフック（useDiff）**
   - ビジネスロジックをコンポーネントから分離
   - useMemoによる最適化

2. **コンポーネント設計**
   - 小さいコンポーネント（DiffLineComponent）
   - 大きいコンポーネント（DiffViewer）
   - 役割の明確な分離

3. **State管理**
   - useStateでユーザー入力を管理
   - 複数のStateの連携

4. **条件付きレンダリング**
   - `{condition && <Component />}` でコンポーネントの表示/非表示
   - 三項演算子 `condition ? A : B`

5. **配列操作**
   - map, filter, split, join
   - 関数型プログラミングの基礎

6. **TypeScript**
   - 型定義（interface, type）
   - null許容型（`number | null`）
   - 型安全性

7. **外部ライブラリの活用**
   - diffライブラリの使い方
   - ドキュメントの読み方

---

## 🚀 次のステップ

### Phase 2で追加できる機能

1. **統合ビュー**
   - サイドバイサイドだけでなく、1カラムの差分表示

2. **文字単位の差分**
   - 行内の具体的な変更箇所をハイライト

3. **ファイルアップロード**
   - ドラッグ&ドロップでファイルを読み込み

4. **履歴機能**
   - 過去の比較を保存してクイックロード

5. **シンタックスハイライト**
   - プログラムコードの差分を見やすく

---

## 📚 参考資料

- [React公式ドキュメント（日本語）](https://ja.react.dev/)
- [TypeScript Handbook（日本語）](https://typescript-jp.gitbook.io/deep-dive/)
- [Tailwind CSS公式](https://tailwindcss.com/docs)
- [diff ライブラリ](https://github.com/kpdecker/jsdiff)
- [lucide-react アイコン一覧](https://lucide.dev/icons/)

---

**作成日**: 2025-11-29
**対象**: プログラミング初学者
**補足**: わからないことがあれば、このドキュメントを見ながら実際のコードと照らし合わせてみてください！
