import { useState, useEffect } from 'react';
import { AlertTriangle, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { ToolProps } from '../../types';

interface JWTPayload {
  [key: string]: any;
}

interface DecodedJWT {
  header: JWTPayload;
  payload: JWTPayload;
  signature: string;
  isValid: boolean;
  error?: string;
}

export function JWTViewer() {
  const [inputJWT, setInputJWT] = useState('');
  const [decodedJWT, setDecodedJWT] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState('');
  const { copyToClipboard } = useCopyToClipboard();

  // Base64URL デコード関数
  const base64UrlDecode = (str: string): string => {
    // Base64URL を Base64 に変換
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // パディングを追加
    while (base64.length % 4) {
      base64 += '=';
    }
    try {
      return atob(base64);
    } catch {
      throw new Error('Invalid base64url encoding');
    }
  };

  // JWT デコード関数
  const decodeJWT = (token: string): DecodedJWT => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('JWTは3つの部分（ヘッダー、ペイロード、シグネチャ）から構成される必要があります');
      }

      const [headerPart, payloadPart, signaturePart] = parts;

      // ヘッダーをデコード
      const headerJson = base64UrlDecode(headerPart);
      const header = JSON.parse(headerJson);

      // ペイロードをデコード
      const payloadJson = base64UrlDecode(payloadPart);
      const payload = JSON.parse(payloadJson);

      return {
        header,
        payload,
        signature: signaturePart,
        isValid: true
      };
    } catch (err) {
      return {
        header: {},
        payload: {},
        signature: '',
        isValid: false,
        error: err instanceof Error ? err.message : 'JWTの解析に失敗しました'
      };
    }
  };

  // リアルタイムデコード
  useEffect(() => {
    if (!inputJWT.trim()) {
      setDecodedJWT(null);
      setError('');
      return;
    }

    const decoded = decodeJWT(inputJWT);
    setDecodedJWT(decoded);
    setError(decoded.error || '');

    if (decoded.isValid && onHistoryAdd) {
//       onHistoryAdd({
//         toolId: 'jwt-viewer',
//         input: inputJWT.slice(0, 50) + (inputJWT.length > 50 ? '...' : ''),
//         output: 'JWT解析完了'
//       });
    }
  }, [inputJWT]);

  // 日付のフォーマット
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 期限チェック
  const getExpirationStatus = (exp?: number): { status: string; className: string; message: string } => {
    if (!exp) {
      return { status: 'unknown', className: 'text-gray-500', message: '期限情報なし' };
    }

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = exp - now;

    if (timeLeft < 0) {
      return { 
        status: 'expired', 
        className: 'text-red-500', 
        message: `期限切れ（${Math.abs(timeLeft)}秒前）` 
      };
    } else if (timeLeft < 3600) {
      return { 
        status: 'expiring', 
        className: 'text-orange-500', 
        message: `まもなく期限切れ（${timeLeft}秒後）` 
      };
    } else {
      return { 
        status: 'valid', 
        className: 'text-green-500', 
        message: `有効（${Math.floor(timeLeft / 3600)}時間後に期限切れ）` 
      };
    }
  };

  const handleCopyHeader = async () => {
    if (decodedJWT?.header) {
      await copyToClipboard(JSON.stringify(decodedJWT.header, null, 2));
    }
  };

  const handleCopyPayload = async () => {
    if (decodedJWT?.payload) {
      await copyToClipboard(JSON.stringify(decodedJWT.payload, null, 2));
    }
  };

  const insertSample = () => {
    // 現在時刻から1時間有効なサンプルJWTを動的生成
    const now = Math.floor(Date.now() / 1000);
    const oneHourLater = now + 3600; // 1時間後
    
    const header = {
      alg: "HS256",
      typ: "JWT"
    };
    
    const payload = {
      sub: "1234567890",
      name: "本田 太郎",
      iat: now,
      exp: oneHourLater,
      aud: "example-audience",
      iss: "example-issuer",
      email: "tanaka@example.com",
      role: "user"
    };
    
    // Base64URL エンコード
    const base64UrlEncode = (obj: object) => {
      return btoa(JSON.stringify(obj))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };
    
    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    
    // サンプルなので固定署名を使用（実際のJWTではシークレットキーで署名）
    const signature = "qLdCiYpv5W7c5qzrPqBkTa7eT5PWrYhgBMl_v9Lc-Cs";
    
    const sampleJWT = `${encodedHeader}.${encodedPayload}.${signature}`;
    setInputJWT(sampleJWT);
  };

  const expStatus = decodedJWT?.payload?.exp ? getExpirationStatus(decodedJWT.payload.exp) : null;

  return (
    <div className="space-y-6">
      {/* サンプル挿入 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">JWT Viewer</h3>
        <Button size="sm" variant="outline" onClick={insertSample}>
          サンプル挿入
        </Button>
      </div>

      {/* 入力エリア */}
      <div>
        <label htmlFor="jwt-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          JWT文字列を入力
        </label>
        <textarea
          id="jwt-input"
          value={inputJWT}
          onChange={(e) => setInputJWT(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOi..."
          className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y font-mono text-sm"
        />
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
            <div className="text-sm">
              <div className="font-medium text-red-800 dark:text-red-200 mb-1">JWTエラー</div>
              <div className="text-red-600 dark:text-red-300">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* デコード結果 */}
      {decodedJWT && decodedJWT.isValid && (
        <div className="space-y-4">
          {/* 期限ステータス */}
          {expStatus && (
            <div className={`p-3 rounded-md border ${
              expStatus.status === 'expired' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
              expStatus.status === 'expiring' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
              'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <div className={`flex items-center text-sm font-medium ${expStatus.className}`}>
                {expStatus.status === 'expired' ? <XCircle className="w-4 h-4 mr-2" /> : 
                 expStatus.status === 'expiring' ? <Clock className="w-4 h-4 mr-2" /> : 
                 <CheckCircle className="w-4 h-4 mr-2" />}
                {expStatus.message}
              </div>
            </div>
          )}

          {/* ヘッダー */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">ヘッダー (Header)</h3>
              <Button size="sm" variant="outline" onClick={handleCopyHeader}>
                <Copy className="w-4 h-4 mr-1" />
                コピー
              </Button>
            </div>
            <pre className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm font-mono overflow-x-auto text-gray-900 dark:text-white">
              {JSON.stringify(decodedJWT.header, null, 2)}
            </pre>
            
            {/* ヘッダー情報の説明 */}
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {decodedJWT.header.alg && (
                  <div><strong>アルゴリズム:</strong> {decodedJWT.header.alg}</div>
                )}
                {decodedJWT.header.typ && (
                  <div><strong>タイプ:</strong> {decodedJWT.header.typ}</div>
                )}
                {decodedJWT.header.kid && (
                  <div><strong>キーID:</strong> {decodedJWT.header.kid}</div>
                )}
              </div>
            </div>
          </div>

          {/* ペイロード */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">ペイロード (Payload)</h3>
              <Button size="sm" variant="outline" onClick={handleCopyPayload}>
                <Copy className="w-4 h-4 mr-1" />
                コピー
              </Button>
            </div>
            <pre className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm font-mono overflow-x-auto text-gray-900 dark:text-white">
              {JSON.stringify(decodedJWT.payload, null, 2)}
            </pre>

            {/* 標準クレーム情報 */}
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">標準クレーム</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {decodedJWT.payload.iss && (
                  <div><strong>発行者 (iss):</strong> {decodedJWT.payload.iss}</div>
                )}
                {decodedJWT.payload.sub && (
                  <div><strong>主体 (sub):</strong> {decodedJWT.payload.sub}</div>
                )}
                {decodedJWT.payload.aud && (
                  <div><strong>対象者 (aud):</strong> {Array.isArray(decodedJWT.payload.aud) ? decodedJWT.payload.aud.join(', ') : decodedJWT.payload.aud}</div>
                )}
                {decodedJWT.payload.exp && (
                  <div><strong>期限 (exp):</strong> {formatTimestamp(decodedJWT.payload.exp)}</div>
                )}
                {decodedJWT.payload.nbf && (
                  <div><strong>有効開始 (nbf):</strong> {formatTimestamp(decodedJWT.payload.nbf)}</div>
                )}
                {decodedJWT.payload.iat && (
                  <div><strong>発行時刻 (iat):</strong> {formatTimestamp(decodedJWT.payload.iat)}</div>
                )}
                {decodedJWT.payload.jti && (
                  <div><strong>JWT ID (jti):</strong> {decodedJWT.payload.jti}</div>
                )}
              </div>
            </div>
          </div>

          {/* シグネチャ */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">シグネチャ (Signature)</h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-3">
              <code className="text-sm font-mono text-gray-900 dark:text-white break-all">
                {decodedJWT.signature}
              </code>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <AlertTriangle className="w-4 h-4 inline mr-1" /> このツールはJWTの構造を表示するだけで、シグネチャの検証は行いません。
              セキュリティが重要な場合は、適切な検証ライブラリを使用してください。
            </p>
          </div>
        </div>
      )}

      {/* 使用方法 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">使用方法</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• JWT（JSON Web Token）文字列を上のテキストエリアに貼り付けてください</li>
          <li>• ヘッダーとペイロードが自動的にデコードされ、見やすい形式で表示されます</li>
          <li>• 期限（exp）がある場合、有効性がチェックされます</li>
          <li>• このツールは表示専用で、シグネチャの検証は行いません</li>
        </ul>
      </div>
    </div>
  );
}