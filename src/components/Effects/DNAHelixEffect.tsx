import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface DNAHelixEffectProps {
  trigger: boolean;
  particleCount?: number;
  helixHeight?: number;
  helixWidth?: number;
  rotationSpeed?: number;
  colors?: string[];
  onComplete?: () => void;
  className?: string;
}

export function DNAHelixEffect({
  trigger,
  particleCount = 20,
  helixHeight = 300,
  helixWidth = 100,
  rotationSpeed = 2,
  colors = ['#00ff88', '#0088ff', '#8800ff', '#ff0088'],
  onComplete,
  className = ''
}: DNAHelixEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    setIsActive(true);
    createHelixParticles();
    animateHelix();

    return () => {
      cleanup();
      setIsActive(false);
    };
  }, [trigger, particleCount, helixHeight, helixWidth, rotationSpeed]);

  const createHelixParticles = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      // DNA二重螺旋のため、2つの螺旋を作成
      for (let strand = 0; strand < 2; strand++) {
        const particle = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
          position: absolute;
          width: 8px;
          height: 8px;
          background: ${color};
          border-radius: 50%;
          box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
          top: 50%;
          left: 50%;
          transform-origin: center center;
        `;

        container.appendChild(particle);
        particlesRef.current.push(particle);
        
        // 初期位置を設定
        setParticlePosition(particle, i, strand);
      }
    }

    // 螺旋を繋ぐ横線（塩基対）も作成
    createBasePairs();
  };

  const setParticlePosition = (particle: HTMLElement, index: number, strand: number) => {
    const progress = index / particleCount;
    const angle = progress * Math.PI * 4 + (strand * Math.PI); // 180度ずらして二重螺旋
    
    const x = Math.cos(angle) * helixWidth / 2;
    const y = progress * helixHeight - helixHeight / 2;
    const z = Math.sin(angle) * helixWidth / 2;

    gsap.set(particle, {
      x: x,
      y: y,
      z: z,
      scale: 0
    });
  };

  const createBasePairs = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // 4つごとに塩基対の線を作成
    for (let i = 0; i < particleCount; i += 4) {
      const basePair = document.createElement('div');
      basePair.style.cssText = `
        position: absolute;
        height: 2px;
        width: ${helixWidth}px;
        background: linear-gradient(90deg, transparent 0%, #ffffff40 20%, #ffffff60 50%, #ffffff40 80%, transparent 100%);
        top: 50%;
        left: 50%;
        transform-origin: center center;
        opacity: 0.6;
      `;

      const progress = i / particleCount;
      const y = progress * helixHeight - helixHeight / 2;
      
      gsap.set(basePair, {
        y: y,
        rotationZ: (progress * 360 * 2) % 360, // 2回転
        scale: 0
      });

      container.appendChild(basePair);
      particlesRef.current.push(basePair);
    }
  };

  const animateHelix = () => {
    const particles = particlesRef.current;
    
    const timeline = gsap.timeline({
      onComplete: () => {
        onComplete?.();
        setIsActive(false);
      }
    });

    // パーティクル出現
    timeline
      .to(particles, {
        scale: 1,
        duration: 1,
        stagger: {
          amount: 0.8,
          from: "start"
        },
        ease: "back.out(1.7)"
      })
      // 螺旋回転アニメーション
      .to(containerRef.current, {
        rotationY: 720, // 2回転
        duration: rotationSpeed,
        ease: "none",
        repeat: 1
      }, 0.5)
      // パーティクルの個別アニメーション
      .to(particles, {
        rotationZ: "+=360",
        duration: rotationSpeed,
        stagger: 0.05,
        ease: "none"
      }, 0.5)
      // 最終的に収束
      .to(particles, {
        scale: 0,
        y: 0,
        rotationZ: "+=180",
        duration: 1,
        stagger: {
          amount: 0.5,
          from: "center"
        },
        ease: "back.in(1.7)"
      });
  };

  const cleanup = () => {
    particlesRef.current.forEach(particle => {
      particle.remove();
    });
    particlesRef.current = [];
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ 
        perspective: '800px',
        transformStyle: 'preserve-3d',
        height: `${helixHeight}px`,
        display: isActive ? 'block' : 'none'
      }}
    />
  );
}

// データローダー用のDNA螺旋
export function DNALoader({
  isLoading,
  size = 'medium',
  className = ''
}: {
  isLoading: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  const sizeSettings = {
    small: { height: 80, width: 30, particles: 8 },
    medium: { height: 120, width: 50, particles: 12 },
    large: { height: 160, width: 70, particles: 16 }
  };

  const settings = sizeSettings[size];

  return (
    <div className={`flex justify-center items-center ${className}`}>
      {isLoading && (
        <DNAHelixEffect
          trigger={isLoading}
          particleCount={settings.particles}
          helixHeight={settings.height}
          helixWidth={settings.width}
          rotationSpeed={3}
          colors={['#00ff88', '#0088ff']}
        />
      )}
    </div>
  );
}

// 要素生成エフェクト
export function DNAGeneration({
  children,
  trigger,
  onComplete
}: {
  children: React.ReactNode;
  trigger: boolean;
  onComplete?: () => void;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const helixRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !elementRef.current) return;

    const element = elementRef.current;
    
    // 初期状態：要素を隠す
    gsap.set(element, { opacity: 0, scale: 0.5 });

    // DNAアニメーション後に要素を表示
    const timeline = gsap.timeline({ onComplete });

    timeline
      // DNA螺旋が成長
      .fromTo(helixRef.current, 
        { scaleY: 0, transformOrigin: 'bottom center' },
        { 
          scaleY: 1, 
          duration: 1.5, 
          ease: "power2.out" 
        }
      )
      // 螺旋が回転
      .to(helixRef.current, {
        rotationY: 360,
        duration: 2,
        ease: "none"
      }, 0.5)
      // 螺旋が収束して要素が出現
      .to(helixRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.in(1.7)"
      }, 2)
      .to(element, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)"
      }, 2.2);

    return () => {
      timeline.kill();
    };
  }, [trigger, onComplete]);

  return (
    <div ref={elementRef} className="relative">
      <div ref={helixRef} className="absolute inset-0 z-10">
        <DNAHelixEffect
          trigger={trigger}
          particleCount={10}
          helixHeight={100}
          helixWidth={60}
          rotationSpeed={1}
        />
      </div>
      {children}
    </div>
  );
}

// リスト項目の順次DNA生成
export function DNAStaggeredGeneration({
  children,
  trigger,
  stagger = 0.3
}: {
  children: React.ReactNode;
  trigger: boolean;
  stagger?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    const container = containerRef.current;
    const items = container.querySelectorAll('[data-dna-item]');

    // 初期状態
    gsap.set(items, { opacity: 0, y: 50, scale: 0.8 });

    // 順次DNAエフェクトで出現
    gsap.to(items, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.2,
      stagger: stagger,
      ease: "back.out(1.7)",
      onStart: function() {
        // 各アイテムに小さなDNA螺旋エフェクトを追加
        const item = this.targets()[0] as HTMLElement;
        createMiniDNAEffect(item);
      }
    });

  }, [trigger, stagger]);

  const createMiniDNAEffect = (element: HTMLElement) => {
    const particles: HTMLElement[] = [];
    
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #00ff88;
        border-radius: 50%;
        box-shadow: 0 0 6px #00ff88;
        pointer-events: none;
        top: 50%;
        left: 50%;
        z-index: 10;
      `;
      
      element.style.position = 'relative';
      element.appendChild(particle);
      particles.push(particle);

      const angle = (i / 6) * Math.PI * 2;
      const radius = 20;
      
      gsap.fromTo(particle,
        { scale: 0, x: 0, y: 0 },
        {
          scale: 1,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          duration: 0.8,
          delay: i * 0.1,
          ease: "back.out(1.7)"
        }
      );

      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        delay: 1.5 + i * 0.05,
        ease: "power2.in",
        onComplete: () => particle.remove()
      });
    }
  };

  return (
    <div ref={containerRef} style={{ perspective: '500px' }}>
      {children}
    </div>
  );
}

// フック版
export function useDNAHelixEffect() {
  const createDNAEffect = (element: HTMLElement, options?: {
    particleCount?: number;
    duration?: number;
    colors?: string[];
    onComplete?: () => void;
  }) => {
    const { 
      particleCount = 12, 
      duration = 2, 
      colors = ['#00ff88', '#0088ff', '#8800ff'], 
      onComplete 
    } = options || {};

    const particles: HTMLElement[] = [];
    
    // パーティクル作成
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: ${color};
        border-radius: 50%;
        box-shadow: 0 0 8px ${color};
        pointer-events: none;
        top: 50%;
        left: 50%;
      `;
      
      element.style.position = 'relative';
      element.appendChild(particle);
      particles.push(particle);
    }

    const timeline = gsap.timeline({ 
      onComplete: () => {
        particles.forEach(p => p.remove());
        onComplete?.();
      }
    });

    // DNA螺旋アニメーション
    particles.forEach((particle, i) => {
      const progress = i / particleCount;
      const radius = 30;
      
      timeline
        .fromTo(particle,
          { 
            scale: 0,
            x: 0,
            y: -progress * 60 + 30
          },
          {
            scale: 1,
            x: Math.cos(progress * Math.PI * 4) * radius,
            y: -progress * 60 + 30,
            duration: duration * 0.6,
            ease: "back.out(1.7)"
          }, i * 0.1)
        .to(particle, {
          rotationZ: 360,
          scale: 0,
          duration: duration * 0.4,
          ease: "power2.in"
        }, duration * 0.6 + i * 0.05);
    });

    return timeline;
  };

  return { createDNAEffect };
}