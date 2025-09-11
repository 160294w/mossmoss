import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ParallelWorldShiftProps {
  trigger: boolean;
  shiftType?: 'split' | 'slice' | 'fragment' | 'dimensional';
  direction?: 'horizontal' | 'vertical' | 'radial';
  intensity?: 'subtle' | 'dramatic' | 'extreme';
  onMidShift?: () => void;
  onComplete?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function ParallelWorldShift({
  trigger,
  shiftType = 'split',
  direction = 'horizontal',
  intensity = 'dramatic',
  onMidShift,
  onComplete,
  className = '',
  children
}: ParallelWorldShiftProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fragmentsRef = useRef<HTMLDivElement[]>([]);

  const intensitySettings = {
    subtle: { distance: 300, rotation: 10, scale: 0.9, duration: 1.2 },
    dramatic: { distance: 600, rotation: 30, scale: 0.7, duration: 1.8 },
    extreme: { distance: 1000, rotation: 60, scale: 0.5, duration: 2.5 }
  };

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    // const container = containerRef.current; // 未使用
    const settings = intensitySettings[intensity];

    createFragments();

    const timeline = gsap.timeline({
      onComplete: () => {
        cleanup();
        onComplete?.();
      }
    });

    switch (shiftType) {
      case 'split':
        animateSplit(timeline, settings);
        break;
      case 'slice':
        animateSlice(timeline, settings);
        break;
      case 'fragment':
        animateFragment(timeline, settings);
        break;
      case 'dimensional':
        animateDimensional(timeline, settings);
        break;
    }

    return () => {
      timeline.kill();
      cleanup();
    };
  }, [trigger, shiftType, direction, intensity]);

  const createFragments = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    fragmentsRef.current = [];

    const fragmentCount = shiftType === 'fragment' ? 9 : 
                         shiftType === 'slice' ? 6 : 2;

    for (let i = 0; i < fragmentCount; i++) {
      const fragment = document.createElement('div');
      const gradients = [
        'linear-gradient(45deg, #ff006e, #8338ec)',
        'linear-gradient(45deg, #3a86ff, #06ffa5)',
        'linear-gradient(45deg, #ffbe0b, #fb5607)',
        'linear-gradient(45deg, #f72585, #4cc9f0)',
        'linear-gradient(45deg, #7209b7, #560bad)'
      ];
      
      fragment.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${gradients[i % gradients.length]};
        opacity: 0.9;
        z-index: ${1000 + i};
        transform-origin: center center;
        backdrop-filter: blur(1px);
      `;

      // フラグメントタイプによって初期位置を設定
      setFragmentPosition(fragment, i, fragmentCount);
      
      container.appendChild(fragment);
      fragmentsRef.current.push(fragment);
    }
  };

  const setFragmentPosition = (fragment: HTMLElement, index: number, total: number) => {
    switch (shiftType) {
      case 'split':
        if (direction === 'horizontal') {
          fragment.style.clipPath = index === 0 ? 
            'polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)' :
            'polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)';
        } else {
          fragment.style.clipPath = index === 0 ? 
            'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)' :
            'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)';
        }
        break;
      
      case 'slice':
        const sliceHeight = 100 / total;
        fragment.style.clipPath = 
          `polygon(0% ${sliceHeight * index}%, 100% ${sliceHeight * index}%, 100% ${sliceHeight * (index + 1)}%, 0% ${sliceHeight * (index + 1)}%)`;
        break;
      
      case 'fragment':
        const row = Math.floor(index / 3);
        const col = index % 3;
        fragment.style.clipPath = 
          `polygon(${col * 33.33}% ${row * 33.33}%, ${(col + 1) * 33.33}% ${row * 33.33}%, ${(col + 1) * 33.33}% ${(row + 1) * 33.33}%, ${col * 33.33}% ${(row + 1) * 33.33}%)`;
        break;
    }
  };

  const animateSplit = (timeline: gsap.core.Timeline, settings: any) => {
    const [fragment1, fragment2] = fragmentsRef.current;

    timeline
      .set([fragment1, fragment2], { display: 'block' })
      .to(fragment1, {
        x: direction === 'horizontal' ? 0 : -settings.distance,
        y: direction === 'horizontal' ? -settings.distance : 0,
        rotation: -settings.rotation,
        scale: settings.scale,
        duration: settings.duration * 0.6,
        ease: "power2.out"
      }, 0)
      .to(fragment2, {
        x: direction === 'horizontal' ? 0 : settings.distance,
        y: direction === 'horizontal' ? settings.distance : 0,
        rotation: settings.rotation,
        scale: settings.scale,
        duration: settings.duration * 0.6,
        ease: "power2.out"
      }, 0)
      .call(onMidShift || (() => {}), [], settings.duration * 0.3)
      .to([fragment1, fragment2], {
        x: direction === 'horizontal' ? 0 : (index: number) => index === 0 ? -settings.distance * 2 : settings.distance * 2,
        y: direction === 'horizontal' ? (index: number) => index === 0 ? -settings.distance * 2 : settings.distance * 2 : 0,
        rotation: (index: number) => index === 0 ? -settings.rotation * 2 : settings.rotation * 2,
        scale: 0,
        opacity: 0,
        duration: settings.duration * 0.4,
        ease: "power2.in"
      });
  };

  const animateSlice = (timeline: gsap.core.Timeline, settings: any) => {
    const fragments = fragmentsRef.current;

    timeline
      .set(fragments, { display: 'block' })
      .to(fragments, {
        x: (index: number) => (index % 2 === 0 ? -1 : 1) * settings.distance * (0.5 + Math.random() * 0.5),
        rotation: (index: number) => (index % 2 === 0 ? -1 : 1) * settings.rotation * Math.random(),
        duration: settings.duration * 0.5,
        stagger: 0.1,
        ease: "power2.out"
      })
      .call(onMidShift || (() => {}), [], settings.duration * 0.25)
      .to(fragments, {
        x: (index: number) => (index % 2 === 0 ? -1 : 1) * settings.distance * 2,
        scale: 0,
        opacity: 0,
        duration: settings.duration * 0.5,
        stagger: 0.05,
        ease: "back.in(1.7)"
      });
  };

  const animateFragment = (timeline: gsap.core.Timeline, settings: any) => {
    const fragments = fragmentsRef.current;

    timeline
      .set(fragments, { display: 'block' })
      .to(fragments, {
        x: () => (Math.random() - 0.5) * settings.distance,
        y: () => (Math.random() - 0.5) * settings.distance,
        rotation: () => (Math.random() - 0.5) * settings.rotation * 2,
        scale: () => 0.5 + Math.random() * 0.5,
        duration: settings.duration * 0.6,
        stagger: {
          amount: 0.3,
          from: "random"
        },
        ease: "power2.out"
      })
      .call(onMidShift || (() => {}), [], settings.duration * 0.3)
      .to(fragments, {
        scale: 0,
        rotation: "+=360",
        opacity: 0,
        duration: settings.duration * 0.4,
        stagger: {
          amount: 0.2,
          from: "center"
        },
        ease: "back.in(2)"
      });
  };

  const animateDimensional = (timeline: gsap.core.Timeline, settings: any) => {
    const fragments = fragmentsRef.current;

    timeline
      .set(fragments, { 
        display: 'block',
        transformOrigin: '50% 50% -100px'
      })
      .to(fragments, {
        rotationX: () => (Math.random() - 0.5) * 180,
        rotationY: () => (Math.random() - 0.5) * 180,
        z: () => Math.random() * 500 - 250,
        duration: settings.duration * 0.7,
        stagger: 0.1,
        ease: "power2.out"
      })
      .call(onMidShift || (() => {}), [], settings.duration * 0.35)
      .to(fragments, {
        rotationX: "+=180",
        rotationY: "+=180",
        z: -1000,
        scale: 0,
        opacity: 0,
        duration: settings.duration * 0.3,
        stagger: 0.05,
        ease: "power2.in"
      });
  };

  const cleanup = () => {
    fragmentsRef.current.forEach(fragment => {
      fragment.remove();
    });
    fragmentsRef.current = [];
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 ${className}`}
      style={{ 
        perspective: '1000px',
        display: trigger ? 'block' : 'none'
      }}
    >
      {children}
    </div>
  );
}

// ページ遷移用
export function PageParallelShift({
  isTransitioning,
  onMidTransition,
  onComplete,
  shiftType = 'split'
}: {
  isTransitioning: boolean;
  onMidTransition?: () => void;
  onComplete?: () => void;
  shiftType?: 'split' | 'slice' | 'fragment' | 'dimensional';
}) {
  return (
    <ParallelWorldShift
      trigger={isTransitioning}
      shiftType={shiftType}
      intensity="dramatic"
      onMidShift={onMidTransition}
      onComplete={onComplete}
    />
  );
}

// 要素用のパラレルシフト
export function ElementParallelShift({
  children,
  trigger,
  onComplete
}: {
  children: React.ReactNode;
  trigger: boolean;
  onComplete?: () => void;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !elementRef.current) return;

    const element = elementRef.current;

    // 分身を作成
    const clone1 = element.cloneNode(true) as HTMLElement;
    const clone2 = element.cloneNode(true) as HTMLElement;
    
    clone1.style.position = 'absolute';
    clone2.style.position = 'absolute';
    clone1.style.top = '0';
    clone2.style.top = '0';
    clone1.style.left = '0';
    clone2.style.left = '0';
    clone1.style.zIndex = '10';
    clone2.style.zIndex = '11';

    element.style.position = 'relative';
    element.appendChild(clone1);
    element.appendChild(clone2);

    const timeline = gsap.timeline({
      onComplete: () => {
        clone1.remove();
        clone2.remove();
        onComplete?.();
      }
    });

    timeline
      .to(clone1, {
        x: -200,
        rotation: -15,
        scale: 0.8,
        duration: 0.6,
        ease: "power2.out"
      }, 0)
      .to(clone2, {
        x: 200,
        rotation: 15,
        scale: 0.8,
        duration: 0.6,
        ease: "power2.out"
      }, 0)
      .to([clone1, clone2], {
        opacity: 0,
        scale: 0,
        duration: 0.4,
        ease: "power2.in"
      });

    return () => {
      timeline.kill();
    };
  }, [trigger, onComplete]);

  return <div ref={elementRef}>{children}</div>;
}

// フック版
export function useParallelWorldShift() {
  const createParallelShift = (element: HTMLElement, options?: {
    type?: 'split' | 'fragment' | 'dimensional';
    intensity?: 'subtle' | 'dramatic';
    onComplete?: () => void;
  }) => {
    const { type = 'split', intensity = 'dramatic', onComplete } = options || {};
    
    const settings = intensity === 'dramatic' ? 
      { distance: 300, rotation: 30, duration: 1.5 } :
      { distance: 150, rotation: 15, duration: 1 };

    if (type === 'split') {
      // 要素を複製して分裂効果
      const clone1 = element.cloneNode(true) as HTMLElement;
      const clone2 = element.cloneNode(true) as HTMLElement;
      
      element.parentNode?.insertBefore(clone1, element);
      element.parentNode?.insertBefore(clone2, element);
      
      clone1.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)';
      clone2.style.clipPath = 'polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)';
      
      element.style.opacity = '0';

      return gsap.timeline({ onComplete })
        .to(clone1, {
          y: -settings.distance,
          rotation: -settings.rotation,
          duration: settings.duration * 0.6,
          ease: "power2.out"
        }, 0)
        .to(clone2, {
          y: settings.distance,
          rotation: settings.rotation,
          duration: settings.duration * 0.6,
          ease: "power2.out"
        }, 0)
        .to([clone1, clone2], {
          scale: 0,
          opacity: 0,
          duration: settings.duration * 0.4,
          ease: "power2.in",
          onComplete: () => {
            clone1.remove();
            clone2.remove();
            element.style.opacity = '1';
          }
        });
    }

    // デフォルトは簡単な分裂エフェクト
    return gsap.timeline({ onComplete })
      .to(element, {
        scale: 1.1,
        rotation: 5,
        duration: 0.2,
        ease: "power2.out"
      })
      .to(element, {
        scale: 1,
        rotation: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.3)"
      });
  };

  return { createParallelShift };
}