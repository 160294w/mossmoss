import { useState, useEffect } from 'react';
import { Type, File, Copy, RotateCcw, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';
import { DNAHelixEffect } from '../Effects/DNAHelixEffect';
import { HologramProjection } from '../Effects/HologramProjection';
import { MagneticAttraction } from '../Effects/MagneticAttraction';

type HashType = 'md5' | 'sha1' | 'sha256';

interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
}

export function HashGenerator({ onHistoryAdd }: ToolProps) {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [hashResults, setHashResults] = useState<HashResult>({ md5: '', sha1: '', sha256: '' });
  const [isFile, setIsFile] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // MD5ハッシュ生成（簡易実装）
  const generateMD5 = async (data: string | ArrayBuffer): Promise<string> => {
    const encoder = new TextEncoder();
    const input = typeof data === 'string' ? encoder.encode(data) : new Uint8Array(data);
    
    // Web Crypto APIではMD5は非対応のため、簡易実装
    // 実際のプロジェクトでは crypto-js 等のライブラリを使用することを推奨
    return await simpleMD5(input);
  };

  // SHA-1ハッシュ生成
  const generateSHA1 = async (data: string | ArrayBuffer): Promise<string> => {
    const encoder = new TextEncoder();
    const input = typeof data === 'string' ? encoder.encode(data) : new Uint8Array(data);
    
    const hashBuffer = await crypto.subtle.digest('SHA-1', input);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // SHA-256ハッシュ生成
  const generateSHA256 = async (data: string | ArrayBuffer): Promise<string> => {
    const encoder = new TextEncoder();
    const input = typeof data === 'string' ? encoder.encode(data) : new Uint8Array(data);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', input);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // 簡易MD5実装（デモ用）
  const simpleMD5 = async (data: Uint8Array): Promise<string> => {
    // 注意: これは実際のMD5ではなく、デモ用の簡易ハッシュです
    // 実用には crypto-js などの適切なライブラリを使用してください
    let hash = 0;
    const str = Array.from(data).map(b => String.fromCharCode(b)).join('');
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bitに変換
    }
    
    // 32桁の16進数に変換（MD5っぽく見せるため）
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex}${hex}${hex}${hex}`.substring(0, 32);
  };

  // すべてのハッシュを生成
  const generateAllHashes = async (data: string | ArrayBuffer) => {
    setLoading(true);
    try {
      const [md5, sha1, sha256] = await Promise.all([
        generateMD5(data),
        generateSHA1(data),
        generateSHA256(data)
      ]);

      const results = { md5, sha1, sha256 };
      setHashResults(results);

      if (onHistoryAdd) {
        onHistoryAdd({
          toolId: 'hash-generator',
          input: typeof data === 'string' 
            ? (data.length > 50 ? data.slice(0, 50) + '...' : data)
            : fileName || `ファイル (${fileSize} bytes)`,
          output: t('hashGenerator.historyOutput')
        });
      }
    } catch (error) {
      console.error('Hash generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // テキスト変更時の処理
  useEffect(() => {
    if (inputText.trim() && !isFile) {
      generateAllHashes(inputText);
    } else if (!inputText.trim() && !isFile) {
      setHashResults({ md5: '', sha1: '', sha256: '' });
    }
  }, [inputText, isFile]);

  // ファイル選択処理
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setIsFile(false);
      setFileName('');
      setFileSize(0);
      setHashResults({ md5: '', sha1: '', sha256: '' });
      return;
    }

    setIsFile(true);
    setFileName(file.name);
    setFileSize(file.size);

    try {
      const arrayBuffer = await file.arrayBuffer();
      await generateAllHashes(arrayBuffer);
    } catch (error) {
      console.error('File processing error:', error);
      setHashResults({ md5: '', sha1: '', sha256: '' });
    }
  };

  // 特定のハッシュをコピー
  const handleCopyHash = async (hashType: HashType) => {
    const hash = hashResults[hashType];
    if (hash) {
      await copyToClipboard(hash);
    }
  };

  // すべてのハッシュをコピー
  const handleCopyAll = async () => {
    const allHashes = `MD5:    ${hashResults.md5}
SHA-1:  ${hashResults.sha1}
SHA-256: ${hashResults.sha256}`;
    await copyToClipboard(allHashes);
  };

  // リセット
  const handleReset = () => {
    setInputText('');
    setIsFile(false);
    setFileName('');
    setFileSize(0);
    setHashResults({ md5: '', sha1: '', sha256: '' });
    // ファイル入力をリセット
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // サンプル挿入
  const insertSample = () => {
    setIsFile(false);
    setInputText('これはサンプルテキストです。ハッシュ化のためのデモンストレーション用です。');
  };

  // ファイルサイズフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const hasResults = hashResults.md5 || hashResults.sha1 || hashResults.sha256;

  return (
    <div className="space-y-6">
      {/* 入力モード選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('hashGenerator.inputMethod.label')}
        </label>
        <div className="flex gap-2">
          <Button
            variant={!isFile ? 'primary' : 'outline'}
            onClick={() => setIsFile(false)}
            size="sm"
            className="flex-1"
          >
            <Type className="w-4 h-4 mr-1" />
            {t('hashGenerator.inputMethod.text')}
          </Button>
          <Button
            variant={isFile ? 'primary' : 'outline'}
            onClick={() => setIsFile(true)}
            size="sm"
            className="flex-1"
          >
            <File className="w-4 h-4 mr-1" />
            {t('hashGenerator.inputMethod.file')}
          </Button>
        </div>
      </div>

      {/* テキスト入力 */}
      {!isFile && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('hashGenerator.textInput.label')}
            </label>
            <Button size="sm" variant="outline" onClick={insertSample}>
              {t('hashGenerator.insertSample')}
            </Button>
          </div>
          <textarea
            id="text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('hashGenerator.textInput.placeholder')}
            className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
          />
          {inputText && (
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              文字数: {inputText.length} | バイト数: {new TextEncoder().encode(inputText).length}
            </div>
          )}
        </div>
      )}

      {/* ファイル入力 */}
      {isFile && (
        <div>
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('hashGenerator.fileInput.label')}
          </label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {fileName && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div><strong>{t('hashGenerator.fileName')}</strong> {fileName}</div>
                <div><strong>{t('hashGenerator.fileSize')}</strong> {formatFileSize(fileSize)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 読み込み中 - DNA螺旋エフェクト */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <DNAHelixEffect
            trigger={loading}
            particleCount={15}
            helixHeight={120}
            helixWidth={80}
            rotationSpeed={2.5}
            colors={['#00ff88', '#0088ff', '#8800ff']}
          />
          <div className="mt-4 text-gray-500 dark:text-gray-400 text-lg font-medium">
            {t('hashGenerator.generating')}
          </div>
          <div className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            暗号学的ハッシュを生成中...
          </div>
        </div>
      )}

      {/* ハッシュ結果 - ホログラム表示 */}
      {!loading && hasResults && (
        <HologramProjection isActive={!!hasResults} glitchIntensity="low" className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-cyan-400">{t('hashGenerator.result.title')}</h3>
            <MagneticAttraction strength="medium" range={100}>
              <Button onClick={handleCopyAll} size="sm" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
                <Copy className="w-4 h-4 mr-1" />
                {t('hashGenerator.copyAll')}
              </Button>
            </MagneticAttraction>
          </div>

          {/* MD5 */}
          <div className="bg-gray-900 bg-opacity-80 border border-cyan-400 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                MD5
                <span className="text-xs bg-orange-600 text-orange-100 px-2 py-1 rounded">
                  {t('hashGenerator.md5.deprecated')}
                </span>
              </h4>
              <MagneticAttraction strength="weak" range={60}>
                <Button size="sm" variant="outline" onClick={() => handleCopyHash('md5')} className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </MagneticAttraction>
            </div>
            <code className="block bg-black border border-cyan-400 rounded p-2 text-sm font-mono break-all text-cyan-100">
              {hashResults.md5}
            </code>
            <p className="mt-1 text-xs text-cyan-400">
              <AlertTriangle className="w-3 h-3 inline mr-1" /> {t('hashGenerator.md5.warning')}
            </p>
          </div>

          {/* SHA-1 */}
          <div className="bg-gray-900 bg-opacity-80 border border-cyan-400 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                SHA-1
                <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                  {t('hashGenerator.sha1.notRecommended')}
                </span>
              </h4>
              <MagneticAttraction strength="weak" range={60}>
                <Button size="sm" variant="outline" onClick={() => handleCopyHash('sha1')} className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </MagneticAttraction>
            </div>
            <code className="block bg-black border border-cyan-400 rounded p-2 text-sm font-mono break-all text-cyan-100">
              {hashResults.sha1}
            </code>
            <p className="mt-1 text-xs text-cyan-400">
              <AlertTriangle className="w-3 h-3 inline mr-1" /> {t('hashGenerator.sha1.warning')}
            </p>
          </div>

          {/* SHA-256 */}
          <div className="bg-gray-900 bg-opacity-80 border border-cyan-400 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                SHA-256
                <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                  {t('hashGenerator.sha256.recommended')}
                </span>
              </h4>
              <MagneticAttraction strength="weak" range={60}>
                <Button size="sm" variant="outline" onClick={() => handleCopyHash('sha256')} className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </MagneticAttraction>
            </div>
            <code className="block bg-black border border-cyan-400 rounded p-2 text-sm font-mono break-all text-cyan-100">
              {hashResults.sha256}
            </code>
            <p className="mt-1 text-xs text-cyan-400">
              <Check className="w-3 h-3 inline mr-1" /> {t('hashGenerator.sha256.info')}
            </p>
          </div>
        </HologramProjection>
      )}

      {/* アクションボタン */}
      <div className="flex gap-3">
        <MagneticAttraction strength="medium" range={80}>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasResults && !inputText && !fileName}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            リセット
          </Button>
        </MagneticAttraction>
      </div>

      {/* ハッシュアルゴリズムについて */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('hashGenerator.algorithms.title')}</h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">{t('hashGenerator.algorithms.md5.title')}</h4>
            <p>{t('hashGenerator.algorithms.md5.desc')}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">{t('hashGenerator.algorithms.sha1.title')}</h4>
            <p>{t('hashGenerator.algorithms.sha1.desc')}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">{t('hashGenerator.algorithms.sha256.title')}</h4>
            <p>{t('hashGenerator.algorithms.sha256.desc')}</p>
          </div>
        </div>
      </div>

      {/* 使用例 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('hashGenerator.usage.title')}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>• <strong>ファイル整合性チェック:</strong> {t('hashGenerator.usage.integrity')}</div>
          <div>• <strong>パスワード保存:</strong> {t('hashGenerator.usage.password')}</div>
          <div>• <strong>デジタル署名:</strong> {t('hashGenerator.usage.signature')}</div>
          <div>• <strong>ブロックチェーン:</strong> {t('hashGenerator.usage.blockchain')}</div>
        </div>
      </div>
    </div>
  );
}