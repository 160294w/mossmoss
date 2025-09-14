import { useEffect } from 'react';
import { toolSEOData, ToolSEOData } from '../utils/seoData';

interface SEOHeadProps {
  toolId?: string;
  customData?: Partial<ToolSEOData>;
}

export function SEOHead({ toolId, customData }: SEOHeadProps) {
  useEffect(() => {
    let seoData: ToolSEOData;

    if (toolId && toolSEOData[toolId]) {
      seoData = toolSEOData[toolId];
    } else {
      // デフォルトのホームページSEOデータ
      seoData = {
        title: 'tarutaru - 25種類の便利ツール | 文字数カウント・JSON整形・Base64変換など',
        description: '文字数カウント、JSON整形、Base64変換、QRコード生成、JWT表示など25種類の便利なWebツールを無料で提供。プログラマーや開発者、事務作業に最適なオンラインツール集。',
        keywords: ['便利ツール', '文字数カウント', 'JSON整形', 'Base64変換', 'QRコード生成', 'JWT', 'ハッシュ生成', 'UUID', '進数変換', '開発ツール', 'プログラミング', 'オンラインツール'],
        path: '/'
      };
    }

    // カスタムデータでオーバーライド
    if (customData) {
      seoData = { ...seoData, ...customData };
    }

    // ページタイトルを動的に更新
    document.title = seoData.title;

    // メタディスクリプションを更新
    updateMetaTag('description', seoData.description);

    // キーワードを更新
    updateMetaTag('keywords', seoData.keywords.join(','));

    // OGタグを更新
    updateMetaProperty('og:title', seoData.title);
    updateMetaProperty('og:description', seoData.description);
    updateMetaProperty('og:url', `https://tarutaru.pages.dev${seoData.path}`);

    // Twitter Cardを更新
    updateMetaTag('twitter:title', seoData.title);
    updateMetaTag('twitter:description', seoData.description);

    // Canonical URLを更新
    updateCanonicalURL(`https://tarutaru.pages.dev${seoData.path}`);

    // 構造化データを更新（個別ツールの場合）
    if (toolId) {
      updateStructuredData(toolId, seoData);
    }

  }, [toolId, customData]);

  return null; // このコンポーネントは何も描画しない
}

function updateMetaTag(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function updateMetaProperty(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function updateCanonicalURL(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

function updateStructuredData(_toolId: string, seoData: ToolSEOData) {
  // 既存の構造化データスクリプトを削除
  const existingScript = document.querySelector('script[data-tool-structured-data]');
  if (existingScript) {
    existingScript.remove();
  }

  // 新しい構造化データを追加
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": seoData.title.split(' | ')[0], // タイトルからツール名を抽出
    "description": seoData.description,
    "url": `https://tarutaru.pages.dev${seoData.path}`,
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    },
    "author": {
      "@type": "Organization",
      "name": "tarutaru"
    },
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": seoData.title.split(' | ')[0],
      "applicationCategory": "WebApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "JPY"
      }
    },
    "inLanguage": ["ja", "en"],
    "browserRequirements": "Requires JavaScript. Requires HTML5."
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-tool-structured-data', 'true');
  script.textContent = JSON.stringify(structuredData, null, 2);
  document.head.appendChild(script);
}