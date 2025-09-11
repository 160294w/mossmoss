import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface LiquidMorphProps {
  children: React.ReactNode;
  trigger: boolean;
  morphType?: 'blob' | 'wave' | 'elastic' | 'liquid';
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

export function LiquidMorph({ 
  children, 
  trigger, 
  morphType = 'blob',
  duration = 1.2,
  onComplete,
  className = ''
}: LiquidMorphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const _contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current || !_contentRef.current) return;

    const container = containerRef.current;
    // const _content = _contentRef.current; // 未使用

    let timeline: gsap.core.Timeline;

    switch (morphType) {
      case 'blob':
        timeline = gsap.timeline({ onComplete })
          .to(container, {
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            scaleX: 1.1,
            scaleY: 0.9,
            duration: duration * 0.3,
            ease: "power2.inOut"
          })
          .to(container, {
            borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
            scaleX: 0.95,
            scaleY: 1.05,
            duration: duration * 0.3,
            ease: "power2.inOut"
          })
          .to(container, {
            borderRadius: '50% 50% 50% 50%',
            scaleX: 1,
            scaleY: 1,
            duration: duration * 0.4,
            ease: "elastic.out(1, 0.5)"
          });
        break;

      case 'wave':
        timeline = gsap.timeline({ onComplete });
        
        // 波のようなアニメーション
        for (let i = 0; i < 5; i++) {
          timeline.to(container, {
            borderRadius: `${20 + Math.sin(i) * 30}% ${60 + Math.cos(i) * 20}% ${40 + Math.sin(i + 1) * 25}% ${80 + Math.cos(i + 1) * 15}% / ${30 + Math.sin(i + 2) * 20}% ${70 + Math.cos(i + 2) * 25}% ${50 + Math.sin(i + 3) * 30}% ${60 + Math.cos(i + 3) * 20}%`,
            duration: duration / 5,
            ease: "sine.inOut"
          }, i * (duration / 8));
        }
        
        timeline.to(container, {
          borderRadius: '50%',
          duration: duration * 0.3,
          ease: "back.out(1.7)"
        });
        break;

      case 'elastic':
        timeline = gsap.timeline({ onComplete })
          .to(container, {
            scaleX: 1.3,
            scaleY: 0.7,
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            duration: duration * 0.4,
            ease: "power2.out"
          })
          .to(container, {
            scaleX: 0.8,
            scaleY: 1.2,
            borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
            duration: duration * 0.3,
            ease: "power2.inOut"
          })
          .to(container, {
            scaleX: 1,
            scaleY: 1,
            borderRadius: '50%',
            duration: duration * 0.3,
            ease: "elastic.out(1.2, 0.4)"
          });
        break;

      case 'liquid':
        // 液体がこぼれるような効果
        timeline = gsap.timeline({ onComplete });
        
        // 液体要素を作成
        const liquidElements: HTMLElement[] = [];
        for (let _i = 0; _i < 8; _i++) {
          const liquid = document.createElement('div');
          liquid.style.cssText = `
            position: absolute;
            width: ${Math.random() * 20 + 10}px;
            height: ${Math.random() * 20 + 10}px;
            background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.8;
          `;
          container.appendChild(liquid);
          liquidElements.push(liquid);

          // 各液体パーティクルのアニメーション
          gsap.fromTo(liquid,
            { scale: 0, x: 0, y: 0 },
            {
              scale: 1,
              x: (Math.random() - 0.5) * 200,
              y: Math.random() * 100 + 50,
              duration: duration * 0.8,
              ease: "power2.out",
              delay: _i * 0.1
            }
          );

          gsap.to(liquid, {
            scale: 0,
            opacity: 0,
            duration: duration * 0.3,
            ease: "power2.in",
            delay: duration * 0.6 + _i * 0.05,
            onComplete: _i === liquidElements.length - 1 ? () => {
              liquidElements.forEach(el => el.remove());
            } : undefined
          });
        }

        // メインコンテナのアニメーション
        timeline.to(container, {
          borderRadius: '20% 80% 30% 70% / 50% 30% 70% 50%',
          scale: 0.9,
          duration: duration * 0.4,
          ease: "power2.inOut"
        })
        .to(container, {
          borderRadius: '50%',
          scale: 1,
          duration: duration * 0.6,
          ease: "elastic.out(1, 0.3)"
        });
        break;

      default:
        timeline = gsap.timeline({ onComplete });
    }

    return () => {
      timeline?.kill();
    };
  }, [trigger, morphType, duration, onComplete]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden transition-all ${className}`}
      style={{ borderRadius: '8px' }}
    >
      <div ref={_contentRef}>
        {children}
      </div>
    </div>
  );
}

// SVGを使用した高度な液体エフェクト
export function SVGLiquidMorph({ 
  trigger, 
  onComplete,
  color = '#4facfe',
  className = '' 
}: {
  trigger: boolean;
  onComplete?: () => void;
  color?: string;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!trigger || !svgRef.current) return;

    const path = svgRef.current.querySelector('path');
    if (!path) return;

    // SVGパスのモーフィング
    const morphFrames = [
      "M0,40 Q50,0 100,40 Q150,80 200,40 Q250,0 300,40 L300,100 L0,100 Z",
      "M0,50 Q50,20 100,50 Q150,30 200,50 Q250,70 300,50 L300,100 L0,100 Z",
      "M0,30 Q50,70 100,30 Q150,90 200,30 Q250,10 300,30 L300,100 L0,100 Z",
      "M0,60 Q50,40 100,60 Q150,20 200,60 Q250,80 300,60 L300,100 L0,100 Z",
      "M0,40 Q50,0 100,40 Q150,80 200,40 Q250,0 300,40 L300,100 L0,100 Z"
    ];

    const timeline = gsap.timeline({ onComplete });

    morphFrames.forEach((frame, _index) => {
      timeline.to(path, {
        attr: { d: frame },
        duration: 0.3,
        ease: "power2.inOut"
      });
    });

    return () => {
      timeline.kill();
    };
  }, [trigger, onComplete]);

  return (
    <div className={`w-full h-20 ${className}`}>
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        viewBox="0 0 300 100"
        className="absolute bottom-0"
      >
        <defs>
          <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M0,40 Q50,0 100,40 Q150,80 200,40 Q250,0 300,40 L300,100 L0,100 Z"
          fill="url(#liquidGradient)"
        />
      </svg>
    </div>
  );
}

// フック版
export function useLiquidMorph() {
  const morphElement = (element: HTMLElement, options?: {
    type?: 'blob' | 'wave' | 'elastic';
    duration?: number;
    onComplete?: () => void;
  }) => {
    const { type = 'blob', duration = 1.2, onComplete } = options || {};

    let timeline: gsap.core.Timeline;

    switch (type) {
      case 'blob':
        timeline = gsap.timeline({ onComplete })
          .to(element, {
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            scaleX: 1.1,
            scaleY: 0.9,
            duration: duration * 0.3,
            ease: "power2.inOut"
          })
          .to(element, {
            borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
            scaleX: 0.95,
            scaleY: 1.05,
            duration: duration * 0.3,
            ease: "power2.inOut"
          })
          .to(element, {
            borderRadius: '8px', // 元の形に戻す
            scaleX: 1,
            scaleY: 1,
            duration: duration * 0.4,
            ease: "elastic.out(1, 0.5)"
          });
        break;

      case 'wave':
        timeline = gsap.timeline({ onComplete });
        
        for (let i = 0; i < 3; i++) {
          timeline.to(element, {
            borderRadius: `${20 + Math.sin(i) * 30}% ${60 + Math.cos(i) * 20}%`,
            scaleX: 1 + Math.sin(i) * 0.1,
            scaleY: 1 + Math.cos(i) * 0.1,
            duration: duration / 4,
            ease: "sine.inOut"
          });
        }
        
        timeline.to(element, {
          borderRadius: '8px',
          scaleX: 1,
          scaleY: 1,
          duration: duration * 0.3,
          ease: "back.out(1.7)"
        });
        break;

      case 'elastic':
        timeline = gsap.timeline({ onComplete })
          .to(element, {
            scaleX: 1.3,
            scaleY: 0.7,
            duration: duration * 0.4,
            ease: "power2.out"
          })
          .to(element, {
            scaleX: 0.8,
            scaleY: 1.2,
            duration: duration * 0.3,
            ease: "power2.inOut"
          })
          .to(element, {
            scaleX: 1,
            scaleY: 1,
            duration: duration * 0.3,
            ease: "elastic.out(1.2, 0.4)"
          });
        break;

      default:
        timeline = gsap.timeline({ onComplete });
    }

    return timeline;
  };

  return { morphElement };
}