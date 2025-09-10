import { useState } from 'react';
import forge from 'node-forge';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

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

export function CertificateViewer({ onHistoryAdd }: ToolProps) {
  const [inputCert, setInputCert] = useState('');
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  // node-forgeを使って証明書を解析
  const parseCertificate = (certPem: string): CertificateInfo => {
    try {
      // PEM形式の証明書をnode-forgeで解析
      const cert = forge.pki.certificateFromPem(certPem);
      
      // 発行者情報を取得
      const issuer: { [key: string]: string } = {};
      cert.issuer.attributes.forEach(attr => {
        const key = attr.shortName || attr.name;
        if (key) {
          issuer[key] = Array.isArray(attr.value) ? attr.value.join(', ') : (attr.value || '');
        }
      });

      // 主体者情報を取得
      const subject: { [key: string]: string } = {};
      cert.subject.attributes.forEach(attr => {
        const key = attr.shortName || attr.name;
        if (key) {
          subject[key] = Array.isArray(attr.value) ? attr.value.join(', ') : (attr.value || '');
        }
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
          const keyUsage = ext as any;
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
          const basicConstraints = ext as any;
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
      
      onHistoryAdd?.({
        toolId: 'certificate-viewer',
        input: `Cert for ${info.subject.CN || info.subject.O}`,
        output: t('certificateViewer.historyOutput')
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
            {t('certificateViewer.input.title')}
          </h3>
          <div className="flex space-x-2">
            <Button onClick={insertSampleCert} variant="outline" size="sm">
              {t('certificateViewer.insertSample')}
            </Button>
            <Button onClick={handleCopyCert} variant="outline" size="sm">
              {isCopied ? t('certificateViewer.copied') : t('certificateViewer.copyCert')}
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm">
              {t('certificateViewer.clear')}
            </Button>
          </div>
        </div>

        <textarea
          value={inputCert}
          onChange={(e) => handleCertInput(e.target.value)}
          placeholder={t('certificateViewer.input.placeholder')}
          rows={8}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-y"
        />

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">
              <strong>{t('certificateViewer.error.title')}</strong> {error}
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
                {t('certificateViewer.expired')}
              </p>
            </div>
          ) : getDaysUntilExpiry(certInfo.validTo) <= 30 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                {t('certificateViewer.expiring', { days: getDaysUntilExpiry(certInfo.validTo) })}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 font-semibold">
                {t('certificateViewer.valid', { days: getDaysUntilExpiry(certInfo.validTo) })}
              </p>
            </div>
          )}

          {/* 基本情報 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('certificateViewer.basicInfo.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('certificateViewer.version')}</label>
                <p className="text-sm text-gray-900 dark:text-white">{certInfo.version}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('certificateViewer.serialNumber')}</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{certInfo.serialNumber}</p>
              </div>
            </div>
          </div>

          {/* 発行者・主体者情報 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('certificateViewer.issuer.title')}</h3>
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
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('certificateViewer.subject.title')}</h3>
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('certificateViewer.validity.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('certificateViewer.validFrom')}</label>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(certInfo.validFrom)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('certificateViewer.validTo')}</label>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(certInfo.validTo)}</p>
              </div>
            </div>
          </div>

          {/* 公開鍵情報 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('certificateViewer.publicKey.title')}</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('certificateViewer.publicKey.algorithm')}</label>
                <p className="text-sm text-gray-900 dark:text-white">{certInfo.publicKey.algorithm}</p>
              </div>
              {certInfo.publicKey.keySize && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('certificateViewer.publicKey.keySize')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{certInfo.publicKey.keySize}</p>
                </div>
              )}
              {certInfo.publicKey.exponent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('certificateViewer.publicKey.exponent')}</label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{certInfo.publicKey.exponent}</p>
                </div>
              )}
            </div>
          </div>

          {/* 署名情報 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('certificateViewer.signature.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('certificateViewer.signature.algorithm')}</label>
                <p className="text-sm text-gray-900 dark:text-white">{certInfo.signature.algorithm}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('certificateViewer.signature.hash')}</label>
                <p className="text-sm text-gray-900 dark:text-white">{certInfo.signature.hash}</p>
              </div>
            </div>
          </div>

          {/* 拡張情報 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('certificateViewer.extensions.title')}</h3>
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('certificateViewer.fingerprint.title')}</h3>
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
            <p><strong>{t('certificateViewer.notice')}</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}