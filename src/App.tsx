import { useState } from 'react';
import { gsap } from 'gsap';
import { 
  FileText, 
  RefreshCw, 
  Dices, 
  Code2, 
  QrCode, 
  Key, 
  Binary, 
  Hash, 
  Fingerprint, 
  Calculator, 
  FileCode, 
  ArrowUpDown,
  Highlighter,
  Smile,
  RotateCcw,
  Search,
  Shield,
  Palette,
  Clock,
  Calendar,
  Terminal,
  AlertTriangle,
  ScrollText,
  ArrowRightLeft,
  Code
} from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Header } from './components/Layout/Header';
import { ToolCard } from './components/ToolCard';
import { ToolContainer } from './components/ToolContainer';
import { Tool, HistoryItem } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CharacterCount } from './components/Tools/CharacterCount';
import { TextConverter } from './components/Tools/TextConverter';
import { RandomGenerator } from './components/Tools/RandomGenerator';
import { JSONFormatter } from './components/Tools/JSONFormatter';
import { QRGenerator } from './components/Tools/QRGenerator';
import { JWTViewer } from './components/Tools/JWTViewer';
import { BaseConverter } from './components/Tools/BaseConverter';
import { HashGenerator } from './components/Tools/HashGenerator';
import { UUIDGenerator } from './components/Tools/UUIDGenerator';
import { RadixConverter } from './components/Tools/RadixConverter';
import { MarkdownConverter } from './components/Tools/MarkdownConverter';
import { TextSorter } from './components/Tools/TextSorter';
import { CodeHighlighter } from './components/Tools/CodeHighlighter';
import { AsciiArtGenerator } from './components/Tools/AsciiArtGenerator';
import { YamlJsonConverter } from './components/Tools/YamlJsonConverter';
import { JqExplorer } from './components/Tools/JqExplorer';
import { CertificateViewer } from './components/Tools/CertificateViewer';
import { ColorPreview } from './components/Tools/ColorPreview';
import { DateTimeFormatter } from './components/Tools/DateTimeFormatter';
import { CronParser } from './components/Tools/CronParser';
import { CurlConverter } from './components/Tools/CurlConverter';
import { HtmlEscaper } from './components/Tools/HtmlEscaper';
import { JsonLogViewer } from './components/Tools/JsonLogViewer';
import { CaseConverter } from './components/Tools/CaseConverter';
import { CurlToCode } from './components/Tools/CurlToCode';
import { useGSAP } from './hooks/useGSAP';

// ツール定義（基本情報）
const toolsConfig = [
  {
    id: 'character-count',
    nameKey: 'tool.characterCount.name',
    descriptionKey: 'tool.characterCount.description',
    icon: FileText,
    component: CharacterCount
  },
  {
    id: 'text-converter',
    nameKey: 'tool.textConverter.name',
    descriptionKey: 'tool.textConverter.description',
    icon: RefreshCw,
    component: TextConverter
  },
  {
    id: 'random-generator',
    nameKey: 'tool.randomGenerator.name',
    descriptionKey: 'tool.randomGenerator.description',
    icon: Dices,
    component: RandomGenerator
  },
  {
    id: 'json-formatter',
    nameKey: 'tool.jsonFormatter.name',
    descriptionKey: 'tool.jsonFormatter.description',
    icon: Code2,
    component: JSONFormatter
  },
  {
    id: 'qr-generator',
    nameKey: 'tool.qrGenerator.name',
    descriptionKey: 'tool.qrGenerator.description',
    icon: QrCode,
    component: QRGenerator
  },
  {
    id: 'jwt-viewer',
    nameKey: 'tool.jwtViewer.name',
    descriptionKey: 'tool.jwtViewer.description',
    icon: Key,
    component: JWTViewer
  },
  {
    id: 'base-converter',
    nameKey: 'tool.baseConverter.name',
    descriptionKey: 'tool.baseConverter.description',
    icon: Binary,
    component: BaseConverter
  },
  {
    id: 'hash-generator',
    nameKey: 'tool.hashGenerator.name',
    descriptionKey: 'tool.hashGenerator.description',
    icon: Hash,
    component: HashGenerator
  },
  {
    id: 'uuid-generator',
    nameKey: 'tool.uuidGenerator.name',
    descriptionKey: 'tool.uuidGenerator.description',
    icon: Fingerprint,
    component: UUIDGenerator
  },
  {
    id: 'radix-converter',
    nameKey: 'tool.radixConverter.name',
    descriptionKey: 'tool.radixConverter.description',
    icon: Calculator,
    component: RadixConverter
  },
  {
    id: 'markdown-converter',
    nameKey: 'tool.markdownConverter.name',
    descriptionKey: 'tool.markdownConverter.description',
    icon: FileCode,
    component: MarkdownConverter
  },
  {
    id: 'text-sorter',
    nameKey: 'tool.textSorter.name',
    descriptionKey: 'tool.textSorter.description',
    icon: ArrowUpDown,
    component: TextSorter
  },
  {
    id: 'code-highlighter',
    nameKey: 'tool.codeHighlighter.name',
    descriptionKey: 'tool.codeHighlighter.description',
    icon: Highlighter,
    component: CodeHighlighter
  },
  {
    id: 'ascii-art-generator',
    nameKey: 'tool.asciiArtGenerator.name',
    descriptionKey: 'tool.asciiArtGenerator.description',
    icon: Smile,
    component: AsciiArtGenerator
  },
  {
    id: 'yaml-json-converter',
    nameKey: 'tool.yamlJsonConverter.name',
    descriptionKey: 'tool.yamlJsonConverter.description',
    icon: RotateCcw,
    component: YamlJsonConverter
  },
  {
    id: 'jq-explorer',
    nameKey: 'tool.jqExplorer.name',
    descriptionKey: 'tool.jqExplorer.description',
    icon: Search,
    component: JqExplorer
  },
  {
    id: 'certificate-viewer',
    nameKey: 'tool.certificateViewer.name',
    descriptionKey: 'tool.certificateViewer.description',
    icon: Shield,
    component: CertificateViewer
  },
  {
    id: 'color-preview',
    nameKey: 'tool.colorPreview.name',
    descriptionKey: 'tool.colorPreview.description',
    icon: Palette,
    component: ColorPreview
  },
  {
    id: 'datetime-formatter',
    nameKey: 'tool.datetimeFormatter.name',
    descriptionKey: 'tool.datetimeFormatter.description',
    icon: Clock,
    component: DateTimeFormatter
  },
  {
    id: 'cron-parser',
    nameKey: 'tool.cronParser.name',
    descriptionKey: 'tool.cronParser.description',
    icon: Calendar,
    component: CronParser
  },
  {
    id: 'curl-converter',
    nameKey: 'tool.curlConverter.name',
    descriptionKey: 'tool.curlConverter.description',
    icon: Terminal,
    component: CurlConverter
  },
  {
    id: 'html-escaper',
    nameKey: 'tool.htmlEscaper.name',
    descriptionKey: 'tool.htmlEscaper.description',
    icon: AlertTriangle,
    component: HtmlEscaper
  },
  {
    id: 'json-log-viewer',
    nameKey: 'tool.jsonLogViewer.name',
    descriptionKey: 'tool.jsonLogViewer.description',
    icon: ScrollText,
    component: JsonLogViewer
  },
  {
    id: 'case-converter',
    nameKey: 'tool.caseConverter.name',
    descriptionKey: 'tool.caseConverter.description',
    icon: ArrowRightLeft,
    component: CaseConverter
  },
  {
    id: 'curl-to-code',
    nameKey: 'tool.curlToCode.name',
    descriptionKey: 'tool.curlToCode.description',
    icon: Code,
    component: CurlToCode
  }
];

function AppContent() {
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [, setHistory] = useLocalStorage<HistoryItem[]>('toolHistory', []);
  const { t } = useLanguage();
  
  // ツール定義を多言語対応で変換
  const tools: Tool[] = toolsConfig.map(tool => ({
    id: tool.id,
    name: t(tool.nameKey),
    description: t(tool.descriptionKey),
    icon: tool.icon,
    component: tool.component
  }));
  
  // GSAPアニメーション
  const containerRef = useGSAP(() => {
    if (!currentTool) {
      // タイトルのアニメーション
      gsap.fromTo('.main-title',
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      // ツール一覧の一括フェードインアニメーション（高速化）
      gsap.fromTo('.tool-card', 
        { 
          opacity: 0, 
          y: 15,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
          stagger: {
            amount: 0.6, // 全体で0.6秒間に収める
            from: "center", // 中央から外側へ
            grid: "auto"
          }
        }
      );
    } else {
      // ツール詳細画面のフェードイン
      gsap.fromTo('.tool-container', 
        { 
          opacity: 0, 
          y: 30,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out"
        }
      );
    }
  }, [currentTool]);

  const handleToolSelect = (toolId: string) => {
    setCurrentTool(toolId);
  };

  const handleBack = () => {
    // 戻るアニメーション
    gsap.to('.tool-container', {
      opacity: 0,
      y: -30,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        setCurrentTool(null);
      }
    });
  };

  const handleHistoryAdd = (item: Omit<HistoryItem, 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev.slice(0, 2)]); // 最新3件まで保持
  };

  const selectedTool = tools.find(tool => tool.id === currentTool);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTool && selectedTool ? (
          <ToolContainer
            title={selectedTool.name}
            description={selectedTool.description}
            onBack={handleBack}
          >
            <selectedTool.component onHistoryAdd={handleHistoryAdd} />
          </ToolContainer>
        ) : (
          <div>
            <div className="text-center mb-12">
              <h2 className="main-title text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('main.title')}
              </h2>
              <p className="main-title text-xl text-gray-600 dark:text-gray-400">
                {t('main.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {tools.map(tool => (
                <div key={tool.id} className="tool-card">
                  <ToolCard
                    tool={tool}
                    onClick={() => handleToolSelect(tool.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;