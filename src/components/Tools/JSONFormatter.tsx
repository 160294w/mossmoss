import { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { ToolProps } from '../../types';

export function JSONFormatter({ onHistoryAdd }: ToolProps) {
  const [inputJSON, setInputJSON] = useState('');
  const [outputJSON, setOutputJSON] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [isValid, setIsValid] = useState(false);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // JSON解析とフォーマット関数
  const formatJSON = (jsonString: string, indent: number): { formatted: string; error: string; valid: boolean } => {
    if (!jsonString.trim()) {
      return { formatted: '', error: '', valid: false };
    }

    try {
      // JSON文字列をパースして再度文字列化（フォーマット）
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, indent);
      return { formatted, error: '', valid: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'JSONの解析に失敗しました';
      return { formatted: '', error: errorMessage, valid: false };
    }
  };

  // リアルタイムフォーマット
  useEffect(() => {
    const result = formatJSON(inputJSON, indentSize);
    setOutputJSON(result.formatted);
    setError(result.error);
    setIsValid(result.valid);

    if (result.valid && onHistoryAdd) {
      onHistoryAdd({
        toolId: 'json-formatter',
        input: inputJSON.slice(0, 100) + (inputJSON.length > 100 ? '...' : ''),
        output: 'JSON整形完了'
      });
    }
  }, [inputJSON, indentSize, onHistoryAdd]);

  // ミニファイ（圧縮）
  const minifyJSON = () => {
    const result = formatJSON(inputJSON, 0);
    if (result.valid) {
      setOutputJSON(JSON.stringify(JSON.parse(inputJSON)));
    }
  };

  // サンプルJSONを挿入
  const insertSample = () => {
    const sampleJSON = {
      "name": "田中太郎",
      "age": 30,
      "email": "tanaka@example.com",
      "address": {
        "country": "日本",
        "prefecture": "東京都",
        "city": "新宿区"
      },
      "hobbies": ["読書", "映画鑑賞", "プログラミング"],
      "active": true,
      "score": null
    };
    setInputJSON(JSON.stringify(sampleJSON));
  };

  const handleCopy = async () => {
    await copyToClipboard(outputJSON);
  };

  const handleReset = () => {
    setInputJSON('');
    setOutputJSON('');
    setError('');
    setIsValid(false);
  };

  // JSON統計情報を取得
  const getJSONStats = (jsonString: string) => {
    if (!isValid) return null;

    try {
      const parsed = JSON.parse(jsonString);
      const stats = {
        size: new Blob([jsonString]).size,
        formattedSize: new Blob([outputJSON]).size,
        keys: 0,
        arrays: 0,
        objects: 0,
        nulls: 0,
        strings: 0,
        numbers: 0,
        booleans: 0
      };

      const analyze = (obj: any) => {
        if (Array.isArray(obj)) {
          stats.arrays++;
          obj.forEach(analyze);
        } else if (obj !== null && typeof obj === 'object') {
          stats.objects++;
          stats.keys += Object.keys(obj).length;
          Object.values(obj).forEach(analyze);
        } else if (obj === null) {
          stats.nulls++;
        } else if (typeof obj === 'string') {
          stats.strings++;
        } else if (typeof obj === 'number') {
          stats.numbers++;
        } else if (typeof obj === 'boolean') {
          stats.booleans++;
        }
      };

      analyze(parsed);
      return stats;
    } catch {
      return null;
    }
  };

  const stats = getJSONStats(inputJSON);

  return (
    <div className="space-y-6">
      {/* 設定 */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="indent-size" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            インデント:
          </label>
          <select
            id="indent-size"
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={2}>2スペース</option>
            <option value={4}>4スペース</option>
            <option value={1}>タブ</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={minifyJSON} disabled={!isValid}>
            圧縮
          </Button>
          <Button size="sm" variant="outline" onClick={insertSample}>
            サンプル挿入
          </Button>
        </div>
      </div>

      {/* 入力エリア */}
      <div>
        <label htmlFor="input-json" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          JSON文字列を入力
        </label>
        <textarea
          id="input-json"
          value={inputJSON}
          onChange={(e) => setInputJSON(e.target.value)}
          placeholder='{"key": "value", "array": [1, 2, 3]}'
          className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y font-mono text-sm"
        />
        
        {/* エラー表示 */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start">
              <span className="text-red-500 mr-2">⚠️</span>
              <div className="text-sm">
                <div className="font-medium text-red-800 dark:text-red-200 mb-1">JSONエラー</div>
                <div className="text-red-600 dark:text-red-300 font-mono">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* 成功表示 */}
        {isValid && !error && inputJSON && (
          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center text-sm text-green-800 dark:text-green-200">
              <span className="mr-2">✓</span>
              有効なJSONです
            </div>
          </div>
        )}
      </div>

      {/* 出力エリア */}
      <div>
        <label htmlFor="output-json" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          整形されたJSON
        </label>
        <textarea
          id="output-json"
          value={outputJSON}
          readOnly
          className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white resize-y font-mono text-sm"
        />
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button 
          onClick={handleCopy} 
          disabled={!outputJSON}
          className="flex items-center gap-2"
        >
          {isCopied ? '✓ コピー済み' : '📋 結果をコピー'}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!inputJSON}
        >
          🔄 リセット
        </Button>
      </div>

      {/* JSON統計情報 */}
      {stats && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">JSON統計</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{stats.size}B</div>
              <div className="text-gray-500 dark:text-gray-400">元サイズ</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{stats.formattedSize}B</div>
              <div className="text-gray-500 dark:text-gray-400">整形後</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{stats.objects}</div>
              <div className="text-gray-500 dark:text-gray-400">オブジェクト</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{stats.arrays}</div>
              <div className="text-gray-500 dark:text-gray-400">配列</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{stats.keys}</div>
              <div className="text-gray-500 dark:text-gray-400">キー数</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{stats.strings}</div>
              <div className="text-gray-500 dark:text-gray-400">文字列</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{stats.numbers}</div>
              <div className="text-gray-500 dark:text-gray-400">数値</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{stats.booleans}</div>
              <div className="text-gray-500 dark:text-gray-400">真偽値</div>
            </div>
          </div>
        </div>
      )}

      {/* 使用例 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">使用方法</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• 整形したいJSON文字列を上のテキストエリアに貼り付けてください</li>
          <li>• 構文エラーがある場合は自動的に検出してエラーを表示します</li>
          <li>• インデントサイズを変更して見やすさを調整できます</li>
          <li>• 「圧縮」ボタンで改行やスペースを削除した最小形式にできます</li>
        </ul>
      </div>
    </div>
  );
}