import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface TimeWarpEffectProps {
  trigger: boolean;
  warpType?: 'radial' | 'tunnel' | 'spiral' | 'shockwave';
  intensity?: 'subtle' | 'moderate' | 'extreme';
  direction?: 'forward' | 'backward' | 'pause';
  duration?: number;
  epicenter?: { x: number; y: number };
  onComplete?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function TimeWarpEffect({
  trigger,
  warpType = 'radial',
  intensity = 'moderate',
  direction = 'forward',
  duration = 2,
  epicenter,
  onComplete,
  className = '',
  children
}: TimeWarpEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const warpFieldRef = useRef<HTMLCanvasElement>(null);
  const [isWarping, setIsWarping] = useState(false);

  const intensitySettings = {
    subtle: { ripples: 3, amplitude: 20, frequency: 0.5, distortion: 0.1 },
    moderate: { ripples: 5, amplitude: 40, frequency: 1, distortion: 0.3 },
    extreme: { ripples: 8, amplitude: 80, frequency: 2, distortion: 0.6 }
  };

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    setIsWarping(true);
    const container = containerRef.current;
    const settings = intensitySettings[intensity];

    createWarpField();
    animateTimeWarp(container, settings);

    return () => {
      setIsWarping(false);
    };
  }, [trigger, warpType, intensity, direction, duration]);

  const createWarpField = () => {
    if (!warpFieldRef.current || !containerRef.current) return;

    const canvas = warpFieldRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // ワープフィールドの描画を開始
    animateWarpField(ctx, canvas.width, canvas.height);
  };

  const animateWarpField = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const settings = intensitySettings[intensity];
    const centerX = epicenter?.x ?? width / 2;
    const centerY = epicenter?.y ?? height / 2;

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 時空の歪みを視覚化
      switch (warpType) {
        case 'radial':
          drawRadialWarp(ctx, centerX, centerY, time, settings);
          break;
        case 'tunnel':
          drawTunnelWarp(ctx, centerX, centerY, time, settings);
          break;
        case 'spiral':
          drawSpiralWarp(ctx, centerX, centerY, time, settings);
          break;
        case 'shockwave':
          drawShockwaveWarp(ctx, centerX, centerY, time, settings);
          break;
      }

      time += direction === 'backward' ? -0.1 : 0.1;
      
      if (time < duration * 10 && isWarping) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const drawRadialWarp = (
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    time: number, 
    settings: any
  ) => {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
    ctx.lineWidth = 2;

    for (let i = 0; i < settings.ripples; i++) {
      const radius = (time + i * 20) % 300;
      const opacity = 1 - (radius / 300);
      
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      
      // 歪んだ円を描画
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const distortion = Math.sin(time * settings.frequency + angle * 3) * settings.amplitude * 0.1;
        const x = centerX + Math.cos(angle) * (radius + distortion);
        const y = centerY + Math.sin(angle) * (radius + distortion);
        
        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }
  };

  const drawTunnelWarp = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    time: number,
    _settings: any
  ) => {
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(128, 0, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'screen';

    // 回転するトンネル効果
    for (let layer = 0; layer < 5; layer++) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((time + layer * 0.5) * 0.1);
      ctx.scale(1 + Math.sin(time * 0.1) * 0.2, 1 + Math.cos(time * 0.1) * 0.2);
      
      const size = 50 + layer * 30;
      ctx.fillRect(-size/2, -size/2, size, size);
      ctx.restore();
    }

    ctx.globalCompositeOperation = 'source-over';
  };

  const drawSpiralWarp = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    time: number,
    settings: any
  ) => {
    ctx.strokeStyle = 'rgba(255, 0, 136, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let angle = 0; angle < Math.PI * 8; angle += 0.1) {
      const spiralRadius = angle * 5;
      const timeOffset = time * settings.frequency;
      const distortion = Math.sin(timeOffset + angle) * settings.amplitude * 0.1;
      
      const x = centerX + Math.cos(angle + timeOffset) * (spiralRadius + distortion);
      const y = centerY + Math.sin(angle + timeOffset) * (spiralRadius + distortion);
      
      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  const drawShockwaveWarp = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    time: number,
    _settings: any
  ) => {
    // メインショックウェーブ
    const mainRadius = time * 15;
    const gradient = ctx.createRadialGradient(
      centerX, centerY, mainRadius - 20,
      centerX, centerY, mainRadius + 20
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2);
    ctx.fill();

    // 余波
    for (let i = 1; i <= 3; i++) {
      const aftershockRadius = mainRadius - i * 40;
      if (aftershockRadius > 0) {
        ctx.globalAlpha = 0.3 / i;
        ctx.beginPath();
        ctx.arc(centerX, centerY, aftershockRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  };

  const animateTimeWarp = (container: HTMLElement, settings: any) => {
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsWarping(false);
        onComplete?.();
      }
    });

    // 時間停止効果
    if (direction === 'pause') {
      timeline
        .to(container, {
          filter: 'blur(2px) brightness(1.5) saturate(2)',
          duration: 0.3,
          ease: "power2.out"
        })
        .to(container, {
          filter: 'blur(0px) brightness(1) saturate(1)',
          duration: duration - 0.6,
          ease: "none"
        })
        .to(container, {
          filter: 'blur(0px) brightness(1) saturate(1)',
          duration: 0.3,
          ease: "power2.in"
        });
    }
    
    // 時間加速/減速効果
    else {
      const speedMultiplier = direction === 'forward' ? 1 : -1;
      
      timeline
        .to(container, {
          scale: 1 + settings.distortion * speedMultiplier,
          rotation: 360 * speedMultiplier,
          filter: `hue-rotate(${180 * speedMultiplier}deg) blur(${settings.distortion * 3}px)`,
          duration: duration * 0.4,
          ease: "power2.out"
        })
        .to(container, {
          scale: 1,
          rotation: 0,
          filter: 'hue-rotate(0deg) blur(0px)',
          duration: duration * 0.6,
          ease: "elastic.out(1, 0.3)"
        });
    }

    // 画面の歪みエフェクト
    timeline.to(container, {
      skewX: () => Math.sin(Date.now() * 0.01) * settings.distortion,
      skewY: () => Math.cos(Date.now() * 0.01) * settings.distortion * 0.5,
      duration: duration,
      ease: "sine.inOut"
    }, 0);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {children}
      
      {/* ワープフィールドキャンバス */}
      {isWarping && (
        <canvas
          ref={warpFieldRef}
          className="absolute inset-0 pointer-events-none z-10"
          style={{ mixBlendMode: 'screen' }}
        />
      )}
      
      {/* 時空歪みオーバーレイ */}
      {isWarping && (
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: `radial-gradient(circle at ${epicenter?.x ?? 50}% ${epicenter?.y ?? 50}%, 
              rgba(0,255,255,0.1) 0%, 
              rgba(128,0,255,0.05) 50%, 
              transparent 70%)`,
            animation: 'timeWarpPulse 0.5s ease-in-out infinite alternate'
          }}
        />
      )}

      <style>{`
        @keyframes timeWarpPulse {
          from { opacity: 0.3; transform: scale(1); }
          to { opacity: 0.7; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}

// 時間停止エフェクト
export function TimeFreeze({
  children,
  trigger,
  duration = 3,
  onComplete
}: {
  children: React.ReactNode;
  trigger: boolean;
  duration?: number;
  onComplete?: () => void;
}) {
  return (
    <TimeWarpEffect
      trigger={trigger}
      warpType="shockwave"
      direction="pause"
      intensity="extreme"
      duration={duration}
      onComplete={onComplete}
    >
      {children}
    </TimeWarpEffect>
  );
}

// 時間巻き戻しエフェクト
export function TimeRewind({
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
    
    const timeline = gsap.timeline({ onComplete });

    // 巻き戻し効果
    timeline
      .to(element, {
        filter: 'sepia(1) hue-rotate(240deg)',
        scale: 0.9,
        duration: 0.5,
        ease: "power2.out"
      })
      .to(element, {
        rotationY: -360,
        duration: 1.5,
        ease: "power2.inOut"
      })
      .to(element, {
        filter: 'sepia(0) hue-rotate(0deg)',
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
      });

    return () => {
      timeline.kill();
    };
  }, [trigger, onComplete]);

  return (
    <div ref={elementRef} style={{ perspective: '800px' }}>
      <TimeWarpEffect
        trigger={trigger}
        warpType="spiral"
        direction="backward"
        intensity="moderate"
      >
        {children}
      </TimeWarpEffect>
    </div>
  );
}

// 未来への加速エフェクト
export function TimeFastForward({
  children,
  trigger,
  onComplete
}: {
  children: React.ReactNode;
  trigger: boolean;
  onComplete?: () => void;
}) {
  return (
    <TimeWarpEffect
      trigger={trigger}
      warpType="tunnel"
      direction="forward"
      intensity="extreme"
      duration={1.5}
      onComplete={onComplete}
    >
      {children}
    </TimeWarpEffect>
  );
}

// ページローダー用タイムワープ
export function TimeWarpLoader({
  isLoading,
  text = "時空間を歪めています...",
  className = ''
}: {
  isLoading: boolean;
  text?: string;
  className?: string;
}) {
  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 ${className}`}>
      <TimeWarpEffect
        trigger={isLoading}
        warpType="radial"
        intensity="moderate"
        duration={10} // 長めの継続時間
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400 mb-4">
            {text}
          </div>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </TimeWarpEffect>
    </div>
  );
}

// フック版
export function useTimeWarpEffect() {
  const createTimeWarp = (element: HTMLElement, options?: {
    type?: 'radial' | 'tunnel' | 'spiral';
    direction?: 'forward' | 'backward' | 'pause';
    intensity?: 'subtle' | 'moderate' | 'extreme';
    duration?: number;
    onComplete?: () => void;
  }) => {
    const { 
      type: _type = 'radial', // 未使用 
      direction = 'forward', 
      intensity = 'moderate', 
      duration = 2,
      onComplete 
    } = options || {};

    const settings = {
      subtle: { scale: 1.05, blur: 1, distortion: 0.1 },
      moderate: { scale: 1.2, blur: 3, distortion: 0.3 },
      extreme: { scale: 1.5, blur: 6, distortion: 0.6 }
    }[intensity];

    const timeline = gsap.timeline({ onComplete });

    if (direction === 'pause') {
      // 時間停止
      timeline
        .to(element, {
          filter: `blur(${settings.blur}px) brightness(1.5) saturate(2)`,
          scale: settings.scale,
          duration: 0.3,
          ease: "power2.out"
        })
        .to(element, {
          filter: 'blur(0px) brightness(1) saturate(1)',
          scale: 1,
          duration: duration - 0.6,
          ease: "none"
        })
        .to(element, {
          duration: 0.3,
          ease: "power2.in"
        });
    } else {
      // 時間加速/減速
      const speedMultiplier = direction === 'forward' ? 1 : -1;
      
      timeline
        .to(element, {
          scale: 1 + settings.distortion * speedMultiplier,
          rotation: 180 * speedMultiplier,
          filter: `hue-rotate(${90 * speedMultiplier}deg) blur(${settings.blur}px)`,
          duration: duration * 0.6,
          ease: "power2.out"
        })
        .to(element, {
          scale: 1,
          rotation: 0,
          filter: 'hue-rotate(0deg) blur(0px)',
          duration: duration * 0.4,
          ease: "elastic.out(1, 0.3)"
        });
    }

    return timeline;
  };

  return { createTimeWarp };
}