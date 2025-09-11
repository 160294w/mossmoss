import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';
import { DNAGeneration } from '../Effects/DNAHelixEffect';
import { MagneticAttraction } from '../Effects/MagneticAttraction';

export function UUIDGenerator({ onHistoryAdd }: ToolProps) {
  const { t } = useLanguage();
  const [version, setVersion] = useState<'v4' | 'v1'>('v4');
  const [quantity, setQuantity] = useState(1);
  const [uuidList, setUuidList] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const generateUUID = () => {
    if (version === 'v4') {
      return crypto.randomUUID();
    } else {
      // Simple UUID v1 implementation (timestamp-based)
      const timestamp = Date.now();
      const random = Math.random().toString(16).substring(2, 14);
      return `${timestamp.toString(16).padStart(12, '0')}-4${random.substring(0, 3)}-${random.substring(3, 7)}-${random.substring(7, 11)}`;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // DNA螺旋エフェクトの演出時間
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUuids = Array.from({ length: quantity }, () => generateUUID());
    setUuidList(newUuids);
    setIsGenerating(false);
    
    if (newUuids.length === 1) {
      onHistoryAdd?.({
        toolId: 'uuid-generator',
        input: `UUID ${version}`,
        output: newUuids[0]
      });
    } else {
      onHistoryAdd?.({
        toolId: 'uuid-generator',
        input: t('uuidGenerator.historyOutput.multiple').replace('{count}', quantity.toString()).replace('{version}', version),
        output: t('uuidGenerator.historyOutput.generated').replace('{count}', newUuids.length.toString())
      });
    }
  };

  const handleCopy = (value: string) => {
    copyToClipboard(value);
  };

  const handleCopyAll = () => {
    const allUuids = uuidList.join('\n');
    copyToClipboard(allUuids);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('uuidGenerator.version.label')}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="v4"
                checked={version === 'v4'}
                onChange={(e) => setVersion(e.target.value as 'v4' | 'v1')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('uuidGenerator.version.v4')}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="v1"
                checked={version === 'v1'}
                onChange={(e) => setVersion(e.target.value as 'v4' | 'v1')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('uuidGenerator.version.v1')}
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('uuidGenerator.quantity.label')}
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <MagneticAttraction strength="medium" range={100}>
          <Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>
            {isGenerating ? 'DNA配列生成中...' : t('uuidGenerator.generate')}
          </Button>
        </MagneticAttraction>
      </div>

      {uuidList.length > 0 && (
        <DNAGeneration trigger={uuidList.length > 0}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('uuidGenerator.result.label')}
              </h3>
              {uuidList.length > 1 && (
                <MagneticAttraction strength="medium" range={80}>
                  <Button
                    onClick={handleCopyAll}
                    variant="outline"
                    size="sm"
                  >
                    {isCopied ? (
                      <><Check className="w-4 h-4 mr-1" /> {t('uuidGenerator.copied')}</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-1" /> {t('uuidGenerator.copyAll')}</>
                    )}
                  </Button>
                </MagneticAttraction>
              )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {uuidList.map((uuid, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <code className="flex-1 text-sm font-mono text-gray-900 dark:text-white break-all">
                  {uuid}
                </code>
                <MagneticAttraction strength="weak" range={60}>
                  <Button
                    onClick={() => handleCopy(uuid)}
                    variant="outline"
                    size="sm"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <><Copy className="w-4 h-4 mr-1" /> {t('uuidGenerator.copy')}</>
                    )}
                  </Button>
                </MagneticAttraction>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>UUID v4:</strong> {t('uuidGenerator.description.v4')}
            </p>
            <p>
              <strong>UUID v1:</strong> {t('uuidGenerator.description.v1')}
            </p>
          </div>
        </div>
        </DNAGeneration>
      )}
    </div>
  );
}