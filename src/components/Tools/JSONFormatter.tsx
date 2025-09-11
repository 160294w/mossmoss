import { useState, useEffect } from 'react';
import { AlertTriangle, Check, Copy, RotateCcw } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { HologramProjection } from '../Effects/HologramProjection';
import { MagneticAttraction } from '../Effects/MagneticAttraction';

export function JSONFormatter() {
  const [inputJSON, setInputJSON] = useState('');
  const [outputJSON, setOutputJSON] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [isValid, setIsValid] = useState(false);
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

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
      const errorMessage = err instanceof Error ? err.message : t('jsonFormatter.error.title');
      return { formatted: '', error: errorMessage, valid: false };
    }
  };

  // リアルタイムフォーマット
  useEffect(() => {
    const result = formatJSON(inputJSON, indentSize);
    setOutputJSON(result.formatted);
    setError(result.error);
    setIsValid(result.valid);
  }, [inputJSON, indentSize]);

  // ミニファイ（圧縮）
  const minifyJSON = () => {
    if (!isValid || !inputJSON.trim()) return;
    
    try {
      const parsed = JSON.parse(inputJSON);
      const minified = JSON.stringify(parsed);
      setOutputJSON(minified);
      
      // インデント設定を0に変更して、リアルタイム更新を無効化
      setIndentSize(0);
    } catch (err) {
      // エラーが発生した場合は何もしない
      console.error('Minify error:', err);
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
    // 整形済み（2スペースインデント）でJSONを挿入
    setInputJSON(JSON.stringify(sampleJSON, null, 2));
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
            {t('jsonFormatter.settings.indent')}:
          </label>
          <select
            id="indent-size"
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={2}>{t('jsonFormatter.settings.twoSpaces')}</option>
            <option value={4}>{t('jsonFormatter.settings.fourSpaces')}</option>
            <option value={1}>{t('jsonFormatter.settings.tab')}</option>
          </select>
        </div>

        <div className="flex gap-2">
          <MagneticAttraction strength="medium" range={80}>
            <Button size="sm" variant="outline" onClick={minifyJSON} disabled={!isValid}>
              {t('jsonFormatter.button.compress')}
            </Button>
          </MagneticAttraction>
          <MagneticAttraction strength="medium" range={80}>
            <Button size="sm" variant="outline" onClick={insertSample}>
              {t('jsonFormatter.button.insertSample')}
            </Button>
          </MagneticAttraction>
        </div>
      </div>

      {/* 入力エリア */}
      <div>
        <label htmlFor="input-json" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('jsonFormatter.input.label')}
        </label>
        <textarea
          id="input-json"
          value={inputJSON}
          onChange={(e) => setInputJSON(e.target.value)}
          placeholder={t('jsonFormatter.input.placeholder')}
          className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y font-mono text-sm"
        />
        
        {/* エラー表示 */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
              <div className="text-sm">
                <div className="font-medium text-red-800 dark:text-red-200 mb-1">{t('jsonFormatter.error.title')}</div>
                <div className="text-red-600 dark:text-red-300 font-mono">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* 成功表示 */}
        {isValid && !error && inputJSON && (
          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center text-sm text-green-800 dark:text-green-200">
              <Check className="w-4 h-4 mr-2" />
              {t('jsonFormatter.success')}
            </div>
          </div>
        )}
      </div>

      {/* 出力エリア - ホログラム表示 */}
      <div>
        <label htmlFor="output-json" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('jsonFormatter.output.label')}
        </label>
        {outputJSON ? (
          <HologramProjection isActive={!!outputJSON} glitchIntensity="low">
            <textarea
              id="output-json"
              value={outputJSON}
              readOnly
              className="w-full h-48 px-3 py-2 border border-cyan-400 rounded-md shadow-sm bg-black text-cyan-100 resize-y font-mono text-sm"
            />
          </HologramProjection>
        ) : (
          <textarea
            id="output-json"
            value={outputJSON}
            readOnly
            className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white resize-y font-mono text-sm"
          />
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <MagneticAttraction strength="medium" range={100}>
          <Button 
            onClick={handleCopy} 
            disabled={!outputJSON}
            className="flex items-center gap-2"
          >
            {isCopied ? (
              <><Check className="w-4 h-4 mr-1" /> {t('jsonFormatter.copied')}</>
            ) : (
              <><Copy className="w-4 h-4 mr-1" /> {t('jsonFormatter.button.copyResult')}</>
            )}
          </Button>
        </MagneticAttraction>
        <MagneticAttraction strength="medium" range={80}>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!inputJSON}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            {t('jsonFormatter.button.reset')}
          </Button>
        </MagneticAttraction>
      </div>

      {/* JSON統計情報 - ホログラム表示 */}
      {stats && (
        <HologramProjection isActive={!!stats} glitchIntensity="low">
          <div className="bg-gray-900 bg-opacity-80 border border-cyan-400 rounded-lg p-4">
            <h3 className="text-sm font-medium text-cyan-300 mb-3">{t('jsonFormatter.stats.title')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold text-cyan-100">{stats.size}B</div>
              <div className="text-cyan-400">{t('jsonFormatter.stats.originalSize')}</div>
            </div>
            <div>
              <div className="font-semibold text-cyan-100">{stats.formattedSize}B</div>
              <div className="text-cyan-400">{t('jsonFormatter.stats.formattedSize')}</div>
            </div>
            <div>
              <div className="font-semibold text-cyan-100">{stats.objects}</div>
              <div className="text-cyan-400">{t('jsonFormatter.stats.objects')}</div>
            </div>
            <div>
              <div className="font-semibold text-cyan-100">{stats.arrays}</div>
              <div className="text-cyan-400">{t('jsonFormatter.stats.arrays')}</div>
            </div>
            <div>
              <div className="font-semibold text-cyan-100">{stats.keys}</div>
              <div className="text-cyan-400">{t('jsonFormatter.stats.keys')}</div>
            </div>
            <div>
              <div className="font-semibold text-cyan-100">{stats.strings}</div>
              <div className="text-cyan-400">{t('jsonFormatter.stats.strings')}</div>
            </div>
            <div>
              <div className="font-semibold text-cyan-100">{stats.numbers}</div>
              <div className="text-cyan-400">{t('jsonFormatter.stats.numbers')}</div>
            </div>
            <div>
              <div className="font-semibold text-cyan-100">{stats.booleans}</div>
              <div className="text-cyan-400">{t('jsonFormatter.stats.booleans')}</div>
            </div>
          </div>
        </div>
        </HologramProjection>
      )}

      {/* 使用例 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('jsonFormatter.usage.title')}</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• {t('jsonFormatter.usage.step1')}</li>
          <li>• {t('jsonFormatter.usage.step2')}</li>
          <li>• {t('jsonFormatter.usage.step3')}</li>
          <li>• {t('jsonFormatter.usage.step4')}</li>
        </ul>
      </div>
    </div>
  );
}