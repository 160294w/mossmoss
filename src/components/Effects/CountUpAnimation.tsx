import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface CountUpAnimationProps {
  from: number;
  to: number;
  duration?: number;
  delay?: number;
  trigger?: boolean;
  formatter?: (value: number) => string;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function CountUpAnimation({ 
  from, 
  to, 
  duration = 1.5,
  delay = 0,
  trigger = true,
  formatter,
  onUpdate,
  onComplete,
  className = '',
  suffix = '',
  prefix = ''
}: CountUpAnimationProps) {
  const [displayValue, setDisplayValue] = useState(from);
  const countRef = useRef({ value: from });

  useEffect(() => {
    if (!trigger) return;

    const counter = countRef.current;

    const animation = gsap.to(counter, {
      value: to,
      duration: duration,
      delay: delay,
      ease: "power2.out",
      onUpdate: () => {
        const currentValue = Math.floor(counter.value);
        setDisplayValue(currentValue);
        onUpdate?.(currentValue);
      },
      onComplete: () => {
        setDisplayValue(to);
        onComplete?.();
      }
    });

    return () => {
      animation?.kill();
    };
  }, [trigger, from, to, duration, delay, onUpdate, onComplete]);

  const formatValue = (value: number) => {
    let formatted = formatter ? formatter(value) : value.toString();
    return `${prefix}${formatted}${suffix}`;
  };

  return (
    <span className={className}>
      {formatValue(displayValue)}
    </span>
  );
}

// 複数の数字を順番にカウントアップ
export function MultiCountUp({ 
  counts,
  stagger = 0.2,
  duration = 1.5,
  trigger = true,
  className = ''
}: {
  counts: Array<{
    from: number;
    to: number;
    label?: string;
    formatter?: (value: number) => string;
    prefix?: string;
    suffix?: string;
  }>;
  stagger?: number;
  duration?: number;
  trigger?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {counts.map((count, index) => (
        <div key={index} className="flex items-center justify-between">
          {count.label && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {count.label}
            </span>
          )}
          <CountUpAnimation
            from={count.from}
            to={count.to}
            duration={duration}
            delay={index * stagger}
            trigger={trigger}
            formatter={count.formatter}
            prefix={count.prefix}
            suffix={count.suffix}
            className="font-mono text-lg font-semibold"
          />
        </div>
      ))}
    </div>
  );
}

// プログレスバー付きカウントアップ
export function CountUpWithProgress({ 
  from, 
  to, 
  duration = 2,
  trigger = true,
  showProgress = true,
  progressColor = '#00ff88',
  className = ''
}: {
  from: number;
  to: number;
  duration?: number;
  trigger?: boolean;
  showProgress?: boolean;
  progressColor?: string;
  className?: string;
}) {
  const [currentValue, setCurrentValue] = useState(from);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const counter = { value: from };
    
    const timeline = gsap.timeline();

    // カウントアップ
    timeline.to(counter, {
      value: to,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => {
        setCurrentValue(Math.floor(counter.value));
      }
    });

    // プログレスバー
    if (showProgress && progressRef.current) {
      timeline.to(progressRef.current, {
        scaleX: 1,
        duration: duration,
        ease: "power2.out"
      }, 0);
    }

    return () => {
      timeline.kill();
    };
  }, [trigger, from, to, duration, showProgress]);

  const percentage = ((currentValue - from) / (to - from)) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-3xl font-bold font-mono text-center">
        {currentValue.toLocaleString()}
      </div>
      
      {showProgress && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            ref={progressRef}
            className="h-full rounded-full transform origin-left scale-x-0"
            style={{ 
              backgroundColor: progressColor,
              boxShadow: `0 0 10px ${progressColor}` 
            }}
          />
        </div>
      )}
      
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {percentage.toFixed(1)}% 完了
      </div>
    </div>
  );
}

// 回転ホイール式カウンター（スロットマシン風）
export function SlotCountUp({ 
  from, 
  to, 
  duration = 2,
  trigger = true,
  digits = 3,
  className = ''
}: {
  from: number;
  to: number;
  duration?: number;
  trigger?: boolean;
  digits?: number;
  className?: string;
}) {
  const [_displayValue, setDisplayValue] = useState(from);
  const digitRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const counter = { value: from };

    const animation = gsap.to(counter, {
      value: to,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => {
        const currentValue = Math.floor(counter.value);
        setDisplayValue(currentValue);

        // 各桁のアニメーション
        const valueString = currentValue.toString().padStart(digits, '0');
        valueString.split('').forEach((digit, index) => {
          const digitElement = digitRefs.current[index];
          if (digitElement) {
            const digitValue = parseInt(digit);
            gsap.set(digitElement, {
              y: -digitValue * 30 // 各数字の高さを30pxと仮定
            });
          }
        });
      }
    });

    return () => {
      animation?.kill();
    };
  }, [trigger, from, to, duration, digits]);

  return (
    <div className={`flex ${className}`}>
      {Array.from({ length: digits }).map((_, index) => (
        <div 
          key={index}
          className="relative w-8 h-10 overflow-hidden bg-black text-green-400 text-center font-mono text-xl"
          style={{ 
            borderRadius: '4px',
            margin: '0 1px'
          }}
        >
          <div 
            ref={el => digitRefs.current[index] = el}
            className="absolute inset-0 flex flex-col"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <div 
                key={num} 
                className="h-10 flex items-center justify-center"
                style={{ lineHeight: '40px' }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 統計表示用のアニメーション数値
export function StatCounter({ 
  value, 
  label,
  trigger = true,
  duration = 1.5,
  delay = 0,
  format = 'number',
  className = ''
}: {
  value: number;
  label: string;
  trigger?: boolean;
  duration?: number;
  delay?: number;
  format?: 'number' | 'percentage' | 'currency' | 'bytes';
  className?: string;
}) {
  const formatters = {
    number: (val: number) => val.toLocaleString(),
    percentage: (val: number) => `${val}%`,
    currency: (val: number) => `¥${val.toLocaleString()}`,
    bytes: (val: number) => {
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = val;
      let unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        <CountUpAnimation
          from={0}
          to={value}
          duration={duration}
          delay={delay}
          trigger={trigger}
          formatter={formatters[format]}
        />
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

// フック版
export function useCountUpAnimation() {
  const animateCount = (
    element: HTMLElement,
    from: number,
    to: number,
    options?: {
      duration?: number;
      formatter?: (value: number) => string;
      onComplete?: () => void;
    }
  ) => {
    const { duration = 1.5, formatter, onComplete } = options || {};
    const counter = { value: from };

    return gsap.to(counter, {
      value: to,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => {
        const currentValue = Math.floor(counter.value);
        element.textContent = formatter ? 
          formatter(currentValue) : 
          currentValue.toString();
      },
      onComplete
    });
  };

  const animateMultipleCounts = (
    elements: HTMLElement[],
    values: Array<{ from: number; to: number; formatter?: (value: number) => string }>,
    options?: {
      duration?: number;
      stagger?: number;
      onComplete?: () => void;
    }
  ) => {
    const { duration = 1.5, stagger = 0.2, onComplete } = options || {};
    const timeline = gsap.timeline({ onComplete });

    elements.forEach((element, index) => {
      const { from, to, formatter } = values[index] || { from: 0, to: 0 };
      const counter = { value: from };

      timeline.to(counter, {
        value: to,
        duration: duration,
        ease: "power2.out",
        onUpdate: () => {
          const currentValue = Math.floor(counter.value);
          element.textContent = formatter ? 
            formatter(currentValue) : 
            currentValue.toString();
        }
      }, index * stagger);
    });

    return timeline;
  };

  return { animateCount, animateMultipleCounts };
}