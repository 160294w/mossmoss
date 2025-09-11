import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface RadarScanProps {
  isScanning: boolean;
  size?: number;
  color?: string;
  scanSpeed?: number;
  fadeTrail?: boolean;
  className?: string;
}

export function RadarScan({ 
  isScanning, 
  size = 100, 
  color = '#00ff88', 
  scanSpeed = 2,
  fadeTrail = true,
  className = '' 
}: RadarScanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<GSAPTween>();

  useEffect(() => {
    if (!containerRef.current || !scanLineRef.current) return;

    const scanLine = scanLineRef.current;

    if (isScanning) {
      // スキャンアニメーション開始
      animationRef.current = gsap.to(scanLine, {
        rotation: 360,
        duration: scanSpeed,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%"
      });

      // フェードトレイルエフェクト
      if (fadeTrail) {
        const trail = containerRef.current.querySelector('.scan-trail') as HTMLElement;
        if (trail) {
          gsap.to(trail, {
            opacity: 0.6,
            duration: 0.5,
            repeat: -1,
            yoyo: true
          });
        }
      }
    } else {
      // アニメーション停止
      if (animationRef.current) {
        animationRef.current.kill();
      }
      
      gsap.to(scanLine, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [isScanning, scanSpeed, fadeTrail]);

  return (
    <div 
      ref={containerRef}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* レーダー背景円 */}
      <div 
        className="absolute rounded-full border-2 opacity-30"
        style={{ 
          width: size, 
          height: size,
          borderColor: color
        }}
      />
      <div 
        className="absolute rounded-full border opacity-20"
        style={{ 
          width: size * 0.7, 
          height: size * 0.7,
          borderColor: color
        }}
      />
      <div 
        className="absolute rounded-full border opacity-20"
        style={{ 
          width: size * 0.4, 
          height: size * 0.4,
          borderColor: color
        }}
      />
      
      {/* グリッドライン */}
      <div 
        className="absolute"
        style={{ 
          width: size, 
          height: 1, 
          backgroundColor: color, 
          opacity: 0.2 
        }}
      />
      <div 
        className="absolute"
        style={{ 
          width: 1, 
          height: size, 
          backgroundColor: color, 
          opacity: 0.2 
        }}
      />

      {/* スキャンライン */}
      <div
        ref={scanLineRef}
        className="absolute"
        style={{
          width: size / 2,
          height: 2,
          background: `linear-gradient(to right, transparent, ${color})`,
          transformOrigin: `0 50%`,
          opacity: isScanning ? 1 : 0,
          boxShadow: `0 0 10px ${color}`
        }}
      />

      {/* フェードトレイル */}
      {fadeTrail && (
        <div
          className="scan-trail absolute rounded-full"
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle, transparent 60%, ${color}08 70%, transparent 80%)`,
            opacity: isScanning ? 0.3 : 0
          }}
        />
      )}

      {/* 中央ドット */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: 4, 
          height: 4, 
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`
        }}
      />
    </div>
  );
}

// QRコード生成時用のスキャナーエフェクト
export function QRScanner({ isActive, onComplete, className = '' }: {
  isActive: boolean;
  onComplete?: () => void;
  className?: string;
}) {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !scannerRef.current) return;

    const scanner = scannerRef.current;
    
    // スキャンライン移動
    const timeline = gsap.timeline({
      repeat: 2, // 3回スキャン
      onComplete: () => {
        gsap.to(scanner, {
          opacity: 0,
          duration: 0.5,
          onComplete
        });
      }
    });

    timeline
      .fromTo(scanner.querySelector('.scan-line'), 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.1 }
      )
      .to(scanner.querySelector('.scan-line'), 
        { y: 100, duration: 0.8, ease: "none" }
      )
      .to(scanner.querySelector('.scan-line'), 
        { opacity: 0, duration: 0.1 }
      );

  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div 
      ref={scannerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ background: 'rgba(0, 255, 136, 0.1)' }}
    >
      <div 
        className="scan-line absolute w-full h-0.5 bg-green-400"
        style={{ 
          boxShadow: '0 0 10px #00ff88, 0 0 20px #00ff88',
          opacity: 0
        }}
      />
      
      {/* スキャナーコーナー */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-green-400" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-green-400" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-green-400" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-green-400" />
    </div>
  );
}

// フック版
export function useRadarScan() {
  const createRadarScan = (element: HTMLElement, options?: {
    duration?: number;
    color?: string;
    pulses?: number;
  }) => {
    const { duration = 2, color = '#00ff88', pulses = 3 } = options || {};

    // 一時的なレーダー要素を作成
    const radar = document.createElement('div');
    radar.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      margin: -50px 0 0 -50px;
      border: 2px solid ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
    `;

    element.appendChild(radar);

    // パルスエフェクト
    const timeline = gsap.timeline({
      onComplete: () => {
        radar.remove();
      }
    });

    for (let i = 0; i < pulses; i++) {
      timeline.fromTo(radar,
        { scale: 0, opacity: 1 },
        { 
          scale: 2, 
          opacity: 0, 
          duration: duration / pulses,
          ease: "power2.out"
        },
        i * (duration / pulses) * 0.3
      );
    }

    return timeline;
  };

  return { createRadarScan };
}