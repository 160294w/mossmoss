import { useState } from 'react';
import { Copy, RotateCcw, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

export function CharacterCount() {
  const [text, setText] = useState('');
  const [includeSpaces, setIncludeSpaces] = useState(true);
  const [includeNewlines, setIncludeNewlines] = useState(true);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // 文字数カウント関数
  const getCharCount = (text: string): { total: number; noSpaces: number; noNewlines: number; noSpacesNewlines: number; lines: number; words: number } => {
    const total = text.length;
    const noSpaces = text.replace(/ /g, '').length;
    const noNewlines = text.replace(/\n/g, '').length;
    const noSpacesNewlines = text.replace(/[ \n]/g, '').length;
    const lines = text.split('\n').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    return {
      total,
      noSpaces,
      noNewlines,
      noSpacesNewlines,
      lines,
      words
    };
  };

  const counts = getCharCount(text);
  const displayCount = includeSpaces && includeNewlines ? counts.total :
                      !includeSpaces && includeNewlines ? counts.noSpaces :
                      includeSpaces && !includeNewlines ? counts.noNewlines :
                      counts.noSpacesNewlines;

  // 履歴追加機能は一時的に無効化（無限ループ防止）
  // useEffect(() => {
  //   if (text && onHistoryAdd) {
//   //     onHistoryAdd({
//   //       toolId: 'character-count',
//   //       input: text,
//   //       output: `${displayCount}文字`
//   //     });
  //   }
  // }, [text, displayCount]);

  const handleCopy = async () => {
    const result = `テキスト: ${text}\n文字数: ${displayCount}文字\n単語数: ${counts.words}語\n行数: ${counts.lines}行`;
    await copyToClipboard(result);
  };

  const handleReset = () => {
    setText('');
  };

  return (
    <div className="space-y-6">
      {/* 入力エリア */}
      <div>
        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          テキストを入力してください
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ここにテキストを入力..."
          className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
        />
      </div>

      {/* オプション */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">カウント設定</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeSpaces}
              onChange={(e) => setIncludeSpaces(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">空白を含める</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeNewlines}
              onChange={(e) => setIncludeNewlines(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">改行を含める</span>
          </label>
        </div>
      </div>

      {/* 結果表示 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">カウント結果</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {displayCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">文字数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {counts.words}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">単語数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {counts.lines}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">行数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {((text.match(/[あ-んア-ヶ一-龯]/g) || []).length)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">日本語文字</div>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>全文字数（空白・改行含む）: {counts.total}</div>
          <div>空白除く: {counts.noSpaces}</div>
          <div>改行除く: {counts.noNewlines}</div>
          <div>空白・改行除く: {counts.noSpacesNewlines}</div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button 
          onClick={handleCopy} 
          disabled={!text}
          className="flex items-center gap-2"
        >
          {isCopied ? (
            <><Check className="w-4 h-4 mr-1" /> コピー済み</>
          ) : (
            <><Copy className="w-4 h-4 mr-1" /> 結果をコピー</>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!text}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          リセット
        </Button>
      </div>
    </div>
  );
}