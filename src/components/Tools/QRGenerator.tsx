import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export function QRGenerator({ onHistoryAdd }: ToolProps) {
  const [inputText, setInputText] = useState('');
  const [qrDataURL, setQRDataURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    size: 300,
    margin: 4,
    errorCorrectionLevel: 'M' as ErrorCorrectionLevel,
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  // QRコード生成
  const generateQR = async (text: string) => {
    if (!text.trim()) {
      setQRDataURL('');
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const qrOptions = {
        width: options.size,
        margin: options.margin,
        color: {
          dark: options.foregroundColor,
          light: options.backgroundColor,
        },
        errorCorrectionLevel: options.errorCorrectionLevel,
      };

      // Data URLとして生成
      const dataURL = await QRCode.toDataURL(text, qrOptions);
      setQRDataURL(dataURL);

      // Canvasにも描画
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, text, qrOptions);
      }

      if (onHistoryAdd) {
        onHistoryAdd({
          toolId: 'qr-generator',
          input: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
          output: t('qrGenerator.historyOutput')
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('qrGenerator.error.generateFailed'));
      setQRDataURL('');
    } finally {
      setLoading(false);
    }
  };

  // テキストまたはオプションが変更されたときにQRコードを再生成
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      generateQR(inputText);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [inputText, options]);

  // QRコードをダウンロード
  const downloadQR = () => {
    if (!qrDataURL) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // QRコードをクリップボードにコピー
  const copyQR = async () => {
    if (!qrDataURL) return;

    try {
      const response = await fetch(qrDataURL);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    } catch (err) {
      // フォールバック: データURLをコピー
      await copyToClipboard(qrDataURL);
    }
  };

  // プリセット
  const presets = [
    { name: t('qrGenerator.preset.website'), value: 'https://example.com' },
    { name: t('qrGenerator.preset.email'), value: 'mailto:example@email.com' },
    { name: t('qrGenerator.preset.phone'), value: 'tel:+81-90-1234-5678' },
    { name: t('qrGenerator.preset.sms'), value: 'sms:+81-90-1234-5678' },
    { name: t('qrGenerator.preset.wifi'), value: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;' },
    { name: t('qrGenerator.preset.vcard'), value: 'BEGIN:VCARD\nVERSION:3.0\nFN:田中太郎\nTEL:+81-90-1234-5678\nEMAIL:tanaka@example.com\nEND:VCARD' },
  ];

  const errorLevels = [
    { value: 'L', label: t('qrGenerator.errorLevel.L') },
    { value: 'M', label: t('qrGenerator.errorLevel.M') },
    { value: 'Q', label: t('qrGenerator.errorLevel.Q') },
    { value: 'H', label: t('qrGenerator.errorLevel.H') },
  ];

  return (
    <div className="space-y-6">
      {/* プリセット */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('qrGenerator.presets')}
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => setInputText(preset.value)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 入力エリア */}
      <div>
        <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('qrGenerator.input.label')}
        </label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('qrGenerator.input.placeholder')}
          className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
        />
        {inputText && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('qrGenerator.characterCount').replace('{count}', inputText.length.toString())}
          </div>
        )}
      </div>

      {/* オプション設定 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* サイズ設定 */}
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('qrGenerator.size').replace('{size}', options.size.toString())}
          </label>
          <input
            id="size"
            type="range"
            min="100"
            max="800"
            step="50"
            value={options.size}
            onChange={(e) => setOptions(prev => ({ ...prev, size: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>100px</span>
            <span>800px</span>
          </div>
        </div>

        {/* マージン設定 */}
        <div>
          <label htmlFor="margin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('qrGenerator.margin').replace('{margin}', options.margin.toString())}
          </label>
          <input
            id="margin"
            type="range"
            min="0"
            max="10"
            value={options.margin}
            onChange={(e) => setOptions(prev => ({ ...prev, margin: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0</span>
            <span>10</span>
          </div>
        </div>

        {/* エラー訂正レベル */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('qrGenerator.errorCorrection')}
          </label>
          <select
            value={options.errorCorrectionLevel}
            onChange={(e) => setOptions(prev => ({ ...prev, errorCorrectionLevel: e.target.value as ErrorCorrectionLevel }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {errorLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* 色設定 */}
        <div className="space-y-3">
          <div>
            <label htmlFor="fg-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('qrGenerator.foregroundColor')}
            </label>
            <div className="flex gap-2">
              <input
                id="fg-color"
                type="color"
                value={options.foregroundColor}
                onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={options.foregroundColor}
                onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bg-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('qrGenerator.backgroundColor')}
            </label>
            <div className="flex gap-2">
              <input
                id="bg-color"
                type="color"
                value={options.backgroundColor}
                onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={options.backgroundColor}
                onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* QRコード表示エリア */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('qrGenerator.result')}</h3>
        
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">{t('qrGenerator.loading')}</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <div>{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && qrDataURL && (
          <div className="text-center">
            <div className="inline-block bg-white p-4 rounded-lg shadow-sm">
              <img src={qrDataURL} alt="Generated QR Code" className="max-w-full" />
            </div>
            
            <div className="mt-4 flex justify-center gap-3">
              <Button onClick={downloadQR} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {t('qrGenerator.download')}
              </Button>
              <Button variant="outline" onClick={copyQR} className="flex items-center gap-2">
                {isCopied ? (
                  <><Check className="w-4 h-4" /> {t('common.copied')}</>
                ) : (
                  <><Copy className="w-4 h-4" /> {t('qrGenerator.copyImage')}</>
                )}
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && !inputText && (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            {t('qrGenerator.usage.step1')}
          </div>
        )}
      </div>

      {/* 隠しCanvas（ダウンロード用） */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 使用例 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('qrGenerator.usage.title')}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>• {t('qrGenerator.usage.step1')}</div>
          <div>• {t('qrGenerator.usage.step2')}</div>
          <div>• {t('qrGenerator.usage.step3')}</div>
          <div>• {t('qrGenerator.usage.step4')}</div>
        </div>
      </div>
    </div>
  );
}