import { useState, useEffect } from 'react';
import { Clock, Calendar, Copy, RotateCcw, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

export function DateTimeFormatter({ onHistoryAdd }: ToolProps) {
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState<'unix' | 'iso' | 'local'>('unix');
  const [unixTime, setUnixTime] = useState<number | null>(null);
  const [isoTime, setIsoTime] = useState<string>('');
  const [localTime, setLocalTime] = useState<string>('');
  const [japanTime, setJapanTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  const formatLocalTime = (date: Date): string => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatJapanTime = (date: Date): string => {
    return date.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatUTCTime = (date: Date): string => {
    return date.toLocaleString('ja-JP', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const parseAndConvert = (value: string, type: 'unix' | 'iso' | 'local') => {
    if (!value.trim()) {
      setError('');
      setUnixTime(null);
      setIsoTime('');
      setLocalTime('');
      setJapanTime('');
      setUtcTime('');
      return;
    }

    try {
      let date: Date;

      switch (type) {
        case 'unix':
          const timestamp = parseFloat(value);
          if (isNaN(timestamp)) {
            throw new Error(t('datetimeFormatter.error.invalidUnix'));
          }
          // 秒とミリ秒を自動判定
          date = timestamp > 1e10 ? new Date(timestamp) : new Date(timestamp * 1000);
          break;

        case 'iso':
          date = new Date(value);
          if (isNaN(date.getTime())) {
            throw new Error(t('datetimeFormatter.error.invalidISO'));
          }
          break;

        case 'local':
          date = new Date(value);
          if (isNaN(date.getTime())) {
            throw new Error(t('datetimeFormatter.error.invalidDate'));
          }
          break;

        default:
          throw new Error(t('datetimeFormatter.error.unknownType'));
      }

      if (isNaN(date.getTime())) {
        throw new Error(t('datetimeFormatter.error.invalidDateTime'));
      }

      // 全フォーマットに変換
      setUnixTime(Math.floor(date.getTime() / 1000));
      setIsoTime(date.toISOString());
      setLocalTime(formatLocalTime(date));
      setJapanTime(formatJapanTime(date));
      setUtcTime(formatUTCTime(date));
      setError('');

      onHistoryAdd?.({
        toolId: 'datetime-formatter',
        input: `${value} (${type})`,
        output: t('datetimeFormatter.historyOutput').replace('{iso}', date.toISOString())
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : t('datetimeFormatter.error.conversion'));
      setUnixTime(null);
      setIsoTime('');
      setLocalTime('');
      setJapanTime('');
      setUtcTime('');
    }
  };

  useEffect(() => {
    parseAndConvert(inputValue, inputType);
  }, [inputValue, inputType]);

  const handleCopy = (text: string) => {
    copyToClipboard(text);
  };

  const handleReset = () => {
    setInputValue('');
  };

  const insertCurrentTime = () => {
    const now = new Date();
    switch (inputType) {
      case 'unix':
        setInputValue(Math.floor(now.getTime() / 1000).toString());
        break;
      case 'iso':
        setInputValue(now.toISOString());
        break;
      case 'local':
        setInputValue(now.toLocaleString('sv-SE')); // YYYY-MM-DD HH:mm:ss format
        break;
    }
  };

  const formatSamples = {
    unix: ['1703030400', '1703030400000'],
    iso: ['2023-12-20T00:00:00.000Z', '2023-12-20T09:00:00+09:00'],
    local: ['2023-12-20 09:00:00', '2023/12/20 9:00:00']
  };

  return (
    <div className="space-y-6">
      {/* 入力タイプ選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('datetimeFormatter.inputFormat.label')}
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={inputType === 'unix' ? 'primary' : 'outline'}
            onClick={() => setInputType('unix')}
          >
            {t('datetimeFormatter.format.unix')}
          </Button>
          <Button
            size="sm"
            variant={inputType === 'iso' ? 'primary' : 'outline'}
            onClick={() => setInputType('iso')}
          >
            {t('datetimeFormatter.format.iso')}
          </Button>
          <Button
            size="sm"
            variant={inputType === 'local' ? 'primary' : 'outline'}
            onClick={() => setInputType('local')}
          >
            {t('datetimeFormatter.format.local')}
          </Button>
        </div>
      </div>

      {/* 入力エリア */}
      <div>
        <label htmlFor="datetime-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('datetimeFormatter.input.label')}
        </label>
        <input
          id="datetime-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`例: ${formatSamples[inputType][0]}`}
          className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            error ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {/* フォーマット例 */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <p>{t('datetimeFormatter.supportedFormats').replace('{formats}', formatSamples[inputType].join(', '))}</p>
        </div>
      </div>

      {/* 変換結果 */}
      {(unixTime !== null || isoTime || localTime) && !error && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('datetimeFormatter.result.title')}</h3>
          
          {/* Unix Time */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('datetimeFormatter.unix.title')}
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(unixTime?.toString() || '')}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="font-mono text-lg text-gray-900 dark:text-white">
              {unixTime}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('datetimeFormatter.unix.milliseconds').replace('{ms}', unixTime ? (unixTime * 1000).toString() : '')}
            </div>
          </div>

          {/* ISO8601 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('datetimeFormatter.iso.title')}
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(isoTime)}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="font-mono text-lg text-gray-900 dark:text-white break-all">
              {isoTime}
            </div>
          </div>

          {/* ローカル時刻 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('datetimeFormatter.local.title')}
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(localTime)}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="font-mono text-lg text-gray-900 dark:text-white">
              {localTime}
            </div>
          </div>

          {/* 日本時間 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('datetimeFormatter.japan.title')}
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(japanTime)}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="font-mono text-lg text-gray-900 dark:text-white">
              {japanTime}
            </div>
          </div>

          {/* UTC時刻 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('datetimeFormatter.utc.title')}
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(utcTime)}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="font-mono text-lg text-gray-900 dark:text-white">
              {utcTime}
            </div>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button onClick={insertCurrentTime}>
          <Clock className="w-4 h-4 mr-1" />
          {t('datetimeFormatter.insertCurrent')}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('datetimeFormatter.reset')}
        </Button>
      </div>
    </div>
  );
}