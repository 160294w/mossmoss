import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryTabs } from '../CategoryTabs';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { Hash, Type, Code, Database, Zap, Wrench } from 'lucide-react';

const renderWithLanguage = (component: React.ReactElement, language: 'ja' | 'en' = 'ja') => {
  return render(
    <LanguageProvider defaultLanguage={language}>
      {component}
    </LanguageProvider>
  );
};

describe('CategoryTabs', () => {
  const mockOnCategoryChange = vi.fn();
  const mockCategories = [
    { id: 'all', nameKey: 'category.all', color: 'blue', icon: Hash },
    { id: 'text', nameKey: 'category.text', color: 'green', icon: Type },
    { id: 'development', nameKey: 'category.development', color: 'purple', icon: Code },
    { id: 'data', nameKey: 'category.data', color: 'orange', icon: Database },
    { id: 'generator', nameKey: 'category.generator', color: 'yellow', icon: Zap },
    { id: 'utility', nameKey: 'category.utility', color: 'red', icon: Wrench },
  ];

  const defaultToolCounts = { all: 25, text: 4, development: 6, data: 4, generator: 4, utility: 7 };

  beforeEach(() => {
    mockOnCategoryChange.mockClear();
  });

  it('renders without crashing', () => {
    renderWithLanguage(
      <CategoryTabs
        categories={mockCategories}
        selectedCategory="all"
        onCategoryChange={mockOnCategoryChange}
        toolCounts={defaultToolCounts}
      />
    );

    // Just check that buttons are rendered
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6);
  });

  it('shows tool counts', () => {
    renderWithLanguage(
      <CategoryTabs
        categories={mockCategories}
        selectedCategory="all"
        onCategoryChange={mockOnCategoryChange}
        toolCounts={defaultToolCounts}
      />
    );

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('calls onCategoryChange when clicked', () => {
    renderWithLanguage(
      <CategoryTabs
        categories={mockCategories}
        selectedCategory="all"
        onCategoryChange={mockOnCategoryChange}
        toolCounts={defaultToolCounts}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // Click second button (text category)

    expect(mockOnCategoryChange).toHaveBeenCalledWith('text');
  });

  it('handles empty categories array', () => {
    renderWithLanguage(
      <CategoryTabs
        categories={[]}
        selectedCategory="all"
        onCategoryChange={mockOnCategoryChange}
        toolCounts={{}}
      />
    );

    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('renders category icons', () => {
    const { container } = renderWithLanguage(
      <CategoryTabs
        categories={mockCategories}
        selectedCategory="all"
        onCategoryChange={mockOnCategoryChange}
        toolCounts={defaultToolCounts}
      />
    );

    // Check that SVG icons are rendered
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(6); // One for each category
  });
});