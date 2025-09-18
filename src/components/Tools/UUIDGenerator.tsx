import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

export function UUIDGenerator({ onHistoryAdd }: ToolProps) {
  const { t } = useLanguage();
  const [version, setVersion] = useState<'v4' | 'v1' | 'v7' | 'ulid'>('v4');
  const [quantity, setQuantity] = useState(1);
  const [uuidList, setUuidList] = useState<string[]>([]);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // ULID生成用のBase32エンコード文字セット (Crockford's Base32)
  const ULID_ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  const generateULID = (): string => {
    const timestamp = Date.now();
    const randomBytes = new Uint8Array(10);
    crypto.getRandomValues(randomBytes);

    // タイムスタンプ部分（48bit = 10文字のBase32）
    let timestampStr = '';
    let time = timestamp;
    for (let i = 9; i >= 0; i--) {
      timestampStr = ULID_ENCODING[time & 31] + timestampStr;
      time = Math.floor(time / 32);
    }

    // ランダム部分（80bit = 16文字のBase32）
    let randomStr = '';
    let carry = 0;
    for (let i = 0; i < 16; i++) {
      const byteIndex = Math.floor((i * 5) / 8);
      const bitIndex = (i * 5) % 8;

      if (byteIndex < randomBytes.length) {
        let value = randomBytes[byteIndex] >> bitIndex;
        if (byteIndex + 1 < randomBytes.length && bitIndex > 3) {
          value |= (randomBytes[byteIndex + 1] << (8 - bitIndex));
        }
        randomStr += ULID_ENCODING[(value + carry) & 31];
        carry = Math.floor((value + carry) / 32);
      } else {
        randomStr += ULID_ENCODING[carry & 31];
        carry = 0;
      }
    }

    return timestampStr + randomStr;
  };

  const generateUUID = () => {
    if (version === 'v4') {
      return crypto.randomUUID();
    } else if (version === 'v7') {
      // UUID v7 implementation (timestamp + random)
      const timestamp = Date.now();
      const timestampHex = timestamp.toString(16).padStart(12, '0');

      // Generate random bits for the remaining parts
      const randomBytes = new Uint8Array(10);
      crypto.getRandomValues(randomBytes);

      // Convert random bytes to hex
      const randomHex = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Format as UUID v7: xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx
      // First 48 bits: timestamp (12 hex chars)
      // Next 4 bits: version (7)
      // Next 12 bits: random
      // Next 2 bits: variant (10)
      // Next 14 bits: random
      // Last 48 bits: random

      const part1 = timestampHex.substring(0, 8);
      const part2 = timestampHex.substring(8, 12);
      const part3 = '7' + randomHex.substring(0, 3);
      const part4 = (parseInt(randomHex.substring(3, 5), 16) | 0x80).toString(16).padStart(2, '0') + randomHex.substring(5, 7);
      const part5 = randomHex.substring(7, 19);

      return `${part1}-${part2}-${part3}-${part4}-${part5}`;
    } else if (version === 'ulid') {
      return generateULID();
    } else {
      // Simple UUID v1 implementation (timestamp-based)
      const timestamp = Date.now();
      const random = Math.random().toString(16).substring(2, 14);
      return `${timestamp.toString(16).padStart(12, '0')}-1${random.substring(0, 3)}-${random.substring(3, 7)}-${random.substring(7, 11)}`;
    }
  };

  const handleGenerate = () => {
    const newUuids = Array.from({ length: quantity }, () => generateUUID());
    setUuidList(newUuids);
    
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
                onChange={(e) => setVersion(e.target.value as 'v4' | 'v1' | 'v7' | 'ulid')}
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
                onChange={(e) => setVersion(e.target.value as 'v4' | 'v1' | 'v7' | 'ulid')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('uuidGenerator.version.v1')}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="v7"
                checked={version === 'v7'}
                onChange={(e) => setVersion(e.target.value as 'v4' | 'v1' | 'v7' | 'ulid')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('uuidGenerator.version.v7')}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="ulid"
                checked={version === 'ulid'}
                onChange={(e) => setVersion(e.target.value as 'v4' | 'v1' | 'v7' | 'ulid')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('uuidGenerator.version.ulid')}
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

        <Button onClick={handleGenerate} className="w-full">
          {t('uuidGenerator.generate')}
        </Button>
      </div>

      {uuidList.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('uuidGenerator.result.label')}
            </h3>
            {uuidList.length > 1 && (
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
                  {isCopied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <><Copy className="w-4 h-4 mr-1" /> {t('uuidGenerator.copy')}</>
                  )}
                </Button>
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
            <p>
              <strong>UUID v7:</strong> {t('uuidGenerator.description.v7')}
            </p>
            <p>
              <strong>ULID:</strong> {t('uuidGenerator.description.ulid')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}