import { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  component: React.ComponentType<ToolProps>;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleDark: () => void;
}

export interface HistoryItem {
  toolId: string;
  input: string;
  output: string;
  timestamp: number;
}

export interface ToolProps {
  onHistoryAdd?: (item: Omit<HistoryItem, 'timestamp'>) => void;
}