import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'ja' | 'en';

interface Translations {
  ja: Record<string, string>;
  en: Record<string, string>;
}

const translations: Translations = {
  ja: {
    // Header
    'app.title': 'mossmoss',
    'header.toggleTheme': 'テーマを切り替え',
    
    // Main page
    'main.title': '便利ツール集',
    'main.subtitle': 'よく使う小物ツールを一箇所に',
    
    // Tools
    'tool.characterCount.name': '文字数カウント',
    'tool.characterCount.description': 'テキストの文字数をリアルタイムで表示',
    'tool.textConverter.name': '全角・半角変換',
    'tool.textConverter.description': '数字、英字、カタカナを個別に変換',
    'tool.randomGenerator.name': 'ランダム文字列生成',
    'tool.randomGenerator.description': '桁数や文字種を指定して生成',
    'tool.jsonFormatter.name': 'JSONフォーマッタ',
    'tool.jsonFormatter.description': 'JSONを整形して見やすく表示',
    'tool.qrGenerator.name': 'QRコード生成',
    'tool.qrGenerator.description': 'テキストからQRコードを生成',
    'tool.jwtViewer.name': 'JWT Viewer',
    'tool.jwtViewer.description': 'JWTトークンをデコードして表示',
    'tool.baseConverter.name': 'Base64/58変換',
    'tool.baseConverter.description': 'Base64、Base64URL、Base58の変換',
    'tool.hashGenerator.name': 'ハッシュ生成',
    'tool.hashGenerator.description': 'MD5、SHA-1、SHA-256ハッシュ生成',
    'tool.uuidGenerator.name': 'UUID生成',
    'tool.uuidGenerator.description': 'UUID v4/v1を生成',
    'tool.radixConverter.name': '進数変換',
    'tool.radixConverter.description': '2進数、8進数、16進数などの相互変換',
    'tool.markdownConverter.name': 'Markdown変換',
    'tool.markdownConverter.description': 'Markdown ⇔ HTML 相互変換',
    'tool.textSorter.name': 'テキストソート',
    'tool.textSorter.description': '行単位でのソート・重複削除・シャッフル',
    'tool.codeHighlighter.name': 'コードハイライト',
    'tool.codeHighlighter.description': '自動言語検出とシンタックスハイライト',
    'tool.asciiArtGenerator.name': 'アスキーアート',
    'tool.asciiArtGenerator.description': '2ちゃんねる風AAをランダム生成',
    'tool.yamlJsonConverter.name': 'YAML/JSON変換',
    'tool.yamlJsonConverter.description': 'YAML ⇔ JSON 相互変換',
    'tool.jqExplorer.name': 'jqエクスプローラー',
    'tool.jqExplorer.description': 'JSON探索でjqクエリを自動生成',
    'tool.certificateViewer.name': '証明書ビューア (工事中)',
    'tool.certificateViewer.description': 'X.509証明書の詳細情報を表示',
    
    // Common
    'common.back': '戻る'
  },
  en: {
    // Header
    'app.title': 'mossmoss',
    'header.toggleTheme': 'Toggle theme',
    
    // Main page
    'main.title': 'Utility Tools Collection',
    'main.subtitle': 'Handy tools in one place',
    
    // Tools
    'tool.characterCount.name': 'Character Count',
    'tool.characterCount.description': 'Real-time character count display',
    'tool.textConverter.name': 'Text Converter',
    'tool.textConverter.description': 'Convert between full-width and half-width characters',
    'tool.randomGenerator.name': 'Random String Generator',
    'tool.randomGenerator.description': 'Generate strings with custom length and character sets',
    'tool.jsonFormatter.name': 'JSON Formatter',
    'tool.jsonFormatter.description': 'Format and beautify JSON data',
    'tool.qrGenerator.name': 'QR Code Generator',
    'tool.qrGenerator.description': 'Generate QR codes from text',
    'tool.jwtViewer.name': 'JWT Viewer',
    'tool.jwtViewer.description': 'Decode and display JWT tokens',
    'tool.baseConverter.name': 'Base64/58 Converter',
    'tool.baseConverter.description': 'Convert between Base64, Base64URL, and Base58',
    'tool.hashGenerator.name': 'Hash Generator',
    'tool.hashGenerator.description': 'Generate MD5, SHA-1, SHA-256 hashes',
    'tool.uuidGenerator.name': 'UUID Generator',
    'tool.uuidGenerator.description': 'Generate UUID v4/v1',
    'tool.radixConverter.name': 'Radix Converter',
    'tool.radixConverter.description': 'Convert between binary, octal, decimal, and hexadecimal',
    'tool.markdownConverter.name': 'Markdown Converter',
    'tool.markdownConverter.description': 'Convert between Markdown and HTML',
    'tool.textSorter.name': 'Text Sorter',
    'tool.textSorter.description': 'Sort lines, remove duplicates, and shuffle text',
    'tool.codeHighlighter.name': 'Code Highlighter',
    'tool.codeHighlighter.description': 'Automatic language detection and syntax highlighting',
    'tool.asciiArtGenerator.name': 'ASCII Art Generator',
    'tool.asciiArtGenerator.description': 'Generate random 2chan-style ASCII art',
    'tool.yamlJsonConverter.name': 'YAML/JSON Converter',
    'tool.yamlJsonConverter.description': 'Convert between YAML and JSON formats',
    'tool.jqExplorer.name': 'jq Explorer',
    'tool.jqExplorer.description': 'Generate jq queries by clicking JSON fields',
    'tool.certificateViewer.name': 'Certificate Viewer (WIP)',
    'tool.certificateViewer.description': 'Display X.509 certificate details',
    
    // Common
    'common.back': 'Back'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ja');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}