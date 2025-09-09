import { useState, useEffect } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { ToolProps } from '../../types';

type ConversionMode = 'encode' | 'decode';
type ConversionType = 'base64' | 'base64url' | 'base58';

export function BaseConverter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<ConversionMode>('encode');
  const [conversionType, setConversionType] = useState<ConversionType>('base64');
  const [error, setError] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // Base58アルファベット（Bitcoin/IPFS形式）
  const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  // Base58エンコード
  const base58Encode = (input: string): string => {
    const bytes = new TextEncoder().encode(input);
    const digits = [0];

    for (let i = 0; i < bytes.length; i++) {
      let carry = bytes[i];
      for (let j = 0; j < digits.length; j++) {
        carry += digits[j] << 8;
        digits[j] = carry % 58;
        carry = Math.floor(carry / 58);
      }
      while (carry > 0) {
        digits.push(carry % 58);
        carry = Math.floor(carry / 58);
      }
    }

    // 先頭のゼロバイトをゼロ文字に変換
    let leadingZeros = 0;
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
      leadingZeros++;
    }

    return '1'.repeat(leadingZeros) + digits.reverse().map(d => BASE58_ALPHABET[d]).join('');
  };

  // Base58デコード
  const base58Decode = (input: string): string => {
    const digits = [0];

    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const value = BASE58_ALPHABET.indexOf(char);
      if (value === -1) {
        throw new Error(`無効な Base58 文字: ${char}`);
      }

      let carry = value;
      for (let j = 0; j < digits.length; j++) {
        carry += digits[j] * 58;
        digits[j] = carry & 0xff;
        carry >>= 8;
      }
      while (carry > 0) {
        digits.push(carry & 0xff);
        carry >>= 8;
      }
    }

    // 先頭の '1' を 0x00 バイトに変換
    let leadingOnes = 0;
    for (let i = 0; i < input.length && input[i] === '1'; i++) {
      leadingOnes++;
    }

    const result = new Uint8Array(leadingOnes + digits.length);
    for (let i = 0; i < digits.length; i++) {
      result[leadingOnes + i] = digits[digits.length - 1 - i];
    }

    return new TextDecoder().decode(result);
  };

  // Base64URLエンコード
  const base64UrlEncode = (input: string): string => {
    return btoa(unescape(encodeURIComponent(input)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // Base64URLデコード
  const base64UrlDecode = (input: string): string => {
    // パディングを復元
    let padded = input.replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4) {
      padded += '=';
    }
    return decodeURIComponent(escape(atob(padded)));
  };

  // 変換関数
  const convertText = (text: string, type: ConversionType, mode: ConversionMode): { output: string; error: string } => {
    if (!text.trim()) {
      return { output: '', error: '' };
    }

    try {
      let result = '';
      
      switch (type) {
        case 'base64':
          if (mode === 'encode') {
            result = btoa(unescape(encodeURIComponent(text)));
          } else {
            result = decodeURIComponent(escape(atob(text)));
          }
          break;
          
        case 'base64url':
          if (mode === 'encode') {
            result = base64UrlEncode(text);
          } else {
            result = base64UrlDecode(text);
          }
          break;
          
        case 'base58':
          if (mode === 'encode') {
            result = base58Encode(text);
          } else {
            result = base58Decode(text);
          }
          break;
      }

      return { output: result, error: '' };
    } catch (err) {
      return { 
        output: '', 
        error: err instanceof Error ? err.message : `${type.toUpperCase()}の${mode === 'encode' ? 'エンコード' : 'デコード'}に失敗しました` 
      };
    }
  };

  // リアルタイム変換
  useEffect(() => {
    const { output: result, error } = convertText(inputText, conversionType, mode);
    setOutputText(result);
    setError(error);

    if (result && !error) {
//       onHistoryAdd({
//         toolId: 'base-converter',
//         input: inputText.slice(0, 50) + (inputText.length > 50 ? '...' : ''),
//         output: `${conversionType.toUpperCase()} ${mode === 'encode' ? 'エンコード' : 'デコード'}完了`
//       });
    }
  }, [inputText, conversionType, mode]);

  const handleCopy = async () => {
    await copyToClipboard(outputText);
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  const handleSwap = () => {
    setInputText(outputText);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  // サンプル挿入
  const insertSample = () => {
    const samples = {
      base64: { encode: 'Hello, 世界! 🌍', decode: 'SGVsbG8sIOS4lueVjSEg8J+MjQ==' },
      base64url: { encode: 'Hello, World!', decode: 'SGVsbG8sIFdvcmxkIQ' },
      base58: { encode: 'Hello Bitcoin', decode: 'JxF12TrwXzfRXZfrdvR' }
    };
    setInputText(samples[conversionType][mode]);
  };

  return (
    <div className="space-y-6">
      {/* 変換設定 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            変換方向
          </label>
          <div className="flex gap-2">
            <Button
              variant={mode === 'encode' ? 'primary' : 'outline'}
              onClick={() => setMode('encode')}
              size="sm"
              className="flex-1"
            >
              エンコード
            </Button>
            <Button
              variant={mode === 'decode' ? 'primary' : 'outline'}
              onClick={() => setMode('decode')}
              size="sm"
              className="flex-1"
            >
              デコード
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            変換形式
          </label>
          <select
            value={conversionType}
            onChange={(e) => setConversionType(e.target.value as ConversionType)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="base64">Base64</option>
            <option value="base64url">Base64URL</option>
            <option value="base58">Base58</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button size="sm" variant="outline" onClick={insertSample} className="w-full">
            サンプル挿入
          </Button>
        </div>
      </div>

      {/* 入力エリア */}
      <div>
        <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {mode === 'encode' ? '元のテキスト' : `${conversionType.toUpperCase()}文字列`}
        </label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={mode === 'encode' ? 'エンコードしたいテキストを入力...' : `${conversionType.toUpperCase()}文字列を入力...`}
          className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y font-mono text-sm"
        />
        {inputText && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            文字数: {inputText.length} | バイト数: {new TextEncoder().encode(inputText).length}
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
            <div className="text-sm">
              <div className="font-medium text-red-800 dark:text-red-200 mb-1">変換エラー</div>
              <div className="text-red-600 dark:text-red-300">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* 出力エリア */}
      <div>
        <label htmlFor="output-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {mode === 'encode' ? `${conversionType.toUpperCase()}文字列` : 'デコードされたテキスト'}
        </label>
        <textarea
          id="output-text"
          value={outputText}
          readOnly
          className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white resize-y font-mono text-sm"
        />
        {outputText && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            文字数: {outputText.length} | バイト数: {new TextEncoder().encode(outputText).length}
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 flex-wrap">
        <Button 
          onClick={handleCopy} 
          disabled={!outputText}
          className="flex items-center gap-2"
        >
          {isCopied ? '✓ コピー済み' : '📋 結果をコピー'}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleSwap}
          disabled={!outputText}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          入出力を入れ替え
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!inputText}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          リセット
        </Button>
      </div>

      {/* フォーマット説明 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">エンコーディング形式について</h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Base64</h4>
            <p>標準的なBase64エンコーディング。A-Z, a-z, 0-9, +, / の64文字を使用。パディングに = を使用。</p>
            <p className="text-xs mt-1">例: "Hello" → "SGVsbG8="</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Base64URL</h4>
            <p>URL安全なBase64。+ を -、/ を _ に置換し、パディング = を省略。JWT等で使用。</p>
            <p className="text-xs mt-1">例: "Hello" → "SGVsbG8"</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Base58</h4>
            <p>Bitcoin等で使用。紛らわしい文字（0, O, I, l）を除いた58文字を使用。</p>
            <p className="text-xs mt-1">例: "Hello" → "9Ajdvzr"</p>
          </div>
        </div>
      </div>

      {/* 使用例 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">使用例</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>• <strong>Base64:</strong> メール添付ファイル、データURL、Basic認証</div>
          <div>• <strong>Base64URL:</strong> JWT、OAuth、URL安全な文字列</div>
          <div>• <strong>Base58:</strong> Bitcoin、IPFS、短縮URL</div>
        </div>
      </div>
    </div>
  );
}