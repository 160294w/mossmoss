import { ReactNode } from 'react';
import { Button } from './UI/Button';
import { Card } from './UI/Card';
import { useLanguage } from '../contexts/LanguageContext';

interface ToolContainerProps {
  title: string;
  description: string;
  children: ReactNode;
  onBack: () => void;
}

export function ToolContainer({ title, description, children, onBack }: ToolContainerProps) {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-4xl mx-auto tool-container">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          ← {t('common.back')}
        </Button>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      
      <Card>
        {children}
      </Card>
    </div>
  );
}