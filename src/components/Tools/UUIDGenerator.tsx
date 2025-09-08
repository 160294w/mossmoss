import { useState } from 'react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { HistoryItem } from '../../types';

interface UUIDGeneratorProps {
  onHistoryAdd: (item: Omit<HistoryItem, 'timestamp'>) => void;
}

export function UUIDGenerator({ onHistoryAdd }: UUIDGeneratorProps) {
  const [uuid, setUuid] = useState('');
  const [version, setVersion] = useState<'v4' | 'v1'>('v4');
  const [quantity, setQuantity] = useState(1);
  const [uuidList, setUuidList] = useState<string[]>([]);
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

  const handleGenerate = () => {
    const newUuids = Array.from({ length: quantity }, () => generateUUID());
    setUuidList(newUuids);
    
    if (newUuids.length === 1) {
      setUuid(newUuids[0]);
      onHistoryAdd({
        toolId: 'uuid-generator',
        result: newUuids[0]
      });
    } else {
      onHistoryAdd({
        toolId: 'uuid-generator',
        result: `${newUuids.length}個のUUID生成`
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
            UUIDバージョン
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
                UUID v4 (ランダム)
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
                UUID v1 (タイムスタンプベース)
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            生成数量
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

        <Button onClick={handleGenerate} className="w-full">
          UUID生成
        </Button>
      </div>

      {uuidList.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              生成されたUUID
            </h3>
            {uuidList.length > 1 && (
              <Button
                onClick={handleCopyAll}
                variant="outline"
                size="sm"
              >
                {isCopied ? 'コピー済み!' : 'すべてコピー'}
              </Button>
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
                <Button
                  onClick={() => handleCopy(uuid)}
                  variant="outline"
                  size="sm"
                >
                  {isCopied ? '✓' : 'コピー'}
                </Button>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>UUID v4:</strong> 完全にランダムな値を使用
            </p>
            <p>
              <strong>UUID v1:</strong> タイムスタンプベース（簡易実装）
            </p>
          </div>
        </div>
      )}
    </div>
  );
}