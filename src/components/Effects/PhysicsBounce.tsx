import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface PhysicsBounceProps {
  children: React.ReactNode;
  trigger: boolean;
  bounceType?: 'drop' | 'shake' | 'jello' | 'wobble' | 'rubberBand';
  intensity?: 'gentle' | 'normal' | 'strong';
  onComplete?: () => void;
  className?: string;
}

export function PhysicsBounce({ 
  children, 
  trigger, 
  bounceType = 'drop',
  intensity = 'normal',
  onComplete,
  className = ''
}: PhysicsBounceProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  const intensitySettings = {
    gentle: { distance: 20, duration: 0.6, ease: "bounce.out" },
    normal: { distance: 40, duration: 0.8, ease: "bounce.out" },
    strong: { distance: 60, duration: 1.2, ease: "bounce.out" }
  };

  useEffect(() => {
    if (!trigger || !elementRef.current) return;

    const element = elementRef.current;
    const settings = intensitySettings[intensity];

    let animation: gsap.core.Timeline;

    switch (bounceType) {
      case 'drop':
        animation = gsap.timeline()
          .fromTo(element, 
            { y: -settings.distance, rotation: -5, scale: 0.9 },
            { 
              y: 0, 
              rotation: 0, 
              scale: 1,
              duration: settings.duration, 
              ease: settings.ease 
            }
          );
        break;

      case 'shake':
        animation = gsap.timeline()
          .to(element, {
            x: -10,
            duration: 0.1,
            repeat: 5,
            yoyo: true,
            ease: "power2.inOut"
          })
          .to(element, {
            x: 0,
            duration: 0.2,
            ease: "elastic.out(1, 0.3)"
          });
        break;

      case 'jello':
        animation = gsap.timeline()
          .to(element, {
            skewX: -12.5,
            skewY: -12.5,
            duration: 0.1,
            ease: "none"
          })
          .to(element, {
            skewX: 6.25,
            skewY: 6.25,
            duration: 0.1,
            ease: "none"
          })
          .to(element, {
            skewX: -3.125,
            skewY: -3.125,
            duration: 0.1,
            ease: "none"
          })
          .to(element, {
            skewX: 1.5625,
            skewY: 1.5625,
            duration: 0.1,
            ease: "none"
          })
          .to(element, {
            skewX: 0,
            skewY: 0,
            duration: 0.1,
            ease: "none"
          });
        break;

      case 'wobble':
        animation = gsap.timeline()
          .to(element, {
            x: -25,
            rotation: -5,
            duration: 0.15,
            ease: "none"
          })
          .to(element, {
            x: 20,
            rotation: 3,
            duration: 0.15,
            ease: "none"
          })
          .to(element, {
            x: -15,
            rotation: -3,
            duration: 0.15,
            ease: "none"
          })
          .to(element, {
            x: 10,
            rotation: 2,
            duration: 0.15,
            ease: "none"
          })
          .to(element, {
            x: -5,
            rotation: -1,
            duration: 0.15,
            ease: "none"
          })
          .to(element, {
            x: 0,
            rotation: 0,
            duration: 0.15,
            ease: "none"
          });
        break;

      case 'rubberBand':
        animation = gsap.timeline()
          .to(element, {
            scaleX: 1.25,
            scaleY: 0.75,
            duration: 0.2,
            ease: "none"
          })
          .to(element, {
            scaleX: 0.75,
            scaleY: 1.25,
            duration: 0.2,
            ease: "none"
          })
          .to(element, {
            scaleX: 1.15,
            scaleY: 0.85,
            duration: 0.1,
            ease: "none"
          })
          .to(element, {
            scaleX: 1,
            scaleY: 1,
            duration: 0.2,
            ease: "elastic.out(1, 0.3)"
          });
        break;

      default:
        animation = gsap.timeline();
    }

    if (onComplete) {
      animation.eventCallback("onComplete", onComplete);
    }

    return () => {
      animation.kill();
    };
  }, [trigger, bounceType, intensity, onComplete]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

// エラーメッセージ用の特殊バウンス
export function ErrorBounce({ 
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
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !elementRef.current) return;

    const element = elementRef.current;

    const animation = gsap.timeline()
      // 落下
      .fromTo(element, 
        { y: -100, rotation: -10, scale: 0.8 },
        { y: 0, duration: 0.4, ease: "power2.in" }
      )
      // バウンス
      .to(element, {
        y: -30,
        rotation: 5,
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(element, {
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.3,
        ease: "bounce.out"
      })
      // 微細な揺れ
      .to(element, {
        x: -2,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "power2.inOut"
      })
      .to(element, {
        x: 0,
        duration: 0.2,
        ease: "elastic.out(1, 0.3)",
        onComplete
      });

    return () => {
      animation?.kill();
    };
  }, [trigger, onComplete]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

// フック版
export function usePhysicsBounce() {
  const bounceElement = (element: HTMLElement, options?: {
    type?: 'drop' | 'shake' | 'jello' | 'wobble' | 'rubberBand';
    intensity?: 'gentle' | 'normal' | 'strong';
    onComplete?: () => void;
  }) => {
    const { type = 'drop', intensity = 'normal', onComplete } = options || {};

    const intensitySettings = {
      gentle: { distance: 20, duration: 0.6 },
      normal: { distance: 40, duration: 0.8 },
      strong: { distance: 60, duration: 1.2 }
    };

    const settings = intensitySettings[intensity];
    let timeline: gsap.core.Timeline;

    switch (type) {
      case 'drop':
        timeline = gsap.timeline()
          .fromTo(element, 
            { y: -settings.distance, rotation: -5 },
            { 
              y: 0, 
              rotation: 0,
              duration: settings.duration, 
              ease: "bounce.out",
              onComplete 
            }
          );
        break;

      case 'shake':
        timeline = gsap.timeline()
          .to(element, {
            x: -10,
            duration: 0.1,
            repeat: 5,
            yoyo: true,
            ease: "power2.inOut"
          })
          .to(element, {
            x: 0,
            duration: 0.2,
            ease: "elastic.out(1, 0.3)",
            onComplete
          });
        break;

      // 他のタイプも同様に実装...
      default:
        timeline = gsap.timeline();
        if (onComplete) timeline.eventCallback("onComplete", onComplete);
    }

    return timeline;
  };

  // 重力シミュレーション
  const simulateGravity = (element: HTMLElement, options?: {
    gravity?: number;
    bounce?: number;
    friction?: number;
    initialVelocity?: { x: number; y: number };
  }) => {
    const { 
      gravity = 500, 
      bounce = 0.7, 
      friction = 0.9,
      initialVelocity = { x: 0, y: -100 }
    } = options || {};

    let velocityX = initialVelocity.x;
    let velocityY = initialVelocity.y;
    let positionX = 0;
    let positionY = 0;

    const containerRect = element.parentElement?.getBoundingClientRect() || { width: 400, height: 300 };
    const elementRect = element.getBoundingClientRect();

    const animate = () => {
      // 物理計算
      velocityY += gravity * 0.016; // 60fps想定
      positionX += velocityX * 0.016;
      positionY += velocityY * 0.016;

      // 境界との衝突判定
      if (positionY > containerRect.height - elementRect.height) {
        positionY = containerRect.height - elementRect.height;
        velocityY *= -bounce;
        velocityX *= friction;
      }

      if (positionX < 0 || positionX > containerRect.width - elementRect.width) {
        velocityX *= -bounce;
        positionX = Math.max(0, Math.min(positionX, containerRect.width - elementRect.width));
      }

      // DOM更新
      gsap.set(element, { x: positionX, y: positionY });

      // 停止判定
      if (Math.abs(velocityY) < 10 && Math.abs(velocityX) < 10 && 
          positionY >= containerRect.height - elementRect.height - 5) {
        return;
      }

      requestAnimationFrame(animate);
    };

    animate();
  };

  return { bounceElement, simulateGravity };
}