import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface MagneticAttractionProps {
  children: React.ReactNode;
  strength?: 'weak' | 'medium' | 'strong';
  range?: number;
  className?: string;
  disabled?: boolean;
}

export function MagneticAttraction({ 
  children, 
  strength = 'medium',
  range = 100,
  className = '',
  disabled = false
}: MagneticAttractionProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const strengthSettings = {
    weak: { multiplier: 0.1, elasticity: 0.3, duration: 0.6 },
    medium: { multiplier: 0.2, elasticity: 0.4, duration: 0.8 },
    strong: { multiplier: 0.3, elasticity: 0.5, duration: 1.0 }
  };

  useEffect(() => {
    if (!elementRef.current || disabled) return;

    const element = elementRef.current;
    const settings = strengthSettings[strength];
    // let animationId: number;
    let isActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < range) {
        const force = 1 - (distance / range);
        const magneticX = deltaX * force * settings.multiplier;
        const magneticY = deltaY * force * settings.multiplier;

        gsap.to(element, {
          x: magneticX,
          y: magneticY,
          rotation: magneticX * 0.1,
          scale: 1 + force * 0.05,
          duration: settings.duration,
          ease: `elastic.out(${settings.elasticity}, 0.3)`
        });

        // パーティクル効果（強い吸着時）
        if (force > 0.7 && strength === 'strong') {
          createMagneticParticles(element, centerX, centerY, e.clientX, e.clientY);
        }
      }
    };

    const handleMouseEnter = () => {
      isActive = true;
      setIsHovered(true);
      
      gsap.to(element, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      isActive = false;
      setIsHovered(false);
      
      gsap.to(element, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: settings.duration * 1.5,
        ease: `elastic.out(${settings.elasticity}, 0.2)`
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', handleMouseMove);
      // if (animationId) cancelAnimationFrame(animationId); // 未使用
    };
  }, [strength, range, disabled]);

  // 磁気パーティクル生成
  const createMagneticParticles = (
    _element: HTMLElement, 
    centerX: number, 
    centerY: number, 
    mouseX: number, 
    mouseY: number
  ) => {
    for (let i = 0; i < 3; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: linear-gradient(45deg, #00ff88, #00ffff);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${centerX}px;
        top: ${centerY}px;
        box-shadow: 0 0 6px currentColor;
      `;
      
      document.body.appendChild(particle);

      const angle = (Math.PI * 2 / 3) * i;
      const radius = 30;
      
      gsap.fromTo(particle,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          duration: 0.5,
          ease: "power2.out"
        }
      );

      gsap.to(particle, {
        x: mouseX - centerX,
        y: mouseY - centerY,
        scale: 0,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power2.in",
        onComplete: () => particle.remove()
      });
    }
  };

  return (
    <div 
      ref={elementRef}
      className={`inline-block cursor-pointer transition-all ${className}`}
      style={{
        filter: isHovered ? `drop-shadow(0 0 20px rgba(0, 255, 136, 0.3))` : 'none'
      }}
    >
      {children}
    </div>
  );
}

// カード用の磁気エフェクト
export function MagneticCard({
  children,
  className = '',
  onClick
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <MagneticAttraction strength="medium" range={120}>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow ${className}`}
        onClick={onClick}
      >
        {children}
      </div>
    </MagneticAttraction>
  );
}

// ボタン用の磁気エフェクト
export function MagneticButton({
  children,
  onClick,
  variant = 'primary',
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}) {
  const baseClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white';

  return (
    <MagneticAttraction strength="strong" range={80}>
      <button
        onClick={onClick}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${baseClasses} ${className}`}
      >
        {children}
      </button>
    </MagneticAttraction>
  );
}

// フック版
export function useMagneticAttraction() {
  const createMagneticEffect = (element: HTMLElement, options?: {
    strength?: 'weak' | 'medium' | 'strong';
    range?: number;
    onAttract?: () => void;
  }) => {
    const { strength = 'medium', range = 100, onAttract } = options || {};
    
    const strengthSettings = {
      weak: { multiplier: 0.1, elasticity: 0.3 },
      medium: { multiplier: 0.2, elasticity: 0.4 },
      strong: { multiplier: 0.3, elasticity: 0.5 }
    };

    const settings = strengthSettings[strength];
    let isActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < range) {
        const force = 1 - (distance / range);
        const magneticX = deltaX * force * settings.multiplier;
        const magneticY = deltaY * force * settings.multiplier;

        gsap.to(element, {
          x: magneticX,
          y: magneticY,
          rotation: magneticX * 0.1,
          duration: 0.8,
          ease: `elastic.out(${settings.elasticity}, 0.3)`
        });

        if (force > 0.8) {
          onAttract?.();
        }
      }
    };

    const handleMouseEnter = () => {
      isActive = true;
    };

    const handleMouseLeave = () => {
      isActive = false;
      gsap.to(element, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 1.2,
        ease: `elastic.out(${settings.elasticity}, 0.2)`
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  };

  return { createMagneticEffect };
}