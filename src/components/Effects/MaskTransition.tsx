import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface MaskTransitionProps {
  isActive: boolean;
  maskType?: 'circle' | 'heart' | 'star' | 'diamond' | 'polygon' | 'wipe';
  direction?: 'in' | 'out';
  duration?: number;
  onComplete?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function MaskTransition({ 
  isActive, 
  maskType = 'circle',
  direction = 'in',
  duration = 0.8,
  onComplete,
  className = '',
  children
}: MaskTransitionProps) {
  const maskRef = useRef<HTMLDivElement>(null);

  const maskShapes = {
    circle: {
      start: 'circle(0% at 50% 50%)',
      end: 'circle(100% at 50% 50%)'
    },
    heart: {
      start: 'polygon(50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%)',
      end: 'polygon(50% 25%, 35% 0%, 15% 0%, 0% 25%, 0% 50%, 25% 75%, 50% 100%, 75% 75%, 100% 50%, 100% 25%, 85% 0%, 65% 0%)'
    },
    star: {
      start: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      end: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
    },
    diamond: {
      start: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      end: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
    },
    polygon: {
      start: 'polygon(50% 50%, 50% 50%, 50% 50%)',
      end: 'polygon(0% 0%, 100% 0%, 85% 50%, 100% 100%, 0% 100%, 15% 50%)'
    },
    wipe: {
      start: 'inset(0 100% 0 0)',
      end: 'inset(0 0% 0 0)'
    }
  };

  useEffect(() => {
    if (!isActive || !maskRef.current) return;

    const mask = maskRef.current;
    const shape = maskShapes[maskType];

    const startClip = direction === 'in' ? shape.start : shape.end;
    const endClip = direction === 'in' ? shape.end : shape.start;

    gsap.fromTo(mask, 
      { clipPath: startClip },
      { 
        clipPath: endClip,
        duration: duration,
        ease: "power2.inOut",
        onComplete
      }
    );

  }, [isActive, maskType, direction, duration, onComplete]);

  if (!isActive && direction === 'in') return null;

  return (
    <div 
      ref={maskRef}
      className={`fixed inset-0 z-50 ${className}`}
      style={{
        backgroundColor: direction === 'in' ? 'white' : 'transparent',
        clipPath: maskShapes[maskType].start
      }}
    >
      {children}
    </div>
  );
}

// ページ遷移用のマスクトランジション
export function PageMaskTransition({ 
  isTransitioning, 
  onMidTransition,
  onComplete,
  maskType = 'circle',
  className = '' 
}: {
  isTransitioning: boolean;
  onMidTransition?: () => void;
  onComplete?: () => void;
  maskType?: 'circle' | 'heart' | 'star' | 'diamond';
  className?: string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTransitioning || !overlayRef.current) return;

    const overlay = overlayRef.current;
    const shape = {
      circle: {
        expand: 'circle(100% at 50% 50%)',
        shrink: 'circle(0% at 50% 50%)'
      },
      heart: {
        expand: 'polygon(50% 25%, 35% 0%, 15% 0%, 0% 25%, 0% 50%, 25% 75%, 50% 100%, 75% 75%, 100% 50%, 100% 25%, 85% 0%, 65% 0%)',
        shrink: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)'
      },
      star: {
        expand: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        shrink: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)'
      },
      diamond: {
        expand: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        shrink: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)'
      }
    }[maskType];

    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { display: 'none' });
        onComplete?.();
      }
    });

    // フェーズ1: マスクが展開してページを覆う
    timeline
      .set(overlay, { display: 'block' })
      .fromTo(overlay,
        { clipPath: shape.shrink },
        { 
          clipPath: shape.expand,
          duration: 0.4,
          ease: "power2.in",
          onComplete: onMidTransition
        }
      )
      // フェーズ2: マスクが収縮して新しいページを表示
      .to(overlay, {
        clipPath: shape.shrink,
        duration: 0.4,
        ease: "power2.out"
      });

    return () => {
      timeline?.kill();
    };
  }, [isTransitioning, onMidTransition, onComplete, maskType]);

  return (
    <div 
      ref={overlayRef}
      className={`fixed inset-0 z-50 bg-white ${className}`}
      style={{ 
        display: 'none',
        clipPath: 'circle(0% at 50% 50%)'
      }}
    />
  );
}

// 画像のマスクリビール
export function ImageMaskReveal({ 
  src, 
  alt, 
  trigger,
  maskType = 'circle',
  className = '' 
}: {
  src: string;
  alt: string;
  trigger: boolean;
  maskType?: 'circle' | 'star' | 'heart';
  className?: string;
}) {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!trigger || !imageRef.current) return;

    const image = imageRef.current;
    
    const masks = {
      circle: 'circle(0% at 50% 50%)',
      star: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      heart: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)'
    };

    const endMasks = {
      circle: 'circle(100% at 50% 50%)',
      star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      heart: 'polygon(50% 25%, 35% 0%, 15% 0%, 0% 25%, 0% 50%, 25% 75%, 50% 100%, 75% 75%, 100% 50%, 100% 25%, 85% 0%, 65% 0%)'
    };

    gsap.fromTo(image,
      { clipPath: masks[maskType] },
      { 
        clipPath: endMasks[maskType],
        duration: 1.2,
        ease: "power2.out"
      }
    );

  }, [trigger, maskType]);

  return (
    <img 
      ref={imageRef}
      src={src} 
      alt={alt}
      className={className}
      style={{ clipPath: 'circle(0% at 50% 50%)' }}
    />
  );
}

// フック版
export function useMaskTransition() {
  const createMaskTransition = (element: HTMLElement, options?: {
    maskType?: 'circle' | 'heart' | 'star' | 'diamond';
    direction?: 'in' | 'out';
    duration?: number;
    onComplete?: () => void;
  }) => {
    const { 
      maskType = 'circle', 
      direction = 'in', 
      duration = 0.8, 
      onComplete 
    } = options || {};

    const masks = {
      circle: {
        start: 'circle(0% at 50% 50%)',
        end: 'circle(100% at 50% 50%)'
      },
      heart: {
        start: 'polygon(50% 50%, 50% 50%, 50% 50%)',
        end: 'polygon(50% 25%, 35% 0%, 15% 0%, 0% 25%, 0% 50%, 25% 75%, 50% 100%, 75% 75%, 100% 50%, 100% 25%, 85% 0%, 65% 0%)'
      },
      star: {
        start: 'polygon(50% 50%, 50% 50%, 50% 50%)',
        end: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
      },
      diamond: {
        start: 'polygon(50% 50%, 50% 50%, 50% 50%)',
        end: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
      }
    };

    const shape = masks[maskType];
    const startClip = direction === 'in' ? shape.start : shape.end;
    const endClip = direction === 'in' ? shape.end : shape.start;

    return gsap.fromTo(element, 
      { clipPath: startClip },
      { 
        clipPath: endClip,
        duration: duration,
        ease: "power2.inOut",
        onComplete
      }
    );
  };

  const createWipeTransition = (element: HTMLElement, options?: {
    direction?: 'left' | 'right' | 'up' | 'down';
    duration?: number;
    onComplete?: () => void;
  }) => {
    const { direction = 'left', duration = 0.6, onComplete } = options || {};

    const wipes = {
      left: { start: 'inset(0 100% 0 0)', end: 'inset(0 0% 0 0)' },
      right: { start: 'inset(0 0 0 100%)', end: 'inset(0 0 0 0%)' },
      up: { start: 'inset(100% 0 0 0)', end: 'inset(0% 0 0 0)' },
      down: { start: 'inset(0 0 100% 0)', end: 'inset(0 0 0% 0)' }
    };

    const wipe = wipes[direction];

    return gsap.fromTo(element, 
      { clipPath: wipe.start },
      { 
        clipPath: wipe.end,
        duration: duration,
        ease: "power2.inOut",
        onComplete
      }
    );
  };

  return { createMaskTransition, createWipeTransition };
}