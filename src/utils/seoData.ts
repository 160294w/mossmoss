// SEO用のメタデータ定義
export interface ToolSEOData {
  title: string;
  description: string;
  keywords: string[];
  path: string;
}

export const toolSEOData: Record<string, ToolSEOData> = {
  'character-count': {
    title: '文字数カウント - 日本語・英語対応 | tarutaru',
    description: 'リアルタイムで文字数・バイト数・行数をカウント。日本語・英語・記号対応の無料文字数カウンターツール。コピー機能付きで使いやすい。',
    keywords: ['文字数カウント', '文字数', 'バイト数', '行数', '日本語', '英語', 'リアルタイム', '無料'],
    path: '/tools/character-count'
  },
  'json-formatter': {
    title: 'JSON整形・圧縮ツール - 美しい整形とミニファイ | tarutaru',
    description: 'JSONデータを見やすく整形したり圧縮（ミニファイ）できる無料ツール。構文チェック・エラー表示・統計情報付き。開発者必須のJSONフォーマッター。',
    keywords: ['JSON整形', 'JSONフォーマッター', 'JSON圧縮', 'ミニファイ', '構文チェック', 'JSON validator', '開発ツール'],
    path: '/tools/json-formatter'
  },
  'jwt-viewer': {
    title: 'JWT Token表示・デコードツール - ヘッダー・ペイロード解析 | tarutaru',
    description: 'JWT（JSON Web Token）をデコードしてヘッダー・ペイロード・シグネチャを表示。期限チェック・標準クレーム表示対応の無料JWTビューアー。',
    keywords: ['JWT', 'JSON Web Token', 'JWTデコード', 'JWT表示', 'トークン', '認証', 'セキュリティ', '開発ツール'],
    path: '/tools/jwt-viewer'
  },
  'base-converter': {
    title: 'Base64・Base58変換ツール - エンコード・デコード対応 | tarutaru',
    description: 'Base64、Base64URL、Base58の相互変換ツール。エンコード・デコード双方向対応。バイト数・文字数統計付きの無料Base変換ツール。',
    keywords: ['Base64変換', 'Base58変換', 'Base64エンコード', 'Base64デコード', 'Base64URL', '暗号化', '開発ツール'],
    path: '/tools/base-converter'
  },
  'qr-generator': {
    title: 'QRコード生成ツール - 高品質・カスタマイズ対応 | tarutaru',
    description: 'テキストからQRコードを生成する無料ツール。サイズ・色・エラー訂正レベル調整可能。URL・メール・Wi-Fi設定用QRコード対応。PNG形式ダウンロード。',
    keywords: ['QRコード生成', 'QRコード', 'QRコード作成', '2次元バーコード', 'URL', 'WiFi', 'PNG', '無料'],
    path: '/tools/qr-generator'
  },
  'hash-generator': {
    title: 'ハッシュ生成ツール - MD5・SHA-1・SHA-256対応 | tarutaru',
    description: 'テキストからMD5、SHA-1、SHA-256ハッシュを生成する無料ツール。ファイル検証・パスワード確認・データ整合性チェックに最適。',
    keywords: ['ハッシュ生成', 'MD5', 'SHA-1', 'SHA-256', 'ハッシュ値', '暗号化', 'チェックサム', 'データ検証'],
    path: '/tools/hash-generator'
  },
  'uuid-generator': {
    title: 'UUID生成ツール - v4・v1対応の一意識別子生成 | tarutaru',
    description: 'UUID v4・v1を生成する無料ツール。データベースの主キー・ファイル名・セッションIDに最適な一意識別子を瞬時に生成。',
    keywords: ['UUID生成', 'UUID', '一意識別子', 'GUID', 'v4', 'v1', 'データベース', 'セッションID'],
    path: '/tools/uuid-generator'
  },
  'radix-converter': {
    title: '進数変換ツール - 2進数・8進数・10進数・16進数相互変換 | tarutaru',
    description: '2進数・8進数・10進数・16進数を相互変換する無料ツール。プログラミング・数学の学習に最適。リアルタイム変換で使いやすい。',
    keywords: ['進数変換', '2進数', '8進数', '10進数', '16進数', '基数変換', 'プログラミング', '数学'],
    path: '/tools/radix-converter'
  },
  'text-converter': {
    title: '全角半角変換ツール - 数字・英字・カタカナ変換 | tarutaru',
    description: '全角・半角文字を相互変換する無料ツール。数字・英字・カタカナを個別変換可能。データ整理・文書作成に便利。',
    keywords: ['全角半角変換', '全角', '半角', 'カタカナ変換', '数字変換', '英字変換', '文字変換', 'データ整理'],
    path: '/tools/text-converter'
  },
  'random-generator': {
    title: 'ランダム文字列生成ツール - パスワード・トークン・PIN生成 | tarutaru',
    description: 'カスタマイズ可能なランダム文字列生成ツール。パスワード・トークン・PIN生成に最適。文字種・長さ調整可能。安全で使いやすい。',
    keywords: ['ランダム文字列', 'パスワード生成', 'トークン生成', 'PIN生成', 'ランダムパスワード', 'セキュリティ', '暗号化'],
    path: '/tools/random-generator'
  },
  'markdown-converter': {
    title: 'Markdown変換ツール - HTML相互変換 | tarutaru',
    description: 'MarkdownとHTMLを相互変換する無料ツール。ブログ・ドキュメント作成に最適。プレビュー機能付きで使いやすい。',
    keywords: ['Markdown変換', 'Markdown', 'HTML変換', 'マークダウン', 'ブログ', 'ドキュメント', 'プレビュー'],
    path: '/tools/markdown-converter'
  },
  'text-sorter': {
    title: 'テキストソートツール - 行ソート・重複削除・シャッフル | tarutaru',
    description: 'テキストの行をソート・重複削除・シャッフルする無料ツール。昇順・降順・ランダム並び替え対応。データ整理に便利。',
    keywords: ['テキストソート', 'ソート', '重複削除', 'シャッフル', '並び替え', '行ソート', 'データ整理'],
    path: '/tools/text-sorter'
  },
  'code-highlighter': {
    title: 'コードハイライトツール - 自動言語判定・シンタックスハイライト | tarutaru',
    description: 'プログラムコードを美しくハイライト表示する無料ツール。自動言語判定・多言語対応。プレゼン・ドキュメント作成に最適。',
    keywords: ['コードハイライト', 'シンタックスハイライト', '構文ハイライト', 'プログラミング', 'コード表示', '言語判定'],
    path: '/tools/code-highlighter'
  },
  'ascii-art-generator': {
    title: 'ASCII Art生成ツール - ランダム2ch風アスキーアート | tarutaru',
    description: 'ランダムな2ch風ASCII Artを生成する無料ツール。顔文字・キャラクター・装飾文字を自動生成。チャット・掲示板に最適。',
    keywords: ['ASCII Art', 'アスキーアート', '2ch', '顔文字', 'AA', 'テキストアート', 'ランダム生成'],
    path: '/tools/ascii-art-generator'
  },
  'yaml-json-converter': {
    title: 'YAML-JSON変換ツール - 相互変換・構文チェック | tarutaru',
    description: 'YAMLとJSONを相互変換する無料ツール。構文チェック・エラー表示付き。設定ファイル・API開発に便利。',
    keywords: ['YAML変換', 'JSON変換', 'YAML', 'JSON', '相互変換', '設定ファイル', 'API', '構文チェック'],
    path: '/tools/yaml-json-converter'
  },
  'jq-explorer': {
    title: 'jq式テストツール - JSON Query実行・フィルタリング | tarutaru',
    description: 'jq式を使ったJSONデータのフィルタリング・変換ツール。リアルタイムでjqクエリをテスト実行。API開発・データ処理に最適。',
    keywords: ['jq', 'jqコマンド', 'JSON Query', 'JSONフィルター', 'データ処理', 'API', 'クエリ'],
    path: '/tools/jq-explorer'
  },
  'certificate-viewer': {
    title: '証明書表示ツール - SSL証明書・X.509証明書解析 | tarutaru',
    description: 'SSL証明書・X.509証明書の詳細情報を表示する無料ツール。有効期限・発行者・拡張情報を分析。セキュリティ検証に最適。',
    keywords: ['証明書', 'SSL証明書', 'X.509', '証明書解析', 'セキュリティ', '有効期限', 'SSL', 'TLS'],
    path: '/tools/certificate-viewer'
  },
  'color-preview': {
    title: 'カラープレビューツール - 色表示・カラーコード変換 | tarutaru',
    description: 'HEX・RGB・HSLカラーコードをプレビュー表示する無料ツール。色の相互変換・色見本確認。Web制作・デザインに便利。',
    keywords: ['カラープレビュー', '色', 'HEXカラー', 'RGB', 'HSL', 'カラーコード', 'Webデザイン', '色見本'],
    path: '/tools/color-preview'
  },
  'datetime-formatter': {
    title: '日時フォーマットツール - 日付時刻形式変換 | tarutaru',
    description: '日付・時刻を様々な形式に変換する無料ツール。Unix timestamp・ISO 8601・カスタム形式対応。プログラミング・データ処理に便利。',
    keywords: ['日時フォーマット', '日付変換', '時刻変換', 'Unix timestamp', 'ISO 8601', '日付形式', 'プログラミング'],
    path: '/tools/datetime-formatter'
  },
  'cron-parser': {
    title: 'Cron式解析ツール - crontab式パーサー・実行時刻計算 | tarutaru',
    description: 'Cron式（crontab）を解析して実行時刻を表示する無料ツール。次回実行時刻・スケジュール確認。サーバー管理・自動化に最適。',
    keywords: ['Cron', 'crontab', 'Cron式', 'スケジュール', '自動化', 'サーバー管理', 'タスクスケジューラー'],
    path: '/tools/cron-parser'
  },
  'curl-converter': {
    title: 'cURL変換ツール - HTTPリクエスト変換・API分析 | tarutaru',
    description: 'cURLコマンドを解析してHTTPリクエストの詳細を表示する無料ツール。ヘッダー・メソッド・ボディを分析。API開発・デバッグに便利。',
    keywords: ['cURL', 'cURLコマンド', 'HTTPリクエスト', 'API', 'HTTP', 'ヘッダー', 'デバッグ', '開発ツール'],
    path: '/tools/curl-converter'
  },
  'html-escaper': {
    title: 'HTMLエスケープツール - HTML特殊文字変換 | tarutaru',
    description: 'HTMLの特殊文字をエスケープ・アンエスケープする無料ツール。XSS対策・HTML表示に必須。Web開発・セキュリティ対策に最適。',
    keywords: ['HTMLエスケープ', 'HTML特殊文字', 'エスケープ', 'XSS対策', 'セキュリティ', 'Web開発', '特殊文字'],
    path: '/tools/html-escaper'
  },
  'json-log-viewer': {
    title: 'JSONログビューアー - ログファイル解析・フィルタリング | tarutaru',
    description: 'JSON形式のログファイルを見やすく表示・フィルタリングする無料ツール。サーバーログ・アプリケーションログの分析に最適。',
    keywords: ['JSONログ', 'ログビューアー', 'ログ解析', 'ログファイル', 'サーバーログ', 'フィルタリング', 'デバッグ'],
    path: '/tools/json-log-viewer'
  },
  'case-converter': {
    title: 'ケース変換ツール - camelCase・snake_case・PascalCase変換 | tarutaru',
    description: '文字列のケース形式を変換する無料ツール。camelCase・snake_case・PascalCase・kebab-case対応。プログラミング・命名規則に便利。',
    keywords: ['ケース変換', 'camelCase', 'snake_case', 'PascalCase', 'kebab-case', '命名規則', 'プログラミング'],
    path: '/tools/case-converter'
  },
  'curl-to-code': {
    title: 'cURLコード変換ツール - cURLからプログラムコード生成 | tarutaru',
    description: 'cURLコマンドを各種プログラミング言語のコードに変換する無料ツール。JavaScript・Python・PHP・Java対応。API開発を効率化。',
    keywords: ['cURLコード変換', 'cURL', 'コード生成', 'JavaScript', 'Python', 'PHP', 'API', '開発ツール'],
    path: '/tools/curl-to-code'
  }
};

// ツール検索用のキーワードマッピング
export const toolKeywordMapping: Record<string, string[]> = {
  // 検索語: [該当するツールID]
  '文字数': ['character-count'],
  'カウント': ['character-count'],
  'JSON': ['json-formatter', 'yaml-json-converter', 'jq-explorer', 'json-log-viewer'],
  '整形': ['json-formatter'],
  'フォーマット': ['json-formatter', 'datetime-formatter'],
  'JWT': ['jwt-viewer'],
  'トークン': ['jwt-viewer', 'random-generator'],
  'Base64': ['base-converter'],
  'Base58': ['base-converter'],
  '変換': ['base-converter', 'text-converter', 'radix-converter', 'yaml-json-converter', 'case-converter', 'curl-to-code'],
  'QR': ['qr-generator'],
  'QRコード': ['qr-generator'],
  'ハッシュ': ['hash-generator'],
  'MD5': ['hash-generator'],
  'SHA': ['hash-generator'],
  'UUID': ['uuid-generator'],
  '進数': ['radix-converter'],
  '2進数': ['radix-converter'],
  '16進数': ['radix-converter'],
  '全角': ['text-converter'],
  '半角': ['text-converter'],
  'ランダム': ['random-generator', 'ascii-art-generator'],
  'パスワード': ['random-generator'],
  'Markdown': ['markdown-converter'],
  'ソート': ['text-sorter'],
  '並び替え': ['text-sorter'],
  'コード': ['code-highlighter', 'curl-to-code'],
  'ハイライト': ['code-highlighter'],
  'ASCII': ['ascii-art-generator'],
  'YAML': ['yaml-json-converter'],
  'jq': ['jq-explorer'],
  '証明書': ['certificate-viewer'],
  'SSL': ['certificate-viewer'],
  '色': ['color-preview'],
  'カラー': ['color-preview'],
  '日時': ['datetime-formatter'],
  '日付': ['datetime-formatter'],
  'Cron': ['cron-parser'],
  'cURL': ['curl-converter', 'curl-to-code'],
  'HTML': ['html-escaper'],
  'エスケープ': ['html-escaper'],
  'ログ': ['json-log-viewer'],
  'ケース': ['case-converter'],
  'camel': ['case-converter'],
  'snake': ['case-converter']
};