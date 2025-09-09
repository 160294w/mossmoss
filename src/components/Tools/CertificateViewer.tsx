import { useState } from 'react';
import forge from 'node-forge';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { HistoryItem } from '../../types';

interface CertificateViewerProps {
  onHistoryAdd: (item: Omit<HistoryItem, 'timestamp'>) => void;
}

interface CertificateInfo {
  version: string;
  serialNumber: string;
  issuer: { [key: string]: string };
  subject: { [key: string]: string };
  validFrom: string;
  validTo: string;
  publicKey: {
    algorithm: string;
    keySize?: string;
    exponent?: string;
    curve?: string;
  };
  signature: {
    algorithm: string;
    hash: string;
  };
  extensions: { [key: string]: any };
  fingerprints: {
    sha1: string;
    sha256: string;
  };
}

export function CertificateViewer({ onHistoryAdd }: CertificateViewerProps) {
  const [inputCert, setInputCert] = useState('');
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // node-forgeを使って証明書を解析
  const parseCertificate = (certPem: string): CertificateInfo => {
    try {
      // PEM形式の証明書をnode-forgeで解析
      const cert = forge.pki.certificateFromPem(certPem);
      
      // 発行者情報を取得
      const issuer: { [key: string]: string } = {};
      cert.issuer.attributes.forEach(attr => {
        issuer[attr.shortName || attr.name] = attr.value;
      });

      // 主体者情報を取得
      const subject: { [key: string]: string } = {};
      cert.subject.attributes.forEach(attr => {
        subject[attr.shortName || attr.name] = attr.value;
      });

      // 公開鍵情報を取得
      const publicKey = cert.publicKey as forge.pki.rsa.PublicKey;
      let keyInfo = {
        algorithm: 'Unknown',
        keySize: 'Unknown',
        exponent: 'Unknown'
      };

      if ((publicKey as any).n) { // RSA key
        const rsaKey = publicKey as forge.pki.rsa.PublicKey;
        keyInfo = {
          algorithm: 'RSA',
          keySize: `${rsaKey.n.bitLength()} bits`,
          exponent: `${rsaKey.e.toString()} (0x${rsaKey.e.toString(16).toUpperCase()})`
        };
      }

      // 拡張情報を取得
      const extensions: { [key: string]: any } = {};
      cert.extensions.forEach(ext => {
        const name = ext.name || `OID ${ext.id}`;
        if (ext.name === 'keyUsage') {
          const keyUsage = ext as forge.pki.KeyUsageExtension;
          const uses: string[] = [];
          if (keyUsage.digitalSignature) uses.push('Digital Signature');
          if (keyUsage.keyEncipherment) uses.push('Key Encipherment');
          if (keyUsage.dataEncipherment) uses.push('Data Encipherment');
          if (keyUsage.keyAgreement) uses.push('Key Agreement');
          if (keyUsage.keyCertSign) uses.push('Certificate Signing');
          if (keyUsage.cRLSign) uses.push('CRL Signing');
          extensions[name] = uses.join(', ');
        } else if (ext.name === 'subjectAltName') {
          const altNames = (ext as any).altNames || [];
          const names = altNames.map((alt: any) => {
            if (alt.type === 2) return `DNS:${alt.value}`;
            if (alt.type === 7) return `IP:${alt.value}`;
            return alt.value;
          });
          extensions[name] = names.join(', ');
        } else if (ext.name === 'basicConstraints') {
          const basicConstraints = ext as forge.pki.BasicConstraintsExtension;
          extensions[name] = `CA:${basicConstraints.cA ? 'TRUE' : 'FALSE'}`;
          if (basicConstraints.pathLenConstraint !== undefined) {
            extensions[name] += `, pathlen:${basicConstraints.pathLenConstraint}`;
          }
        } else {
          extensions[name] = ext.value || 'Present';
        }
      });

      // フィンガープリントを計算
      const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
      const sha1Hash = forge.md.sha1.create();
      sha1Hash.update(certDer);
      const sha256Hash = forge.md.sha256.create();
      sha256Hash.update(certDer);

      const sha1Fingerprint = sha1Hash.digest().toHex().match(/.{2}/g)?.join(':').toUpperCase() || '';
      const sha256Fingerprint = sha256Hash.digest().toHex().match(/.{2}/g)?.join(':').toUpperCase() || '';

      const certInfo: CertificateInfo = {
        version: `v${cert.version + 1} (${cert.version})`,
        serialNumber: '0x' + cert.serialNumber.toUpperCase(),
        issuer,
        subject,
        validFrom: cert.validity.notBefore.toISOString(),
        validTo: cert.validity.notAfter.toISOString(),
        publicKey: keyInfo,
        signature: {
          algorithm: cert.signatureOid || 'Unknown',
          hash: cert.siginfo?.algorithmOid || 'Unknown'
        },
        extensions,
        fingerprints: {
          sha1: sha1Fingerprint,
          sha256: sha256Fingerprint
        }
      };

      return certInfo;
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Invalid PEM formatted message')) {
          throw new Error('PEM形式が不正です。-----BEGIN CERTIFICATE-----で始まり-----END CERTIFICATE-----で終わる形式で入力してください。');
        }
        if (err.message.includes('ASN.1')) {
          throw new Error('証明書のASN.1構造が不正です。有効な証明書を入力してください。');
        }
        throw new Error(`証明書の解析エラー: ${err.message}`);
      }
      throw new Error('証明書の解析中に予期しないエラーが発生しました。');
    }
  };

  const handleCertInput = (value: string) => {
    setInputCert(value);
    setError(null);

    if (!value.trim()) {
      setCertInfo(null);
      return;
    }

    try {
      const info = parseCertificate(value);
      setCertInfo(info);
      
      onHistoryAdd({
        toolId: 'certificate-viewer',
        result: '証明書情報を解析'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '証明書の解析エラー');
      setCertInfo(null);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const isExpired = (validTo: string): boolean => {
    return new Date(validTo) < new Date();
  };

  const getDaysUntilExpiry = (validTo: string): number => {
    const expiry = new Date(validTo);
    const now = new Date();
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleCopyCert = () => {
    copyToClipboard(inputCert);
  };

  const insertSampleCert = () => {
    const sampleCert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/OvYOtSXMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAlVTMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjIwMTE1MTAzMDAwWhcNMjUwMTE0MTAzMDAwWjBF
MQswCQYDVQQGEwJVUzETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAu1SU1LfVLPHCozMxH2Mo4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onL
Rnrq0/IzW7yWR7QkrmBL7jTKEn5u+qKhbwKfBstIs+bMprp1yBjsftmulVcmgbP1
iMAA49mqF4o8nY0tSPHTCgE8WD1L3vD4TgmSgNWXO4L9DAhk0yFV9nqGKHu6vLb6
I8vhkbGc1RjbZILdQFJZhAOtNa6eI4GDzxNhQNlO7a5ltk8XArHg5rR7jPJyaJVy
GGCDhYL9JqS9KNGsFoafN0rKzJwC0lCe2MuOEuTZ7QJCyG+7Znn1g9z5O2qfLa8b
tZzwUhZs1wJN9cK+WMLnLHbXnClVEQIDAQABo1AwTjAdBgNVHQ4EFgQUhKD2DLjH
3qX6Lx1fSE7Q5G6pT7cEJkwHwYDVR0jBBgwFoAUhKD2DLjH3qX6Lx1fSE7Q5G6p
T7cEJkwDAYDVR0TAQH/BAIwADANBgkqhkiG9w0BAQsFAAOCAQEAZwwIdHCO4oUN
d1yhXC1OIElkzDoGvPk8V1zBWv8VC7WNkWF4RZzgRfZzDJQw2kBsXdhtYQ8Lk3oN
jLI8eP0CXuE7WjXaFBOTlhJrEzpE5sSaTPMW5TZN8qUKpR9wdRqjLrktFBCmXCVA
7QjGC4yJ5I4WnD0Qw6Q+dHjVoUnQ6+yTQ8Jm3I5dG9vCXjYF5UH5BhIkBJ2GFQP0
2BNmQdnM2dKWmCo7GxHyUQOvnvGqFI9vwFb+T8DgVp5pTQ7rKFq0GZbELa5lPQoE
7XxF5hF5xZkOWnJvELgbOFq4Ry8gCCzgRq3CvhUKt1gvNyS5w5FK9Yoe7YdEh4n2
jBzFT9nJ2g==
-----END CERTIFICATE-----`;

    setInputCert(sampleCert);
    handleCertInput(sampleCert);
  };

  const clearAll = () => {
    setInputCert('');
    setCertInfo(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            X.509証明書入力
          </h3>
          <div className="flex space-x-2">
            <Button onClick={insertSampleCert} variant="outline" size="sm">
              サンプル証明書
            </Button>
            <Button onClick={handleCopyCert} variant="outline" size="sm">
              {isCopied ? 'コピー済み!' : '証明書をコピー'}
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm">
              クリア
            </Button>
          </div>
        </div>

        <textarea
          value={inputCert}
          onChange={(e) => handleCertInput(e.target.value)}
          placeholder="-----BEGIN CERTIFICATE-----で始まるPEM形式の証明書を入力してください..."
          rows={8}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-y"
        />

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">
              <strong>エラー:</strong> {error}
            </p>
          </div>
        )}
      </div>

      {certInfo && (
        <div className="space-y-6">
          {/* 有効期限の警告 */}
          {isExpired(certInfo.validTo) ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 font-semibold">
                ⚠️ この証明書は有効期限切れです
              </p>
            </div>
          ) : getDaysUntilExpiry(certInfo.validTo) <= 30 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                ⚠️ この証明書は{getDaysUntilExpiry(certInfo.validTo)}日後に有効期限切れになります
              </p>
            </div>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 font-semibold">
                ✅ この証明書は有効です（{getDaysUntilExpiry(certInfo.validTo)}日間有効）
              </p>
            </div>
          )}

          {/* 基本情報 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">基本情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">バージョン</label>
                <p className="text-sm text-gray-900 dark:text-white">{certInfo.version}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">シリアル番号</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{certInfo.serialNumber}</p>
              </div>
            </div>
          </div>

          {/* 発行者・主体者情報 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">発行者 (Issuer)</h3>
              <div className="space-y-2">
                {Object.entries(certInfo.issuer).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{key}</label>
                    <p className="text-sm text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">主体者 (Subject)</h3>
              <div className="space-y-2">
                {Object.entries(certInfo.subject).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{key}</label>
                    <p className="text-sm text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 有効期限 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">有効期限</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">有効期限開始</label>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(certInfo.validFrom)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">有効期限終了</label>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(certInfo.validTo)}</p>
              </div>
            </div>
          </div>

          {/* 公開鍵情報 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">公開鍵</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">アルゴリズム</label>
                <p className="text-sm text-gray-900 dark:text-white">{certInfo.publicKey.algorithm}</p>
              </div>
              {certInfo.publicKey.keySize && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">鍵サイズ</label>
                  <p className="text-sm text-gray-900 dark:text-white">{certInfo.publicKey.keySize}</p>
                </div>
              )}
              {certInfo.publicKey.exponent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">指数</label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{certInfo.publicKey.exponent}</p>
                </div>
              )}
            </div>
          </div>

          {/* 署名情報 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">署名</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">署名アルゴリズム</label>
                <p className="text-sm text-gray-900 dark:text-white">{certInfo.signature.algorithm}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ハッシュ関数</label>
                <p className="text-sm text-gray-900 dark:text-white">{certInfo.signature.hash}</p>
              </div>
            </div>
          </div>

          {/* 拡張情報 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">拡張</h3>
            <div className="space-y-2">
              {Object.entries(certInfo.extensions).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{key}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* フィンガープリント */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">フィンガープリント</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SHA-1</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono break-all">{certInfo.fingerprints.sha1}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SHA-256</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono break-all">{certInfo.fingerprints.sha256}</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>注意:</strong> この証明書ビューアーは教育・デバッグ目的のものです。実際の証明書検証には専用ツールを使用してください。</p>
          </div>
        </div>
      )}
    </div>
  );
}