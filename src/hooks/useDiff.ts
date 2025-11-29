import { useMemo } from 'react';
import * as Diff from 'diff';

/**
 * 差分行のタイプ
 */
export type DiffType = 'added' | 'removed' | 'modified' | 'normal';

/**
 * 差分行の情報
 */
export interface DiffLine {
  leftLineNumber: number | null;  // 左側の行番号（null = 空行）
  rightLineNumber: number | null; // 右側の行番号（null = 空行）
  content: string;                // 行の内容
  type: DiffType;                 // 差分のタイプ
}

/**
 * 差分統計情報
 */
export interface DiffStats {
  addedLines: number;    // 追加された行数
  removedLines: number;  // 削除された行数
  modifiedLines: number; // 変更された行数
  totalLines: number;    // 総行数
}

/**
 * 差分計算の結果
 */
export interface DiffResult {
  lines: DiffLine[];     // 整形済み差分データ
  stats: DiffStats;      // 統計情報
}

/**
 * useDiffフックのオプション
 */
export interface UseDiffOptions {
  ignoreWhitespace?: boolean;  // 空白を無視するか
  ignoreCase?: boolean;        // 大文字小文字を無視するか
}

/**
 * テキストを前処理する
 * @param text 元のテキスト
 * @param options 前処理オプション
 * @returns 前処理済みテキスト
 */
function preprocessText(text: string, options: UseDiffOptions): string {
  let processed = text;

  // 大文字小文字を無視する場合、すべて小文字に変換
  if (options.ignoreCase) {
    processed = processed.toLowerCase();
  }

  // 空白を無視する場合、各行から前後の空白を除去
  if (options.ignoreWhitespace) {
    processed = processed
      .split('\n')
      .map(line => line.trim())
      .join('\n');
  }

  return processed;
}

/**
 * 差分を計算する内部関数
 * @param leftText 左側のテキスト
 * @param rightText 右側のテキスト
 * @param options 差分計算オプション
 * @returns 差分計算結果
 */
function calculateDiff(
  leftText: string,
  rightText: string,
  options: UseDiffOptions = {}
): DiffResult {
  // テキストを前処理
  const processedLeft = preprocessText(leftText, options);
  const processedRight = preprocessText(rightText, options);

  // diffライブラリで行単位の差分を計算
  const changes = Diff.diffLines(processedLeft, processedRight);

  const lines: DiffLine[] = [];
  let leftLineNumber = 1;
  let rightLineNumber = 1;
  let stats: DiffStats = {
    addedLines: 0,
    removedLines: 0,
    modifiedLines: 0,
    totalLines: 0,
  };

  // 各changeを処理して、DiffLine配列に変換
  changes.forEach((change) => {
    // 改行で分割（最後の空行は除去）
    const changeLines = change.value.split('\n');
    if (changeLines[changeLines.length - 1] === '') {
      changeLines.pop();
    }

    changeLines.forEach((content) => {
      if (change.added) {
        // 追加された行
        lines.push({
          leftLineNumber: null,
          rightLineNumber: rightLineNumber++,
          content,
          type: 'added',
        });
        stats.addedLines++;
      } else if (change.removed) {
        // 削除された行
        lines.push({
          leftLineNumber: leftLineNumber++,
          rightLineNumber: null,
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
      stats.totalLines++;
    });
  });

  return { lines, stats };
}

/**
 * 差分を計算するカスタムフック
 *
 * @example
 * const { lines, stats } = useDiff({
 *   leftText: 'Hello\nWorld',
 *   rightText: 'Hello\nReact',
 *   options: { ignoreWhitespace: true }
 * });
 *
 * @param leftText 左側（オリジナル）のテキスト
 * @param rightText 右側（変更後）のテキスト
 * @param options 差分計算のオプション
 * @returns 差分計算結果（lines と stats）
 */
export function useDiff(
  leftText: string,
  rightText: string,
  options: UseDiffOptions = {}
): DiffResult {
  // useMemoで差分計算結果をキャッシュ
  // 入力テキストやオプションが変わらない限り再計算しない
  return useMemo(() => {
    return calculateDiff(leftText, rightText, options);
  }, [leftText, rightText, options.ignoreWhitespace, options.ignoreCase]);
}
