import { LucideIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Category {
  id: string;
  nameKey: string;
  icon: LucideIcon;
  color: string;
}

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  toolCounts: Record<string, number>;
}

export function CategoryTabs({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  toolCounts 
}: CategoryTabsProps) {
  const { t } = useLanguage();

  const getColorStyles = (color: string, isSelected: boolean) => {
    const colorMap = {
      gray: isSelected 
        ? 'bg-gray-600 text-white border-gray-600' 
        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
      blue: isSelected 
        ? 'bg-blue-600 text-white border-blue-600' 
        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      green: isSelected 
        ? 'bg-green-600 text-white border-green-600' 
        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      purple: isSelected 
        ? 'bg-purple-600 text-white border-purple-600' 
        : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      orange: isSelected 
        ? 'bg-orange-600 text-white border-orange-600' 
        : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
      indigo: isSelected 
        ? 'bg-indigo-600 text-white border-indigo-600' 
        : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {categories.map(category => {
          const count = toolCounts[category.id] || 0;
          const isSelected = selectedCategory === category.id;
          const colorStyles = getColorStyles(category.color, isSelected);
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                inline-flex items-center px-4 py-2 rounded-full text-sm font-medium 
                transition-all duration-200 border
                ${colorStyles}
                ${isSelected ? 'shadow-md' : 'shadow-sm hover:shadow-md'}
              `}
            >
              <category.icon className="w-4 h-4 mr-2" />
              {t(category.nameKey)}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-black/10 text-current'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}