import { useState, useEffect } from 'react';
import { Copy, RotateCcw, Check, Palette, Hash, Square } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

export function ColorPreview({ onHistoryAdd }: ToolProps) {
  const [colorInput, setColorInput] = useState('#3b82f6');
  const [hexColor, setHexColor] = useState('#3b82f6');
  const [rgbColor, setRgbColor] = useState('59, 130, 246');
  const [hslColor, setHslColor] = useState('217, 91%, 60%');
  const [isValidColor, setIsValidColor] = useState(true);
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  // HEXからRGBに変換
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // RGBからHEXに変換
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // RGBからHSLに変換
  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s: number;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // 色の明度に基づいて文字色を決定
  const getTextColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  // 色の補色を取得
  const getComplementaryColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';
    
    const compR = 255 - rgb.r;
    const compG = 255 - rgb.g;
    const compB = 255 - rgb.b;
    
    return rgbToHex(compR, compG, compB);
  };

  // 色の更新
  const updateColors = (input: string) => {
    let isValid = false;
    let normalizedHex = '';

    // HEX形式の場合
    if (input.match(/^#?[0-9a-fA-F]{6}$/)) {
      normalizedHex = input.startsWith('#') ? input : '#' + input;
      isValid = true;
    }
    // 短縮HEX形式の場合 (#rgb)
    else if (input.match(/^#?[0-9a-fA-F]{3}$/)) {
      const shortHex = input.startsWith('#') ? input.slice(1) : input;
      normalizedHex = '#' + shortHex.split('').map(char => char + char).join('');
      isValid = true;
    }
    // RGB形式の場合
    else if (input.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/)) {
      const match = input.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        
        if (r <= 255 && g <= 255 && b <= 255) {
          normalizedHex = rgbToHex(r, g, b);
          isValid = true;
        }
      }
    }

    setIsValidColor(isValid);

    if (isValid && normalizedHex) {
      setHexColor(normalizedHex);
      const rgb = hexToRgb(normalizedHex);
      if (rgb) {
        setRgbColor(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        setHslColor(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);

        onHistoryAdd?.({
          toolId: 'color-preview',
          input: input,
          output: t('colorPreview.historyOutput').replace('{hex}', normalizedHex).replace('{r}', rgb.r.toString()).replace('{g}', rgb.g.toString()).replace('{b}', rgb.b.toString())
        });
      }
    }
  };

  useEffect(() => {
    updateColors(colorInput);
  }, [colorInput]);

  const handleInputChange = (value: string) => {
    setColorInput(value);
  };

  const handleCopy = (text: string) => {
    copyToClipboard(text);
  };

  const handleReset = () => {
    setColorInput('#3b82f6');
  };

  const insertSample = () => {
    setColorInput('#ff6b6b');
  };

  // カラーパレットのサンプル色
  const sampleColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
    '#dda0dd', '#98d8c8', '#fd79a8', '#6c5ce7', '#a29bfe',
    '#fd7272', '#55a3ff', '#5f27cd', '#00d2d3', '#ff9ff3'
  ];

  return (
    <div className="space-y-6">
      {/* 入力エリア */}
      <div>
        <label htmlFor="color-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('colorPreview.input.label')}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="color-input"
              type="text"
              value={colorInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={t('colorPreview.input.placeholder')}
              className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isValidColor 
                  ? 'border-gray-300 dark:border-gray-600' 
                  : 'border-red-300 dark:border-red-500'
              }`}
            />
          </div>
          <input
            type="color"
            value={isValidColor ? hexColor : '#000000'}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            title={t('colorPreview.colorPicker')}
          />
        </div>
        {!isValidColor && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {t('colorPreview.error.invalid')}
          </p>
        )}
      </div>

      {/* カラープレビュー */}
      {isValidColor && (
        <div className="space-y-4">
          {/* メインプレビュー */}
          <div 
            className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-lg font-semibold shadow-inner"
            style={{ 
              backgroundColor: hexColor,
              color: getTextColor(hexColor)
            }}
          >
            {hexColor}
          </div>

          {/* 色情報 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Square className="w-4 h-4" />
                HEX
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono">{hexColor}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(hexColor)}
                  className="ml-2"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                RGB
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono">rgb({rgbColor})</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(`rgb(${rgbColor})`)}
                  className="ml-2"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HSL</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono">hsl({hslColor})</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(`hsl(${hslColor})`)}
                  className="ml-2"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* 補色プレビュー */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('colorPreview.complementary.title')}</h3>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-semibold shadow-inner"
                style={{ 
                  backgroundColor: getComplementaryColor(hexColor),
                  color: getTextColor(getComplementaryColor(hexColor))
                }}
              >
                {getComplementaryColor(hexColor)}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(getComplementaryColor(hexColor))}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="ml-1">{t('colorPreview.complementary.copy')}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* サンプルカラー */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('colorPreview.samples.title')}</h3>
        <div className="grid grid-cols-5 gap-2">
          {sampleColors.map((color, index) => (
            <button
              key={index}
              onClick={() => handleInputChange(color)}
              className="w-full h-10 rounded border border-gray-300 dark:border-gray-600 hover:scale-105 transition-transform cursor-pointer shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button onClick={insertSample}>
          <Square className="w-4 h-4 mr-1" />
          {t('colorPreview.insertSample')}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('colorPreview.reset')}
        </Button>
      </div>
    </div>
  );
}