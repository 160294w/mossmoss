import { useState, useEffect } from 'react';
import { Calendar, Copy, RotateCcw, Check, Info } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

interface CronField {
  minutes: string;
  hours: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export function CronParser({ onHistoryAdd }: ToolProps) {
  const [cronExpression, setCronExpression] = useState('0 9 * * 1-5');
  const [cronFields, setCronFields] = useState<CronField | null>(null);
  const [description, setDescription] = useState<string>('');
  const [nextRuns, setNextRuns] = useState<Date[]>([]);
  const [error, setError] = useState<string>('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  // Cronフィールドの説明マップ
  const cronFieldDescriptions = {
    minutes: { name: t('cronParser.field.minute'), range: '0-59', special: '* , - /' },
    hours: { name: t('cronParser.field.hour'), range: '0-23', special: '* , - /' },
    dayOfMonth: { name: t('cronParser.field.day'), range: '1-31', special: '* , - / ? L W' },
    month: { name: t('cronParser.field.month'), range: '1-12', special: '* , - /' },
    dayOfWeek: { name: t('cronParser.field.weekday'), range: '0-7 (日-土)', special: '* , - / ? L #' }
  };

  // 曜日名の変換
  const dayOfWeekNames = [
    t('cronParser.dayName.0'), t('cronParser.dayName.1'), t('cronParser.dayName.2'), 
    t('cronParser.dayName.3'), t('cronParser.dayName.4'), t('cronParser.dayName.5'), t('cronParser.dayName.6')
  ];
  const monthNames = [
    t('cronParser.monthName.1'), t('cronParser.monthName.2'), t('cronParser.monthName.3'),
    t('cronParser.monthName.4'), t('cronParser.monthName.5'), t('cronParser.monthName.6'),
    t('cronParser.monthName.7'), t('cronParser.monthName.8'), t('cronParser.monthName.9'),
    t('cronParser.monthName.10'), t('cronParser.monthName.11'), t('cronParser.monthName.12')
  ];

  // Cron式の解析
  const parseCronExpression = (expression: string): CronField | null => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error(t('cronParser.error.invalidFormat'));
    }

    return {
      minutes: parts[0],
      hours: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4]
    };
  };

  // フィールドの説明生成
  const generateFieldDescription = (field: string, type: keyof CronField): string => {
    if (field === '*') {
      switch (type) {
        case 'minutes': return t('cronParser.desc.everyMinute');
        case 'hours': return t('cronParser.desc.everyHour');
        case 'dayOfMonth': return t('cronParser.desc.everyDay');
        case 'month': return t('cronParser.desc.everyMonth');
        case 'dayOfWeek': return t('cronParser.desc.everyDay');
        default: return t('cronParser.desc.every');
      }
    }

    if (field.includes(',')) {
      const values = field.split(',');
      if (type === 'dayOfWeek') {
        return values.map(v => dayOfWeekNames[parseInt(v) % 7] || v).join(', ');
      }
      if (type === 'month') {
        return values.map(v => monthNames[parseInt(v) - 1] || v).join(', ');
      }
      return values.join(', ');
    }

    if (field.includes('-')) {
      const [start, end] = field.split('-');
      if (type === 'dayOfWeek') {
        return `${dayOfWeekNames[parseInt(start) % 7]}${t('cronParser.desc.from')}${dayOfWeekNames[parseInt(end) % 7]}`;
      }
      if (type === 'month') {
        return `${monthNames[parseInt(start) - 1]}${t('cronParser.desc.from')}${monthNames[parseInt(end) - 1]}`;
      }
      return `${start}${t('cronParser.desc.from')}${end}`;
    }

    if (field.includes('/')) {
      const [base, step] = field.split('/');
      const baseDesc = base === '*' ? '' : `${base}${t('cronParser.desc.from')}`;
      switch (type) {
        case 'minutes': return `${baseDesc}${step}${t('cronParser.desc.intervalMinute')}`;
        case 'hours': return `${baseDesc}${step}${t('cronParser.desc.intervalHour')}`;
        case 'dayOfMonth': return `${baseDesc}${step}${t('cronParser.desc.intervalDay')}`;
        case 'month': return `${baseDesc}${step}${t('cronParser.desc.intervalMonth')}`;
        case 'dayOfWeek': return `${baseDesc}${step}${t('cronParser.desc.intervalWeekday')}`;
        default: return `${baseDesc}${step}${t('cronParser.desc.interval')}`;
      }
    }

    // 単一の値
    if (type === 'dayOfWeek') {
      return dayOfWeekNames[parseInt(field) % 7] || field;
    }
    if (type === 'month') {
      return monthNames[parseInt(field) - 1] || field;
    }
    if (type === 'minutes') {
      return `${field}${t('cronParser.desc.minute')}`;
    }
    if (type === 'hours') {
      return `${field}${t('cronParser.desc.hour')}`;
    }

    return field;
  };

  // 日本語の説明生成
  const generateDescription = (fields: CronField): string => {
    const minuteDesc = generateFieldDescription(fields.minutes, 'minutes');
    const hourDesc = generateFieldDescription(fields.hours, 'hours');
    const dayDesc = generateFieldDescription(fields.dayOfMonth, 'dayOfMonth');
    const monthDesc = generateFieldDescription(fields.month, 'month');
    const weekDesc = generateFieldDescription(fields.dayOfWeek, 'dayOfWeek');

    // 基本的な組み合わせパターン
    if (fields.minutes !== '*' && fields.hours !== '*' && fields.dayOfMonth === '*' && fields.month === '*' && fields.dayOfWeek !== '*') {
      return `${weekDesc}の${hourDesc}${minuteDesc}に実行`;
    }

    if (fields.minutes !== '*' && fields.hours !== '*' && fields.dayOfMonth !== '*' && fields.month === '*' && fields.dayOfWeek === '*') {
      return `毎月${dayDesc}の${hourDesc}${minuteDesc}に実行`;
    }

    if (fields.minutes !== '*' && fields.hours !== '*' && fields.dayOfMonth === '*' && fields.month === '*' && fields.dayOfWeek === '*') {
      return `毎日${hourDesc}${minuteDesc}に実行`;
    }

    // 複雑な組み合わせ
    let desc = '';
    if (fields.month !== '*') desc += `${monthDesc}の`;
    if (fields.dayOfMonth !== '*' && fields.dayOfWeek !== '*') {
      desc += `${dayDesc}または${weekDesc}の`;
    } else if (fields.dayOfMonth !== '*') {
      desc += `${dayDesc}の`;
    } else if (fields.dayOfWeek !== '*') {
      desc += `${weekDesc}の`;
    }
    if (fields.hours !== '*') desc += `${hourDesc}`;
    if (fields.minutes !== '*') desc += `${minuteDesc}`;
    desc += 'に実行';

    return desc;
  };

  // 次回実行日時の計算（簡易版）
  const calculateNextRuns = (fields: CronField, count: number = 5): Date[] => {
    const results: Date[] = [];
    const now = new Date();
    const candidate = new Date(now);
    candidate.setSeconds(0, 0);

    for (let i = 0; i < 1000 && results.length < count; i++) {
      candidate.setTime(candidate.getTime() + 60000); // 1分ずつ進める

      // 分をチェック
      if (fields.minutes !== '*' && !matchesCronField(fields.minutes, candidate.getMinutes())) {
        continue;
      }

      // 時をチェック  
      if (fields.hours !== '*' && !matchesCronField(fields.hours, candidate.getHours())) {
        continue;
      }

      // 日をチェック
      if (fields.dayOfMonth !== '*' && !matchesCronField(fields.dayOfMonth, candidate.getDate())) {
        continue;
      }

      // 月をチェック
      if (fields.month !== '*' && !matchesCronField(fields.month, candidate.getMonth() + 1)) {
        continue;
      }

      // 曜日をチェック
      if (fields.dayOfWeek !== '*' && !matchesCronField(fields.dayOfWeek, candidate.getDay())) {
        continue;
      }

      results.push(new Date(candidate));
    }

    return results;
  };

  // Cronフィールドとの一致判定
  const matchesCronField = (field: string, value: number): boolean => {
    if (field === '*') return true;

    if (field.includes(',')) {
      return field.split(',').some(part => matchesCronField(part.trim(), value));
    }

    if (field.includes('/')) {
      const [base, step] = field.split('/');
      const stepNum = parseInt(step);
      if (base === '*') {
        return value % stepNum === 0;
      }
      const baseNum = parseInt(base);
      return value >= baseNum && (value - baseNum) % stepNum === 0;
    }

    if (field.includes('-')) {
      const [start, end] = field.split('-');
      const startNum = parseInt(start);
      const endNum = parseInt(end);
      return value >= startNum && value <= endNum;
    }

    return value === parseInt(field);
  };

  useEffect(() => {
    try {
      const fields = parseCronExpression(cronExpression);
      setCronFields(fields);
      
      if (fields) {
        const desc = generateDescription(fields);
        setDescription(desc);
        
        const next = calculateNextRuns(fields);
        setNextRuns(next);
      }
      
      setError('');

      onHistoryAdd?.({
        toolId: 'cron-parser',
        input: cronExpression,
        output: description || t('cronParser.historyOutput')
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : t('cronParser.error.parseFailed'));
      setCronFields(null);
      setDescription('');
      setNextRuns([]);
    }
  }, [cronExpression]);

  const handleCopy = (text: string) => {
    copyToClipboard(text);
  };

  const handleReset = () => {
    setCronExpression('0 9 * * 1-5');
  };

  const sampleExpressions = [
    { expr: '0 9 * * 1-5', desc: t('cronParser.sample.weekdays') },
    { expr: '0 */2 * * *', desc: t('cronParser.sample.every2hours') },
    { expr: '30 1 1 * *', desc: t('cronParser.sample.monthly') },
    { expr: '0 0 * * 0', desc: t('cronParser.sample.sunday') },
    { expr: '*/15 * * * *', desc: t('cronParser.sample.every15min') }
  ];

  return (
    <div className="space-y-6">
      {/* 入力エリア */}
      <div>
        <label htmlFor="cron-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('cronParser.input.label')}
        </label>
        <input
          id="cron-input"
          type="text"
          value={cronExpression}
          onChange={(e) => setCronExpression(e.target.value)}
          placeholder={t('cronParser.input.placeholder')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono ${
            error ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {/* フィールド説明 */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <p>{t('cronParser.format')}</p>
        </div>
      </div>

      {/* Cronフィールド解析結果 */}
      {cronFields && !error && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('cronParser.fields.title')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(cronFields).map(([key, value]) => {
              const fieldKey = key as keyof CronField;
              const fieldInfo = cronFieldDescriptions[fieldKey];
              return (
                <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {fieldInfo.name}
                  </h4>
                  <div className="font-mono text-lg text-gray-900 dark:text-white">
                    {value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {generateFieldDescription(value, fieldKey)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 説明 */}
      {description && !error && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('cronParser.schedule.title')}
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(description)}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-blue-800 dark:text-blue-200 text-lg">
            {description}
          </p>
        </div>
      )}

      {/* 次回実行日時 */}
      {nextRuns.length > 0 && !error && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t('cronParser.nextRuns.title')}
          </h3>
          
          <div className="space-y-2">
            {nextRuns.map((date, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-mono text-lg text-gray-900 dark:text-white">
                    {date.toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      weekday: 'short'
                    })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {index === 0 ? t('cronParser.nextRun') : t('cronParser.runCount').replace('{count}', (index + 1).toString())}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(date.toISOString())}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* サンプル */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('cronParser.samples.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sampleExpressions.map((sample, index) => (
            <button
              key={index}
              onClick={() => setCronExpression(sample.expr)}
              className="text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-mono text-sm text-gray-900 dark:text-white">
                {sample.expr}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {sample.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('cronParser.reset')}
        </Button>
      </div>
    </div>
  );
}