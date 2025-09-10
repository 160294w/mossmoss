import { useState } from 'react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

type SortMode = 'alphabetical' | 'numerical' | 'length' | 'random';
type SortOrder = 'asc' | 'desc';

export function TextSorter({ onHistoryAdd }: ToolProps) {
  const [inputText, setInputText] = useState('');
  const [sortedText, setSortedText] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

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

    onHistoryAdd?.({
      toolId: 'text-sorter',
      input: t('textSorter.historyInput').replace('{count}', lines.length.toString()),
      output: t('textSorter.historyOutput').replace('{mode}', getSortModeLabel())
    });
  };

  const getSortModeLabel = () => {
    const modeLabel = t(`textSorter.mode.${sortMode}`);
    if (sortMode === 'random') {
      return modeLabel;
    }
    const orderLabel = t(sortOrder === 'asc' ? 'textSorter.order.asc.short' : 'textSorter.order.desc.short');
    return modeLabel + orderLabel;
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
              {t('textSorter.input.label')}
            </label>
            <Button onClick={insertSample} variant="outline" size="sm">
              {t('textSorter.insertSample')}
            </Button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('textSorter.input.placeholder')}
            rows={8}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('textSorter.sortMethod')}
            </label>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="alphabetical">{t('textSorter.mode.alphabetical')}</option>
              <option value="numerical">{t('textSorter.mode.numerical')}</option>
              <option value="length">{t('textSorter.mode.length')}</option>
              <option value="random">{t('textSorter.mode.random')}</option>
            </select>
          </div>

          {sortMode !== 'random' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('textSorter.sortOrder')}
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="asc">{t('textSorter.order.asc')}</option>
                <option value="desc">{t('textSorter.order.desc')}</option>
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
                {t('textSorter.caseSensitive')}
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
                {t('textSorter.removeDuplicates')}
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
                {t('textSorter.removeEmpty')}
              </span>
            </label>
          </div>
        </div>

        <Button onClick={handleSort} className="w-full">
          {t('textSorter.execute')}
        </Button>
      </div>

      {sortedText && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('textSorter.result')} ({getSortModeLabel()})
            </h3>
            <div className="flex gap-2">
              <Button onClick={handleReverse} variant="outline" size="sm">
                {t('textSorter.reverse')}
              </Button>
              <Button onClick={handleCopy} variant="outline" size="sm">
                {isCopied ? t('common.copied') : t('common.copy')}
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
              <div className="font-medium text-blue-600 dark:text-blue-400">{t('textSorter.stats.inputLines')}</div>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats.inputCount}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="font-medium text-green-600 dark:text-green-400">{t('textSorter.stats.outputLines')}</div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">{stats.outputCount}</div>
            </div>
            {removeEmpty && stats.removedEmpty > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <div className="font-medium text-yellow-600 dark:text-yellow-400">{t('textSorter.stats.removedEmpty')}</div>
                <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{stats.removedEmpty}</div>
              </div>
            )}
            {removeDuplicates && stats.removedDuplicates > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <div className="font-medium text-red-600 dark:text-red-400">{t('textSorter.stats.removedDuplicates')}</div>
                <div className="text-xl font-bold text-red-700 dark:text-red-300">{stats.removedDuplicates}</div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>{t('textSorter.explanation.title')}</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li><strong>{t('textSorter.mode.alphabetical')}:</strong> {t('textSorter.explanation.alphabetical')}</li>
              <li><strong>{t('textSorter.mode.numerical')}:</strong> {t('textSorter.explanation.numerical')}</li>
              <li><strong>{t('textSorter.mode.length')}:</strong> {t('textSorter.explanation.length')}</li>
              <li><strong>{t('textSorter.mode.random')}:</strong> {t('textSorter.explanation.random')}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}