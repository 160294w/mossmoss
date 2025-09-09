import { useState } from 'react';
import * as yaml from 'js-yaml';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { HistoryItem } from '../../types';

interface YamlJsonConverterProps {
  onHistoryAdd: (item: Omit<HistoryItem, 'timestamp'>) => void;
}

export function YamlJsonConverter({ onHistoryAdd }: YamlJsonConverterProps) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [inputFormat, setInputFormat] = useState<'yaml' | 'json'>('yaml');
  const [error, setError] = useState<string | null>(null);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const convertYamlToJson = (yamlText: string): string => {
    try {
      const parsed = yaml.load(yamlText);
      return JSON.stringify(parsed, null, 2);
    } catch (err) {
      throw new Error(`YAML parsing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const convertJsonToYaml = (jsonText: string): string => {
    try {
      const parsed = JSON.parse(jsonText);
      return yaml.dump(parsed, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false
      });
    } catch (err) {
      throw new Error(`JSON parsing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      setError('入力テキストが空です');
      setOutputText('');
      return;
    }

    setError(null);
    
    try {
      let result: string;
      let conversionType: string;
      
      if (inputFormat === 'yaml') {
        result = convertYamlToJson(inputText);
        conversionType = 'YAML → JSON';
      } else {
        result = convertJsonToYaml(inputText);
        conversionType = 'JSON → YAML';
      }
      
      setOutputText(result);
      
      onHistoryAdd({
        toolId: 'yaml-json-converter',
        result: `${conversionType}変換実行`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '変換に失敗しました';
      setError(errorMessage);
      setOutputText('');
    }
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
    setError(null);
    
    // 自動変換
    if (value.trim()) {
      try {
        let result: string;
        
        if (inputFormat === 'yaml') {
          result = convertYamlToJson(value);
        } else {
          result = convertJsonToYaml(value);
        }
        
        setOutputText(result);
        setError(null);
      } catch (err) {
        // 入力中のエラーは表示しない（完了時のみ）
        setOutputText('');
      }
    } else {
      setOutputText('');
    }
  };

  const handleFormatSwitch = () => {
    const newFormat = inputFormat === 'yaml' ? 'json' : 'yaml';
    setInputFormat(newFormat);
    
    // 入力と出力を入れ替え
    if (outputText) {
      setInputText(outputText);
      setOutputText(inputText);
    }
    
    setError(null);
  };

  const handleCopy = () => {
    copyToClipboard(outputText);
  };

  const insertSampleYaml = () => {
    const sampleYaml = `# サンプルYAML設定
server:
  host: localhost
  port: 8080
  ssl:
    enabled: true
    cert_path: "/path/to/cert.pem"
    key_path: "/path/to/key.pem"

database:
  type: postgresql
  connection:
    host: db.example.com
    port: 5432
    database: myapp
    username: user
    password: secret

features:
  - authentication
  - logging
  - monitoring

settings:
  debug: false
  max_connections: 100
  timeout: 30s`;

    setInputText(sampleYaml);
    setInputFormat('yaml');
    handleInputChange(sampleYaml);
  };

  const insertSampleJson = () => {
    const sampleJson = `{
  "server": {
    "host": "localhost",
    "port": 8080,
    "ssl": {
      "enabled": true,
      "cert_path": "/path/to/cert.pem",
      "key_path": "/path/to/key.pem"
    }
  },
  "database": {
    "type": "postgresql",
    "connection": {
      "host": "db.example.com",
      "port": 5432,
      "database": "myapp",
      "username": "user",
      "password": "secret"
    }
  },
  "features": [
    "authentication",
    "logging",
    "monitoring"
  ],
  "settings": {
    "debug": false,
    "max_connections": 100,
    "timeout": "30s"
  }
}`;

    setInputText(sampleJson);
    setInputFormat('json');
    handleInputChange(sampleJson);
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                入力形式:
              </label>
              <select
                value={inputFormat}
                onChange={(e) => {
                  setInputFormat(e.target.value as 'yaml' | 'json');
                  setError(null);
                }}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="yaml">YAML</option>
                <option value="json">JSON</option>
              </select>
            </div>
            
            <Button onClick={handleFormatSwitch} variant="outline" size="sm">
              ⇄ 入出力切り替え
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button onClick={insertSampleYaml} variant="outline" size="sm">
              YAMLサンプル
            </Button>
            <Button onClick={insertSampleJson} variant="outline" size="sm">
              JSONサンプル
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm">
              クリア
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {inputFormat === 'yaml' ? 'YAML' : 'JSON'}入力
          </label>
          <textarea
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={`${inputFormat === 'yaml' ? 'YAML' : 'JSON'}を入力してください...`}
            rows={12}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-y"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">
              <strong>エラー:</strong> {error}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {inputFormat === 'yaml' ? 'JSON' : 'YAML'}出力
          </h3>
          <div className="flex space-x-2">
            <Button onClick={handleConvert} variant="outline" size="sm">
              変換実行
            </Button>
            <Button 
              onClick={handleCopy} 
              variant="outline" 
              size="sm"
              disabled={!outputText}
            >
              {isCopied ? 'コピー済み!' : 'コピー'}
            </Button>
          </div>
        </div>

        <textarea
          value={outputText}
          readOnly
          placeholder={`変換された${inputFormat === 'yaml' ? 'JSON' : 'YAML'}がここに表示されます...`}
          rows={12}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-y"
        />

        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>機能:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>YAML → JSON:</strong> YAML形式をJSON形式に変換</li>
            <li><strong>JSON → YAML:</strong> JSON形式をYAML形式に変換</li>
            <li><strong>リアルタイム変換:</strong> 入力と同時に自動変換</li>
            <li><strong>入出力切り替え:</strong> 変換結果を入力として再利用可能</li>
            <li><strong>エラー検出:</strong> 構文エラーを詳細に表示</li>
          </ul>
        </div>
      </div>
    </div>
  );
}