import { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { HistoryItem } from '../../types';

interface MarkdownConverterProps {
  onHistoryAdd: (item: Omit<HistoryItem, 'timestamp'>) => void;
}

export function MarkdownConverter() {
  const [mode, setMode] = useState<'md-to-html' | 'html-to-md'>('md-to-html');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // HTML to Markdown の簡易変換関数
  const htmlToMarkdown = (html: string): string => {
    let markdown = html;

    // HTMLタグをMarkdownに変換
    markdown = markdown.replace(/<h([1-6])>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
      return '#'.repeat(parseInt(level)) + ' ' + content + '\n\n';
    });

    markdown = markdown.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
    markdown = markdown.replace(/<br\s*\/?>/gi, '  \n');
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    markdown = markdown.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    markdown = markdown.replace(/<code>(.*?)<\/code>/gi, '`$1`');
    markdown = markdown.replace(/<pre><code>(.*?)<\/code><\/pre>/gis, '```\n$1\n```');
    markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)');
    markdown = markdown.replace(/<img src="(.*?)" alt="(.*?)".*?>/gi, '![$2]($1)');
    markdown = markdown.replace(/<ul>(.*?)<\/ul>/gis, (match, content) => {
      return content.replace(/<li>(.*?)<\/li>/gi, '- $1\n') + '\n';
    });
    markdown = markdown.replace(/<ol>(.*?)<\/ol>/gis, (match, content) => {
      let counter = 1;
      return content.replace(/<li>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
    });
    markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/gis, (match, content) => {
      return content.split('\n').map(line => line.trim() ? `> ${line.trim()}` : '>').join('\n') + '\n\n';
    });

    // 余分な空行を削除
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    markdown = markdown.trim();

    return markdown;
  };

  const handleConvert = () => {
    if (!input.trim()) {
      setError('変換する内容を入力してください');
      return;
    }

    try {
      if (mode === 'md-to-html') {
        // Markdown to HTML
        const rawHtml = marked(input);
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);
        setOutput(sanitizedHtml);
        
//         onHistoryAdd({
//           toolId: 'markdown-converter',
//           output: 'Markdown → HTML 変換'
//         });
      } else {
        // HTML to Markdown
        const markdown = htmlToMarkdown(input);
        setOutput(markdown);
        
//         onHistoryAdd({
//           toolId: 'markdown-converter',
//           output: 'HTML → Markdown 変換'
//         });
      }
      
      setError('');
    } catch (err) {
      setError('変換中にエラーが発生しました');
      console.error('変換エラー:', err);
    }
  };

  const handleCopy = () => {
    copyToClipboard(output);
  };

  const sampleMarkdown = `# サンプル見出し

これは**太字**と*斜体*のテキストです。

## リスト

- 項目1
- 項目2
- 項目3

## コード

\`inline code\`

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## リンク

[リンクテキスト](https://example.com)

> これは引用文です。`;

  const sampleHtml = `<h1>サンプル見出し</h1>
<p>これは<strong>太字</strong>と<em>斜体</em>のテキストです。</p>
<h2>リスト</h2>
<ul>
  <li>項目1</li>
  <li>項目2</li>
  <li>項目3</li>
</ul>
<h2>コード</h2>
<p><code>inline code</code></p>
<pre><code>function hello() {
  console.log("Hello, World!");
}</code></pre>
<h2>リンク</h2>
<p><a href="https://example.com">リンクテキスト</a></p>
<blockquote>
  <p>これは引用文です。</p>
</blockquote>`;

  const insertSample = () => {
    setInput(mode === 'md-to-html' ? sampleMarkdown : sampleHtml);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            変換モード
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="md-to-html"
                checked={mode === 'md-to-html'}
                onChange={(e) => setMode(e.target.value as 'md-to-html' | 'html-to-md')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Markdown → HTML
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="html-to-md"
                checked={mode === 'html-to-md'}
                onChange={(e) => setMode(e.target.value as 'md-to-html' | 'html-to-md')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                HTML → Markdown
              </span>
            </label>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === 'md-to-html' ? 'Markdown入力' : 'HTML入力'}
            </label>
            <Button onClick={insertSample} variant="outline" size="sm">
              サンプル挿入
            </Button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'md-to-html' ? 'Markdownを入力してください...' : 'HTMLを入力してください...'}
            rows={10}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-y"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button onClick={handleConvert} className="w-full">
          変換実行
        </Button>
      </div>

      {output && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'md-to-html' ? 'HTML出力' : 'Markdown出力'}
            </h3>
            <Button onClick={handleCopy} variant="outline" size="sm">
              {isCopied ? 'コピー済み!' : 'コピー'}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                変換結果（コード）
              </div>
              <textarea
                value={output}
                readOnly
                rows={8}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>

            {mode === 'md-to-html' && (
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  プレビュー
                </div>
                <div
                  className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: output }}
                />
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>注意:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>HTML → Markdown変換は簡易実装のため、複雑なHTMLは正確に変換されない場合があります</li>
              <li>セキュリティのため、出力HTMLは自動的にサニタイズされます</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}