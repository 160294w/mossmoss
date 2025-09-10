import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

export function RadixConverter({ onHistoryAdd }: ToolProps) {
  const [inputValue, setInputValue] = useState('');
  const [fromBase, setFromBase] = useState(10);
  const [results, setResults] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  const bases = [
    { value: 2, label: t('radixConverter.base.binary') },
    { value: 8, label: t('radixConverter.base.octal') },
    { value: 10, label: t('radixConverter.base.decimal') },
    { value: 16, label: t('radixConverter.base.hexadecimal') },
    { value: 32, label: t('radixConverter.base.base32') },
    { value: 36, label: t('radixConverter.base.base36') }
  ];

  const validateInput = (value: string, base: number) => {
    if (!value.trim()) return false;
    
    const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base);
    return value.toUpperCase().split('').every(char => validChars.includes(char));
  };

  const handleConvert = () => {
    if (!inputValue.trim()) {
      setError(t('radixConverter.error.enterValue'));
      return;
    }

    if (!validateInput(inputValue, fromBase)) {
      setError(t('radixConverter.error.invalidChars').replace('{base}', fromBase.toString()));
      return;
    }

    try {
      const decimalValue = parseInt(inputValue, fromBase);
      
      if (isNaN(decimalValue)) {
        setError(t('radixConverter.error.cannotConvert'));
        return;
      }

      const newResults: { [key: number]: string } = {};
      bases.forEach(base => {
        if (base.value !== fromBase) {
          const converted = decimalValue.toString(base.value);
          newResults[base.value] = base.value === 16 ? converted.toUpperCase() : converted;
        }
      });

      setResults(newResults);
      setError('');

      onHistoryAdd?.({
        toolId: 'radix-converter',
        input: t('radixConverter.historyInput').replace('{base}', fromBase.toString()).replace('{value}', inputValue),
        output: t('radixConverter.historyOutput')
      });
    } catch (err) {
      setError(t('radixConverter.error.conversionError'));
    }
  };

  const handleCopy = (value: string) => {
    copyToClipboard(value);
  };

  const getBasePrefix = (base: number) => {
    switch (base) {
      case 2: return '0b';
      case 8: return '0o';
      case 16: return '0x';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('radixConverter.input.label')}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.replace(/\s/g, ''))}
            placeholder={t('radixConverter.input.placeholder')}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('radixConverter.inputBase.label')}
          </label>
          <select
            value={fromBase}
            onChange={(e) => setFromBase(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {bases.map(base => (
              <option key={base.value} value={base.value}>
                {base.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button onClick={handleConvert} className="w-full">
          {t('radixConverter.convert')}
        </Button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('radixConverter.result')}
          </h3>

          <div className="space-y-3">
            {bases.map(base => {
              if (base.value === fromBase || !results[base.value]) return null;
              
              return (
                <div
                  key={base.value}
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {base.label}
                    </div>
                    <div className="flex items-center gap-2">
                      {getBasePrefix(base.value) && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {getBasePrefix(base.value)}
                        </span>
                      )}
                      <code className="text-lg font-mono text-gray-900 dark:text-white">
                        {results[base.value]}
                      </code>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCopy(results[base.value])}
                    variant="outline"
                    size="sm"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : (
                      <><Copy className="w-4 h-4 mr-1" /> {t('radixConverter.copy')}</>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>{t('radixConverter.availableChars')}</strong></p>
            <p><strong>2進数:</strong> 0, 1</p>
            <p><strong>8進数:</strong> 0-7</p>
            <p><strong>10進数:</strong> 0-9</p>
            <p><strong>16進数:</strong> 0-9, A-F</p>
            <p><strong>32進数:</strong> 0-9, A-V</p>
            <p><strong>36進数:</strong> 0-9, A-Z</p>
          </div>
        </div>
      )}
    </div>
  );
}