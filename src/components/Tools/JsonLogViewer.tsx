import { useState, useEffect, useMemo } from 'react';
import { FileText, Search, Filter, Download, Copy, RotateCcw, Check, Eye, EyeOff, Calendar, AlertCircle, Info, CheckCircle, XCircle, Zap } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

interface LogEntry {
  timestamp?: string;
  level?: string;
  message?: string;
  [key: string]: any;
  _raw: string;
  _formatted: string;
  _index: number;
}

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

export function JsonLogViewer({ onHistoryAdd }: ToolProps) {
  const [rawLogs, setRawLogs] = useState('');
  const [parsedLogs, setParsedLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [showLevel, setShowLevel] = useState(true);
  const [showMessage, setShowMessage] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const [maxLines, setMaxLines] = useState(1000);
  const [error, setError] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  // ログレベルの色とアイコンのマップ
  const logLevelConfig: Record<LogLevel, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
    error: { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20', icon: XCircle },
    warn: { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', icon: AlertCircle },
    info: { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20', icon: Info },
    debug: { color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-800/50', icon: CheckCircle },
    trace: { color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20', icon: Zap }
  };

  // ログの解析
  const parseLogLines = (logs: string): LogEntry[] => {
    if (!logs.trim()) return [];

    const lines = logs.split('\n').filter(line => line.trim());
    const entries: LogEntry[] = [];

    lines.forEach((line, index) => {
      if (index >= maxLines) return;

      try {
        // JSON形式のログを解析
        const jsonLog = JSON.parse(line);
        
        // 一般的なログフィールドを抽出
        const entry: LogEntry = {
          ...jsonLog,
          _raw: line,
          _formatted: JSON.stringify(jsonLog, null, 2),
          _index: index
        };

        // タイムスタンプの正規化
        if (jsonLog.timestamp || jsonLog.time || jsonLog.ts || jsonLog['@timestamp']) {
          entry.timestamp = jsonLog.timestamp || jsonLog.time || jsonLog.ts || jsonLog['@timestamp'];
        }

        // ログレベルの正規化
        if (jsonLog.level || jsonLog.severity || jsonLog.priority) {
          const level = (jsonLog.level || jsonLog.severity || jsonLog.priority).toString().toLowerCase();
          entry.level = level;
        }

        // メッセージの抽出
        if (jsonLog.message || jsonLog.msg || jsonLog.text) {
          entry.message = jsonLog.message || jsonLog.msg || jsonLog.text;
        }

        entries.push(entry);

      } catch (err) {
        // JSON以外の行は生ログとして扱う
        entries.push({
          message: line,
          level: 'info',
          timestamp: new Date().toISOString(),
          _raw: line,
          _formatted: line,
          _index: index
        });
      }
    });

    return entries;
  };

  // タイムスタンプのフォーマット
  const formatTimestamp = (timestamp: string | undefined): string => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // Unix timestampの場合
        const unixTime = parseInt(timestamp);
        if (!isNaN(unixTime)) {
          const unixDate = unixTime > 1e10 ? new Date(unixTime) : new Date(unixTime * 1000);
          return unixDate.toLocaleString('ja-JP', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }
        return timestamp;
      }
      
      return date.toLocaleString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  // ログの解析と更新
  useEffect(() => {
    try {
      const logs = parseLogLines(rawLogs);
      setParsedLogs(logs);
      setError('');

      if (logs.length > 0) {
        onHistoryAdd?.({
          toolId: 'json-log-viewer',
          input: t('jsonLogViewer.historyInput', { count: logs.length }),
          output: t('jsonLogViewer.historyOutput', { 
            errors: logs.filter(l => l.level === 'error').length, 
            warnings: logs.filter(l => l.level === 'warn').length 
          })
        });
      }
    } catch (err) {
      setError(t('jsonLogViewer.error.parsing'));
    }
  }, [rawLogs, maxLines]);

  // フィルタリングと検索
  const filteredLogs = useMemo(() => {
    let filtered = parsedLogs;

    // レベルフィルタ
    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel);
    }

    // 検索クエリ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message?.toLowerCase().includes(query) ||
        log._raw.toLowerCase().includes(query) ||
        JSON.stringify(log).toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [parsedLogs, filterLevel, searchQuery]);

  // 統計情報
  const stats = useMemo(() => {
    const total = parsedLogs.length;
    const levels = parsedLogs.reduce((acc, log) => {
      const level = log.level || 'unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, levels };
  }, [parsedLogs]);

  const handleCopy = (text: string) => {
    copyToClipboard(text);
  };

  const handleReset = () => {
    setRawLogs('');
    setParsedLogs([]);
    setSearchQuery('');
    setFilterLevel('all');
    setError('');
  };

  const insertSampleLogs = () => {
    const sampleLogs = [
      '{"timestamp":"2023-12-20T09:15:23.456Z","level":"info","message":"Application started successfully","service":"api-server","port":3000}',
      '{"timestamp":"2023-12-20T09:15:45.123Z","level":"debug","message":"Database connection established","service":"api-server","database":"mongodb"}',
      '{"timestamp":"2023-12-20T09:16:12.789Z","level":"warn","message":"High memory usage detected","service":"api-server","memory_usage":"85%","threshold":"80%"}',
      '{"timestamp":"2023-12-20T09:16:30.234Z","level":"error","message":"Failed to process user request","service":"api-server","user_id":"12345","error":"Connection timeout","stack_trace":"Error at line 42"}',
      '{"timestamp":"2023-12-20T09:17:01.567Z","level":"info","message":"User logged in","service":"auth-service","user_id":"67890","ip_address":"192.168.1.100"}',
      '{"timestamp":"2023-12-20T09:17:15.890Z","level":"trace","message":"Cache hit for user profile","service":"api-server","user_id":"67890","cache_key":"profile:67890","response_time":"2ms"}',
      '{"timestamp":"2023-12-20T09:17:30.012Z","level":"error","message":"Payment processing failed","service":"payment-service","transaction_id":"tx_abc123","amount":1500,"currency":"JPY","error_code":"INSUFFICIENT_FUNDS"}',
      '{"timestamp":"2023-12-20T09:18:00.345Z","level":"info","message":"Scheduled backup completed","service":"backup-service","backup_size":"2.3GB","duration":"45s","status":"success"}'
    ].join('\n');
    
    setRawLogs(sampleLogs);
  };

  const exportLogs = () => {
    const exportData = filteredLogs.map(log => {
      const exportLog: any = { ...log };
      delete exportLog._raw;
      delete exportLog._formatted;
      delete exportLog._index;
      return exportLog;
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 設定パネル */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('jsonLogViewer.settings.title')}</h3>
        
        {/* 表示フィールド選択 */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showTimestamp}
              onChange={(e) => setShowTimestamp(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <Calendar className="w-4 h-4 ml-2 mr-1" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('jsonLogViewer.settings.timestamp')}</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showLevel}
              onChange={(e) => setShowLevel(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <AlertCircle className="w-4 h-4 ml-2 mr-1" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('jsonLogViewer.settings.level')}</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showMessage}
              onChange={(e) => setShowMessage(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <FileText className="w-4 h-4 ml-2 mr-1" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('jsonLogViewer.settings.message')}</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showRaw}
              onChange={(e) => setShowRaw(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            {showRaw ? <EyeOff className="w-4 h-4 ml-2 mr-1" /> : <Eye className="w-4 h-4 ml-2 mr-1" />}
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('jsonLogViewer.settings.showRaw')}</span>
          </label>
        </div>

        {/* フィルタと検索 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('jsonLogViewer.filter.level')}</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'all')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{t('jsonLogViewer.filter.all')}</option>
              <option value="error">{t('jsonLogViewer.filter.error')}</option>
              <option value="warn">{t('jsonLogViewer.filter.warn')}</option>
              <option value="info">{t('jsonLogViewer.filter.info')}</option>
              <option value="debug">{t('jsonLogViewer.filter.debug')}</option>
              <option value="trace">{t('jsonLogViewer.filter.trace')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('jsonLogViewer.search.label')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('jsonLogViewer.search.placeholder')}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('jsonLogViewer.maxLines')}</label>
            <input
              type="number"
              value={maxLines}
              onChange={(e) => setMaxLines(parseInt(e.target.value) || 1000)}
              min="100"
              max="10000"
              step="100"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      {stats.total > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('jsonLogViewer.stats.title')}</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('jsonLogViewer.stats.totalLines')} </span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">{stats.total}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('jsonLogViewer.stats.showing')} </span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">{filteredLogs.length}</span>
            </div>
            {Object.entries(stats.levels).map(([level, count]) => {
              const config = logLevelConfig[level as LogLevel];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <div key={level} className="flex items-center gap-1">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="capitalize text-gray-500 dark:text-gray-400">{level}: </span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 入力エリア */}
      <div>
        <label htmlFor="json-logs" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('jsonLogViewer.input.label')}
        </label>
        <textarea
          id="json-logs"
          value={rawLogs}
          onChange={(e) => setRawLogs(e.target.value)}
          placeholder={t('jsonLogViewer.input.placeholder')}
          rows={6}
          className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-y ${
            error ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* ログ表示エリア */}
      {filteredLogs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('jsonLogViewer.results.title', { count: filteredLogs.length })}
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={exportLogs}
              >
                <Download className="w-4 h-4 mr-1" />
                {t('jsonLogViewer.export')}
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {filteredLogs.map((log, index) => {
                const levelConfig = logLevelConfig[log.level as LogLevel];
                const Icon = levelConfig?.icon || Info;
                
                return (
                  <div
                    key={`${log._index}-${index}`}
                    className={`px-4 py-2 border-b border-gray-700 last:border-b-0 hover:bg-gray-800 dark:hover:bg-gray-700 ${
                      levelConfig?.bgColor || 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* ログレベルアイコン */}
                      {showLevel && (
                        <div className="flex-shrink-0 mt-0.5">
                          <Icon className={`w-4 h-4 ${levelConfig?.color || 'text-gray-400'}`} />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {/* タイムスタンプ */}
                          {showTimestamp && log.timestamp && (
                            <span className="font-mono text-green-400 bg-gray-800 px-2 py-0.5 rounded text-xs">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          )}
                          
                          {/* ログレベル */}
                          {showLevel && log.level && (
                            <span className={`font-mono px-2 py-0.5 rounded text-xs uppercase font-semibold ${
                              levelConfig?.color || 'text-gray-400'
                            }`}>
                              {log.level}
                            </span>
                          )}
                        </div>
                        
                        {/* メッセージ */}
                        {showMessage && log.message && (
                          <div className="mt-1 text-white font-mono text-sm leading-relaxed">
                            {log.message}
                          </div>
                        )}
                        
                        {/* 追加フィールド */}
                        {Object.entries(log).filter(([key]) => 
                          !['timestamp', 'level', 'message', '_raw', '_formatted', '_index'].includes(key)
                        ).length > 0 && (
                          <div className="mt-2 text-xs">
                            {Object.entries(log)
                              .filter(([key]) => !['timestamp', 'level', 'message', '_raw', '_formatted', '_index'].includes(key))
                              .map(([key, value]) => (
                                <span key={key} className="inline-block mr-3 mb-1">
                                  <span className="text-blue-400">{key}:</span>
                                  <span className="text-yellow-400 ml-1">{JSON.stringify(value)}</span>
                                </span>
                              ))
                            }
                          </div>
                        )}
                        
                        {/* 生ログ表示 */}
                        {showRaw && (
                          <div className="mt-2">
                            <details className="group">
                              <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-300">
                                {t('jsonLogViewer.showRawLog')}
                              </summary>
                              <pre className="mt-1 text-xs text-gray-300 bg-gray-900 p-2 rounded overflow-x-auto">
                                {log._raw}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                      
                      {/* コピーボタン */}
                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(showRaw ? log._raw : log._formatted)}
                          className="opacity-60 hover:opacity-100"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button onClick={insertSampleLogs}>
          <FileText className="w-4 h-4 mr-1" />
          {t('jsonLogViewer.insertSample')}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('jsonLogViewer.reset')}
        </Button>
      </div>
    </div>
  );
}