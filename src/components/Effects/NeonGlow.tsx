import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface NeonGlowProps {
  children: React.ReactNode;
  isActive: boolean;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  flickerEffect?: boolean;
  pulseEffect?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function NeonGlow({ 
  children, 
  isActive, 
  color = '#00ff88',
  intensity = 'medium',
  flickerEffect = false,
  pulseEffect = true,
  className = '',
  style
}: NeonGlowProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline>();

  const intensitySettings = {
    low: { blur: 5, spread: 10, opacity: 0.6 },
    medium: { blur: 10, spread: 20, opacity: 0.8 },
    high: { blur: 15, spread: 30, opacity: 1 }
  };

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const settings = intensitySettings[intensity];

    if (isActive) {
      timelineRef.current = gsap.timeline();

      // ベースグロー設定
      const baseGlow = `
        0 0 ${settings.blur}px ${color},
        0 0 ${settings.spread}px ${color},
        0 0 ${settings.spread * 1.5}px ${color},
        inset 0 0 ${settings.blur}px ${color}
      `;

      gsap.set(element, {
        boxShadow: baseGlow,
        color: color,
        textShadow: `0 0 ${settings.blur}px ${color}`,
        borderColor: color
      });

      if (pulseEffect) {
        // パルスエフェクト
        timelineRef.current.to(element, {
          boxShadow: `
            0 0 ${settings.blur * 2}px ${color},
            0 0 ${settings.spread * 2}px ${color},
            0 0 ${settings.spread * 3}px ${color},
            inset 0 0 ${settings.blur * 2}px ${color}
          `,
          textShadow: `0 0 ${settings.blur * 2}px ${color}`,
          duration: 1,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      }

      if (flickerEffect) {
        // フリッカーエフェクト（ネオンサインの不安定さ）
        const flickerTimeline = gsap.timeline({ repeat: -1 });
        
        flickerTimeline
          .to(element, { 
            opacity: 0.3, 
            duration: 0.05,
            ease: "none"
          })
          .to(element, { 
            opacity: 1, 
            duration: 0.05,
            ease: "none"
          })
          .to(element, { 
            opacity: 0.7, 
            duration: 0.03,
            ease: "none"
          })
          .to(element, { 
            opacity: 1, 
            duration: 0.02,
            ease: "none"
          })
          .to({}, { duration: Math.random() * 3 + 2 }); // ランダム待機

        timelineRef.current.add(flickerTimeline, 0);
      }
    } else {
      // グロー効果を削除
      gsap.to(element, {
        boxShadow: 'none',
        textShadow: 'none',
        duration: 0.5,
        ease: "power2.out"
      });
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isActive, color, intensity, flickerEffect, pulseEffect]);

  return (
    <div ref={elementRef} className={className} style={style}>
      {children}
    </div>
  );
}

// ネオンテキストコンポーネント
export function NeonText({ 
  text, 
  isActive = true,
  color = '#00ff88',
  fontSize = 'text-2xl',
  className = ''
}: {
  text: string;
  isActive?: boolean;
  color?: string;
  fontSize?: string;
  className?: string;
}) {
  return (
    <NeonGlow 
      isActive={isActive} 
      color={color}
      className={`${fontSize} font-bold ${className}`}
      style={{
        fontFamily: 'monospace',
        letterSpacing: '0.1em'
      }}
    >
      <span>{text}</span>
    </NeonGlow>
  );
}

// ネオンボーダーコンポーネント
export function NeonBorder({ 
  children, 
  isActive = true,
  color = '#00ff88',
  borderWidth = 2,
  className = ''
}: {
  children: React.ReactNode;
  isActive?: boolean;
  color?: string;
  borderWidth?: number;
  className?: string;
}) {
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!borderRef.current || !isActive) return;

    const element = borderRef.current;

    // アニメーション付きボーダー
    const timeline = gsap.timeline({ repeat: -1 });
    
    timeline
      .to(element, {
        boxShadow: `
          0 0 5px ${color},
          0 0 10px ${color},
          0 0 15px ${color},
          0 0 20px ${color},
          inset 0 0 5px ${color}
        `,
        duration: 1,
        ease: "sine.inOut"
      })
      .to(element, {
        boxShadow: `
          0 0 2px ${color},
          0 0 5px ${color},
          0 0 8px ${color},
          0 0 12px ${color},
          inset 0 0 2px ${color}
        `,
        duration: 1,
        ease: "sine.inOut"
      });

    return () => {
      timeline.kill();
    };
  }, [isActive, color]);

  return (
    <div 
      ref={borderRef}
      className={`border-${borderWidth} ${className}`}
      style={{ borderColor: color }}
    >
      {children}
    </div>
  );
}

// サクセス時の輝きエフェクト
export function SuccessGlow({ 
  trigger, 
  onComplete,
  className = '' 
}: {
  trigger: boolean;
  onComplete?: () => void;
  className?: string;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !elementRef.current) return;

    const element = elementRef.current;

    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(element, { 
          boxShadow: 'none', 
          opacity: 0 
        });
        onComplete?.();
      }
    });

    timeline
      .fromTo(element, 
        { 
          scale: 0.5, 
          opacity: 0,
          boxShadow: 'none'
        },
        { 
          scale: 1.2, 
          opacity: 1,
          boxShadow: `
            0 0 20px #00ff88,
            0 0 40px #00ff88,
            0 0 60px #00ff88,
            0 0 80px #00ff88
          `,
          duration: 0.3,
          ease: "power2.out"
        }
      )
      .to(element, {
        scale: 1,
        boxShadow: `
          0 0 10px #00ff88,
          0 0 20px #00ff88,
          0 0 30px #00ff88
        `,
        duration: 0.4,
        ease: "elastic.out(1, 0.5)"
      })
      .to(element, {
        opacity: 0,
        boxShadow: 'none',
        duration: 0.5,
        ease: "power2.out"
      });

  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <div 
      ref={elementRef}
      className={`absolute inset-0 rounded-lg pointer-events-none ${className}`}
      style={{ 
        background: 'radial-gradient(circle, rgba(0,255,136,0.1) 0%, transparent 70%)',
        zIndex: 10
      }}
    />
  );
}

// フック版
export function useNeonEffect() {
  const addNeonGlow = (element: HTMLElement, options?: {
    color?: string;
    intensity?: 'low' | 'medium' | 'high';
    duration?: number;
    flicker?: boolean;
  }) => {
    const { 
      color = '#00ff88', 
      intensity = 'medium', 
      duration = 1,
      flicker = false
    } = options || {};

    const intensitySettings = {
      low: { blur: 5, spread: 10 },
      medium: { blur: 10, spread: 20 },
      high: { blur: 15, spread: 30 }
    };

    const settings = intensitySettings[intensity];

    const timeline = gsap.timeline();

    // グロー適用
    timeline.to(element, {
      boxShadow: `
        0 0 ${settings.blur}px ${color},
        0 0 ${settings.spread}px ${color},
        0 0 ${settings.spread * 1.5}px ${color}
      `,
      textShadow: `0 0 ${settings.blur}px ${color}`,
      color: color,
      duration: duration,
      ease: "power2.out"
    });

    // フリッカーエフェクト
    if (flicker) {
      timeline.to(element, {
        opacity: 0.3,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "none"
      }, "-=0.5");
    }

    return timeline;
  };

  const removeNeonGlow = (element: HTMLElement, duration = 0.5) => {
    return gsap.to(element, {
      boxShadow: 'none',
      textShadow: 'none',
      duration: duration,
      ease: "power2.out"
    });
  };

  return { addNeonGlow, removeNeonGlow };
}