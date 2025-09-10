import { useState, useEffect } from 'react';
import { Terminal, Code2, Copy, RotateCcw, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

type Language = 'python' | 'javascript' | 'ruby' | 'go' | 'php' | 'java';

interface ParsedCurl {
  method: string;
  url: string;
  headers: { [key: string]: string };
  body?: string;
  cookies?: string;
}

export function CurlToCode({ onHistoryAdd }: ToolProps) {
  const [curlInput, setCurlInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('python');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  const languages: { value: Language; label: string; icon: string }[] = [
    { value: 'python', label: 'Python (requests)', icon: '🐍' },
    { value: 'javascript', label: 'JavaScript (fetch)', icon: '🟨' },
    { value: 'ruby', label: 'Ruby (net/http)', icon: '💎' },
    { value: 'go', label: 'Go (net/http)', icon: '🔵' },
    { value: 'php', label: 'PHP (curl)', icon: '🐘' },
    { value: 'java', label: 'Java (HttpURLConnection)', icon: '☕' }
  ];

  // curlコマンドの解析
  const parseCurlCommand = (curl: string): ParsedCurl => {
    const parsed: ParsedCurl = {
      method: 'GET',
      url: '',
      headers: {}
    };

    // 改行とバックスラッシュを処理
    const cleanCommand = curl.replace(/\\\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();

    // URLの抽出
    const urlMatch = cleanCommand.match(/curl\s+(?:[^'"\s]+\s+)*['"]?([^'"\s]+?)['"]?(?:\s|$)/) ||
                    cleanCommand.match(/['"]([^'"]*?:\/\/[^'"]+)['"]/) ||
                    cleanCommand.match(/(https?:\/\/[^\s'"]+)/);
    
    if (urlMatch) {
      parsed.url = urlMatch[1].replace(/['"]/g, '');
    }

    // メソッドの抽出
    const methodMatch = cleanCommand.match(/-X\s+(['"]?)(\w+)\1/i) ||
                       cleanCommand.match(/--request\s+(['"]?)(\w+)\1/i);
    if (methodMatch) {
      parsed.method = methodMatch[2].toUpperCase();
    }

    // ヘッダーの抽出
    const headerMatches = cleanCommand.matchAll(/-H\s+['"]([^'"]+?)['"]|--header\s+['"]([^'"]+?)['"]|-H\s+([^\s][^-]*?)(?=\s-|$)|--header\s+([^\s][^-]*?)(?=\s-|$)/g);
    for (const match of headerMatches) {
      const header = match[1] || match[2] || match[3] || match[4];
      if (header && header.includes(':')) {
        const [key, ...valueParts] = header.split(':');
        if (key && valueParts.length > 0) {
          parsed.headers[key.trim()] = valueParts.join(':').trim();
        }
      }
    }

    // ボディデータの抽出
    const dataMatch = cleanCommand.match(/-d\s+['"]([^'"]*?)['"]|--data\s+['"]([^'"]*?)['"]|--data-raw\s+['"]([^'"]*?)['"]|--data-binary\s+['"]([^'"]*?)['"]/) ||
                     cleanCommand.match(/-d\s+([^-\s'"][^\s]*)|--data\s+([^-\s'"][^\s]*)/);
    
    if (dataMatch) {
      parsed.body = dataMatch[1] || dataMatch[2] || dataMatch[3] || dataMatch[4] || dataMatch[5] || dataMatch[6];
      if (parsed.method === 'GET') {
        parsed.method = 'POST';
      }
    }

    // Cookieの抽出
    const cookieMatch = cleanCommand.match(/-b\s+['"]([^'"]+?)['"]|--cookie\s+['"]([^'"]+?)['"]/) ||
                       cleanCommand.match(/-b\s+([^-\s'"][^\s]*)|--cookie\s+([^-\s'"][^\s]*)/);
    if (cookieMatch) {
      parsed.cookies = cookieMatch[1] || cookieMatch[2] || cookieMatch[3] || cookieMatch[4];
    }

    return parsed;
  };

  // Python (requests) コード生成
  const generatePythonCode = (parsed: ParsedCurl): string => {
    const lines: string[] = [];
    lines.push('import requests');
    lines.push('import json');
    lines.push('');

    // URL
    lines.push(`url = "${parsed.url}"`);
    
    // ヘッダー
    if (Object.keys(parsed.headers).length > 0) {
      lines.push('');
      lines.push('headers = {');
      Object.entries(parsed.headers).forEach(([key, value]) => {
        lines.push(`    "${key}": "${value}",`);
      });
      lines.push('}');
    }

    // データ
    if (parsed.body) {
      lines.push('');
      try {
        JSON.parse(parsed.body);
        lines.push('data = json.dumps({');
        const jsonData = JSON.parse(parsed.body);
        Object.entries(jsonData).forEach(([key, value]) => {
          lines.push(`    "${key}": ${JSON.stringify(value)},`);
        });
        lines.push('})');
      } catch {
        lines.push(`data = "${parsed.body.replace(/"/g, '\\"')}"`);
      }
    }

    // クッキー
    if (parsed.cookies) {
      lines.push('');
      lines.push(`cookies = "${parsed.cookies}"`);
    }

    // リクエスト実行
    lines.push('');
    const requestParams: string[] = ['url'];
    if (Object.keys(parsed.headers).length > 0) requestParams.push('headers=headers');
    if (parsed.body) requestParams.push('data=data');
    if (parsed.cookies) requestParams.push('cookies=cookies');

    lines.push(`response = requests.${parsed.method.toLowerCase()}(${requestParams.join(', ')})`);
    lines.push('');
    lines.push('print(f"Status: {response.status_code}")');
    lines.push('print(f"Response: {response.text}")');

    return lines.join('\n');
  };

  // JavaScript (fetch) コード生成
  const generateJavaScriptCode = (parsed: ParsedCurl): string => {
    const lines: string[] = [];

    // オプション構築
    const options: string[] = [`method: '${parsed.method}'`];

    if (Object.keys(parsed.headers).length > 0) {
      options.push('headers: {');
      Object.entries(parsed.headers).forEach(([key, value]) => {
        options.push(`    '${key}': '${value}',`);
      });
      options.push('  }');
    }

    if (parsed.body) {
      try {
        JSON.parse(parsed.body);
        options.push(`body: JSON.stringify(${parsed.body})`);
      } catch {
        options.push(`body: '${parsed.body.replace(/'/g, "\\'")}'`);
      }
    }

    // fetch実行
    lines.push(`fetch('${parsed.url}', {`);
    lines.push(`  ${options.join(',\n  ')}`);
    lines.push('})');
    lines.push('.then(response => {');
    lines.push('  console.log("Status:", response.status);');
    lines.push('  return response.text();');
    lines.push('})');
    lines.push('.then(data => {');
    lines.push('  console.log("Response:", data);');
    lines.push('})');
    lines.push('.catch(error => {');
    lines.push('  console.error("Error:", error);');
    lines.push('});');

    return lines.join('\n');
  };

  // Ruby コード生成
  const generateRubyCode = (parsed: ParsedCurl): string => {
    const lines: string[] = [];
    lines.push('require "net/http"');
    lines.push('require "json"');
    lines.push('require "uri"');
    lines.push('');

    lines.push(`uri = URI("${parsed.url}")`);
    lines.push('http = Net::HTTP.new(uri.host, uri.port)');
    
    if (parsed.url.startsWith('https://')) {
      lines.push('http.use_ssl = true');
    }
    lines.push('');

    // リクエストオブジェクト
    const methodClass = {
      'GET': 'Net::HTTP::Get',
      'POST': 'Net::HTTP::Post',
      'PUT': 'Net::HTTP::Put',
      'DELETE': 'Net::HTTP::Delete',
      'PATCH': 'Net::HTTP::Patch'
    }[parsed.method] || 'Net::HTTP::Get';

    lines.push(`request = ${methodClass}.new(uri)`);
    
    // ヘッダー
    if (Object.keys(parsed.headers).length > 0) {
      lines.push('');
      Object.entries(parsed.headers).forEach(([key, value]) => {
        lines.push(`request["${key}"] = "${value}"`);
      });
    }

    // ボディ
    if (parsed.body) {
      lines.push('');
      try {
        JSON.parse(parsed.body);
        lines.push(`request.body = ${parsed.body}.to_json`);
      } catch {
        lines.push(`request.body = "${parsed.body.replace(/"/g, '\\"')}"`);
      }
    }

    // 実行
    lines.push('');
    lines.push('response = http.request(request)');
    lines.push('puts "Status: #{response.code}"');
    lines.push('puts "Response: #{response.body}"');

    return lines.join('\n');
  };

  // Go コード生成
  const generateGoCode = (parsed: ParsedCurl): string => {
    const lines: string[] = [];
    lines.push('package main');
    lines.push('');
    lines.push('import (');
    lines.push('\t"fmt"');
    lines.push('\t"io/ioutil"');
    lines.push('\t"net/http"');
    if (parsed.body) {
      lines.push('\t"strings"');
    }
    lines.push(')');
    lines.push('');
    lines.push('func main() {');

    // ボディデータ
    if (parsed.body) {
      lines.push(`\tbody := strings.NewReader(\`${parsed.body}\`)`);
      lines.push(`\treq, err := http.NewRequest("${parsed.method}", "${parsed.url}", body)`);
    } else {
      lines.push(`\treq, err := http.NewRequest("${parsed.method}", "${parsed.url}", nil)`);
    }

    lines.push('\tif err != nil {');
    lines.push('\t\tpanic(err)');
    lines.push('\t}');
    lines.push('');

    // ヘッダー
    if (Object.keys(parsed.headers).length > 0) {
      Object.entries(parsed.headers).forEach(([key, value]) => {
        lines.push(`\treq.Header.Set("${key}", "${value}")`);
      });
      lines.push('');
    }

    // クライアント実行
    lines.push('\tclient := &http.Client{}');
    lines.push('\tresp, err := client.Do(req)');
    lines.push('\tif err != nil {');
    lines.push('\t\tpanic(err)');
    lines.push('\t}');
    lines.push('\tdefer resp.Body.Close()');
    lines.push('');
    lines.push('\tbody, err := ioutil.ReadAll(resp.Body)');
    lines.push('\tif err != nil {');
    lines.push('\t\tpanic(err)');
    lines.push('\t}');
    lines.push('');
    lines.push('\tfmt.Println("Status:", resp.Status)');
    lines.push('\tfmt.Println("Response:", string(body))');
    lines.push('}');

    return lines.join('\n');
  };

  // PHP コード生成
  const generatePhpCode = (parsed: ParsedCurl): string => {
    const lines: string[] = [];
    lines.push('<?php');
    lines.push('');
    lines.push('$ch = curl_init();');
    lines.push('');
    lines.push(`curl_setopt($ch, CURLOPT_URL, "${parsed.url}");`);
    lines.push('curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);');

    if (parsed.method !== 'GET') {
      lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${parsed.method}");`);
    }

    // ヘッダー
    if (Object.keys(parsed.headers).length > 0) {
      lines.push('');
      lines.push('$headers = [');
      Object.entries(parsed.headers).forEach(([key, value]) => {
        lines.push(`    "${key}: ${value}",`);
      });
      lines.push('];');
      lines.push('curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);');
    }

    // ボディ
    if (parsed.body) {
      lines.push('');
      lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, '${parsed.body.replace(/'/g, "\\'")}');`);
    }

    // 実行
    lines.push('');
    lines.push('$response = curl_exec($ch);');
    lines.push('$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);');
    lines.push('curl_close($ch);');
    lines.push('');
    lines.push('echo "Status: " . $httpCode . "\\n";');
    lines.push('echo "Response: " . $response . "\\n";');
    lines.push('');
    lines.push('?>');

    return lines.join('\n');
  };

  // Java コード生成
  const generateJavaCode = (parsed: ParsedCurl): string => {
    const lines: string[] = [];
    lines.push('import java.io.*;');
    lines.push('import java.net.*;');
    lines.push('import java.nio.charset.StandardCharsets;');
    lines.push('');
    lines.push('public class HttpRequest {');
    lines.push('    public static void main(String[] args) throws Exception {');
    lines.push(`        URL url = new URL("${parsed.url}");`);
    lines.push('        HttpURLConnection conn = (HttpURLConnection) url.openConnection();');
    lines.push('        ');
    lines.push(`        conn.setRequestMethod("${parsed.method}");`);

    // ヘッダー
    if (Object.keys(parsed.headers).length > 0) {
      lines.push('');
      Object.entries(parsed.headers).forEach(([key, value]) => {
        lines.push(`        conn.setRequestProperty("${key}", "${value}");`);
      });
    }

    // ボディ
    if (parsed.body) {
      lines.push('');
      lines.push('        conn.setDoOutput(true);');
      lines.push(`        String jsonInputString = "${parsed.body.replace(/"/g, '\\"')}";`);
      lines.push('        try (OutputStream os = conn.getOutputStream()) {');
      lines.push('            byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);');
      lines.push('            os.write(input, 0, input.length);');
      lines.push('        }');
    }

    // レスポンス読み取り
    lines.push('');
    lines.push('        int responseCode = conn.getResponseCode();');
    lines.push('        System.out.println("Status: " + responseCode);');
    lines.push('');
    lines.push('        try (BufferedReader br = new BufferedReader(');
    lines.push('                new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {');
    lines.push('            StringBuilder response = new StringBuilder();');
    lines.push('            String responseLine;');
    lines.push('            while ((responseLine = br.readLine()) != null) {');
    lines.push('                response.append(responseLine.trim());');
    lines.push('            }');
    lines.push('            System.out.println("Response: " + response.toString());');
    lines.push('        }');
    lines.push('    }');
    lines.push('}');

    return lines.join('\n');
  };

  // コード生成
  const generateCodeForLanguage = (parsed: ParsedCurl, language: Language): string => {
    switch (language) {
      case 'python':
        return generatePythonCode(parsed);
      case 'javascript':
        return generateJavaScriptCode(parsed);
      case 'ruby':
        return generateRubyCode(parsed);
      case 'go':
        return generateGoCode(parsed);
      case 'php':
        return generatePhpCode(parsed);
      case 'java':
        return generateJavaCode(parsed);
      default:
        return '';
    }
  };

  // リアルタイム変換
  useEffect(() => {
    if (!curlInput.trim()) {
      setGeneratedCode('');
      setError('');
      return;
    }

    try {
      const parsed = parseCurlCommand(curlInput);
      if (!parsed.url) {
        throw new Error('URLが見つかりません');
      }

      const code = generateCodeForLanguage(parsed, selectedLanguage);
      setGeneratedCode(code);
      setError('');

      onHistoryAdd?.({
        toolId: 'curl-to-code',
        input: curlInput.slice(0, 50) + (curlInput.length > 50 ? '...' : ''),
        output: `curl→${selectedLanguage}変換完了`
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'curlコマンドの解析に失敗しました');
      setGeneratedCode('');
    }
  }, [curlInput, selectedLanguage]);

  const handleCopy = () => {
    copyToClipboard(generatedCode);
  };

  const handleReset = () => {
    setCurlInput('');
    setGeneratedCode('');
    setError('');
  };

  const insertSampleCurl = () => {
    const sample = `curl -X POST "https://api.example.com/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -H "User-Agent: MyApp/1.0" \\
  -d '{"name": "John Doe", "email": "john@example.com", "age": 30}'`;
    setCurlInput(sample);
  };

  const currentLanguage = languages.find(lang => lang.value === selectedLanguage);

  return (
    <div className="space-y-6">
      {/* 言語選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('curlToCode.selectLanguage') || 'Select Output Language'}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {languages.map((lang) => (
            <Button
              key={lang.value}
              size="sm"
              variant={selectedLanguage === lang.value ? 'default' : 'outline'}
              onClick={() => setSelectedLanguage(lang.value)}
              className="justify-start"
            >
              <span className="mr-2">{lang.icon}</span>
              {lang.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 入力エリア */}
      <div>
        <label htmlFor="curl-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('curlToCode.input.label')}
        </label>
        <textarea
          id="curl-input"
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
          placeholder={t('curlToCode.input.placeholder')}
          rows={6}
          className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-y ${
            error ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* 生成されたコード */}
      {generatedCode && !error && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">{currentLanguage?.icon}</span>
              {currentLanguage?.label} {t('curlToCode.code') || 'Code'}
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-1">{isCopied ? t('common.copied') : t('common.copy')}</span>
            </Button>
          </div>
          
          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
              {generatedCode}
            </pre>
          </div>
        </div>
      )}

      {/* 使用方法の説明 */}
      {selectedLanguage && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            {currentLanguage?.label} {t('curlToCode.execution') || 'Execution Instructions'}
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            {selectedLanguage === 'python' && (
              <div>
                <p>• <code>pip install requests</code> でライブラリをインストール</p>
                <p>• <code>python script.py</code> で実行</p>
              </div>
            )}
            {selectedLanguage === 'javascript' && (
              <div>
                <p>• ブラウザのコンソールまたはNode.jsで実行</p>
                <p>• モダンブラウザでfetch APIをサポート</p>
              </div>
            )}
            {selectedLanguage === 'ruby' && (
              <div>
                <p>• Ruby標準ライブラリを使用（追加インストール不要）</p>
                <p>• <code>ruby script.rb</code> で実行</p>
              </div>
            )}
            {selectedLanguage === 'go' && (
              <div>
                <p>• Go標準ライブラリを使用（追加インストール不要）</p>
                <p>• <code>go run main.go</code> で実行</p>
              </div>
            )}
            {selectedLanguage === 'php' && (
              <div>
                <p>• PHP標準のcurl拡張を使用</p>
                <p>• <code>php script.php</code> で実行</p>
              </div>
            )}
            {selectedLanguage === 'java' && (
              <div>
                <p>• Java標準ライブラリを使用（追加依存なし）</p>
                <p>• <code>javac HttpRequest.java && java HttpRequest</code> で実行</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button onClick={insertSampleCurl}>
          <Terminal className="w-4 h-4 mr-1" />
          {t('curlToCode.sample')}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('curlToCode.clear')}
        </Button>
      </div>
    </div>
  );
}