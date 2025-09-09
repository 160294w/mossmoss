import { useState, useCallback } from 'react';
import { Dices, RefreshCw } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { ToolProps } from '../../types';

interface GeneratorOptions {
  length: number;
  includeNumbers: boolean;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

export function RandomGenerator({ onHistoryAdd }: ToolProps) {
  const [options, setOptions] = useState<GeneratorOptions>({
    length: 12,
    includeNumbers: true,
    includeUppercase: true,
    includeLowercase: true,
    includeSymbols: false,
    excludeSimilar: false,
    excludeAmbiguous: false,
  });
  const [generatedText, setGeneratedText] = useState('');
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // 文字セット定義
  const charSets = {
    numbers: '0123456789',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O', // 似た文字
    ambiguous: '{}[]()/\\\'"`~,;.<>' // 紛らわしい文字
  };

  // 文字列生成関数
  const generateRandomString = useCallback(() => {
    let availableChars = '';

    // 選択された文字種を結合
    if (options.includeNumbers) availableChars += charSets.numbers;
    if (options.includeUppercase) availableChars += charSets.uppercase;
    if (options.includeLowercase) availableChars += charSets.lowercase;
    if (options.includeSymbols) availableChars += charSets.symbols;

    // 除外文字の処理
    if (options.excludeSimilar) {
      for (const char of charSets.similar) {
        availableChars = availableChars.replace(new RegExp(char, 'g'), '');
      }
    }

    if (options.excludeAmbiguous) {
      for (const char of charSets.ambiguous) {
        availableChars = availableChars.replace(new RegExp(`\\${char}`, 'g'), '');
      }
    }

    if (availableChars.length === 0) {
      return 'エラー: 使用可能な文字が選択されていません';
    }

    // ランダム文字列生成
    let result = '';
    for (let i = 0; i < options.length; i++) {
      const randomIndex = Math.floor(Math.random() * availableChars.length);
      result += availableChars[randomIndex];
    }

    return result;
  }, [options]);

  const handleGenerate = () => {
    const newString = generateRandomString();
    setGeneratedText(newString);
    
    // 履歴に追加
    setGenerationHistory(prev => [newString, ...prev.slice(0, 4)]); // 最新5件まで

    if (onHistoryAdd && !newString.startsWith('エラー:')) {
      onHistoryAdd({
        toolId: 'random-generator',
        input: `長さ:${options.length}, 文字種:${getCharTypeString()}`,
        output: newString
      });
    }
  };

  const getCharTypeString = () => {
    const types = [];
    if (options.includeNumbers) types.push('数字');
    if (options.includeUppercase) types.push('大文字');
    if (options.includeLowercase) types.push('小文字');
    if (options.includeSymbols) types.push('記号');
    return types.join(', ');
  };

  const handleCopy = async () => {
    await copyToClipboard(generatedText);
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 1000) {
      setOptions(prev => ({ ...prev, length: value }));
    }
  };

  const presetConfigs = [
    { name: 'パスワード(強)', config: { length: 16, includeNumbers: true, includeUppercase: true, includeLowercase: true, includeSymbols: true, excludeSimilar: true, excludeAmbiguous: false } },
    { name: 'パスワード(中)', config: { length: 12, includeNumbers: true, includeUppercase: true, includeLowercase: true, includeSymbols: false, excludeSimilar: true, excludeAmbiguous: false } },
    { name: 'PIN', config: { length: 6, includeNumbers: true, includeUppercase: false, includeLowercase: false, includeSymbols: false, excludeSimilar: false, excludeAmbiguous: false } },
    { name: 'トークン', config: { length: 32, includeNumbers: true, includeUppercase: true, includeLowercase: true, includeSymbols: false, excludeSimilar: false, excludeAmbiguous: false } },
  ];

  return (
    <div className="space-y-6">
      {/* プリセット */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          プリセット
        </label>
        <div className="flex flex-wrap gap-2">
          {presetConfigs.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => setOptions(prev => ({ ...prev, ...preset.config }))}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 長さ設定 */}
      <div>
        <label htmlFor="length" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          文字数: {options.length}
        </label>
        <input
          id="length"
          type="range"
          min="1"
          max="128"
          value={options.length}
          onChange={handleLengthChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>1</span>
          <span>128</span>
        </div>
      </div>

      {/* 文字種選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          使用する文字種
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => setOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">数字 (0-9)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => setOptions(prev => ({ ...prev, includeUppercase: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">大文字 (A-Z)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => setOptions(prev => ({ ...prev, includeLowercase: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">小文字 (a-z)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => setOptions(prev => ({ ...prev, includeSymbols: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">記号</span>
          </label>
        </div>
      </div>

      {/* 除外オプション */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          除外オプション
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.excludeSimilar}
              onChange={(e) => setOptions(prev => ({ ...prev, excludeSimilar: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">似た文字を除外 (il1Lo0O)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={(e) => setOptions(prev => ({ ...prev, excludeAmbiguous: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">紛らわしい記号を除外 ({}[]()等)</span>
          </label>
        </div>
      </div>

      {/* 生成ボタン */}
      <div>
        <Button onClick={handleGenerate} size="lg" className="w-full md:w-auto">
          <Dices className="w-4 h-4 mr-1" />
          ランダム文字列を生成
        </Button>
      </div>

      {/* 結果表示 */}
      {generatedText && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            生成結果
          </label>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-3 mb-3">
            <code className="text-lg font-mono break-all text-gray-900 dark:text-white">
              {generatedText}
            </code>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              {isCopied ? '✓ コピー済み' : '📋 コピー'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGenerate}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              再生成
            </Button>
          </div>
        </div>
      )}

      {/* 生成履歴 */}
      {generationHistory.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">生成履歴</h3>
          <div className="space-y-2">
            {generationHistory.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded p-2">
                <code className="text-sm font-mono text-gray-900 dark:text-white flex-1 mr-2">
                  {item}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(item)}
                  className="flex-shrink-0"
                >
                  📋
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 文字種プレビュー */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">使用される文字</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
          {options.includeNumbers && <div>数字: {charSets.numbers}</div>}
          {options.includeUppercase && <div>大文字: {charSets.uppercase}</div>}
          {options.includeLowercase && <div>小文字: {charSets.lowercase}</div>}
          {options.includeSymbols && <div>記号: {charSets.symbols}</div>}
          {!options.includeNumbers && !options.includeUppercase && !options.includeLowercase && !options.includeSymbols && (
            <div className="text-red-500">文字種が選択されていません</div>
          )}
        </div>
      </div>
    </div>
  );
}