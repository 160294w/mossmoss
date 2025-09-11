import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface GlitchTextProps {
  text: string;
  trigger?: boolean;
  className?: string;
  glitchIntensity?: 'low' | 'medium' | 'high';
  typewriterEffect?: boolean;
  onComplete?: () => void;
}

export function GlitchText({ 
  text, 
  trigger = true, 
  className = '',
  glitchIntensity = 'medium',
  typewriterEffect = true,
  onComplete 
}: GlitchTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayText, setDisplayText] = useState('');

  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
  const intensitySettings = {
    low: { glitchChance: 0.1, glitchDuration: 0.05, glitchCount: 1 },
    medium: { glitchChance: 0.2, glitchDuration: 0.08, glitchCount: 2 },
    high: { glitchChance: 0.3, glitchDuration: 0.12, glitchCount: 3 }
  };

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    const container = containerRef.current;
    const settings = intensitySettings[glitchIntensity];

    if (typewriterEffect) {
      // タイプライター + グリッチエフェクト
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex >= text.length) {
          onComplete?.();
          return;
        }

        // const _currentChar = text[currentIndex]; // 使用されていない変数
        
        // グリッチ効果の判定
        if (Math.random() < settings.glitchChance) {
          // グリッチ文字を表示
          const glitchChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
          setDisplayText(text.slice(0, currentIndex) + glitchChar);
          
          // 短時間後に正しい文字に戻す
          setTimeout(() => {
            setDisplayText(text.slice(0, currentIndex + 1));
            currentIndex++;
            
            // 次の文字へ
            setTimeout(typeNextChar, Math.random() * 50 + 30);
          }, settings.glitchDuration * 1000);
        } else {
          // 通常の文字を表示
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
          
          // 次の文字へ
          setTimeout(typeNextChar, Math.random() * 80 + 40);
        }
      };

      typeNextChar();
    } else {
      // 即座に表示してからグリッチ
      setDisplayText(text);
      
      // ランダムなグリッチエフェクト
      for (let i = 0; i < settings.glitchCount; i++) {
        setTimeout(() => {
          const chars = text.split('');
          const glitchIndices: number[] = [];
          
          // ランダムな位置をグリッチ
          for (let j = 0; j < Math.floor(text.length * 0.3); j++) {
            const index = Math.floor(Math.random() * text.length);
            if (!glitchIndices.includes(index)) {
              glitchIndices.push(index);
              chars[index] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }
          }
          
          setDisplayText(chars.join(''));
          
          // 元に戻す
          setTimeout(() => {
            setDisplayText(text);
            if (i === settings.glitchCount - 1) {
              onComplete?.();
            }
          }, settings.glitchDuration * 1000);
        }, i * 200);
      }
    }

    // コンテナにグリッチスタイルを適用
    gsap.set(container, {
      filter: 'none',
      textShadow: 'none'
    });

    // 追加のビジュアルグリッチエフェクト
    const glitchTimeline = gsap.timeline({ repeat: -1 });
    
    glitchTimeline
      .to(container, {
        duration: 0.1,
        skewX: () => Math.random() * 10 - 5,
        filter: `hue-rotate(${Math.random() * 360}deg) saturate(${Math.random() * 3 + 1})`,
        textShadow: `
          ${Math.random() * 4 - 2}px 0 #ff0000,
          ${Math.random() * 4 - 2}px 0 #00ff00,
          ${Math.random() * 4 - 2}px 0 #0000ff
        `,
        ease: "none"
      })
      .to(container, {
        duration: 0.1,
        skewX: 0,
        filter: 'none',
        textShadow: 'none',
        ease: "none"
      })
      .to({}, { duration: Math.random() * 2 + 1 }); // 待機時間

    // クリーンアップ
    return () => {
      glitchTimeline.kill();
    };
  }, [trigger, text, glitchIntensity, typewriterEffect, onComplete]);

  return (
    <div 
      ref={containerRef}
      className={`font-mono select-none ${className}`}
      style={{ 
        minHeight: '1em',
        display: 'inline-block'
      }}
    >
      {displayText}
      {typewriterEffect && displayText.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
}

// グリッチエフェクトのフック版
export function useGlitchEffect() {
  const glitchElement = (element: HTMLElement, options?: {
    intensity?: 'low' | 'medium' | 'high';
    duration?: number;
  }) => {
    const { intensity = 'medium' } = options || {};
    const settings = {
      low: { maxSkew: 5, maxOffset: 2 },
      medium: { maxSkew: 10, maxOffset: 4 },
      high: { maxSkew: 20, maxOffset: 8 }
    }[intensity];

    const originalText = element.textContent || '';
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

    const timeline = gsap.timeline();

    // グリッチアニメーション
    for (let i = 0; i < 5; i++) {
      timeline
        .to(element, {
          duration: 0.05,
          skewX: Math.random() * settings.maxSkew * 2 - settings.maxSkew,
          x: Math.random() * settings.maxOffset * 2 - settings.maxOffset,
          filter: `hue-rotate(${Math.random() * 360}deg)`,
          textShadow: `
            ${Math.random() * 4 - 2}px 0 #ff0000,
            ${Math.random() * 4 - 2}px 0 #00ff00,
            ${Math.random() * 4 - 2}px 0 #0000ff
          `,
          onStart: () => {
            // テキストを一時的に変更
            if (Math.random() < 0.5) {
              const chars = originalText.split('');
              for (let j = 0; j < Math.floor(chars.length * 0.2); j++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                chars[randomIndex] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
              }
              element.textContent = chars.join('');
            }
          }
        })
        .to(element, {
          duration: 0.05,
          skewX: 0,
          x: 0,
          filter: 'none',
          textShadow: 'none',
          onComplete: i === 4 ? () => {
            element.textContent = originalText;
          } : undefined
        });
    }

    return timeline;
  };

  return { glitchElement };
}

// CSSアニメーション版のグリッチテキスト（より軽量）
export function SimpleGlitchText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span 
        className="absolute top-0 left-0 text-red-500 opacity-70 animate-pulse"
        style={{ 
          clipPath: 'inset(0 0 50% 0)',
          transform: 'translateX(-2px)',
          animationDuration: '0.1s'
        }}
      >
        {text}
      </span>
      <span 
        className="absolute top-0 left-0 text-blue-500 opacity-70 animate-pulse"
        style={{ 
          clipPath: 'inset(50% 0 0 0)',
          transform: 'translateX(2px)',
          animationDuration: '0.15s'
        }}
      >
        {text}
      </span>
    </div>
  );
}