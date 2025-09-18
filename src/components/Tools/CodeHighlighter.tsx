import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

type SupportedLanguage = 'python' | 'ruby' | 'c' | 'shell' | 'go' | 'javascript' | 'typescript' | 'json' | 'html' | 'css' | 'diff' | 'terraform' | 'auto';

const languageKeywords: Record<Exclude<SupportedLanguage, 'auto'>, string[]> = {
  python: ['def ', 'import ', 'from ', 'print(', 'if __name__', 'class ', 'self.', 'elif ', 'lambda '],
  ruby: ['def ', 'end', 'class ', 'module ', 'puts ', 'require ', '@', '||=', 'elsif '],
  c: ['#include', 'int main', 'printf(', 'scanf(', 'malloc(', 'free(', 'struct ', 'typedef '],
  shell: ['#!/bin/bash', '#!/bin/sh', 'echo ', 'grep ', 'awk ', 'sed ', '$1', 'do', 'done'],
  go: ['package ', 'func ', 'import (', 'fmt.Print', 'var ', 'type ', 'struct {', 'interface {}'],
  javascript: ['function ', 'const ', 'let ', 'var ', '=>', 'console.log', 'document.', 'window.'],
  typescript: ['interface ', 'type ', ': string', ': number', 'export ', 'import ', '<T>', 'extends '],
  json: ['{"', '"}', '": "', '": [', '": {'],
  html: ['<html', '<head', '<body', '<div', '<p>', '<span', '<!DOCTYPE'],
  css: ['{', '}', ':', ';', '.', '#', '@media', 'px', 'rem'],
  diff: ['--- ', '+++ ', '@@ ', 'diff --git', 'index ', '@@', '-', '+'],
  terraform: ['Terraform will perform', 'Plan:', '# ', '+ ', '- ', '~ ', '-/+', 'resource "', 'data "', 'known after apply']
};

export function CodeHighlighter({ onHistoryAdd }: ToolProps) {
  const { t } = useLanguage();
  const [inputCode, setInputCode] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<SupportedLanguage>('auto');
  const [manualLanguage, setManualLanguage] = useState<SupportedLanguage>('auto');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // 言語自動検出
  const detectLanguage = (code: string): SupportedLanguage => {
    if (!code.trim()) return 'auto';
    
    const codeLines = code.toLowerCase().split('\n');
    const codeText = code.toLowerCase();
    
    const scores: Record<Exclude<SupportedLanguage, 'auto'>, number> = {
      python: 0, ruby: 0, c: 0, shell: 0, go: 0,
      javascript: 0, typescript: 0, json: 0, html: 0, css: 0, diff: 0, terraform: 0
    };

    // 各言語のキーワードをチェック
    Object.entries(languageKeywords).forEach(([lang, keywords]) => {
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (codeText.includes(keywordLower)) {
          scores[lang as keyof typeof scores] += 1;
          // 行の開始にあるキーワードは重み付け
          if (codeLines.some(line => line.trim().startsWith(keywordLower))) {
            scores[lang as keyof typeof scores] += 2;
          }
        }
      });
    });

    // 特別なパターンチェック
    if (codeText.startsWith('{') && codeText.endsWith('}')) {
      scores.json += 3;
    }
    if (codeText.includes('<!doctype') || codeText.includes('<html')) {
      scores.html += 5;
    }
    if (/\{\s*[\w-]+\s*:\s*[\w#.-]+\s*;\s*\}/.test(codeText)) {
      scores.css += 3;
    }
    // diff特別パターンチェック
    if (codeText.includes('diff --git') || codeText.includes('--- ') || codeText.includes('+++ ')) {
      scores.diff += 5;
    }
    if (codeLines.some(line => /^[-+@]/.test(line.trim()))) {
      scores.diff += 4;
    }
    // terraform plan特別パターンチェック
    if (codeText.includes('terraform will perform') || codeText.includes('plan:')) {
      scores.terraform += 8;
    }
    if (codeText.includes('resource "') || codeText.includes('data "')) {
      scores.terraform += 3;
    }
    if (codeLines.some(line => /^\s*[~+-]\s/.test(line) || /^\s*-\/\+/.test(line))) {
      scores.terraform += 5;
    }

    // 最高スコアの言語を選択
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'auto';
    
    const detectedLang = Object.entries(scores).find(([, score]) => score === maxScore)?.[0];
    return detectedLang as SupportedLanguage || 'auto';
  };

  const handleCodeChange = (code: string) => {
    setInputCode(code);
    const detected = detectLanguage(code);
    setDetectedLanguage(detected);
    
    if (code.trim() && onHistoryAdd) {
      onHistoryAdd({
        toolId: 'code-highlighter',
        input: `Code snippet (${detected})`,
        output: t('codeHighlighter.result.highlighted')
      });
    }
  };

  const getDisplayLanguage = (): string => {
    const lang = manualLanguage !== 'auto' ? manualLanguage : detectedLanguage;
    return lang === 'auto' ? 'plaintext' : lang;
  };

  const handleCopy = () => {
    copyToClipboard(inputCode);
  };

  const insertSample = (lang: SupportedLanguage) => {
    if (lang === 'auto') return;
    const samples: Record<Exclude<SupportedLanguage, 'auto'>, string> = {
      python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# メイン処理
if __name__ == "__main__":
    for i in range(10):
        print(f"F({i}) = {fibonacci(i)}")`,

      ruby: `class Calculator
  def initialize(x, y)
    @x, @y = x, y
  end
  
  def add
    @x + @y
  end
  
  def multiply
    @x * @y
  end
end

# 使用例
calc = Calculator.new(10, 5)
puts "加算: #{calc.add}"
puts "乗算: #{calc.multiply}"`,

      c: `#include <stdio.h>
#include <stdlib.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int num = 5;
    printf("factorial(%d) = %d\n", num, factorial(num));
    return 0;
}`,

      shell: `#!/bin/bash

# ファイル処理スクリプト
LOG_DIR="/var/log"
BACKUP_DIR="/backup"

echo "ログファイルのバックアップを開始します..."

for file in \$LOG_DIR/*.log; do
    if [ -f "\$file" ]; then
        filename=\$(basename "\$file")
        cp "\$file" "\$BACKUP_DIR/\${filename}.\$(date +%Y%m%d)"
        echo "バックアップ完了: \$filename"
    fi
done

echo "すべてのバックアップが完了しました！"`,

      go: `package main

import (
    "fmt"
    "net/http"
    "log"
)

type Server struct {
    port string
}

func (s *Server) handleHome(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, World! Server is running on port %s", s.port)
}

func main() {
    server := &Server{port: "8080"}
    
    http.HandleFunc("/", server.handleHome)
    
    fmt.Printf("Server starting on port %s...\n", server.port)
    log.Fatal(http.ListenAndServe(":"+server.port, nil))
}`,

      javascript: `// 非同期データフェッチとDOM操作
async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\$\{userId\}\`);
        const userData = await response.json();
        
        // DOM要素の更新
        document.querySelector('#user-name').textContent = userData.name;
        document.querySelector('#user-email').textContent = userData.email;
        
        return userData;
    } catch (error) {
        console.error('ユーザーデータの取得に失敗:', error);
        throw error;
    }
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
    fetchUserData(123);
});`,

      typescript: `interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

type UserResponse = {
    data: User[];
    total: number;
    page: number;
};

class UserService {
    private baseUrl: string;
    
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    
    async getUsers<T extends User>(page: number = 1): Promise<UserResponse> {
        const response = await fetch(\`\$\{this.baseUrl\}/users?page=\$\{page\}\`);
        return response.json();
    }
}

const userService = new UserService('/api');`,

      json: `{
  "name": "sample-project",
  "version": "1.0.0",
  "description": "サンプルプロジェクト設定",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.0.0"
  }
}`,

      html: `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>サンプルページ</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>ウェルカムページ</h1>
        <nav>
            <ul>
                <li><a href="#home">ホーム</a></li>
                <li><a href="#about">概要</a></li>
                <li><a href="#contact">お問い合わせ</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="content">
            <p>このページはサンプルHTMLです。</p>
        </section>
    </main>
    
    <script src="script.js"></script>
</body>
</html>`,

      css: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}`,

      diff: `diff --git a/src/components/Button.tsx b/src/components/Button.tsx
index 1234567..abcdefg 100644
--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -1,10 +1,15 @@
 import React from 'react';
-import { ButtonHTMLAttributes } from 'react';
+import { ButtonHTMLAttributes, forwardRef } from 'react';
+import { cn } from '../utils/cn';

-interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
+export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: 'primary' | 'secondary' | 'outline';
   size?: 'sm' | 'md' | 'lg';
+  loading?: boolean;
 }

-export const Button: React.FC<ButtonProps> = ({
+export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
   variant = 'primary',
   size = 'md',
+  loading = false,
   className,
   children,
   ...props
-}) => {
+}, ref) => {
   return (
-    <button className={\`btn btn-\${variant} btn-\${size} \${className}\`} {...props}>
+    <button
+      ref={ref}
+      disabled={loading || props.disabled}
+      className={cn(
+        'btn',
+        \`btn-\${variant}\`,
+        \`btn-\${size}\`,
+        loading && 'btn-loading',
+        className
+      )}
+      {...props}
+    >
+      {loading ? 'Loading...' : children}
     </button>
   );
-};
+});
+
+Button.displayName = 'Button';`,

      terraform: `Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  + create
  - destroy
  ~ update in-place
-/+ destroy and then create replacement

Terraform will perform the following actions:

  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      + ami                                  = "ami-0c94855ba95b798c7"
      + arn                                  = (known after apply)
      + associate_public_ip_address          = (known after apply)
      + availability_zone                    = (known after apply)
      + cpu_core_count                       = (known after apply)
      + cpu_threads_per_core                 = (known after apply)
      + disable_api_stop                     = (known after apply)
      + disable_api_termination              = (known after apply)
      + ebs_optimized                        = (known after apply)
      + get_password_data                    = false
      + host_id                              = (known after apply)
      + id                                   = (known after apply)
      + instance_initiated_shutdown_behavior = (known after apply)
      + instance_state                       = (known after apply)
      + instance_type                        = "t3.micro"
      + ipv6_address_count                   = (known after apply)
      + ipv6_addresses                       = (known after apply)
      + key_name                             = (known after apply)
      + monitoring                           = (known after apply)
      + outpost_arn                          = (known after apply)
      + password_data                        = (known after apply)
      + placement_group                      = (known after apply)
      + placement_partition_number           = (known after apply)
      + primary_network_interface_id         = (known after apply)
      + private_dns_name_options             = (known after apply)
      + private_ip                           = (known after apply)
      + public_dns                           = (known after apply)
      + public_ip                            = (known after apply)
      + secondary_private_ips                = (known after apply)
      + security_groups                      = (known after apply)
      + source_dest_check                    = true
      + subnet_id                            = (known after apply)
      + tags                                 = {
          + "Environment" = "development"
          + "Name"        = "WebServer"
        }
      + tags_all                             = {
          + "Environment" = "development"
          + "Name"        = "WebServer"
        }
      + tenancy                              = (known after apply)
      + user_data                            = (known after apply)
      + user_data_base64                     = (known after apply)
      + user_data_replace_on_change          = false
      + vpc_security_group_ids               = (known after apply)
    }

  # aws_security_group.web_sg will be replaced
  # (requested replacement due to changes in argument "ingress")
-/+ resource "aws_security_group" "web_sg" {
      ~ arn                    = "arn:aws:ec2:us-west-2:123456789012:security-group/sg-0123456789abcdef0" -> (known after apply)
      ~ id                     = "sg-0123456789012345" -> (known after apply)
      ~ name                   = "web-sg-20240101123456789012345678" -> (known after apply)
      ~ owner_id               = "123456789012" -> (known after apply)
      + revoke_rules_on_delete = false
        tags                   = {
            "Environment" = "development"
            "Name"        = "web-security-group"
        }
      ~ vpc_id                 = "vpc-0123456789abcdef0" -> (known after apply)

      ~ ingress {
          ~ cidr_blocks      = [
              - "10.0.0.0/8",
              + "0.0.0.0/0",
            ]
          ~ description      = "HTTP" -> "HTTP from anywhere"
            from_port        = 80
            protocol         = "tcp"
            self             = false
            to_port          = 80
        }

      + ingress {
          + cidr_blocks      = [
              + "0.0.0.0/0",
            ]
          + description      = "HTTPS"
          + from_port        = 443
          + protocol         = "tcp"
          + self             = false
          + to_port          = 443
        }

        egress {
            cidr_blocks      = [
                "0.0.0.0/0",
            ]
            description      = ""
            from_port        = 0
            ipv6_cidr_blocks = []
            prefix_list_ids  = []
            protocol         = "-1"
            security_groups  = []
            self             = false
            to_port          = 0
        }
    }

Plan: 2 to add, 0 to change, 1 to destroy.`
    };

    const sampleCode = samples[lang];
    if (sampleCode) {
      handleCodeChange(sampleCode);
      // 手動で言語も設定
      setManualLanguage(lang);
    }
  };

  const supportedLanguages: { value: SupportedLanguage; label: string }[] = [
    { value: 'auto', label: t('codeHighlighter.language.auto') },
    { value: 'python', label: 'Python' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'c', label: 'C/C++' },
    { value: 'shell', label: 'Shell Script' },
    { value: 'go', label: 'Go' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'json', label: 'JSON' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'diff', label: 'Diff' },
    { value: 'terraform', label: 'Terraform Plan' }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('codeHighlighter.input.label')}
          </label>
          <textarea
            value={inputCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder={t('codeHighlighter.input.placeholder')}
            rows={10}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('codeHighlighter.language.label')}
            </label>
            <select
              value={manualLanguage}
              onChange={(e) => setManualLanguage(e.target.value as SupportedLanguage)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              {supportedLanguages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('codeHighlighter.theme.label')}
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="dark">{t('codeHighlighter.theme.dark')}</option>
              <option value="light">{t('codeHighlighter.theme.light')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('codeHighlighter.detectedLanguage.label')}
            </label>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300">
              {detectedLanguage === 'auto' ? t('codeHighlighter.detectedLanguage.none') : detectedLanguage}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('codeHighlighter.samples.label')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <Button onClick={() => insertSample('python')} variant="outline" size="sm">
              Python
            </Button>
            <Button onClick={() => insertSample('javascript')} variant="outline" size="sm">
              JavaScript
            </Button>
            <Button onClick={() => insertSample('typescript')} variant="outline" size="sm">
              TypeScript
            </Button>
            <Button onClick={() => insertSample('go')} variant="outline" size="sm">
              Go
            </Button>
            <Button onClick={() => insertSample('ruby')} variant="outline" size="sm">
              Ruby
            </Button>
            <Button onClick={() => insertSample('c')} variant="outline" size="sm">
              C
            </Button>
            <Button onClick={() => insertSample('shell')} variant="outline" size="sm">
              Shell
            </Button>
            <Button onClick={() => insertSample('html')} variant="outline" size="sm">
              HTML
            </Button>
            <Button onClick={() => insertSample('css')} variant="outline" size="sm">
              CSS
            </Button>
            <Button onClick={() => insertSample('json')} variant="outline" size="sm">
              JSON
            </Button>
            <Button onClick={() => insertSample('diff')} variant="outline" size="sm">
              Diff
            </Button>
            <Button onClick={() => insertSample('terraform')} variant="outline" size="sm">
              Terraform
            </Button>
          </div>
        </div>
      </div>

      {inputCode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('codeHighlighter.result.title').replace('{language}', getDisplayLanguage())}
            </h3>
            <Button onClick={handleCopy} variant="outline" size="sm">
              {isCopied ? t('codeHighlighter.copied') : t('codeHighlighter.copy')}
            </Button>
          </div>

          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <SyntaxHighlighter
              language={getDisplayLanguage()}
              style={theme === 'dark' ? vscDarkPlus : vs}
              showLineNumbers={true}
              customStyle={{
                margin: 0,
                fontSize: '14px',
                background: 'transparent'
              }}
              lineProps={(lineNumber) => {
                if (getDisplayLanguage() === 'diff') {
                  const line = inputCode.split('\n')[lineNumber - 1] || '';
                  if (line.startsWith('+')) {
                    return {
                      style: {
                        backgroundColor: theme === 'dark' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(209, 250, 229, 0.8)',
                        color: theme === 'dark' ? '#7dd87d' : '#22543d',
                        display: 'block',
                        margin: '0',
                        padding: '0 1rem'
                      }
                    };
                  } else if (line.startsWith('-')) {
                    return {
                      style: {
                        backgroundColor: theme === 'dark' ? 'rgba(248, 81, 73, 0.15)' : 'rgba(254, 226, 226, 0.8)',
                        color: theme === 'dark' ? '#ff7979' : '#742a2a',
                        display: 'block',
                        margin: '0',
                        padding: '0 1rem'
                      }
                    };
                  } else if (line.startsWith('@@')) {
                    return {
                      style: {
                        backgroundColor: theme === 'dark' ? 'rgba(130, 170, 255, 0.15)' : 'rgba(237, 242, 247, 0.8)',
                        color: theme === 'dark' ? '#82aaff' : '#4a5568',
                        display: 'block',
                        margin: '0',
                        padding: '0 1rem',
                        fontWeight: 'bold'
                      }
                    };
                  }
                } else if (getDisplayLanguage() === 'terraform') {
                  const line = inputCode.split('\n')[lineNumber - 1] || '';
                  const trimmedLine = line.trim();

                  if (trimmedLine.startsWith('+ ')) {
                    return {
                      style: {
                        backgroundColor: theme === 'dark' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(209, 250, 229, 0.8)',
                        color: theme === 'dark' ? '#7dd87d' : '#22543d',
                        display: 'block',
                        margin: '0',
                        padding: '0 1rem'
                      }
                    };
                  } else if (trimmedLine.startsWith('- ')) {
                    return {
                      style: {
                        backgroundColor: theme === 'dark' ? 'rgba(248, 81, 73, 0.15)' : 'rgba(254, 226, 226, 0.8)',
                        color: theme === 'dark' ? '#ff7979' : '#742a2a',
                        display: 'block',
                        margin: '0',
                        padding: '0 1rem'
                      }
                    };
                  } else if (trimmedLine.startsWith('~ ')) {
                    return {
                      style: {
                        backgroundColor: theme === 'dark' ? 'rgba(255, 193, 7, 0.15)' : 'rgba(255, 243, 176, 0.8)',
                        color: theme === 'dark' ? '#ffc107' : '#975a16',
                        display: 'block',
                        margin: '0',
                        padding: '0 1rem'
                      }
                    };
                  } else if (trimmedLine.startsWith('-/+ ')) {
                    return {
                      style: {
                        backgroundColor: theme === 'dark' ? 'rgba(255, 87, 34, 0.15)' : 'rgba(255, 224, 178, 0.8)',
                        color: theme === 'dark' ? '#ff5722' : '#bf360c',
                        display: 'block',
                        margin: '0',
                        padding: '0 1rem',
                        fontWeight: 'bold'
                      }
                    };
                  } else if (trimmedLine.startsWith('#')) {
                    return {
                      style: {
                        backgroundColor: theme === 'dark' ? 'rgba(130, 170, 255, 0.15)' : 'rgba(237, 242, 247, 0.8)',
                        color: theme === 'dark' ? '#82aaff' : '#4a5568',
                        display: 'block',
                        margin: '0',
                        padding: '0 1rem',
                        fontStyle: 'italic'
                      }
                    };
                  }
                }
                return {
                  style: {
                    display: 'block',
                    margin: '0',
                    padding: '0 1rem'
                  }
                };
              }}
            >
              {inputCode}
            </SyntaxHighlighter>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>{t('codeHighlighter.supportedLanguages')}</p>
            <p>{t('codeHighlighter.autoDetection')}</p>
            <p>{t('codeHighlighter.manualSelection')}</p>
          </div>
        </div>
      )}
    </div>
  );
}