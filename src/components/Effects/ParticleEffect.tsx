import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ParticleEffectProps {
  trigger: boolean;
  onComplete?: () => void;
  particleCount?: number;
  colors?: string[];
  position?: { x: number; y: number };
}

export function ParticleEffect({ 
  trigger, 
  onComplete, 
  particleCount = 15,
  colors = ['#00ff88', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'],
  position = { x: 0, y: 0 }
}: ParticleEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];

    // パーティクルを生成
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 8 + 4}px;
        height: ${Math.random() * 8 + 4}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        box-shadow: 0 0 ${Math.random() * 10 + 5}px ${color};
        left: ${position.x}px;
        top: ${position.y}px;
      `;

      container.appendChild(particle);
      particles.push(particle);

      // パーティクルアニメーション
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const velocity = Math.random() * 150 + 100;
      const gravity = Math.random() * 300 + 200;

      gsap.fromTo(particle, 
        { 
          x: 0, 
          y: 0, 
          scale: 0,
          rotation: 0,
          opacity: 1 
        },
        { 
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity - gravity,
          scale: Math.random() * 0.8 + 0.2,
          rotation: Math.random() * 720 - 360,
          opacity: 0,
          duration: Math.random() * 1 + 1,
          ease: "power2.out",
          onComplete: i === particleCount - 1 ? () => {
            // 最後のパーティクルが終わったらクリーンアップ
            particles.forEach(p => p.remove());
            onComplete?.();
          } : undefined
        }
      );

      // キラキラエフェクト（一部のパーティクルに追加）
      if (Math.random() < 0.3) {
        gsap.to(particle, {
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
          duration: 0.1,
          repeat: Math.floor(Math.random() * 5) + 2,
          yoyo: true,
          delay: Math.random() * 0.5
        });
      }
    }
  }, [trigger, particleCount, colors, position, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1000 }}
    />
  );
}

// 使いやすいフック版も作成
export function useParticleEffect() {
  // const _containerRef = useRef<HTMLDivElement>(null); // 未使用

  const triggerParticles = (options?: {
    particleCount?: number;
    colors?: string[];
    position?: { x: number; y: number };
    element?: HTMLElement;
  }) => {
    const { 
      particleCount = 15,
      colors = ['#00ff88', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'],
      position,
      element
    } = options || {};

    let targetPosition = position;

    // elementが指定されている場合、その位置を取得
    if (element && !position) {
      const rect = element.getBoundingClientRect();
      targetPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    if (!targetPosition) {
      targetPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    // パーティクル生成とアニメーション
    const particles: HTMLDivElement[] = [];
    const container = document.body;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.cssText = `
        position: fixed;
        width: ${Math.random() * 8 + 4}px;
        height: ${Math.random() * 8 + 4}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        box-shadow: 0 0 ${Math.random() * 10 + 5}px ${color};
        left: ${targetPosition.x}px;
        top: ${targetPosition.y}px;
      `;

      container.appendChild(particle);
      particles.push(particle);

      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const velocity = Math.random() * 150 + 100;
      const gravity = Math.random() * 300 + 200;

      gsap.fromTo(particle, 
        { 
          x: 0, 
          y: 0, 
          scale: 0,
          rotation: 0,
          opacity: 1 
        },
        { 
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity - gravity,
          scale: Math.random() * 0.8 + 0.2,
          rotation: Math.random() * 720 - 360,
          opacity: 0,
          duration: Math.random() * 1.5 + 1,
          ease: "power2.out",
          onComplete: () => {
            particle.remove();
          }
        }
      );

      // キラキラエフェクト
      if (Math.random() < 0.4) {
        gsap.to(particle, {
          filter: `brightness(${Math.random() * 2 + 1})`,
          duration: 0.1,
          repeat: Math.floor(Math.random() * 3) + 1,
          yoyo: true,
          delay: Math.random() * 0.3
        });
      }
    }
  };

  return { triggerParticles };
}