import { useState } from 'react';
import { Button } from '../UI/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolProps } from '../../types';

type AACharacter = {
  name: string;
  category: string;
  art: string;
  description?: string;
};

export function AsciiArtGenerator({ onHistoryAdd }: ToolProps) {
  const [selectedArt, setSelectedArt] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { t } = useLanguage();

  const asciiArts: AACharacter[] = [
    // モナー系
    {
      name: 'モナー（基本）',
      category: 'classic',
      art: `　　∧＿∧
　　( ´∀｀)
　　(　　　 )
　　｜ ｜ |
　　（_＿）_）`,
      description: '2ちゃんねるの元祖マスコット'
    },
    {
      name: 'モナー（挨拶）',
      category: 'classic',
      art: `　 ∧＿∧　 ／￣￣￣￣￣￣￣
　 ( ´∀｀) ＜　おはようモナ〜
　 (　　　)　 ＼＿＿＿＿＿＿＿
　 |　| |
　 （__）_）`
    },
    {
      name: 'モナー（泣き）',
      category: 'classic',
      art: `　　 ∧＿∧
　　 ( ；∀；)
　　 (　　　 )
　　 ｜ ｜ |
　　 （_＿）_）`
    },
    // やる夫系
    {
      name: 'やる夫',
      category: 'yaruo',
      art: `　　　　　　　　　 ／￣￣￣＼
　　　　　　　　　/　　　　　　　＼
　　　　　　　　 /　　 ─　　　─　＼
　　　　　　　　|　　　（●）　（●）　|
　　　　　　　　 ＼　　　（__人__）　 ／
　　　　　　　　　 ＼　　　｀ ⌒´　 ／
　　　　　　　　　　/　　　　　　　　＼`,
      description: 'VIPの人気キャラクター'
    },
    {
      name: 'やる夫（やった）',
      category: 'yaruo',
      art: `　　　　　　　　　 ／￣￣￣＼
　　　　　　　　　/　　　　　　　＼
　　　　　　　　 /　　 ─　　　─　＼　　やったお！
　　　　　　　　|　　　（○）　（○）　|　
　　　　　　　　 ＼　　　（__人__）　 ／
　　　　　　　　　 ＼　　　｀ ⌒´　 ／
　　　　　　　　　　/　　　　　　　　＼`
    },
    {
      name: 'やる夫（困った）',
      category: 'yaruo',
      art: `　　　　　　　　　 ／￣￣￣＼
　　　　　　　　　/　　　　　　　＼
　　　　　　　　 /　　 ─　　　─　＼　　
　　　　　　　　|　　　（－）　（－）　|　困ったお...
　　　　　　　　 ＼　　　（__人__）　 ／
　　　　　　　　　 ＼　　　｀ ⌒´　 ／
　　　　　　　　　　/　　　　　　　　＼`
    },
    // ギコ系
    {
      name: 'ギコ',
      category: 'giko',
      art: `　　 ∧∧　　 ／￣￣￣￣￣
　　 (,,ﾟДﾟ)　＜　ふーん
　　 /　　｜　　＼＿＿＿＿＿
　　(___ノ`,
      description: 'クールなネコキャラ'
    },
    {
      name: 'ギコ（怒り）',
      category: 'giko',
      art: `　　 ∧∧　　 ／￣￣￣￣￣
　　 (,,｀Д´)　＜　ゴルァ！！
　　 /　　｜　　＼＿＿＿＿＿
　　(___ノ`
    },
    {
      name: 'ギコ（驚き）',
      category: 'giko',
      art: `　　 ∧∧　　 ／￣￣￣￣￣
　　 (,,ﾟoﾟ)　＜　なんだって！
　　 /　　｜　　＼＿＿＿＿＿
　　(___ノ`
    },
    // オエー系
    {
      name: 'オエー鳥',
      category: 'oee',
      art: `　　　 ∧ ∧　　　　／￣￣￣￣￣￣￣￣
　　　（ ´∀｀）　　＜　オエーーー！！
　 　 ノ　つ　つ　　　＼＿＿＿＿＿＿＿＿
　　 ⊂､ ノ　　　　
　　　　し'`,
      description: '吐き気を表現するAA'
    },
    {
      name: 'オエー鳥（大）',
      category: 'oee',
      art: `　　　　　　　∧ ∧　　　　／￣￣￣￣￣￣￣￣￣
　　　　　　　（ ´∀｀）　　＜　オエーーーーーー！！
　　　　　　ノ　つ　つ　　　＼＿＿＿＿＿＿＿＿＿
　　　　　⊂､ ノ　　　　　
　　　　　　　し'`
    },
    // 麻呂系
    {
      name: '麻呂',
      category: 'maro',
      art: `　　　　　　　　　 ／⌒＼
　　　　　　　　　/　　　 ）
　　　　　　　　 |　　　 /
　　　　　　　　 |　　 （　/⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒
　　　　　　　　 |　　　　（　それでおじゃるか？
　　　　　　　　 |　　　　　⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒
　　　　　 ＿＿ |　　　　ノ
　　　　　(　 __|___／
　　　　　/　　　　 　　＼
　　　　/　　⌒　　　⌒　　＼
　　　 |::::::::　（・）　　（・）　　|
　　　 |::::::::::　　 ＼___／　　 |
　　　 |::::::::::::::::　　＼/　 　ノ`,
      description: '平安時代の貴公子風キャラ'
    },
    {
      name: '麻呂（驚き）',
      category: 'maro',
      art: `　　　　　　　　　 ／⌒＼
　　　　　　　　　/　　　 ）
　　　　　　　　 |　　　 /
　　　　　　　　 |　　 （　/⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒
　　　　　　　　 |　　　　（　なんですとおおお！？
　　　　　　　　 |　　　　　⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒⌒
　　　　　 ＿＿ |　　　　ノ
　　　　　(　 __|___／
　　　　　/　　　　 　　＼
　　　　/　　⌒　　　⌒　　＼
　　　 |::::::::　（○）　　（○）　　|
　　　 |::::::::::　　 ＼___／　　 |
　　　 |::::::::::::::::　　＼/　 　ノ`
    },
    // その他の人気キャラ
    {
      name: 'しぃ',
      category: 'other',
      art: `　　　 ∧ ∧
　　　（*ﾟーﾟ)
　 　 |つ つ
　　～|　 |
　　　 Ｕ"Ｕ`,
      description: '可愛い女の子キャラ'
    },
    {
      name: 'でぃ',
      category: 'other',
      art: `　　　 ∧ ∧
　　　（,, ﾟ∀ﾟ)　　そうでぃ
　 　 |つ つ
　　～|　 |
　　　 Ｕ"Ｕ`
    },
    {
      name: 'フサギコ',
      category: 'other',
      art: `　　　∧∧
　　 ( ﾟ∀ﾟ)　　　んが？
　　 /　 つつ
　　　~|　|
　　　 ∪∪`
    },
    {
      name: 'ぽこたん',
      category: 'other',
      art: `　　　　　　　　　　　 ぽこたん
　　　　∩___∩　　　　　　 いんしたお…
　　　　|　ノ　　　　 ヽ
　　　 /　　●　　　● |
　　　|　　　　( _●_)　 ミ
　　　彡､　　　|∪|　　 ､｀＼
　　 /　＿＿　 ヽノ　/´>　 )
　　(＿＿＿）　　　　/　(_／
　　　|　　　　　　　 /
　　　|　　/＼　　　＼
　　　|　/　　 )　　　 )
　　　∪　　 （　　　 ＼
　　　　　　　 ＼＿）`
    },
    // 感情表現系
    {
      name: 'ズコー',
      category: 'emotion',
      art: `　　　　　　　　　　　∧＿∧
　　　　　　　　　　 （　　´Д｀）
　　　　　　　　　　 /　　　　 ＼
　　　　　　　　　　|　l　　 　　 l　|　　　　 ＿＿＿＿＿＿＿＿＿＿
　　　　　　　　　　|　|　　 　　 |　|　　　　 |＿＿＿＿＿＿＿＿＿＿｜
　　　　　　　　 ￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣
　　　　　　　　　　　　　　　　　 ズコー`,
      description: 'ずっこける表現'
    },
    {
      name: 'ガクガクブルブル',
      category: 'emotion',
      art: `　　　　　∧ ∧　　　　　 ／￣￣￣￣￣￣
　　　　　 (；ﾟ∀ﾟ)＝3　 ＜　ｶﾞｸｶﾞｸﾌﾞﾙﾌﾞﾙ
　　　　　⊂┯⊂ ) 　　　　 ＼＿＿＿＿＿＿
　　　 　／⌒＼⌒ヽ.
　　　　 ｀ー'　 ｀ー' `,
      description: '恐怖の表現'
    },
    // 1行系感情表現（汎用性が高い）
    {
      name: 'ｷﾀ━━━(ﾟ∀ﾟ)━━━!!',
      category: 'oneline',
      art: `ｷﾀ━━━━━━━━━━━━━━━━━━(ﾟ∀ﾟ)━━━━━━━━━━━━━━━━━━!!!!!`,
      description: '興奮・喜びの表現'
    },
    {
      name: 'ｷﾀｰ',
      category: 'oneline',
      art: `ｷﾀ━━━ヽ(∀ﾟ )人(ﾟ∀ﾟ)人( ﾟ∀)ノ━━━!!`,
      description: '大勢で喜ぶ表現'
    },
    {
      name: 'うはｗｗｗおkｗｗｗ',
      category: 'oneline',
      art: `うはｗｗｗおkｗｗｗ`,
      description: '2ちゃん特有の表現'
    },
    {
      name: 'ワロタ',
      category: 'oneline',
      art: `ワロタ`,
      description: '笑った時の表現'
    },
    {
      name: 'ワロスwww',
      category: 'oneline',
      art: `ワロスwwwwwwwww`,
      description: '爆笑の表現'
    },
    {
      name: 'ちょwwwおまwww',
      category: 'oneline',
      art: `ちょwwwおまwwwwww`,
      description: '突っ込みの表現'
    },
    {
      name: '(´･ω･\`)ショボーン',
      category: 'oneline',
      art: '(´･ω･\`)ショボーン',
      description: '落ち込み・がっかり'
    },
    {
      name: '( ´Д｀)ﾊｧｧ',
      category: 'oneline',
      art: `( ´Д｀)ﾊｧｧ`,
      description: 'ため息・疲れ'
    },
    {
      name: '工エエェェ(´д｀)ェェエエ工',
      category: 'oneline',
      art: `工エエェェ(´д｀)ェェエエ工`,
      description: '驚き・困惑'
    },
    {
      name: 'Σ(ﾟДﾟ)ｽｹﾞｰ',
      category: 'oneline',
      art: `Σ(ﾟДﾟ)ｽｹﾞｰ!!`,
      description: '衝撃・驚愕'
    },
    {
      name: '(・∀・)ｲｲ!',
      category: 'oneline',
      art: `(・∀・)ｲｲ!`,
      description: '良い・賛成'
    },
    {
      name: '(・A・)ｲｸﾅｲ!',
      category: 'oneline',
      art: `(・A・)ｲｸﾅｲ!`,
      description: '悪い・反対'
    },
    {
      name: '(´∀｀)ｱﾊﾊ八八ﾉヽﾉヽﾉヽﾉ ＼ / ＼/ ＼',
      category: 'oneline',
      art: `(´∀｀)ｱﾊﾊ八八ﾉヽﾉヽﾉヽﾉ ＼ / ＼/ ＼`,
      description: '大爆笑'
    },
    {
      name: 'm9(^Д^)ﾌﾟｷﾞｬｰ',
      category: 'oneline',
      art: `m9(^Д^)ﾌﾟｷﾞｬｰ`,
      description: '指差して笑う'
    },
    {
      name: '( ´∀｀)σ)Д`)ﾌﾟﾆｮｰﾝ',
      category: 'oneline',
      art: '( ´∀\`)σ)Д\`)ﾌﾟﾆｮｰﾝ',
      description: '頬つねり'
    },
    {
      name: '(ﾉ∀`)ｱﾁｬｰ',
      category: 'oneline',
      art: '(ﾉ∀\`)ｱﾁｬｰ',
      description: '失敗を見て笑う'
    },
    {
      name: '(´・ω・`)知らんがな',
      category: 'oneline',
      art: '(´・ω・\`)知らんがな',
      description: '関西弁でつっこみ'
    },
    {
      name: '(ﾟДﾟ)ﾊｧ?',
      category: 'oneline',
      art: `(ﾟДﾟ)ﾊｧ?`,
      description: '疑問・困惑'
    },
    {
      name: '(　´∀｀)σ)∀`)ｸｽｸｽ',
      category: 'oneline',
      art: '(　´∀\`)σ)∀\`)ｸｽｸｽ',
      description: 'くすくす笑い'
    },
    {
      name: '(・∀・)ｽﾝｽﾝｽｰﾝ',
      category: 'oneline',
      art: `(・∀・)ｽﾝｽﾝｽｰﾝ♪`,
      description: '楽しい・上機嫌'
    },
    {
      name: '(゜∀゜)ｱﾋｬ',
      category: 'oneline',
      art: `(゜∀゜)ｱﾋｰ`,
      description: '狂気の笑い'
    },
    {
      name: '(￣ー￣)ﾆﾔﾘ',
      category: 'oneline',
      art: `(￣ー￣)ﾆﾔﾘ`,
      description: '意味深な笑み'
    },
    {
      name: '＿|￣|○',
      category: 'oneline',
      art: `＿|￣|○`,
      description: '土下座・謝罪'
    },
    {
      name: 'orz',
      category: 'oneline',
      art: `orz`,
      description: '絶望・挫折'
    },
    {
      name: 'OTL',
      category: 'oneline',
      art: `OTL`,
      description: 'orzの変形'
    },
    {
      name: '○| ￣|＿',
      category: 'oneline',
      art: `○| ￣|＿`,
      description: 'orzの逆'
    },
    {
      name: 'Σ(゜Д゜;)',
      category: 'oneline',
      art: `Σ(゜Д゜;)`,
      description: 'ビックリ・焦り'
    },
    {
      name: '(-_-;)',
      category: 'oneline',
      art: `(-_-;)`,
      description: '困った・呆れ'
    },
    {
      name: '(^o^)/',
      category: 'oneline',
      art: `(^o^)/`,
      description: '元気・万歳'
    },
    {
      name: '＼(^o^)／',
      category: 'oneline',
      art: `＼(^o^)／`,
      description: '両手上げて喜び'
    },
    {
      name: 'ヽ(´ー` )ノ',
      category: 'oneline',
      art: 'ヽ(´ー\` )ノ',
      description: 'のんびり・マッタリ'
    },
    {
      name: '( ・ω・)ﾓﾆｭ?',
      category: 'oneline',
      art: `( ・ω・)ﾓﾆｭ?`,
      description: '疑問・首かしげ'
    },
    {
      name: '(　´ Д ｀ )y-~~',
      category: 'oneline',
      art: `(　´ Д ｀ )y-~~`,
      description: 'タバコを吸う'
    },
    {
      name: 'ヽ(ﾟ∀ﾟ)ﾉ',
      category: 'oneline',
      art: `ヽ(ﾟ∀ﾟ)ﾉ`,
      description: '喜び・やったー'
    },
    {
      name: '(*´д｀*)ハァハァ',
      category: 'oneline',
      art: `(*´д｀*)ハァハァ`,
      description: '興奮・息切れ'
    },
    {
      name: '(ﾟ∀ﾟ)ｱﾋｬ',
      category: 'oneline',
      art: `(ﾟ∀ﾟ)ｱﾋｬ`,
      description: '壊れた笑い'
    },
    {
      name: 'щ(゜Д゜щ)',
      category: 'oneline',
      art: `щ(゜Д゜щ)`,
      description: 'カモーン'
    },
    {
      name: '(((( ；゜Д゜)))',
      category: 'oneline',
      art: `(((( ；゜Д゜))))ガクガクブルブル`,
      description: '恐怖で震える'
    },
    {
      name: '(´Д⊂)',
      category: 'oneline',
      art: `(´Д⊂)`,
      description: '涙・感動'
    },
    {
      name: '(つД⊂)',
      category: 'oneline',
      art: `(つД⊂)`,
      description: 'もっと泣き'
    },
    {
      name: '(´；ω；`)',
      category: 'oneline',
      art: '(´；ω；\`)',
      description: '大泣き'
    }
  ];

  const categories = [
    { value: 'all', label: t('asciiArtGenerator.category.all') },
    { value: 'classic', label: t('asciiArtGenerator.category.classic') },
    { value: 'yaruo', label: t('asciiArtGenerator.category.yaruo') },
    { value: 'giko', label: t('asciiArtGenerator.category.giko') },
    { value: 'oee', label: t('asciiArtGenerator.category.oee') },
    { value: 'maro', label: t('asciiArtGenerator.category.maro') },
    { value: 'other', label: t('asciiArtGenerator.category.other') },
    { value: 'emotion', label: t('asciiArtGenerator.category.emotion') }
  ];

  const getFilteredArts = () => {
    if (selectedCategory === 'all') {
      return asciiArts;
    }
    return asciiArts.filter(art => art.category === selectedCategory);
  };

  const generateRandomArt = () => {
    const filteredArts = getFilteredArts();
    if (filteredArts.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * filteredArts.length);
    const selectedAA = filteredArts[randomIndex];
    
    setSelectedArt(selectedAA.art);
    setSelectedCharacter(selectedAA.name);
    
    onHistoryAdd?.({
      toolId: 'ascii-art-generator',
      input: t('asciiArtGenerator.historyInput').replace('{category}', selectedCategory),
      output: t('asciiArtGenerator.historyOutput.random').replace('{name}', selectedAA.name)
    });
  };

  const selectSpecificArt = (character: AACharacter) => {
    setSelectedArt(character.art);
    setSelectedCharacter(character.name);
    
    onHistoryAdd?.({
      toolId: 'ascii-art-generator',
      input: t('asciiArtGenerator.historyInput').replace('{category}', character.category),
      output: t('asciiArtGenerator.historyOutput.select').replace('{name}', character.name)
    });
  };

  const handleCopy = () => {
    if (selectedArt) {
      copyToClipboard(selectedArt);
    }
  };

  const filteredArts = getFilteredArts();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('asciiArtGenerator.category.label')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 items-end">
            <Button onClick={generateRandomArt} className="whitespace-nowrap">
              {t('asciiArtGenerator.generate')}
            </Button>
            {selectedArt && (
              <Button onClick={handleCopy} variant="outline">
                {isCopied ? t('asciiArtGenerator.copied') : t('asciiArtGenerator.copy')}
              </Button>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>
            {t('asciiArtGenerator.availableCount').replace('{count}', filteredArts.length.toString())}
            {selectedCharacter && ` | ${t('asciiArtGenerator.currentDisplay').replace('{character}', selectedCharacter)}`}
          </p>
        </div>
      </div>

      {selectedArt && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('asciiArtGenerator.result.title')}
            </h3>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
            <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre overflow-x-auto">
{selectedArt}
            </pre>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('asciiArtGenerator.list.title').replace('{category}', categories.find(c => c.value === selectedCategory)?.label || '')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArts.map((character, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => selectSpecificArt(character)}
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                {character.name}
              </div>
              {character.description && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {character.description}
                </div>
              )}
              <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre overflow-hidden">
{character.art.split('\n').slice(0, 3).join('\n')}
{character.art.split('\n').length > 3 ? '...' : ''}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p><strong>{t('asciiArtGenerator.usage.title')}</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>{t('asciiArtGenerator.usage.random')}</li>
          <li>{t('asciiArtGenerator.usage.select')}</li>
          <li>{t('asciiArtGenerator.usage.copy')}</li>
          <li>{t('asciiArtGenerator.usage.category')}</li>
        </ul>
        <p className="mt-2">
          <strong>{t('asciiArtGenerator.notice')}</strong>
        </p>
      </div>
    </div>
  );
}