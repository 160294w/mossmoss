import { gsap } from 'gsap';
import { Tool } from '../types';
import { Card } from './UI/Card';
import { useGSAP } from '../hooks/useGSAP';

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
}

export function ToolCard({ tool, onClick }: ToolCardProps) {
  const cardRef = useGSAP<HTMLDivElement>(() => {
    const card = cardRef.current;
    if (!card) return;

    // ホバー時のアニメーション
    const handleMouseEnter = () => {
      gsap.to(card, { 
        scale: 1.05, 
        y: -5,
        duration: 0.3, 
        ease: "power2.out" 
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, { 
        scale: 1, 
        y: 0,
        duration: 0.3, 
        ease: "power2.out" 
      });
    };

    // クリック時のアニメーション（遷移効果付き）
    const handleClick = () => {
      // カードを少し縮小して目立たせる
      gsap.to(card, { 
        scale: 0.95, 
        duration: 0.1, 
        ease: "power2.out",
        onComplete: () => {
          // フェードアウト効果
          gsap.to(card, {
            scale: 1.1,
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              onClick();
            }
          });
        }
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('click', handleClick);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('click', handleClick);
    };
  }, [onClick]);

  return (
    <div ref={cardRef}>
      <Card className="text-center cursor-pointer h-48 flex flex-col justify-between">
        <div className="flex flex-col items-center flex-1">
          <div className="mb-4 flex justify-center">
            <tool.icon size={48} className={`${tool.iconColor || 'text-blue-500'} dark:opacity-90`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {tool.name}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
          {tool.description}
        </p>
      </Card>
    </div>
  );
}