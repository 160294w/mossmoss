import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface HologramProjectionProps {
  children: React.ReactNode;
  isActive?: boolean;
  glitchIntensity?: 'low' | 'medium' | 'high';
  scanlineSpeed?: number;
  rgbSeparation?: boolean;
  flickerRate?: number;
  className?: string;
  onComplete?: () => void;
}

export function HologramProjection({
  children,
  isActive = true,
  glitchIntensity = 'medium',
  scanlineSpeed = 2,
  rgbSeparation = true,
  flickerRate = 0.1,
  className = '',
  onComplete
}: HologramProjectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);
  const [hologramActive, setHologramActive] = useState(false);

  const intensitySettings = {
    low: { glitchChance: 0.05, displacement: 2, opacity: 0.9 },
    medium: { glitchChance: 0.1, displacement: 5, opacity: 0.85 },
    high: { glitchChance: 0.2, displacement: 10, opacity: 0.8 }
  };

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    setHologramActive(true);
    const container = containerRef.current;
    const settings = intensitySettings[glitchIntensity];

    // ホログラム出現アニメーション
    const timeline = gsap.timeline({
      onComplete: () => {
        onComplete?.();
        startContinuousEffects(container, settings);
      }
    });

    // 初期投影エフェクト
    timeline
      .fromTo(container, 
        { 
          opacity: 0,
          scaleY: 0.1,
          skewX: -2,
          filter: 'hue-rotate(180deg) saturate(2)'
        },
        {
          opacity: settings.opacity,
          scaleY: 1,
          skewX: 0,
          filter: 'hue-rotate(0deg) saturate(1.5)',
          duration: 1,
          ease: "power2.out"
        }
      );

    return () => {
      timeline.kill();
      setHologramActive(false);
    };
  }, [isActive, glitchIntensity]);

  const startContinuousEffects = (container: HTMLElement, settings: any) => {
    // スキャンライン効果
    if (scanlineRef.current) {
      gsap.to(scanlineRef.current, {
        y: '100vh',
        duration: scanlineSpeed,
        repeat: -1,
        ease: "none"
      });
    }

    // 継続的なグリッチ効果
    // const glitchInterval = setInterval(() => {
      if (Math.random() < settings.glitchChance) {
        applyGlitchEffect(container, settings);
      }
    // }, 100);

    // フリッカー効果
    if (flickerRate > 0) {
      // const flickerInterval = setInterval(() => {
        if (Math.random() < flickerRate) {
          gsap.to(container, {
            opacity: 0.3,
            duration: 0.05,
            yoyo: true,
            repeat: 1,
            ease: "none"
          });
        }
      // }, 200);
    }
  };

  const applyGlitchEffect = (container: HTMLElement, settings: any) => {
    const timeline = gsap.timeline();

    timeline
      .to(container, {
        x: (Math.random() - 0.5) * settings.displacement,
        skewX: (Math.random() - 0.5) * 2,
        filter: `hue-rotate(${Math.random() * 60}deg) saturate(${1 + Math.random()})`,
        duration: 0.05,
        ease: "none"
      })
      .to(container, {
        x: 0,
        skewX: 0,
        filter: 'hue-rotate(0deg) saturate(1.5)',
        duration: 0.1,
        ease: "power2.out"
      });
  };

  return (
    <div className={`relative ${className}`}>
      {/* メインホログラム */}
      <div 
        ref={containerRef}
        className="relative"
        style={{
          filter: hologramActive ? 'drop-shadow(0 0 10px #00ffff) contrast(1.2)' : 'none',
          color: hologramActive ? '#00ffff' : 'inherit'
        }}
      >
        {children}
      </div>

      {/* RGB分離エフェクト */}
      {rgbSeparation && hologramActive && (
        <>
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              color: '#ff0000',
              transform: 'translateX(-1px)',
              mixBlendMode: 'screen'
            }}
          >
            {children}
          </div>
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              color: '#00ff00',
              transform: 'translateX(1px)',
              mixBlendMode: 'screen'
            }}
          >
            {children}
          </div>
        </>
      )}

      {/* スキャンライン */}
      {hologramActive && (
        <div 
          ref={scanlineRef}
          className="absolute inset-x-0 h-1 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, #00ffff80 50%, transparent 100%)',
            top: '-100%',
            boxShadow: '0 0 10px #00ffff'
          }}
        />
      )}

      {/* ベースグリッド */}
      {hologramActive && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(0,255,255,0.3) 25%, rgba(0,255,255,0.3) 26%, transparent 27%, transparent 74%, rgba(0,255,255,0.3) 75%, rgba(0,255,255,0.3) 76%, transparent 77%),
              linear-gradient(90deg, transparent 24%, rgba(0,255,255,0.3) 25%, rgba(0,255,255,0.3) 26%, transparent 27%, transparent 74%, rgba(0,255,255,0.3) 75%, rgba(0,255,255,0.3) 76%, transparent 77%)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      )}
    </div>
  );
}

// データ表示用のホログラムテーブル
export function HologramDataTable({
  data,
  trigger,
  className = ''
}: {
  data: Array<{ [key: string]: any }>;
  trigger: boolean;
  className?: string;
}) {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !tableRef.current) return;

    const rows = tableRef.current.querySelectorAll('[data-holo-row]');
    
    gsap.fromTo(rows, 
      { 
        opacity: 0,
        x: -50,
        filter: 'hue-rotate(180deg)'
      },
      {
        opacity: 1,
        x: 0,
        filter: 'hue-rotate(0deg)',
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      }
    );

  }, [trigger, data]);

  if (!data.length) return null;

  const headers = Object.keys(data[0]);

  return (
    <HologramProjection isActive={trigger} className={className}>
      <div ref={tableRef} className="font-mono">
        {/* ヘッダー */}
        <div className="grid gap-4 p-2 border-b border-cyan-400" 
             style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}>
          {headers.map(header => (
            <div key={header} className="font-semibold text-cyan-300 uppercase text-sm">
              {header}
            </div>
          ))}
        </div>
        
        {/* データ行 */}
        {data.map((row, index) => (
          <div 
            key={index}
            data-holo-row
            className="grid gap-4 p-2 border-b border-cyan-400 border-opacity-30 hover:bg-cyan-400 hover:bg-opacity-10 transition-colors"
            style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}
          >
            {headers.map(header => (
              <div key={header} className="text-cyan-100 text-sm">
                {row[header]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </HologramProjection>
  );
}

// ホログラム通知/アラート
export function HologramAlert({
  message,
  type = 'info',
  duration = 3000,
  onClose
}: {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  duration?: number;
  onClose?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  const typeColors = {
    info: '#00ffff',
    warning: '#ffaa00',
    error: '#ff0044',
    success: '#00ff88'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <HologramProjection 
        isActive={true}
        glitchIntensity="low"
        flickerRate={type === 'error' ? 0.3 : 0.1}
      >
        <div 
          className="p-4 rounded-lg border-2 backdrop-blur-sm font-mono"
          style={{ 
            borderColor: typeColors[type],
            backgroundColor: `${typeColors[type]}20`,
            color: typeColors[type],
            boxShadow: `0 0 20px ${typeColors[type]}40`
          }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full animate-pulse" 
                 style={{ backgroundColor: typeColors[type] }} />
            <span className="text-sm font-semibold">
              {type.toUpperCase()} TRANSMISSION
            </span>
          </div>
          <div className="mt-2 text-sm">
            {message}
          </div>
        </div>
      </HologramProjection>
    </div>
  );
}

// ホログラムローダー
export function HologramLoader({
  isLoading,
  text = "LOADING...",
  className = ''
}: {
  isLoading: boolean;
  text?: string;
  className?: string;
}) {
  const dotsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isLoading || !dotsRef.current) return;

    const dots = dotsRef.current;
    
    gsap.to(dots, {
      opacity: 0.3,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut"
    });

  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <HologramProjection isActive={true} glitchIntensity="low">
        <div className="text-center font-mono">
          <div className="text-cyan-400 text-lg font-semibold mb-4">
            {text}
          </div>
          <div className="flex justify-center space-x-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-8 bg-cyan-400"
                style={{
                  animation: `hologramBar 1.5s ease-in-out ${i * 0.1}s infinite`
                }}
              />
            ))}
          </div>
          <div className="mt-4 text-cyan-300 text-sm">
            PROCESSING<span ref={dotsRef}>...</span>
          </div>
        </div>
      </HologramProjection>
      
      <style>{`
        @keyframes hologramBar {
          0%, 100% { transform: scaleY(0.3); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// フック版
export function useHologramProjection() {
  const createHologram = (element: HTMLElement, options?: {
    intensity?: 'low' | 'medium' | 'high';
    duration?: number;
    onComplete?: () => void;
  }) => {
    const { intensity = 'medium', duration = 2, onComplete } = options || {};
    
    const settings = {
      low: { displacement: 2, opacity: 0.9 },
      medium: { displacement: 5, opacity: 0.85 },
      high: { displacement: 10, opacity: 0.8 }
    }[intensity];

    // RGB分離エフェクト用のクローンを作成
    const redClone = element.cloneNode(true) as HTMLElement;
    const greenClone = element.cloneNode(true) as HTMLElement;

    redClone.style.position = 'absolute';
    greenClone.style.position = 'absolute';
    redClone.style.top = '0';
    greenClone.style.top = '0';
    redClone.style.left = '0';
    greenClone.style.left = '0';
    redClone.style.color = '#ff0000';
    greenClone.style.color = '#00ff00';
    redClone.style.opacity = '0.3';
    greenClone.style.opacity = '0.3';
    redClone.style.pointerEvents = 'none';
    greenClone.style.pointerEvents = 'none';

    element.style.position = 'relative';
    element.style.color = '#00ffff';
    element.appendChild(redClone);
    element.appendChild(greenClone);

    const timeline = gsap.timeline({ 
      onComplete: () => {
        redClone.remove();
        greenClone.remove();
        onComplete?.();
      }
    });

    // ホログラム投影アニメーション
    timeline
      .fromTo(element,
        {
          opacity: 0,
          scaleY: 0.1,
          filter: 'hue-rotate(180deg) saturate(2)'
        },
        {
          opacity: settings.opacity,
          scaleY: 1,
          filter: 'hue-rotate(0deg) saturate(1.5) drop-shadow(0 0 10px #00ffff)',
          duration: duration * 0.5,
          ease: "power2.out"
        }
      )
      // グリッチ効果
      .to(element, {
        x: () => (Math.random() - 0.5) * settings.displacement,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: "none"
      })
      .to(element, {
        x: 0,
        duration: duration * 0.3,
        ease: "elastic.out(1, 0.3)"
      });

    return timeline;
  };

  return { createHologram };
}