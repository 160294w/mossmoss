import { useState, useEffect } from 'react';
import { Code, FileText, Copy, RotateCcw, Check, ArrowLeftRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

export function HtmlEscaper({ onHistoryAdd }: ToolProps) {
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  // HTMLエスケープのマップ
  const escapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  // HTMLアンエスケープのマップ（エスケープマップの逆）
  const unescapeMap: { [key: string]: string } = Object.fromEntries(
    Object.entries(escapeMap).map(([key, value]) => [value, key])
  );

  // 追加のHTMLエンティティ
  const additionalEntities: { [key: string]: string } = {
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
    '&sect;': '§',
    '&para;': '¶',
    '&dagger;': '†',
    '&Dagger;': '‡',
    '&bull;': '•',
    '&hellip;': '…',
    '&prime;': '′',
    '&Prime;': '″',
    '&oline;': '‾',
    '&frasl;': '⁄',
    '&weierp;': '℘',
    '&image;': 'ℑ',
    '&real;': 'ℜ',
    '&alefsym;': 'ℵ',
    '&larr;': '←',
    '&uarr;': '↑',
    '&rarr;': '→',
    '&darr;': '↓',
    '&harr;': '↔',
    '&crarr;': '↵',
    '&lArr;': '⇐',
    '&uArr;': '⇑',
    '&rArr;': '⇒',
    '&dArr;': '⇓',
    '&hArr;': '⇔',
    '&forall;': '∀',
    '&part;': '∂',
    '&exist;': '∃',
    '&empty;': '∅',
    '&nabla;': '∇',
    '&isin;': '∈',
    '&notin;': '∉',
    '&ni;': '∋',
    '&prod;': '∏',
    '&sum;': '∑',
    '&minus;': '−',
    '&lowast;': '∗',
    '&radic;': '√',
    '&prop;': '∝',
    '&infin;': '∞',
    '&ang;': '∠',
    '&and;': '∧',
    '&or;': '∨',
    '&cap;': '∩',
    '&cup;': '∪',
    '&int;': '∫',
    '&there4;': '∴',
    '&sim;': '∼',
    '&cong;': '≅',
    '&asymp;': '≈',
    '&ne;': '≠',
    '&equiv;': '≡',
    '&le;': '≤',
    '&ge;': '≥',
    '&sub;': '⊂',
    '&sup;': '⊃',
    '&nsub;': '⊄',
    '&sube;': '⊆',
    '&supe;': '⊇',
    '&oplus;': '⊕',
    '&otimes;': '⊗',
    '&perp;': '⊥'
  };

  // HTMLエスケープ関数
  const escapeHtml = (text: string): string => {
    return text.replace(/[&<>"'`=\/]/g, (char) => escapeMap[char] || char);
  };

  // HTMLアンエスケープ関数
  const unescapeHtml = (text: string): string => {
    // 基本的なHTMLエンティティをアンエスケープ
    let result = text;
    
    // 数値文字参照（&#123; や &#x7B; 形式）
    result = result.replace(/&#(\d+);/g, (_, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });
    
    result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    
    // 名前付きエンティティ
    for (const [entity, char] of Object.entries({ ...unescapeMap, ...additionalEntities })) {
      result = result.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), char);
    }
    
    return result;
  };

  // テキスト変換
  useEffect(() => {
    if (!inputText) {
      setOutputText('');
      return;
    }

    try {
      const result = mode === 'escape' ? escapeHtml(inputText) : unescapeHtml(inputText);
      setOutputText(result);

      onHistoryAdd?.({
        toolId: 'html-escaper',
        input: inputText.slice(0, 50) + (inputText.length > 50 ? '...' : ''),
        output: mode === 'escape' ? t('htmlEscaper.historyOutput.escape') : t('htmlEscaper.historyOutput.unescape')
      });

    } catch (err) {
      setOutputText(t('htmlEscaper.error.conversion'));
    }
  }, [inputText, mode]);

  const handleCopy = () => {
    copyToClipboard(outputText);
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
  };

  const insertSample = () => {
    if (mode === 'escape') {
      setInputText(`<div class="example">
  <h1>HTML エスケープのサンプル</h1>
  <p>特殊文字: & < > " ' / = \`</p>
  <a href="https://example.com">リンク</a>
</div>`);
    } else {
      setInputText(`&lt;div class=&quot;example&quot;&gt;
  &lt;h1&gt;HTML &#x30A2;&#x30F3;&#x30A8;&#x30B9;&#x30B1;&#x30FC;&#x30D7;&#x306E;&#x30B5;&#x30F3;&#x30D7;&#x30EB;&lt;/h1&gt;
  &lt;p&gt;&#x7279;&#x6B8A;&#x6587;&#x5B57;: &amp; &lt; &gt; &quot; &#39; &#x2F; &#x3D; &#x60;&lt;/p&gt;
  &lt;a href=&quot;https://example.com&quot;&gt;&#x30EA;&#x30F3;&#x30AF;&lt;/a&gt;
&lt;/div&gt;`);
    }
  };

  const swapInputOutput = () => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
    setMode(mode === 'escape' ? 'unescape' : 'escape');
  };

  // 統計情報
  const getStats = () => {
    if (!inputText) return null;
    
    const inputLength = inputText.length;
    const outputLength = outputText.length;
    const escapedChars = mode === 'escape' 
      ? inputText.match(/[&<>"'`=\/]/g)?.length || 0
      : outputText.match(/[&<>"'`=\/]/g)?.length || 0;

    return {
      inputLength,
      outputLength,
      difference: outputLength - inputLength,
      escapedChars
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* モード選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('htmlEscaper.mode.label')}
        </label>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'escape' ? 'primary' : 'outline'}
            onClick={() => setMode('escape')}
          >
            <Code className="w-4 h-4 mr-1" />
            {t('htmlEscaper.mode.escape')}
          </Button>
          <ArrowLeftRight className="w-4 h-4 text-gray-400 self-center" />
          <Button
            size="sm"
            variant={mode === 'unescape' ? 'primary' : 'outline'}
            onClick={() => setMode('unescape')}
          >
            <FileText className="w-4 h-4 mr-1" />
            {t('htmlEscaper.mode.unescape')}
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {mode === 'escape' 
            ? t('htmlEscaper.mode.description.escape')
            : t('htmlEscaper.mode.description.unescape')
          }
        </div>
      </div>

      {/* 入力エリア */}
      <div>
        <label htmlFor="html-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {mode === 'escape' ? t('htmlEscaper.input.escape') : t('htmlEscaper.input.unescape')}
        </label>
        <textarea
          id="html-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            mode === 'escape' 
              ? t('htmlEscaper.input.placeholder.escape')
              : t('htmlEscaper.input.placeholder.unescape')
          }
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-y"
        />
      </div>

      {/* 統計情報 */}
      {stats && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('htmlEscaper.stats.title')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500 dark:text-gray-400">{t('htmlEscaper.stats.inputLength')}</div>
              <div className="font-mono text-lg text-gray-900 dark:text-white">{stats.inputLength.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">{t('htmlEscaper.stats.outputLength')}</div>
              <div className="font-mono text-lg text-gray-900 dark:text-white">{stats.outputLength.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">{t('htmlEscaper.stats.difference')}</div>
              <div className={`font-mono text-lg ${stats.difference > 0 ? 'text-red-600' : stats.difference < 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                {stats.difference > 0 ? '+' : ''}{stats.difference.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">{mode === 'escape' ? t('htmlEscaper.stats.escapedChars') : t('htmlEscaper.stats.specialChars')}</div>
              <div className="font-mono text-lg text-gray-900 dark:text-white">{stats.escapedChars}</div>
            </div>
          </div>
        </div>
      )}

      {/* 出力エリア */}
      {outputText && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === 'escape' ? t('htmlEscaper.output.escape') : t('htmlEscaper.output.unescape')}
            </label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={swapInputOutput}
                title={t('htmlEscaper.swapInputOutput')}
              >
                <ArrowLeftRight className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="ml-1">{isCopied ? t('htmlEscaper.copied') : t('htmlEscaper.copy')}</span>
              </Button>
            </div>
          </div>
          <textarea
            value={outputText}
            readOnly
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-sm resize-y"
          />
        </div>
      )}

      {/* よく使われるHTMLエンティティ */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('htmlEscaper.entities.title')}</h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-mono text-gray-900 dark:text-white">&amp;</div>
              <div className="text-gray-500 dark:text-gray-400">&amp;amp;</div>
            </div>
            <div>
              <div className="font-mono text-gray-900 dark:text-white">&lt;</div>
              <div className="text-gray-500 dark:text-gray-400">&amp;lt;</div>
            </div>
            <div>
              <div className="font-mono text-gray-900 dark:text-white">&gt;</div>
              <div className="text-gray-500 dark:text-gray-400">&amp;gt;</div>
            </div>
            <div>
              <div className="font-mono text-gray-900 dark:text-white">"</div>
              <div className="text-gray-500 dark:text-gray-400">&amp;quot;</div>
            </div>
            <div>
              <div className="font-mono text-gray-900 dark:text-white">'</div>
              <div className="text-gray-500 dark:text-gray-400">&amp;#39;</div>
            </div>
            <div>
              <div className="font-mono text-gray-900 dark:text-white"> </div>
              <div className="text-gray-500 dark:text-gray-400">&amp;nbsp;</div>
            </div>
            <div>
              <div className="font-mono text-gray-900 dark:text-white">©</div>
              <div className="text-gray-500 dark:text-gray-400">&amp;copy;</div>
            </div>
            <div>
              <div className="font-mono text-gray-900 dark:text-white">®</div>
              <div className="text-gray-500 dark:text-gray-400">&amp;reg;</div>
            </div>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button onClick={insertSample}>
          <FileText className="w-4 h-4 mr-1" />
          {t('htmlEscaper.insertSample')}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('htmlEscaper.reset')}
        </Button>
      </div>
    </div>
  );
}