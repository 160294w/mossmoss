import { useState, useMemo } from 'react';
import { SEOHead } from './components/SEOHead';
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
import { CategoryTabs } from './components/CategoryTabs';
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

// カテゴリ定義
const categories = [
  {
    id: 'all',
    nameKey: 'category.all',
    icon: Hash,
    color: 'gray'
  },
  {
    id: 'text',
    nameKey: 'category.text',
    icon: FileText,
    color: 'blue'
  },
  {
    id: 'development',
    nameKey: 'category.development',
    icon: Code2,
    color: 'green'
  },
  {
    id: 'data',
    nameKey: 'category.data',
    icon: RefreshCw,
    color: 'purple'
  },
  {
    id: 'generator',
    nameKey: 'category.generator',
    icon: Dices,
    color: 'orange'
  },
  {
    id: 'utility',
    nameKey: 'category.utility',
    icon: Calculator,
    color: 'indigo'
  }
];

// ツール定義（基本情報）- カテゴリ & アイコン色追加
const toolsConfig = [
  {
    id: 'character-count',
    nameKey: 'tool.characterCount.name',
    descriptionKey: 'tool.characterCount.description',
    icon: FileText,
    iconColor: 'text-blue-500',
    component: CharacterCount,
    category: 'text'
  },
  {
    id: 'text-converter',
    nameKey: 'tool.textConverter.name',
    descriptionKey: 'tool.textConverter.description',
    icon: RefreshCw,
    iconColor: 'text-cyan-500',
    component: TextConverter,
    category: 'text'
  },
  {
    id: 'text-sorter',
    nameKey: 'tool.textSorter.name',
    descriptionKey: 'tool.textSorter.description',
    icon: ArrowUpDown,
    iconColor: 'text-sky-500',
    component: TextSorter,
    category: 'text'
  },
  {
    id: 'case-converter',
    nameKey: 'tool.caseConverter.name',
    descriptionKey: 'tool.caseConverter.description',
    icon: ArrowRightLeft,
    iconColor: 'text-indigo-500',
    component: CaseConverter,
    category: 'text'
  },
  {
    id: 'json-formatter',
    nameKey: 'tool.jsonFormatter.name',
    descriptionKey: 'tool.jsonFormatter.description',
    icon: Code2,
    iconColor: 'text-green-500',
    component: JSONFormatter,
    category: 'development'
  },
  {
    id: 'jwt-viewer',
    nameKey: 'tool.jwtViewer.name',
    descriptionKey: 'tool.jwtViewer.description',
    icon: Key,
    iconColor: 'text-emerald-500',
    component: JWTViewer,
    category: 'development'
  },
  {
    id: 'code-highlighter',
    nameKey: 'tool.codeHighlighter.name',
    descriptionKey: 'tool.codeHighlighter.description',
    icon: Highlighter,
    iconColor: 'text-lime-500',
    component: CodeHighlighter,
    category: 'development'
  },
  {
    id: 'curl-converter',
    nameKey: 'tool.curlConverter.name',
    descriptionKey: 'tool.curlConverter.description',
    icon: Terminal,
    iconColor: 'text-teal-500',
    component: CurlConverter,
    category: 'development'
  },
  {
    id: 'curl-to-code',
    nameKey: 'tool.curlToCode.name',
    descriptionKey: 'tool.curlToCode.description',
    icon: Code,
    iconColor: 'text-slate-500',
    component: CurlToCode,
    category: 'development'
  },
  {
    id: 'jq-explorer',
    nameKey: 'tool.jqExplorer.name',
    descriptionKey: 'tool.jqExplorer.description',
    icon: Search,
    iconColor: 'text-violet-500',
    component: JqExplorer,
    category: 'development'
  },
  {
    id: 'json-log-viewer',
    nameKey: 'tool.jsonLogViewer.name',
    descriptionKey: 'tool.jsonLogViewer.description',
    icon: ScrollText,
    iconColor: 'text-fuchsia-500',
    component: JsonLogViewer,
    category: 'development'
  },
  {
    id: 'base-converter',
    nameKey: 'tool.baseConverter.name',
    descriptionKey: 'tool.baseConverter.description',
    icon: Binary,
    iconColor: 'text-purple-500',
    component: BaseConverter,
    category: 'data'
  },
  {
    id: 'radix-converter',
    nameKey: 'tool.radixConverter.name',
    descriptionKey: 'tool.radixConverter.description',
    icon: Calculator,
    iconColor: 'text-pink-500',
    component: RadixConverter,
    category: 'data'
  },
  {
    id: 'yaml-json-converter',
    nameKey: 'tool.yamlJsonConverter.name',
    descriptionKey: 'tool.yamlJsonConverter.description',
    icon: RotateCcw,
    iconColor: 'text-rose-500',
    component: YamlJsonConverter,
    category: 'data'
  },
  {
    id: 'hash-generator',
    nameKey: 'tool.hashGenerator.name',
    descriptionKey: 'tool.hashGenerator.description',
    icon: Hash,
    iconColor: 'text-amber-500',
    component: HashGenerator,
    category: 'data'
  },
  {
    id: 'random-generator',
    nameKey: 'tool.randomGenerator.name',
    descriptionKey: 'tool.randomGenerator.description',
    icon: Dices,
    iconColor: 'text-orange-500',
    component: RandomGenerator,
    category: 'generator'
  },
  {
    id: 'qr-generator',
    nameKey: 'tool.qrGenerator.name',
    descriptionKey: 'tool.qrGenerator.description',
    icon: QrCode,
    iconColor: 'text-yellow-500',
    component: QRGenerator,
    category: 'generator'
  },
  {
    id: 'uuid-generator',
    nameKey: 'tool.uuidGenerator.name',
    descriptionKey: 'tool.uuidGenerator.description',
    icon: Fingerprint,
    iconColor: 'text-red-500',
    component: UUIDGenerator,
    category: 'generator'
  },
  {
    id: 'ascii-art-generator',
    nameKey: 'tool.asciiArtGenerator.name',
    descriptionKey: 'tool.asciiArtGenerator.description',
    icon: Smile,
    iconColor: 'text-lime-600',
    component: AsciiArtGenerator,
    category: 'generator'
  },
  {
    id: 'markdown-converter',
    nameKey: 'tool.markdownConverter.name',
    descriptionKey: 'tool.markdownConverter.description',
    icon: FileCode,
    iconColor: 'text-gray-600',
    component: MarkdownConverter,
    category: 'utility'
  },
  {
    id: 'certificate-viewer',
    nameKey: 'tool.certificateViewer.name',
    descriptionKey: 'tool.certificateViewer.description',
    icon: Shield,
    iconColor: 'text-green-600',
    component: CertificateViewer,
    category: 'utility'
  },
  {
    id: 'color-preview',
    nameKey: 'tool.colorPreview.name',
    descriptionKey: 'tool.colorPreview.description',
    icon: Palette,
    iconColor: 'text-pink-600',
    component: ColorPreview,
    category: 'utility'
  },
  {
    id: 'datetime-formatter',
    nameKey: 'tool.datetimeFormatter.name',
    descriptionKey: 'tool.datetimeFormatter.description',
    icon: Clock,
    iconColor: 'text-blue-600',
    component: DateTimeFormatter,
    category: 'utility'
  },
  {
    id: 'cron-parser',
    nameKey: 'tool.cronParser.name',
    descriptionKey: 'tool.cronParser.description',
    icon: Calendar,
    iconColor: 'text-indigo-600',
    component: CronParser,
    category: 'utility'
  },
  {
    id: 'html-escaper',
    nameKey: 'tool.htmlEscaper.name',
    descriptionKey: 'tool.htmlEscaper.description',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    component: HtmlEscaper,
    category: 'utility'
  }
];

function AppContent() {
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [, setHistory] = useLocalStorage<HistoryItem[]>('toolHistory', []);
  const { t } = useLanguage();
  
  // ツール定義を多言語対応で変換
  const tools: Tool[] = toolsConfig.map(tool => ({
    id: tool.id,
    name: t(tool.nameKey),
    description: t(tool.descriptionKey),
    icon: tool.icon,
    iconColor: tool.iconColor,
    component: tool.component
  }));

  // カテゴリでフィルタリング（元の順番を保持）
  const filteredTools = useMemo(() => {
    let filtered: Tool[];
    if (selectedCategory === 'all') {
      filtered = tools;
    } else {
      filtered = tools.filter(tool => {
        const config = toolsConfig.find(t => t.id === tool.id);
        return config?.category === selectedCategory;
      });
    }
    
    // toolsConfig配列の順番通りにソート
    return filtered.sort((a, b) => {
      const indexA = toolsConfig.findIndex(t => t.id === a.id);
      const indexB = toolsConfig.findIndex(t => t.id === b.id);
      return indexA - indexB;
    });
  }, [tools, selectedCategory]);

  // カテゴリごとのツール数を計算
  const toolCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tools.length };
    categories.forEach(category => {
      if (category.id !== 'all') {
        counts[category.id] = toolsConfig.filter(tool => tool.category === category.id).length;
      }
    });
    return counts;
  }, [tools.length]);
  
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
      <SEOHead toolId={currentTool || undefined} />
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

            {/* カテゴリタブ */}
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              toolCounts={toolCounts}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredTools.map(tool => (
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