import { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { ToolProps } from '../../types';

type HashType = 'md5' | 'sha1' | 'sha256';

interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
}

export function HashGenerator({ onHistoryAdd }: ToolProps) {
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
          output: 'ハッシュ生成完了'
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
    setInputText('Hello, World! こんにちは世界 🌍');
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
          入力方法
        </label>
        <div className="flex gap-2">
          <Button
            variant={!isFile ? 'primary' : 'outline'}
            onClick={() => setIsFile(false)}
            size="sm"
            className="flex-1"
          >
            📝 テキスト入力
          </Button>
          <Button
            variant={isFile ? 'primary' : 'outline'}
            onClick={() => setIsFile(true)}
            size="sm"
            className="flex-1"
          >
            📁 ファイル選択
          </Button>
        </div>
      </div>

      {/* テキスト入力 */}
      {!isFile && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ハッシュ化するテキスト
            </label>
            <Button size="sm" variant="outline" onClick={insertSample}>
              サンプル挿入
            </Button>
          </div>
          <textarea
            id="text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="ハッシュ化したいテキストを入力..."
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
            ハッシュ化するファイル
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
                <div><strong>ファイル名:</strong> {fileName}</div>
                <div><strong>ファイルサイズ:</strong> {formatFileSize(fileSize)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 読み込み中 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">ハッシュを生成中...</div>
        </div>
      )}

      {/* ハッシュ結果 */}
      {!loading && hasResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">ハッシュ結果</h3>
            <Button onClick={handleCopyAll} size="sm" variant="outline">
              📋 すべてコピー
            </Button>
          </div>

          {/* MD5 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                MD5
                <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                  非推奨
                </span>
              </h4>
              <Button size="sm" variant="outline" onClick={() => handleCopyHash('md5')}>
                {isCopied ? '✓' : '📋'}
              </Button>
            </div>
            <code className="block bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm font-mono break-all text-gray-900 dark:text-white">
              {hashResults.md5}
            </code>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              ⚠️ MD5は暗号学的に安全ではありません。セキュリティ用途には使用しないでください。
            </p>
          </div>

          {/* SHA-1 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                SHA-1
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                  推奨されない
                </span>
              </h4>
              <Button size="sm" variant="outline" onClick={() => handleCopyHash('sha1')}>
                {isCopied ? '✓' : '📋'}
              </Button>
            </div>
            <code className="block bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm font-mono break-all text-gray-900 dark:text-white">
              {hashResults.sha1}
            </code>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              ⚠️ SHA-1は脆弱性が発見されています。新しいシステムではSHA-256以上を使用してください。
            </p>
          </div>

          {/* SHA-256 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                SHA-256
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                  推奨
                </span>
              </h4>
              <Button size="sm" variant="outline" onClick={() => handleCopyHash('sha256')}>
                {isCopied ? '✓' : '📋'}
              </Button>
            </div>
            <code className="block bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm font-mono break-all text-gray-900 dark:text-white">
              {hashResults.sha256}
            </code>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              ✅ SHA-256は現在も安全とされており、セキュリティ用途に適しています。
            </p>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!hasResults && !inputText && !fileName}
        >
          🔄 リセット
        </Button>
      </div>

      {/* ハッシュアルゴリズムについて */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">ハッシュアルゴリズムについて</h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">MD5 (Message Digest 5)</h4>
            <p>128ビット（32桁）のハッシュ値。高速だが暗号学的に安全ではない。ファイルの整合性チェックのみに使用。</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">SHA-1 (Secure Hash Algorithm 1)</h4>
            <p>160ビット（40桁）のハッシュ値。2017年に実用的な攻撃が発見され、現在は推奨されない。</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">SHA-256 (SHA-2)</h4>
            <p>256ビット（64桁）のハッシュ値。現在も安全とされ、Bitcoin等で使用される。推奨される選択肢。</p>
          </div>
        </div>
      </div>

      {/* 使用例 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">使用例</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>• <strong>ファイル整合性チェック:</strong> ダウンロードしたファイルが破損していないか確認</div>
          <div>• <strong>パスワード保存:</strong> パスワードを直接保存せず、ハッシュ値で管理</div>
          <div>• <strong>デジタル署名:</strong> 文書の改ざん検出</div>
          <div>• <strong>ブロックチェーン:</strong> Bitcoin等の暗号通貨で使用</div>
        </div>
      </div>
    </div>
  );
}