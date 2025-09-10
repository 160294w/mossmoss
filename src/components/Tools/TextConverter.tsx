import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

type ConversionType = 'numbers' | 'alphabet' | 'katakana' | 'all';

export function TextConverter({ onHistoryAdd }: ToolProps) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [conversionType, setConversionType] = useState<ConversionType>('all');
  const [isFullWidth, setIsFullWidth] = useState(true);
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  // 全角→半角変換関数
  const toHalfWidth = (text: string, type: ConversionType): string => {
    let result = text;

    if (type === 'numbers' || type === 'all') {
      // 全角数字→半角数字
      result = result.replace(/[０-９]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) - 0xFEE0)
      );
    }

    if (type === 'alphabet' || type === 'all') {
      // 全角英字→半角英字
      result = result.replace(/[Ａ-Ｚａ-ｚ]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) - 0xFEE0)
      );
    }

    if (type === 'katakana' || type === 'all') {
      // 全角カタカナ→半角カタカナ
      const fullToHalfKana: { [key: string]: string } = {
        'ア': 'ｱ', 'イ': 'ｲ', 'ウ': 'ｳ', 'エ': 'ｴ', 'オ': 'ｵ',
        'カ': 'ｶ', 'キ': 'ｷ', 'ク': 'ｸ', 'ケ': 'ｹ', 'コ': 'ｺ',
        'ガ': 'ｶﾞ', 'ギ': 'ｷﾞ', 'グ': 'ｸﾞ', 'ゲ': 'ｹﾞ', 'ゴ': 'ｺﾞ',
        'サ': 'ｻ', 'シ': 'ｼ', 'ス': 'ｽ', 'セ': 'ｾ', 'ソ': 'ｿ',
        'ザ': 'ｻﾞ', 'ジ': 'ｼﾞ', 'ズ': 'ｽﾞ', 'ゼ': 'ｾﾞ', 'ゾ': 'ｿﾞ',
        'タ': 'ﾀ', 'チ': 'ﾁ', 'ツ': 'ﾂ', 'テ': 'ﾃ', 'ト': 'ﾄ',
        'ダ': 'ﾀﾞ', 'ヂ': 'ﾁﾞ', 'ヅ': 'ﾂﾞ', 'デ': 'ﾃﾞ', 'ド': 'ﾄﾞ',
        'ナ': 'ﾅ', 'ニ': 'ﾆ', 'ヌ': 'ﾇ', 'ネ': 'ﾈ', 'ノ': 'ﾉ',
        'ハ': 'ﾊ', 'ヒ': 'ﾋ', 'フ': 'ﾌ', 'ヘ': 'ﾍ', 'ホ': 'ﾎ',
        'バ': 'ﾊﾞ', 'ビ': 'ﾋﾞ', 'ブ': 'ﾌﾞ', 'ベ': 'ﾍﾞ', 'ボ': 'ﾎﾞ',
        'パ': 'ﾊﾟ', 'ピ': 'ﾋﾟ', 'プ': 'ﾌﾟ', 'ペ': 'ﾍﾟ', 'ポ': 'ﾎﾟ',
        'マ': 'ﾏ', 'ミ': 'ﾐ', 'ム': 'ﾑ', 'メ': 'ﾒ', 'モ': 'ﾓ',
        'ヤ': 'ﾔ', 'ユ': 'ﾕ', 'ヨ': 'ﾖ',
        'ラ': 'ﾗ', 'リ': 'ﾘ', 'ル': 'ﾙ', 'レ': 'ﾚ', 'ロ': 'ﾛ',
        'ワ': 'ﾜ', 'ヰ': 'ｲ', 'ヱ': 'ｴ', 'ヲ': 'ｦ', 'ン': 'ﾝ',
        'ァ': 'ｧ', 'ィ': 'ｨ', 'ゥ': 'ｩ', 'ェ': 'ｪ', 'ォ': 'ｫ',
        'ッ': 'ｯ', 'ャ': 'ｬ', 'ュ': 'ｭ', 'ョ': 'ｮ',
        'ー': 'ｰ', '・': '･', '「': '｢', '」': '｣'
      };

      for (const [full, half] of Object.entries(fullToHalfKana)) {
        result = result.replace(new RegExp(full, 'g'), half);
      }
    }

    if (type === 'all') {
      // その他の全角記号→半角記号
      result = result.replace(/[！-～]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) - 0xFEE0)
      );
    }

    return result;
  };

  // 半角→全角変換関数
  const toFullWidth = (text: string, type: ConversionType): string => {
    let result = text;

    if (type === 'numbers' || type === 'all') {
      // 半角数字→全角数字
      result = result.replace(/[0-9]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) + 0xFEE0)
      );
    }

    if (type === 'alphabet' || type === 'all') {
      // 半角英字→全角英字
      result = result.replace(/[A-Za-z]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) + 0xFEE0)
      );
    }

    if (type === 'katakana' || type === 'all') {
      // 半角カタカナ→全角カタカナ
      const halfToFullKana: { [key: string]: string } = {
        'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
        'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
        'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
        'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
        'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
        'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
        'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
        'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
        'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
        'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
        'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
        'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
        'ｰ': 'ー', '･': '・', '｢': '「', '｣': '」'
      };

      // 濁点・半濁点の処理
      result = result.replace(/([ｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾊﾋﾌﾍﾎ])ﾞ/g, (match, char) => {
        const dakuten: { [key: string]: string } = {
          'ｶ': 'ガ', 'ｷ': 'ギ', 'ｸ': 'グ', 'ｹ': 'ゲ', 'ｺ': 'ゴ',
          'ｻ': 'ザ', 'ｼ': 'ジ', 'ｽ': 'ズ', 'ｾ': 'ゼ', 'ｿ': 'ゾ',
          'ﾀ': 'ダ', 'ﾁ': 'ヂ', 'ﾂ': 'ヅ', 'ﾃ': 'デ', 'ﾄ': 'ド',
          'ﾊ': 'バ', 'ﾋ': 'ビ', 'ﾌ': 'ブ', 'ﾍ': 'ベ', 'ﾎ': 'ボ'
        };
        return dakuten[char] || match;
      });

      result = result.replace(/([ﾊﾋﾌﾍﾎ])ﾟ/g, (match, char) => {
        const handakuten: { [key: string]: string } = {
          'ﾊ': 'パ', 'ﾋ': 'ピ', 'ﾌ': 'プ', 'ﾍ': 'ペ', 'ﾎ': 'ポ'
        };
        return handakuten[char] || match;
      });

      for (const [half, full] of Object.entries(halfToFullKana)) {
        result = result.replace(new RegExp(half, 'g'), full);
      }
    }

    if (type === 'all') {
      // その他の半角記号→全角記号
      result = result.replace(/[!-~]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) + 0xFEE0)
      );
    }

    return result;
  };

  // テキスト変換
  useEffect(() => {
    if (!inputText) {
      setOutputText('');
      return;
    }

    const converted = isFullWidth 
      ? toFullWidth(inputText, conversionType)
      : toHalfWidth(inputText, conversionType);
    
    setOutputText(converted);

    if (onHistoryAdd) {
      onHistoryAdd({
        toolId: 'text-converter',
        input: inputText,
        output: converted
      });
    }
  }, [inputText, conversionType, isFullWidth]);

  const handleCopy = async () => {
    await copyToClipboard(outputText);
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="space-y-6">
      {/* 変換設定 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('textConverter.direction.label')}
          </label>
          <div className="flex gap-2">
            <Button
              variant={isFullWidth ? 'primary' : 'outline'}
              onClick={() => setIsFullWidth(true)}
              size="sm"
            >
              {t('textConverter.direction.halfToFull')}
            </Button>
            <Button
              variant={!isFullWidth ? 'primary' : 'outline'}
              onClick={() => setIsFullWidth(false)}
              size="sm"
            >
              {t('textConverter.direction.fullToHalf')}
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('textConverter.target.label')}
          </label>
          <select
            value={conversionType}
            onChange={(e) => setConversionType(e.target.value as ConversionType)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{t('textConverter.target.all')}</option>
            <option value="numbers">{t('textConverter.target.numbers')}</option>
            <option value="alphabet">{t('textConverter.target.alphabet')}</option>
            <option value="katakana">{t('textConverter.target.katakana')}</option>
          </select>
        </div>
      </div>

      {/* 入力エリア */}
      <div>
        <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('textConverter.input.label')}
        </label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('textConverter.input.placeholder')}
          className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
        />
      </div>

      {/* 出力エリア */}
      <div>
        <label htmlFor="output-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('textConverter.output.label')}
        </label>
        <textarea
          id="output-text"
          value={outputText}
          readOnly
          className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white resize-y"
        />
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button 
          onClick={handleCopy} 
          disabled={!outputText}
          className="flex items-center gap-2"
        >
          {isCopied ? `✓ ${t('textConverter.copied')}` : `📋 ${t('textConverter.button.copyResult')}`}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!inputText}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('textConverter.button.reset')}
        </Button>
      </div>

      {/* サンプル */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('textConverter.examples.title')}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>{t('textConverter.examples.numbers')}</div>
          <div>{t('textConverter.examples.alphabet')}</div>
          <div>{t('textConverter.examples.katakana')}</div>
          <div>{t('textConverter.examples.symbols')}</div>
        </div>
      </div>
    </div>
  );
}