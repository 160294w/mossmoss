import { useState } from 'react';
import * as yaml from 'js-yaml';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

export function YamlJsonConverter({ onHistoryAdd }: ToolProps) {
  const { t } = useLanguage();
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
      setError(t('yamlJsonConverter.error.emptyInput'));
      setOutputText('');
      return;
    }

    setError(null);
    
    try {
      let result: string;
      
      if (inputFormat === 'yaml') {
        result = convertYamlToJson(inputText);
      } else {
        result = convertJsonToYaml(inputText);
      }
      
      setOutputText(result);
      
      onHistoryAdd?.({
        toolId: 'yaml-json-converter',
        input: `${inputFormat.toUpperCase()} text`,
        output: t('yamlJsonConverter.history.converted').replace('{format}', inputFormat === 'yaml' ? 'JSON' : 'YAML')
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('yamlJsonConverter.error.conversionFailed');
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
    const sampleYaml = t('yamlJsonConverter.sample.yaml');

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
                {t('yamlJsonConverter.label.inputFormat')}:
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
              ⇄ {t('yamlJsonConverter.button.switchFormat')}
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button onClick={insertSampleYaml} variant="outline" size="sm">
              {t('yamlJsonConverter.button.yamlSample')}
            </Button>
            <Button onClick={insertSampleJson} variant="outline" size="sm">
              {t('yamlJsonConverter.button.jsonSample')}
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm">
              {t('yamlJsonConverter.button.clear')}
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('yamlJsonConverter.label.input').replace('{format}', inputFormat === 'yaml' ? 'YAML' : 'JSON')}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={t('yamlJsonConverter.placeholder.input').replace('{format}', inputFormat === 'yaml' ? 'YAML' : 'JSON')}
            rows={12}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-y"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">
              <strong>{t('yamlJsonConverter.label.error')}:</strong> {error}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('yamlJsonConverter.label.output').replace('{format}', inputFormat === 'yaml' ? 'JSON' : 'YAML')}
          </h3>
          <div className="flex space-x-2">
            <Button onClick={handleConvert} variant="outline" size="sm">
              {t('yamlJsonConverter.button.convert')}
            </Button>
            <Button 
              onClick={handleCopy} 
              variant="outline" 
              size="sm"
              disabled={!outputText}
            >
              {isCopied ? t('yamlJsonConverter.button.copied') : t('yamlJsonConverter.button.copy')}
            </Button>
          </div>
        </div>

        <textarea
          value={outputText}
          readOnly
          placeholder={t('yamlJsonConverter.placeholder.output').replace('{format}', inputFormat === 'yaml' ? 'JSON' : 'YAML')}
          rows={12}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-y"
        />

        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>{t('yamlJsonConverter.features.title')}:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>{t('yamlJsonConverter.features.yamlToJson')}:</strong> {t('yamlJsonConverter.features.yamlToJsonDesc')}</li>
            <li><strong>{t('yamlJsonConverter.features.jsonToYaml')}:</strong> {t('yamlJsonConverter.features.jsonToYamlDesc')}</li>
            <li><strong>{t('yamlJsonConverter.features.realtime')}:</strong> {t('yamlJsonConverter.features.realtimeDesc')}</li>
            <li><strong>{t('yamlJsonConverter.features.switch')}:</strong> {t('yamlJsonConverter.features.switchDesc')}</li>
            <li><strong>{t('yamlJsonConverter.features.errorDetection')}:</strong> {t('yamlJsonConverter.features.errorDetectionDesc')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}