import { useState } from 'react';
import { Copy, RotateCcw, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';

export function CharacterCount() {
  const [text, setText] = useState('');
  const [includeSpaces, setIncludeSpaces] = useState(true);
  const [includeNewlines, setIncludeNewlines] = useState(true);
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

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
    const result = `${t('characterCount.input.label')}: ${text}\n${t('characterCount.characters')}: ${displayCount}\n${t('characterCount.words')}: ${counts.words}\n${t('characterCount.lines')}: ${counts.lines}`;
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
          {t('characterCount.input.label')}
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('characterCount.input.placeholder')}
          className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
        />
      </div>

      {/* オプション */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('characterCount.settings')}</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeSpaces}
              onChange={(e) => setIncludeSpaces(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('characterCount.includeSpaces')}</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeNewlines}
              onChange={(e) => setIncludeNewlines(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('characterCount.includeNewlines')}</span>
          </label>
        </div>
      </div>

      {/* 結果表示 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('characterCount.result')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {displayCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('characterCount.characters')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {counts.words}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('characterCount.words')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {counts.lines}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('characterCount.lines')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {((text.match(/[あ-んア-ヶ一-龯]/g) || []).length)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('characterCount.japaneseChars')}</div>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>{t('characterCount.totalWithSpaces')}: {counts.total}</div>
          <div>{t('characterCount.excludeSpaces')}: {counts.noSpaces}</div>
          <div>{t('characterCount.excludeNewlines')}: {counts.noNewlines}</div>
          <div>{t('characterCount.excludeSpacesNewlines')}: {counts.noSpacesNewlines}</div>
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
            <><Check className="w-4 h-4 mr-1" /> {t('characterCount.copied')}</>
          ) : (
            <><Copy className="w-4 h-4 mr-1" /> {t('characterCount.copyResult')}</>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!text}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('characterCount.reset')}
        </Button>
      </div>
    </div>
  );
}