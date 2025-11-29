import { useState } from 'react';
import { ArrowLeftRight, Settings, Trash2 } from 'lucide-react';
import { Button } from '../UI/Button';
import { useDiff, DiffLine, DiffType } from '../../hooks/useDiff';
import { cn } from '../../utils/cn';

/**
 * 差分行コンポーネント
 */
interface DiffLineComponentProps {
  line: DiffLine;
  side: 'left' | 'right';
}

function DiffLineComponent({ line, side }: DiffLineComponentProps) {
  const lineNumber = side === 'left' ? line.leftLineNumber : line.rightLineNumber;
  const shouldDisplay =
    side === 'left' ? line.leftLineNumber !== null : line.rightLineNumber !== null;

  // 差分タイプに応じた背景色とボーダー色を取得
  const getColorClasses = (type: DiffType): string => {
    const colorMap = {
      added: 'bg-green-50 border-l-4 border-green-500 dark:bg-green-900/20 dark:border-green-400',
      removed: 'bg-red-50 border-l-4 border-red-500 dark:bg-red-900/20 dark:border-red-400',
      modified: 'bg-yellow-50 border-l-4 border-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-400',
      normal: 'bg-white dark:bg-gray-800 border-l-4 border-transparent',
    };
    return colorMap[type];
  };

  // 左側は削除行と変更行、右側は追加行と変更行を表示
  const shouldShowContent =
    (side === 'left' && (line.type === 'removed' || line.type === 'normal')) ||
    (side === 'right' && (line.type === 'added' || line.type === 'normal'));

  return (
    <div
      className={cn(
        'flex font-mono text-sm leading-relaxed',
        shouldDisplay && shouldShowContent ? getColorClasses(line.type) : 'bg-gray-50 dark:bg-gray-900'
      )}
    >
      {/* 行番号 */}
      <div
        className={cn(
          'flex-shrink-0 w-12 px-2 text-right select-none',
          'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900'
        )}
      >
        {shouldDisplay && lineNumber !== null ? lineNumber : ''}
      </div>

      {/* 行の内容 */}
      <div className="flex-1 px-3 py-1 overflow-x-auto whitespace-pre">
        {shouldDisplay && shouldShowContent ? line.content || ' ' : ''}
      </div>
    </div>
  );
}

/**
 * DiffViewerメインコンポーネント
 */
export function DiffViewer() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  // useDiffフックで差分を計算
  const { lines, stats } = useDiff(leftText, rightText, {
    ignoreWhitespace,
    ignoreCase,
  });

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

  return (
    <div className="space-y-6">
      {/* ヘッダー: ツールバー */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">オプション:</span>
        </div>

        {/* 空白無視オプション */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(e) => setIgnoreWhitespace(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">空白を無視</span>
        </label>

        {/* 大文字小文字無視オプション */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(e) => setIgnoreCase(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">大文字小文字を無視</span>
        </label>

        {/* アクションボタン */}
        <div className="ml-auto flex gap-2">
          <Button
            onClick={handleSwap}
            variant="outline"
            size="sm"
            disabled={!leftText && !rightText}
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            入れ替え
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
            disabled={!leftText && !rightText}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            クリア
          </Button>
        </div>
      </div>

      {/* 入力エリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            元のテキスト (左側)
          </label>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="比較元のテキストを入力してください..."
            className={cn(
              'w-full h-48 px-4 py-3 font-mono text-sm',
              'border border-gray-300 dark:border-gray-600 rounded-lg',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'placeholder-gray-400 dark:placeholder-gray-500',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'resize-y transition-colors'
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            新しいテキスト (右側)
          </label>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="比較先のテキストを入力してください..."
            className={cn(
              'w-full h-48 px-4 py-3 font-mono text-sm',
              'border border-gray-300 dark:border-gray-600 rounded-lg',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'placeholder-gray-400 dark:placeholder-gray-500',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'resize-y transition-colors'
            )}
          />
        </div>
      </div>

      {/* 統計情報 */}
      {(leftText || rightText) && (
        <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              追加: <span className="font-semibold">{stats.addedLines}</span> 行
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              削除: <span className="font-semibold">{stats.removedLines}</span> 行
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              総行数: <span className="font-semibold">{stats.totalLines}</span> 行
            </span>
          </div>
        </div>
      )}

      {/* 差分表示エリア（サイドバイサイド） */}
      {(leftText || rightText) && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">差分表示</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-gray-300 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            {/* 左ペイン */}
            <div className="bg-white dark:bg-gray-800">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  元のテキスト
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {lines.map((line, index) => (
                  <DiffLineComponent key={`left-${index}`} line={line} side="left" />
                ))}
              </div>
            </div>

            {/* 右ペイン */}
            <div className="bg-white dark:bg-gray-800">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  新しいテキスト
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {lines.map((line, index) => (
                  <DiffLineComponent key={`right-${index}`} line={line} side="right" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 空の状態メッセージ */}
      {!leftText && !rightText && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-sm">テキストを入力して差分を比較してください</p>
        </div>
      )}
    </div>
  );
}
