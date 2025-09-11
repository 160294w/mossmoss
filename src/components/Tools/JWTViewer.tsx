import { useState, useEffect } from 'react';
import { AlertTriangle, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';
import { HologramProjection } from '../Effects/HologramProjection';
import { MagneticAttraction } from '../Effects/MagneticAttraction';

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

export function JWTViewer({ onHistoryAdd }: ToolProps) {
  const [inputJWT, setInputJWT] = useState('');
  const [decodedJWT, setDecodedJWT] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState('');
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLanguage();

  // Base64URL デコード関数（UTF-8対応）
  const base64UrlDecode = (str: string): string => {
    // Base64URL を Base64 に変換
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // パディングを追加
    while (base64.length % 4) {
      base64 += '=';
    }
    try {
      const binaryString = atob(base64);
      // バイナリ文字列をUint8Arrayに変換
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      // UTF-8デコード
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(uint8Array);
    } catch {
      throw new Error(t('jwtViewer.error.invalidBase64'));
    }
  };

  // JWT デコード関数
  const decodeJWT = (token: string): DecodedJWT => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error(t('jwtViewer.error.invalidFormat'));
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
        error: err instanceof Error ? err.message : t('jwtViewer.error.decodeFailed')
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

    if (decoded.isValid) {
      onHistoryAdd?.({
        toolId: 'jwt-viewer',
        input: inputJWT.slice(0, 50) + (inputJWT.length > 50 ? '...' : ''),
        output: t('jwtViewer.historyOutput')
      });
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
      return { status: 'unknown', className: 'text-gray-500', message: t('jwtViewer.status.noExpiration') };
    }

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = exp - now;

    if (timeLeft < 0) {
      return { 
        status: 'expired', 
        className: 'text-red-500', 
        message: t('jwtViewer.status.expired').replace('{seconds}', Math.abs(timeLeft).toString()) 
      };
    } else if (timeLeft < 3600) {
      return { 
        status: 'expiring', 
        className: 'text-orange-500', 
        message: t('jwtViewer.status.expiring').replace('{seconds}', timeLeft.toString()) 
      };
    } else {
      return { 
        status: 'valid', 
        className: 'text-green-500', 
        message: t('jwtViewer.status.valid').replace('{hours}', Math.floor(timeLeft / 3600).toString()) 
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
    console.log('insertSample called'); // デバッグ用
    
    // 現在時刻から1時間有効なサンプルJWTを動的生成
    const now = Math.floor(Date.now() / 1000);
    const oneHourLater = now + 3600; // 1時間後
    
    const header = {
      alg: "HS256",
      typ: "JWT"
    };
    
    const payload = {
      sub: "1234567890",
      name: "田中太郎",
      iat: now,
      exp: oneHourLater,
      aud: "example-audience",
      iss: "example-issuer", 
      email: "tanaka@example.com",
      role: "user"
    };
    
    // より確実なBase64URL エンコード関数
    const base64UrlEncode = (obj: object) => {
      const jsonString = JSON.stringify(obj);
      
      // WebブラウザのWebCrypto APIを使う代わりに、確実な方法を使用
      let base64String;
      try {
        // 最初にUTF-8バイトシーケンスを作成
        const utf8Bytes = new TextEncoder().encode(jsonString);
        
        // Uint8ArrayをBase64文字列に変換
        const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
        base64String = btoa(binaryString);
      } catch (e) {
        // フォールバック: 元の方法
        console.warn('Using fallback base64 encoding');
        base64String = btoa(unescape(encodeURIComponent(jsonString)));
      }
      
      // Base64からBase64URLに変換
      return base64String
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };
    
    try {
      const encodedHeader = base64UrlEncode(header);
      const encodedPayload = base64UrlEncode(payload);
      
      // サンプルなので固定署名を使用（実際のJWTではシークレットキーで署名）
      const signature = "qLdCiYpv5W7c5qzrPqBkTa7eT5PWrYhgBMl_v9Lc-Cs";
      
      const sampleJWT = `${encodedHeader}.${encodedPayload}.${signature}`;
      console.log('Generated JWT:', sampleJWT); // デバッグ用
      console.log('Encoded header:', encodedHeader);
      console.log('Encoded payload:', encodedPayload);
      
      setInputJWT(sampleJWT);
    } catch (error) {
      console.error('Error generating sample JWT:', error);
      // エラーの場合は固定のサンプルを使用
      const fallbackJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU3MDU2MDAsImF1ZCI6InNhbXBsZS1hdWRpZW5jZSIsImlzcyI6InNhbXBsZS1pc3N1ZXIiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wPzzNFbLI";
      setInputJWT(fallbackJWT);
    }
  };

  const expStatus = decodedJWT?.payload?.exp ? getExpirationStatus(decodedJWT.payload.exp) : null;

  return (
    <div className="space-y-6">
      {/* サンプル挿入 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('jwtViewer.title')}</h3>
        <MagneticAttraction strength="medium" range={80}>
          <Button size="sm" variant="outline" onClick={insertSample}>
            {t('jwtViewer.insertSample')}
          </Button>
        </MagneticAttraction>
      </div>

      {/* 入力エリア */}
      <div>
        <label htmlFor="jwt-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('jwtViewer.input.label')}
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
              <div className="font-medium text-red-800 dark:text-red-200 mb-1">{t('jwtViewer.error.title')}</div>
              <div className="text-red-600 dark:text-red-300">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* デコード結果 - ホログラム投影 */}
      {decodedJWT && decodedJWT.isValid && (
        <HologramProjection isActive={true} glitchIntensity="medium">
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
          <div className="bg-gray-900 bg-opacity-80 border border-cyan-400 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-cyan-300">{t('jwtViewer.header.title')}</h3>
              <MagneticAttraction strength="medium" range={80}>
                <Button size="sm" variant="outline" onClick={handleCopyHeader} className="border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black">
                  <Copy className="w-4 h-4 mr-1" />
                  {t('common.copy')}
                </Button>
              </MagneticAttraction>
            </div>
            <pre className="bg-black border border-cyan-400 rounded-md p-3 text-sm font-mono overflow-x-auto text-cyan-100">
              {JSON.stringify(decodedJWT.header, null, 2)}
            </pre>
            
            {/* ヘッダー情報の説明 */}
            <div className="mt-3 text-sm text-cyan-400">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {decodedJWT.header.alg && (
                  <div><strong className="text-cyan-300">{t('jwtViewer.algorithm')}:</strong> {decodedJWT.header.alg}</div>
                )}
                {decodedJWT.header.typ && (
                  <div><strong className="text-cyan-300">{t('jwtViewer.type')}:</strong> {decodedJWT.header.typ}</div>
                )}
                {decodedJWT.header.kid && (
                  <div><strong className="text-cyan-300">{t('jwtViewer.keyId')}:</strong> {decodedJWT.header.kid}</div>
                )}
              </div>
            </div>
          </div>

          {/* ペイロード */}
          <div className="bg-gray-900 bg-opacity-80 border border-cyan-400 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-cyan-300">{t('jwtViewer.payload.title')}</h3>
              <MagneticAttraction strength="medium" range={80}>
                <Button size="sm" variant="outline" onClick={handleCopyPayload} className="border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black">
                  <Copy className="w-4 h-4 mr-1" />
                  {t('common.copy')}
                </Button>
              </MagneticAttraction>
            </div>
            <pre className="bg-black border border-cyan-400 rounded-md p-3 text-sm font-mono overflow-x-auto text-cyan-100">
              {JSON.stringify(decodedJWT.payload, null, 2)}
            </pre>

            {/* 標準クレーム情報 */}
            <div className="mt-3 text-sm text-cyan-400">
              <h4 className="font-medium text-cyan-300 mb-2">{t('jwtViewer.claims.title')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {decodedJWT.payload.iss && (
                  <div><strong className="text-cyan-300">{t('jwtViewer.claims.issuer')}:</strong> {decodedJWT.payload.iss}</div>
                )}
                {decodedJWT.payload.sub && (
                  <div><strong className="text-cyan-300">{t('jwtViewer.claims.subject')}:</strong> {decodedJWT.payload.sub}</div>
                )}
                {decodedJWT.payload.aud && (
                  <div><strong className="text-cyan-300">{t('jwtViewer.claims.audience')}:</strong> {Array.isArray(decodedJWT.payload.aud) ? decodedJWT.payload.aud.join(', ') : decodedJWT.payload.aud}</div>
                )}
                {decodedJWT.payload.exp && (
                  <div><strong className="text-cyan-300">{t('jwtViewer.claims.expiration')}:</strong> {formatTimestamp(decodedJWT.payload.exp)}</div>
                )}
                {decodedJWT.payload.nbf && (
                  <div><strong className="text-cyan-300">{t('jwtViewer.claims.notBefore')}:</strong> {formatTimestamp(decodedJWT.payload.nbf)}</div>
                )}
                {decodedJWT.payload.iat && (
                  <div><strong className="text-cyan-300">{t('jwtViewer.claims.issuedAt')}:</strong> {formatTimestamp(decodedJWT.payload.iat)}</div>
                )}
                {decodedJWT.payload.jti && (
                  <div><strong className="text-cyan-300">{t('jwtViewer.claims.jwtId')}:</strong> {decodedJWT.payload.jti}</div>
                )}
              </div>
            </div>
          </div>

          {/* シグネチャ */}
          <div className="bg-gray-900 bg-opacity-80 border border-cyan-400 rounded-lg p-4">
            <h3 className="text-lg font-medium text-cyan-300 mb-3">{t('jwtViewer.signature.title')}</h3>
            <div className="bg-black border border-cyan-400 rounded-md p-3">
              <code className="text-sm font-mono text-cyan-100 break-all">
                {decodedJWT.signature}
              </code>
            </div>
            <p className="mt-2 text-sm text-cyan-400">
              <AlertTriangle className="w-4 h-4 inline mr-1 text-orange-400" /> {t('jwtViewer.signature.warning')}
            </p>
          </div>
        </div>
        </HologramProjection>
      )}

      {/* 使用方法 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('jwtViewer.usage.title')}</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• {t('jwtViewer.usage.step1')}</li>
          <li>• {t('jwtViewer.usage.step2')}</li>
          <li>• {t('jwtViewer.usage.step3')}</li>
          <li>• {t('jwtViewer.usage.step4')}</li>
        </ul>
      </div>
    </div>
  );
}