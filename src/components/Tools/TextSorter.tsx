import { useState } from 'react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { HistoryItem } from '../../types';

interface TextSorterProps {
  onHistoryAdd: (item: Omit<HistoryItem, 'timestamp'>) => void;
}

type SortMode = 'alphabetical' | 'numerical' | 'length' | 'random';
type SortOrder = 'asc' | 'desc';

export function TextSorter({ onHistoryAdd }: TextSorterProps) {
  const [inputText, setInputText] = useState('');
  const [sortedText, setSortedText] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const sortLines = (lines: string[]): string[] => {
    let processedLines = [...lines];

    // 空行を削除
    if (removeEmpty) {
      processedLines = processedLines.filter(line => line.trim() !== '');
    }

    // 重複を削除
    if (removeDuplicates) {
      processedLines = [...new Set(processedLines)];
    }

    // ソート実行
    switch (sortMode) {
      case 'alphabetical':
        processedLines.sort((a, b) => {
          const strA = caseSensitive ? a : a.toLowerCase();
          const strB = caseSensitive ? b : b.toLowerCase();
          return strA.localeCompare(strB, 'ja');
        });
        break;

      case 'numerical':
        processedLines.sort((a, b) => {
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return numA - numB;
        });
        break;

      case 'length':
        processedLines.sort((a, b) => a.length - b.length);
        break;

      case 'random':
        processedLines.sort(() => Math.random() - 0.5);
        break;
    }

    // 降順の場合は逆順にする（ランダム以外）
    if (sortOrder === 'desc' && sortMode !== 'random') {
      processedLines.reverse();
    }

    return processedLines;
  };

  const handleSort = () => {
    if (!inputText.trim()) {
      setSortedText('');
      return;
    }

    const lines = inputText.split('\n');
    const sortedLines = sortLines(lines);
    const result = sortedLines.join('\n');
    
    setSortedText(result);

    onHistoryAdd({
      toolId: 'text-sorter',
      result: `${lines.length}行をソート（${getSortModeLabel()}）`
    });
  };

  const getSortModeLabel = () => {
    const modes = {
      alphabetical: 'アルファベット順',
      numerical: '数値順',
      length: '文字数順',
      random: 'ランダム'
    };
    return modes[sortMode] + (sortMode !== 'random' ? (sortOrder === 'asc' ? '（昇順）' : '（降順）') : '');
  };

  const handleCopy = () => {
    copyToClipboard(sortedText);
  };

  const handleReverse = () => {
    if (sortedText) {
      const lines = sortedText.split('\n');
      setSortedText(lines.reverse().join('\n'));
    }
  };

  const insertSample = () => {
    const sampleText = `りんご
バナナ
みかん
ぶどう
いちご
メロン
すいか
もも
なし
きゅうり
10
5
100
23
1
333`;
    setInputText(sampleText);
  };

  const getStats = () => {
    const inputLines = inputText ? inputText.split('\n').filter(line => removeEmpty ? line.trim() !== '' : true) : [];
    const outputLines = sortedText ? sortedText.split('\n') : [];
    
    return {
      inputCount: inputLines.length,
      outputCount: outputLines.length,
      removedEmpty: removeEmpty ? inputLines.filter(line => line.trim() === '').length : 0,
      removedDuplicates: removeDuplicates ? inputLines.length - [...new Set(inputLines)].length : 0
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ソートするテキスト（1行に1項目）
            </label>
            <Button onClick={insertSample} variant="outline" size="sm">
              サンプル挿入
            </Button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="ソートしたい項目を1行ずつ入力してください..."
            rows={8}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ソート方法
            </label>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="alphabetical">アルファベット順</option>
              <option value="numerical">数値順</option>
              <option value="length">文字数順</option>
              <option value="random">ランダム</option>
            </select>
          </div>

          {sortMode !== 'random' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ソート順序
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="asc">昇順（A→Z, 小→大, 短→長）</option>
                <option value="desc">降順（Z→A, 大→小, 長→短）</option>
              </select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">
                大文字小文字を区別する
              </span>
            </label>

            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">
                重複を削除
              </span>
            </label>

            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={removeEmpty}
                onChange={(e) => setRemoveEmpty(e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">
                空行を削除
              </span>
            </label>
          </div>
        </div>

        <Button onClick={handleSort} className="w-full">
          ソート実行
        </Button>
      </div>

      {sortedText && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ソート結果 ({getSortModeLabel()})
            </h3>
            <div className="flex gap-2">
              <Button onClick={handleReverse} variant="outline" size="sm">
                順序を逆転
              </Button>
              <Button onClick={handleCopy} variant="outline" size="sm">
                {isCopied ? 'コピー済み!' : 'コピー'}
              </Button>
            </div>
          </div>

          <textarea
            value={sortedText}
            readOnly
            rows={Math.min(sortedText.split('\n').length + 1, 15)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="font-medium text-blue-600 dark:text-blue-400">入力行数</div>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats.inputCount}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="font-medium text-green-600 dark:text-green-400">出力行数</div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">{stats.outputCount}</div>
            </div>
            {removeEmpty && stats.removedEmpty > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <div className="font-medium text-yellow-600 dark:text-yellow-400">削除空行</div>
                <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{stats.removedEmpty}</div>
              </div>
            )}
            {removeDuplicates && stats.removedDuplicates > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <div className="font-medium text-red-600 dark:text-red-400">削除重複</div>
                <div className="text-xl font-bold text-red-700 dark:text-red-300">{stats.removedDuplicates}</div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>ソート方法の説明:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li><strong>アルファベット順:</strong> 文字コード順でソート（日本語対応）</li>
              <li><strong>数値順:</strong> 数値として解析してソート（文字列は0として扱われます）</li>
              <li><strong>文字数順:</strong> 文字列の長さでソート</li>
              <li><strong>ランダム:</strong> ランダムな順序でシャッフル</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}