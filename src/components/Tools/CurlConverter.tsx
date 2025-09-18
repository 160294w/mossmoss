import { useState, useEffect } from 'react';
import { Terminal, Globe, Copy, RotateCcw, Check, ArrowLeftRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

interface HttpRequest {
  method: string;
  url: string;
  headers: { [key: string]: string };
  body?: string;
}

export function CurlConverter({ onHistoryAdd }: ToolProps) {
  const [mode, setMode] = useState<'curl-to-http' | 'http-to-curl'>('curl-to-http');
  const [curlInput, setCurlInput] = useState('');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [httpUrl, setHttpUrl] = useState('');
  const [httpHeaders, setHttpHeaders] = useState('');
  const [httpBody, setHttpBody] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  // curlコマンドからHTTPリクエストへ変換
  const parseCurlCommand = (curl: string): HttpRequest => {
    const request: HttpRequest = {
      method: 'GET',
      url: '',
      headers: {}
    };

    // 基本的なcurlコマンドの解析
    const lines = curl.trim().split(/\\\s*\n|\n/).map(line => line.trim());
    const fullCommand = lines.join(' ');

    // URLの抽出（より精密なパターンマッチング）
    let url = '';

    // 1. クォートで囲まれたURL
    const quotedUrlMatch = fullCommand.match(/['"]([^'"]*?:\/\/[^'"]+)['"]/);
    if (quotedUrlMatch) {
      url = quotedUrlMatch[1];
    } else {
      // 2. 一般的なcurlパターン
      const curlUrlMatch = fullCommand.match(/curl\s+(?:-[^\s]*\s+)*['"]?([^'"\\s]+)['"]?/);
      if (curlUrlMatch) {
        url = curlUrlMatch[1];
      } else {
        // 3. http(s)で始まるパターン
        const httpUrlMatch = fullCommand.match(/(https?:\/\/[^\s'"]+)/);
        if (httpUrlMatch) {
          url = httpUrlMatch[1];
        }
      }
    }

    // URLのクリーンアップと検証
    if (url) {
      url = url.replace(/['"]/g, '').trim();
      // 基本的なURL形式チェック
      if (url.match(/^https?:\/\//) || url.includes('://')) {
        request.url = url;
      }
    }

    // メソッドの抽出
    const methodMatch = fullCommand.match(/-X\s+(['"]?)(\w+)\1/i);
    if (methodMatch) {
      request.method = methodMatch[2].toUpperCase();
    }

    // ヘッダーの抽出
    const headerMatches = fullCommand.matchAll(/-H\s+['"]([^'"]+)['"]|--header\s+['"]([^'"]+)['"]/g);
    for (const match of headerMatches) {
      const header = match[1] || match[2];
      const [key, ...valueParts] = header.split(':');
      if (key && valueParts.length > 0) {
        request.headers[key.trim()] = valueParts.join(':').trim();
      }
    }

    // ボディデータの抽出（改良版）
    let bodyData = '';

    // 1. シングルクォートで囲まれたデータ (-d 'data')
    const singleQuoteMatch = fullCommand.match(/-d\s+'([^']*(?:\\'[^']*)*)'/);
    if (singleQuoteMatch) {
      bodyData = singleQuoteMatch[1];
    }

    // 2. ダブルクォートで囲まれたデータ (-d "data")
    if (!bodyData) {
      const doubleQuoteMatch = fullCommand.match(/-d\s+"([^"]*(?:\\"[^"]*)*)"/);
      if (doubleQuoteMatch) {
        bodyData = doubleQuoteMatch[1];
      }
    }

    // 3. --data パターンも同様に処理
    if (!bodyData) {
      const dataMatch = fullCommand.match(/--data\s+'([^']*(?:\\'[^']*)*)'|--data\s+"([^"]*(?:\\"[^']*)*)"/);
      if (dataMatch) {
        bodyData = dataMatch[1] || dataMatch[2] || '';
      }
    }

    // 4. --data-raw パターン
    if (!bodyData) {
      const dataRawMatch = fullCommand.match(/--data-raw\s+'([^']*(?:\\'[^']*)*)'|--data-raw\s+"([^"]*(?:\\"[^']*)*)"/);
      if (dataRawMatch) {
        bodyData = dataRawMatch[1] || dataRawMatch[2] || '';
      }
    }

    // 5. クォートなしのデータパターン（最後の手段）
    if (!bodyData) {
      const unquotedDataMatch = fullCommand.match(/-d\s+([^-\s]\S+)|--data\s+([^-\s]\S+)|--data-raw\s+([^-\s]\S+)/);
      if (unquotedDataMatch) {
        bodyData = unquotedDataMatch[1] || unquotedDataMatch[2] || unquotedDataMatch[3] || '';
      }
    }

    if (bodyData) {
      // エスケープされた文字を復元
      request.body = bodyData.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      if (request.method === 'GET') {
        request.method = 'POST';
      }
    }

    return request;
  };

  // HTTPリクエストからcurlコマンドへ変換
  const generateCurlCommand = (method: string, url: string, headers: string, body: string): string => {
    const parts: string[] = ['curl'];

    // メソッド
    if (method && method !== 'GET') {
      parts.push(`-X ${method}`);
    }

    // ヘッダー
    if (headers.trim()) {
      const headerLines = headers.split('\n').filter(line => line.trim());
      for (const line of headerLines) {
        if (line.includes(':')) {
          parts.push(`-H "${line.trim()}"`);
        }
      }
    }

    // ボディ
    if (body.trim()) {
      const escapedBody = body.replace(/"/g, '\\"');
      parts.push(`-d "${escapedBody}"`);
    }

    // URL（最後に追加）
    if (url.trim()) {
      parts.push(`"${url.trim()}"`);
    }

    return parts.join(' \\\n  ');
  };

  // HTTPリクエストの整形表示
  const formatHttpRequest = (request: HttpRequest): string => {
    const lines: string[] = [];

    try {
      // URLの有効性をチェック
      if (!request.url || !request.url.trim()) {
        throw new Error('URL is required');
      }

      const url = new URL(request.url);

      // リクエストライン
      lines.push(`${request.method} ${url.pathname}${url.search} HTTP/1.1`);
      lines.push(`Host: ${url.host}`);

      // ヘッダー
      Object.entries(request.headers).forEach(([key, value]) => {
        lines.push(`${key}: ${value}`);
      });

      // 空行
      lines.push('');

      // ボディ
      if (request.body) {
        lines.push(request.body);
      }

      return lines.join('\n');
    } catch (error) {
      throw new Error('Invalid URL format');
    }
  };

  useEffect(() => {
    try {
      if (mode === 'curl-to-http') {
        if (!curlInput.trim()) {
          setOutput('');
          setError('');
          return;
        }

        const request = parseCurlCommand(curlInput);

        // URLが抽出できていない場合のエラーハンドリング
        if (!request.url) {
          setError('有効なURLが見つかりません。curlコマンドにURLが含まれていることを確認してください。');
          setOutput('');
          return;
        }

        const formattedHttp = formatHttpRequest(request);
        setOutput(formattedHttp);
        setError('');

        onHistoryAdd?.({
          toolId: 'curl-converter',
          input: curlInput.slice(0, 100) + (curlInput.length > 100 ? '...' : ''),
          output: t('curlConverter.historyOutput.curlToHttp').replace('{method}', request.method).replace('{url}', request.url)
        });

      } else {
        // http-to-curl
        if (!httpUrl.trim()) {
          setOutput('');
          setError('');
          return;
        }

        // HTTPモードでのURL検証
        try {
          new URL(httpUrl);
        } catch {
          setError('無効なURL形式です。https://example.com のような完全なURLを入力してください。');
          setOutput('');
          return;
        }

        const curlCommand = generateCurlCommand(httpMethod, httpUrl, httpHeaders, httpBody);
        setOutput(curlCommand);
        setError('');

        onHistoryAdd?.({
          toolId: 'curl-converter',
          input: `${httpMethod} ${httpUrl}`,
          output: t('curlConverter.historyOutput.httpToCurl')
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('curlConverter.error.conversion');
      setError(errorMessage);
      setOutput('');
    }
  }, [mode, curlInput, httpMethod, httpUrl, httpHeaders, httpBody]);

  const handleCopy = () => {
    copyToClipboard(output);
  };

  const handleReset = () => {
    setCurlInput('');
    setHttpMethod('GET');
    setHttpUrl('');
    setHttpHeaders('');
    setHttpBody('');
    setOutput('');
    setError('');
  };

  const insertSample = () => {
    if (mode === 'curl-to-http') {
      setCurlInput(`curl -X POST "https://api.example.com/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d '{"name": "John Doe", "email": "john@example.com"}'`);
    } else {
      setHttpMethod('POST');
      setHttpUrl('https://api.example.com/users');
      setHttpHeaders(`Content-Type: application/json
Authorization: Bearer token123`);
      setHttpBody('{"name": "John Doe", "email": "john@example.com"}');
    }
  };

  return (
    <div className="space-y-6">
      {/* モード選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('curlConverter.mode.label')}
        </label>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'curl-to-http' ? 'primary' : 'outline'}
            onClick={() => setMode('curl-to-http')}
          >
            <Terminal className="w-4 h-4 mr-1" />
            {t('curlConverter.mode.curlToHttp')}
          </Button>
          <ArrowLeftRight className="w-4 h-4 text-gray-400 self-center" />
          <Button
            size="sm"
            variant={mode === 'http-to-curl' ? 'primary' : 'outline'}
            onClick={() => setMode('http-to-curl')}
          >
            <Globe className="w-4 h-4 mr-1" />
            {t('curlConverter.mode.httpToCurl')}
          </Button>
        </div>
      </div>

      {mode === 'curl-to-http' ? (
        /* curl → HTTP モード */
        <div>
          <label htmlFor="curl-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('curlConverter.curl.input.label')}
          </label>
          <textarea
            id="curl-input"
            value={curlInput}
            onChange={(e) => setCurlInput(e.target.value)}
            placeholder={t('curlConverter.curl.input.placeholder')}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-y ${
              error ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        </div>
      ) : (
        /* HTTP → curl モード */
        <div className="space-y-4">
          {/* メソッドとURL */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('curlConverter.http.method.label')}
              </label>
              <select
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('curlConverter.http.url.label')}
              </label>
              <input
                type="url"
                value={httpUrl}
                onChange={(e) => setHttpUrl(e.target.value)}
                placeholder={t('curlConverter.http.url.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* ヘッダー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('curlConverter.http.headers.label')}
            </label>
            <textarea
              value={httpHeaders}
              onChange={(e) => setHttpHeaders(e.target.value)}
              placeholder={t('curlConverter.http.headers.placeholder')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          {/* ボディ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('curlConverter.http.body.label')}
            </label>
            <textarea
              value={httpBody}
              onChange={(e) => setHttpBody(e.target.value)}
              placeholder={t('curlConverter.http.body.placeholder')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* 変換結果 */}
      {output && !error && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'curl-to-http' ? t('curlConverter.result.httpRequest') : t('curlConverter.result.curlCommand')}
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-1">{isCopied ? t('curlConverter.copied') : t('curlConverter.copy')}</span>
            </Button>
          </div>
          
          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button onClick={insertSample}>
          <Terminal className="w-4 h-4 mr-1" />
          {t('curlConverter.insertSample')}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('curlConverter.reset')}
        </Button>
      </div>
    </div>
  );
}