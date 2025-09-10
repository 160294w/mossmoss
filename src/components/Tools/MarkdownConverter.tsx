import { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

export function MarkdownConverter({ onHistoryAdd }: ToolProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'md-to-html' | 'html-to-md'>('md-to-html');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // HTML to Markdown の簡易変換関数
  const htmlToMarkdown = (html: string): string => {
    let markdown = html;

    // HTMLタグをMarkdownに変換
    markdown = markdown.replace(/<h([1-6])>(.*?)<\/h[1-6]>/gi, (_, level, content) => {
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
    markdown = markdown.replace(/<ul>(.*?)<\/ul>/gis, (_, content) => {
      return content.replace(/<li>(.*?)<\/li>/gi, '- $1\n') + '\n';
    });
    markdown = markdown.replace(/<ol>(.*?)<\/ol>/gis, (_, content) => {
      let counter = 1;
      return content.replace(/<li>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
    });
    markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/gis, (_, content) => {
      return content.split('\n').map((line: any) => line.trim() ? `> ${line.trim()}` : '>').join('\n') + '\n\n';
    });

    // 余分な空行を削除
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    markdown = markdown.trim();

    return markdown;
  };

  const handleConvert = async () => {
    if (!input.trim()) {
      setError(t('markdownConverter.error.emptyInput'));
      return;
    }

    try {
      if (mode === 'md-to-html') {
        // Markdown to HTML
        const rawHtml = await marked(input);
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);
        setOutput(sanitizedHtml);
        
        onHistoryAdd?.({
          toolId: 'markdown-converter',
          input: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
          output: t('markdownConverter.history.mdToHtml')
        });
      } else {
        // HTML to Markdown
        const markdown = htmlToMarkdown(input);
        setOutput(markdown);
        
        onHistoryAdd?.({
          toolId: 'markdown-converter',
          input: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
          output: t('markdownConverter.history.htmlToMd')
        });
      }
      
      setError('');
    } catch (err) {
      setError(t('markdownConverter.error.conversionError'));
      console.error('Conversion error:', err);
    }
  };

  const handleCopy = () => {
    copyToClipboard(output);
  };

  const sampleMarkdown = t('markdownConverter.sample.markdown');

  const sampleHtml = t('markdownConverter.sample.html');

  const insertSample = () => {
    setInput(mode === 'md-to-html' ? sampleMarkdown : sampleHtml);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('markdownConverter.label.conversionMode')}
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
              {mode === 'md-to-html' ? t('markdownConverter.label.markdownInput') : t('markdownConverter.label.htmlInput')}
            </label>
            <Button onClick={insertSample} variant="outline" size="sm">
              {t('markdownConverter.button.insertSample')}
            </Button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'md-to-html' ? t('markdownConverter.placeholder.markdownInput') : t('markdownConverter.placeholder.htmlInput')}
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
          {t('markdownConverter.button.convert')}
        </Button>
      </div>

      {output && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'md-to-html' ? t('markdownConverter.label.htmlOutput') : t('markdownConverter.label.markdownOutput')}
            </h3>
            <Button onClick={handleCopy} variant="outline" size="sm">
              {isCopied ? t('markdownConverter.button.copied') : t('markdownConverter.button.copy')}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('markdownConverter.label.conversionResult')}
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
                  {t('markdownConverter.label.preview')}
                </div>
                <div
                  className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: output }}
                />
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>{t('markdownConverter.info.noteTitle')}:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('markdownConverter.info.htmlToMdLimitation')}</li>
              <li>{t('markdownConverter.info.securityNote')}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}