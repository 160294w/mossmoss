import { useState, useEffect } from 'react';
import { Type, Copy, RotateCcw, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

type CaseType = 'snake_case' | 'camelCase' | 'PascalCase' | 'kebab-case' | 'SCREAMING_SNAKE_CASE' | 'Title Case' | 'lowercase' | 'UPPERCASE';

interface ConversionResult {
  snake_case: string;
  camelCase: string;
  PascalCase: string;
  'kebab-case': string;
  SCREAMING_SNAKE_CASE: string;
  'Title Case': string;
  lowercase: string;
  UPPERCASE: string;
}

export function CaseConverter({ onHistoryAdd }: ToolProps) {
  const [inputText, setInputText] = useState('');
  const [detectedCase, setDetectedCase] = useState<CaseType | 'mixed' | null>(null);
  const [conversions, setConversions] = useState<ConversionResult | null>(null);
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  // ケースの検出
  const detectCase = (text: string): CaseType | 'mixed' | null => {
    if (!text.trim()) return null;

    const trimmed = text.trim();
    
    // snake_case (小文字 + アンダースコア)
    if (/^[a-z]+(_[a-z]+)*$/.test(trimmed)) return 'snake_case';
    
    // SCREAMING_SNAKE_CASE (大文字 + アンダースコア)
    if (/^[A-Z]+(_[A-Z]+)*$/.test(trimmed)) return 'SCREAMING_SNAKE_CASE';
    
    // camelCase (最初小文字、後は大文字で区切り)
    if (/^[a-z][a-zA-Z]*$/.test(trimmed) && /[A-Z]/.test(trimmed)) return 'camelCase';
    
    // PascalCase (最初大文字、後は大文字で区切り)
    if (/^[A-Z][a-zA-Z]*$/.test(trimmed) && /[a-z]/.test(trimmed)) return 'PascalCase';
    
    // kebab-case (小文字 + ハイフン)
    if (/^[a-z]+(-[a-z]+)*$/.test(trimmed)) return 'kebab-case';
    
    // Title Case (各単語の最初が大文字、スペース区切り)
    if (/^[A-Z][a-z]*(\s[A-Z][a-z]*)*$/.test(trimmed)) return 'Title Case';
    
    // 全て小文字
    if (/^[a-z\s]+$/.test(trimmed) && trimmed === trimmed.toLowerCase()) return 'lowercase';
    
    // 全て大文字
    if (/^[A-Z\s]+$/.test(trimmed) && trimmed === trimmed.toUpperCase()) return 'UPPERCASE';
    
    return 'mixed';
  };

  // テキストを単語に分割
  const splitIntoWords = (text: string): string[] => {
    // snake_case, SCREAMING_SNAKE_CASE
    if (text.includes('_')) {
      return text.split('_').filter(word => word);
    }
    
    // kebab-case
    if (text.includes('-')) {
      return text.split('-').filter(word => word);
    }
    
    // Title Case, lowercase, UPPERCASE (スペース区切り)
    if (text.includes(' ')) {
      return text.split(' ').filter(word => word);
    }
    
    // camelCase, PascalCase (大文字で分割)
    const words = text.split(/(?=[A-Z])/).filter(word => word);
    return words;
  };

  // 各ケースに変換
  const convertToAllCases = (text: string): ConversionResult => {
    const words = splitIntoWords(text.trim());
    const cleanWords = words.map(word => word.toLowerCase().replace(/[^a-z0-9]/g, ''));

    return {
      snake_case: cleanWords.join('_'),
      camelCase: cleanWords.length > 0 
        ? cleanWords[0] + cleanWords.slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
        : '',
      PascalCase: cleanWords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(''),
      'kebab-case': cleanWords.join('-'),
      SCREAMING_SNAKE_CASE: cleanWords.join('_').toUpperCase(),
      'Title Case': cleanWords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      lowercase: cleanWords.join(' '),
      UPPERCASE: cleanWords.join(' ').toUpperCase()
    };
  };

  // リアルタイム変換
  useEffect(() => {
    if (!inputText.trim()) {
      setDetectedCase(null);
      setConversions(null);
      return;
    }

    const detected = detectCase(inputText);
    setDetectedCase(detected);
    
    const results = convertToAllCases(inputText);
    setConversions(results);

    onHistoryAdd?.({
      toolId: 'case-converter',
      input: inputText.slice(0, 50) + (inputText.length > 50 ? '...' : ''),
      output: `Case conversion completed: ${detected || 'mixed'} → 8 types`
    });

  }, [inputText]);

  const handleCopy = (text: string) => {
    copyToClipboard(text);
  };

  const handleReset = () => {
    setInputText('');
    setDetectedCase(null);
    setConversions(null);
  };

  const insertSample = () => {
    const samples = [
      'user_profile_data',
      'getUserProfileData',
      'UserProfileData',
      'user-profile-data',
      'USER_PROFILE_DATA',
      'User Profile Data'
    ];
    setInputText(samples[Math.floor(Math.random() * samples.length)]);
  };

  // ケースの説明
  const getCaseDescription = (caseType: CaseType): string => {
    return t(`caseConverter.case.${caseType}`);
  };

  // ケースの色
  const getCaseColor = (caseType: CaseType): string => {
    const colors: Record<CaseType, string> = {
      'snake_case': 'text-green-600 dark:text-green-400',
      'camelCase': 'text-blue-600 dark:text-blue-400',
      'PascalCase': 'text-purple-600 dark:text-purple-400',
      'kebab-case': 'text-orange-600 dark:text-orange-400',
      'SCREAMING_SNAKE_CASE': 'text-red-600 dark:text-red-400',
      'Title Case': 'text-indigo-600 dark:text-indigo-400',
      'lowercase': 'text-gray-600 dark:text-gray-400',
      'UPPERCASE': 'text-yellow-600 dark:text-yellow-400'
    };
    return colors[caseType] || 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* 入力エリア */}
      <div>
        <label htmlFor="case-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('caseConverter.input.label')}
        </label>
        <input
          id="case-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('caseConverter.input.placeholder')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
        />
        
        {/* 検出されたケース */}
        {detectedCase && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('caseConverter.detected')}</span>
            <span className={`font-mono text-sm font-semibold ${getCaseColor(detectedCase === 'mixed' ? 'lowercase' : detectedCase)}`}>
              {detectedCase === 'mixed' ? t('caseConverter.mixed') : detectedCase}
            </span>
            {detectedCase !== 'mixed' && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({getCaseDescription(detectedCase)})
              </span>
            )}
          </div>
        )}
      </div>

      {/* 変換結果 */}
      {conversions && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('caseConverter.results')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(conversions).map(([caseType, result]) => {
              const typedCaseType = caseType as CaseType;
              return (
                <div key={caseType} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className={`text-sm font-medium ${getCaseColor(typedCaseType)}`}>
                        {caseType}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getCaseDescription(typedCaseType)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(result)}
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded border p-3">
                    <code className="font-mono text-sm text-gray-900 dark:text-white break-all">
                      {result || '(空文字)'}
                    </code>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 使用例 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">{t('caseConverter.examples.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">{t('caseConverter.examples.programming')}</div>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• <code>snake_case</code> - Python変数</li>
              <li>• <code>camelCase</code> - JavaScript変数</li>
              <li>• <code>PascalCase</code> - クラス名</li>
              <li>• <code>SCREAMING_SNAKE_CASE</code> - 定数</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">{t('caseConverter.examples.web')}</div>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• <code>kebab-case</code> - CSS クラス</li>
              <li>• <code>kebab-case</code> - HTML 属性</li>
              <li>• <code>Title Case</code> - UI テキスト</li>
              <li>• <code>lowercase</code> - URL セグメント</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 一括変換のサンプル */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('caseConverter.patterns.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { from: 'user_name', to: 'snake_case → camelCase' },
            { from: 'getUserData', to: 'camelCase → snake_case' },
            { from: 'api-endpoint', to: 'kebab-case → PascalCase' },
            { from: 'MAX_RETRY_COUNT', to: 'CONSTANT → camelCase' },
            { from: 'User Profile Settings', to: 'Title Case → snake_case' },
            { from: 'background-color', to: 'CSS → JavaScript' }
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setInputText(example.from)}
              className="text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-mono text-sm text-gray-900 dark:text-white">
                {example.from}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {example.to}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button onClick={insertSample}>
          <Type className="w-4 h-4 mr-1" />
          {t('caseConverter.sample')}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('caseConverter.reset')}
        </Button>
      </div>
    </div>
  );
}