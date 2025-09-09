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
  Shield
} from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
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
import { useGSAP } from './hooks/useGSAP';

// ツール定義（実装予定）
const tools: Tool[] = [
  {
    id: 'character-count',
    name: '文字数カウント',
    description: 'テキストの文字数をリアルタイムで表示',
    icon: FileText,
    component: CharacterCount
  },
  {
    id: 'text-converter',
    name: '全角・半角変換',
    description: '数字、英字、カタカナを個別に変換',
    icon: RefreshCw,
    component: TextConverter
  },
  {
    id: 'random-generator',
    name: 'ランダム文字列生成',
    description: '桁数や文字種を指定して生成',
    icon: Dices,
    component: RandomGenerator
  },
  {
    id: 'json-formatter',
    name: 'JSONフォーマッタ',
    description: 'JSONを整形して見やすく表示',
    icon: Code2,
    component: JSONFormatter
  },
  {
    id: 'qr-generator',
    name: 'QRコード生成',
    description: 'テキストからQRコードを生成',
    icon: QrCode,
    component: QRGenerator
  },
  {
    id: 'jwt-viewer',
    name: 'JWT Viewer',
    description: 'JWTトークンをデコードして表示',
    icon: Key,
    component: JWTViewer
  },
  {
    id: 'base-converter',
    name: 'Base64/58変換',
    description: 'Base64、Base64URL、Base58の変換',
    icon: Binary,
    component: BaseConverter
  },
  {
    id: 'hash-generator',
    name: 'ハッシュ生成',
    description: 'MD5、SHA-1、SHA-256ハッシュ生成',
    icon: Hash,
    component: HashGenerator
  },
  {
    id: 'uuid-generator',
    name: 'UUID生成',
    description: 'UUID v4/v1を生成',
    icon: Fingerprint,
    component: UUIDGenerator
  },
  {
    id: 'radix-converter',
    name: '進数変換',
    description: '2進数、8進数、16進数などの相互変換',
    icon: Calculator,
    component: RadixConverter
  },
  {
    id: 'markdown-converter',
    name: 'Markdown変換',
    description: 'Markdown ⇔ HTML 相互変換',
    icon: FileCode,
    component: MarkdownConverter
  },
  {
    id: 'text-sorter',
    name: 'テキストソート',
    description: '行単位でのソート・重複削除・シャッフル',
    icon: ArrowUpDown,
    component: TextSorter
  },
  {
    id: 'code-highlighter',
    name: 'コードハイライト',
    description: '自動言語検出とシンタックスハイライト',
    icon: Highlighter,
    component: CodeHighlighter
  },
  {
    id: 'ascii-art-generator',
    name: 'アスキーアート',
    description: '2ちゃんねる風AAをランダム生成',
    icon: Smile,
    component: AsciiArtGenerator
  },
  {
    id: 'yaml-json-converter',
    name: 'YAML/JSON変換',
    description: 'YAML ⇔ JSON 相互変換',
    icon: RotateCcw,
    component: YamlJsonConverter
  },
  {
    id: 'jq-explorer',
    name: 'jqエクスプローラー',
    description: 'JSON探索でjqクエリを自動生成',
    icon: Search,
    component: JqExplorer
  },
  {
    id: 'certificate-viewer',
    name: '証明書ビューア (工事中)',
    description: 'X.509証明書の詳細情報を表示',
    icon: Shield,
    component: CertificateViewer
  }
];

function App() {
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [, setHistory] = useLocalStorage<HistoryItem[]>('toolHistory', []);
  
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
    <ThemeProvider>
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
                  便利ツール集
                </h2>
                <p className="main-title text-xl text-gray-600 dark:text-gray-400">
                  よく使う小物ツールを一箇所に
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
    </ThemeProvider>
  );
}

export default App;