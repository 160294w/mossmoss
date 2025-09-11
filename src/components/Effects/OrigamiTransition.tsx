import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface OrigamiTransitionProps {
  isActive: boolean;
  foldType?: 'horizontal' | 'vertical' | 'diagonal' | 'multi';
  duration?: number;
  onMidTransition?: () => void;
  onComplete?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function OrigamiTransition({
  isActive,
  foldType = 'horizontal',
  duration = 1.5,
  onMidTransition,
  onComplete,
  className = '',
  children
}: OrigamiTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const foldPiecesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // const container = containerRef.current; // 未使用
    createFoldPieces();

    const timeline = gsap.timeline({
      onComplete: () => {
        cleanup();
        onComplete?.();
      }
    });

    switch (foldType) {
      case 'horizontal':
        animateHorizontalFold(timeline);
        break;
      case 'vertical':
        animateVerticalFold(timeline);
        break;
      case 'diagonal':
        animateDiagonalFold(timeline);
        break;
      case 'multi':
        animateMultiFold(timeline);
        break;
    }

    return () => {
      timeline.kill();
      cleanup();
    };
  }, [isActive, foldType, duration]);

  const createFoldPieces = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const pieces = foldType === 'multi' ? 4 : 2;
    foldPiecesRef.current = [];

    for (let i = 0; i < pieces; i++) {
      const piece = document.createElement('div');
      piece.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        transform-origin: ${getFoldOrigin(i, pieces)};
        backface-visibility: hidden;
        z-index: ${1000 + i};
      `;
      
      container.appendChild(piece);
      foldPiecesRef.current.push(piece);
    }
  };

  const getFoldOrigin = (index: number, _total: number): string => {
    switch (foldType) {
      case 'horizontal':
        return index === 0 ? 'top center' : 'bottom center';
      case 'vertical':
        return index === 0 ? 'left center' : 'right center';
      case 'diagonal':
        return index === 0 ? 'top left' : 'bottom right';
      case 'multi':
        const origins = ['top left', 'top right', 'bottom left', 'bottom right'];
        return origins[index] || 'center';
      default:
        return 'center';
    }
  };

  const animateHorizontalFold = (timeline: gsap.core.Timeline) => {
    const [topPiece, bottomPiece] = foldPiecesRef.current;

    timeline
      .set([topPiece, bottomPiece], { display: 'block' })
      .to(topPiece, {
        rotationX: -90,
        duration: duration * 0.4,
        ease: "power2.inOut"
      }, 0)
      .to(bottomPiece, {
        rotationX: 90,
        duration: duration * 0.4,
        ease: "power2.inOut"
      }, 0)
      .call(onMidTransition || (() => {}), [], duration * 0.2)
      .to(topPiece, {
        rotationX: -180,
        duration: duration * 0.4,
        ease: "power2.inOut"
      }, duration * 0.4)
      .to(bottomPiece, {
        rotationX: 180,
        duration: duration * 0.4,
        ease: "power2.inOut"
      }, duration * 0.4)
      .to([topPiece, bottomPiece], {
        scale: 0,
        opacity: 0,
        duration: duration * 0.2,
        ease: "power2.in"
      });
  };

  const animateVerticalFold = (timeline: gsap.core.Timeline) => {
    const [leftPiece, rightPiece] = foldPiecesRef.current;

    timeline
      .set([leftPiece, rightPiece], { display: 'block' })
      .to(leftPiece, {
        rotationY: 90,
        duration: duration * 0.4,
        ease: "power2.inOut"
      }, 0)
      .to(rightPiece, {
        rotationY: -90,
        duration: duration * 0.4,
        ease: "power2.inOut"
      }, 0)
      .call(onMidTransition || (() => {}), [], duration * 0.2)
      .to(leftPiece, {
        rotationY: 180,
        duration: duration * 0.4,
        ease: "power2.inOut"
      }, duration * 0.4)
      .to(rightPiece, {
        rotationY: -180,
        duration: duration * 0.4,
        ease: "power2.inOut"
      }, duration * 0.4)
      .to([leftPiece, rightPiece], {
        scale: 0,
        opacity: 0,
        duration: duration * 0.2,
        ease: "power2.in"
      });
  };

  const animateDiagonalFold = (timeline: gsap.core.Timeline) => {
    const [topLeftPiece, bottomRightPiece] = foldPiecesRef.current;

    timeline
      .set([topLeftPiece, bottomRightPiece], { display: 'block' })
      .to(topLeftPiece, {
        rotationX: -45,
        rotationY: -45,
        duration: duration * 0.5,
        ease: "power2.inOut"
      }, 0)
      .to(bottomRightPiece, {
        rotationX: 45,
        rotationY: 45,
        duration: duration * 0.5,
        ease: "power2.inOut"
      }, 0)
      .call(onMidTransition || (() => {}), [], duration * 0.25)
      .to([topLeftPiece, bottomRightPiece], {
        scale: 0.5,
        opacity: 0,
        duration: duration * 0.5,
        ease: "elastic.in(1, 0.3)"
      });
  };

  const animateMultiFold = (timeline: gsap.core.Timeline) => {
    const pieces = foldPiecesRef.current;

    timeline
      .set(pieces, { display: 'block' })
      .to(pieces[0], { // Top Left
        rotationX: -90,
        rotationY: -90,
        duration: duration * 0.3,
        ease: "power2.inOut"
      }, 0)
      .to(pieces[1], { // Top Right
        rotationX: -90,
        rotationY: 90,
        duration: duration * 0.3,
        ease: "power2.inOut"
      }, 0.1)
      .to(pieces[2], { // Bottom Left
        rotationX: 90,
        rotationY: -90,
        duration: duration * 0.3,
        ease: "power2.inOut"
      }, 0.2)
      .to(pieces[3], { // Bottom Right
        rotationX: 90,
        rotationY: 90,
        duration: duration * 0.3,
        ease: "power2.inOut"
      }, 0.3)
      .call(onMidTransition || (() => {}), [], duration * 0.4)
      .to(pieces, {
        scale: 0,
        rotationZ: 360,
        opacity: 0,
        duration: duration * 0.4,
        stagger: 0.1,
        ease: "back.in(1.7)"
      });
  };

  const cleanup = () => {
    foldPiecesRef.current.forEach(piece => {
      piece.remove();
    });
    foldPiecesRef.current = [];
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 ${className}`}
      style={{ 
        perspective: '1000px',
        display: isActive ? 'block' : 'none'
      }}
    >
      {children}
    </div>
  );
}

// ページ遷移用の折り紙エフェクト
export function PageOrigamiFold({
  isTransitioning,
  onMidTransition,
  onComplete,
  foldType = 'horizontal'
}: {
  isTransitioning: boolean;
  onMidTransition?: () => void;
  onComplete?: () => void;
  foldType?: 'horizontal' | 'vertical' | 'diagonal' | 'multi';
}) {
  return (
    <OrigamiTransition
      isActive={isTransitioning}
      foldType={foldType}
      duration={1.2}
      onMidTransition={onMidTransition}
      onComplete={onComplete}
      className="bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600"
    />
  );
}

// カード用の折り紙エフェクト
export function OrigamiCard({
  children,
  trigger,
  onComplete,
  className = ''
}: {
  children: React.ReactNode;
  trigger: boolean;
  onComplete?: () => void;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !cardRef.current) return;

    const card = cardRef.current;

    const timeline = gsap.timeline({ onComplete });

    // カードを本のように開く
    timeline
      .to(card, {
        rotationY: -10,
        rotationX: 5,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(card, {
        rotationY: 10,
        rotationX: -5,
        scale: 1.05,
        duration: 0.4,
        ease: "power2.inOut"
      })
      .to(card, {
        rotationY: 0,
        rotationX: 0,
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });

    return () => {
      timeline.kill();
    };
  }, [trigger, onComplete]);

  return (
    <div 
      ref={cardRef}
      className={`transform-gpu ${className}`}
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {children}
    </div>
  );
}

// 複数要素の順次折り紙エフェクト
export function StaggeredOrigami({
  children,
  trigger,
  stagger = 0.1,
  duration = 0.8
}: {
  children: React.ReactNode;
  trigger: boolean;
  stagger?: number;
  duration?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    const container = containerRef.current;
    const items = container.querySelectorAll('[data-origami-item]');

    gsap.fromTo(items, 
      { 
        rotationX: -90,
        transformOrigin: 'top center',
        opacity: 0,
        scale: 0.8
      },
      {
        rotationX: 0,
        opacity: 1,
        scale: 1,
        duration: duration,
        stagger: stagger,
        ease: "back.out(1.7)"
      }
    );

  }, [trigger, stagger, duration]);

  return (
    <div 
      ref={containerRef}
      style={{ perspective: '1000px' }}
    >
      {children}
    </div>
  );
}

// フック版
export function useOrigamiTransition() {
  const createOrigamiFold = (element: HTMLElement, options?: {
    type?: 'horizontal' | 'vertical' | 'diagonal';
    duration?: number;
    onComplete?: () => void;
  }) => {
    const { type = 'horizontal', duration = 1, onComplete } = options || {};

    let timeline: gsap.core.Timeline;

    switch (type) {
      case 'horizontal':
        timeline = gsap.timeline({ onComplete })
          .to(element, {
            rotationX: -90,
            transformOrigin: 'top center',
            duration: duration * 0.5,
            ease: "power2.inOut"
          })
          .to(element, {
            rotationX: -180,
            duration: duration * 0.5,
            ease: "power2.inOut"
          });
        break;

      case 'vertical':
        timeline = gsap.timeline({ onComplete })
          .to(element, {
            rotationY: 90,
            transformOrigin: 'left center',
            duration: duration * 0.5,
            ease: "power2.inOut"
          })
          .to(element, {
            rotationY: 180,
            duration: duration * 0.5,
            ease: "power2.inOut"
          });
        break;

      case 'diagonal':
        timeline = gsap.timeline({ onComplete })
          .to(element, {
            rotationX: -45,
            rotationY: -45,
            transformOrigin: 'top left',
            duration: duration,
            ease: "power2.inOut"
          });
        break;

      default:
        timeline = gsap.timeline({ onComplete });
    }

    return timeline;
  };

  return { createOrigamiFold };
}