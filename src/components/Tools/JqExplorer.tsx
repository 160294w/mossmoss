import { useState, useCallback } from 'react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

export function JqExplorer({ onHistoryAdd }: ToolProps) {
  const [inputJson, setInputJson] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [selectedJqQuery, setSelectedJqQuery] = useState('');
  const [queryResult, setQueryResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  const generateJqQuery = (path: string[]): string => {
    if (path.length === 0) return '.';
    
    return '.' + path.map(key => {
      // 配列のインデックスかチェック
      if (/^\d+$/.test(key)) {
        return `[${key}]`;
      }
      // キーに特殊文字が含まれているかチェック
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
        return key;
      } else {
        return `["${key}"]`;
      }
    }).join('.');
  };

  const executeJqQuery = useCallback((query: string, data: any): string => {
    try {
      if (!query || query === '.') {
        return JSON.stringify(data, null, 2);
      }

      // 簡単なjqクエリを実行（実際のjqの完全な実装ではない）
      let result = data;
      const parts = query.replace(/^\./, '').split('.');
      
      for (const part of parts) {
        if (!part) continue;
        
        // 配列インデックスの処理
        const arrayMatch = part.match(/\[(\d+)\]$/);
        if (arrayMatch) {
          const key = part.replace(/\[\d+\]$/, '');
          if (key) {
            result = result[key];
          }
          const index = parseInt(arrayMatch[1]);
          if (Array.isArray(result)) {
            result = result[index];
          } else {
            throw new Error(`Index access on non-array: ${part}`);
          }
        }
        // オブジェクトキーの処理
        else if (part.startsWith('["') && part.endsWith('"]')) {
          const key = part.slice(2, -2);
          result = result[key];
        }
        // 通常のキーアクセス
        else {
          result = result[part];
        }
        
        if (result === undefined) {
          throw new Error(`Key not found: ${part}`);
        }
      }
      
      return JSON.stringify(result, null, 2);
    } catch (err) {
      throw new Error(`Query execution error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const handleJsonInput = (value: string) => {
    setInputJson(value);
    setError(null);
    
    if (!value.trim()) {
      setParsedData(null);
      setQueryResult('');
      return;
    }
    
    try {
      const parsed = JSON.parse(value);
      setParsedData(parsed);
      
      // ルートクエリを実行
      if (selectedJqQuery) {
        try {
          const result = executeJqQuery(selectedJqQuery, parsed);
          setQueryResult(result);
        } catch (err) {
          setQueryResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      setError(`JSON Parse Error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
      setParsedData(null);
      setQueryResult('');
    }
  };

  const renderJsonNode = (data: any, path: string[] = [], level: number = 0): React.ReactNode => {
    if (data === null) {
      return (
        <span 
          className="text-gray-500 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
          onClick={() => handlePathClick(path)}
        >
          null
        </span>
      );
    }
    
    if (typeof data === 'string') {
      return (
        <span 
          className="text-green-600 dark:text-green-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
          onClick={() => handlePathClick(path)}
        >
          "{data}"
        </span>
      );
    }
    
    if (typeof data === 'number' || typeof data === 'boolean') {
      return (
        <span 
          className="text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
          onClick={() => handlePathClick(path)}
        >
          {String(data)}
        </span>
      );
    }
    
    if (Array.isArray(data)) {
      return (
        <div className={level > 0 ? 'ml-4' : ''}>
          <span 
            className="text-purple-600 dark:text-purple-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
            onClick={() => handlePathClick(path)}
          >
            [
          </span>
          <div className="ml-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-start">
                <span className="text-gray-400 mr-2">{index}:</span>
                {renderJsonNode(item, [...path, String(index)], level + 1)}
                {index < data.length - 1 && <span className="text-gray-400">,</span>}
              </div>
            ))}
          </div>
          <span className="text-purple-600 dark:text-purple-400">]</span>
        </div>
      );
    }
    
    if (typeof data === 'object') {
      return (
        <div className={level > 0 ? 'ml-4' : ''}>
          <span 
            className="text-orange-600 dark:text-orange-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
            onClick={() => handlePathClick(path)}
          >
            {'{'}
          </span>
          <div className="ml-4">
            {Object.entries(data).map(([key, value], index, array) => (
              <div key={key} className="flex items-start">
                <span 
                  className="text-red-600 dark:text-red-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded mr-2"
                  onClick={() => handlePathClick([...path, key])}
                >
                  "{key}":
                </span>
                {renderJsonNode(value, [...path, key], level + 1)}
                {index < array.length - 1 && <span className="text-gray-400">,</span>}
              </div>
            ))}
          </div>
          <span className="text-orange-600 dark:text-orange-400">{'}'}</span>
        </div>
      );
    }
    
    return <span>{String(data)}</span>;
  };

  const handlePathClick = (path: string[]) => {
    const jqQuery = generateJqQuery(path);
    setSelectedJqQuery(jqQuery);
    
    if (parsedData) {
      try {
        const result = executeJqQuery(jqQuery, parsedData);
        setQueryResult(result);
        
        onHistoryAdd?.({
          toolId: 'jq-explorer',
          input: t('jqExplorer.historyInput', { path: path.join('.') }),
          output: t('jqExplorer.historyOutput', { query: jqQuery })
        });
      } catch (err) {
        setQueryResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleCopyQuery = () => {
    copyToClipboard(selectedJqQuery);
  };

  const insertSampleJson = () => {
    const sample = `{
  "users": [
    {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "profile": {
        "age": 30,
        "department": "開発部",
        "skills": ["JavaScript", "Python", "Docker"]
      },
      "active": true
    },
    {
      "id": 2,
      "name": "佐藤花子",
      "email": "sato@example.com", 
      "profile": {
        "age": 28,
        "department": "デザイン部",
        "skills": ["Figma", "Photoshop", "UI/UX"]
      },
      "active": false
    }
  ],
  "metadata": {
    "total": 2,
    "page": 1,
    "created_at": "2024-01-15T10:30:00Z"
  }
}`;
    
    setInputJson(sample);
    handleJsonInput(sample);
  };

  const clearAll = () => {
    setInputJson('');
    setParsedData(null);
    setSelectedJqQuery('');
    setQueryResult('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('jqExplorer.jsonInput.title')}
          </h3>
          <div className="flex space-x-2">
            <Button onClick={insertSampleJson} variant="outline" size="sm">
              {t('jqExplorer.insertSample')}
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm">
              {t('jqExplorer.clear')}
            </Button>
          </div>
        </div>

        <textarea
          value={inputJson}
          onChange={(e) => handleJsonInput(e.target.value)}
          placeholder={t('jqExplorer.input.placeholder')}
          rows={8}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-y"
        />

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">
              <strong>{t('jqExplorer.error.title')}</strong> {error}
            </p>
          </div>
        )}
      </div>

      {parsedData && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('jqExplorer.tree.title')}
            </h3>
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-sm overflow-auto max-h-96">
              {renderJsonNode(parsedData)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {t('jqExplorer.tree.instruction')}
            </p>
          </div>

          {selectedJqQuery && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('jqExplorer.query.title')}
                </h3>
                <Button onClick={handleCopyQuery} variant="outline" size="sm">
                  {isCopied ? t('jqExplorer.query.copied') : t('jqExplorer.query.copy')}
                </Button>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <code className="text-blue-800 dark:text-blue-300 font-mono">
                  jq '{selectedJqQuery}' data.json
                </code>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                  {t('jqExplorer.result.title')}
                </h4>
                <pre className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm overflow-auto max-h-64">
                  {queryResult}
                </pre>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>{t('jqExplorer.usage.title')}</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('jqExplorer.usage.step1')}</li>
              <li>{t('jqExplorer.usage.step2')}</li>
              <li>{t('jqExplorer.usage.step3')}</li>
              <li>{t('jqExplorer.usage.step4')}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}