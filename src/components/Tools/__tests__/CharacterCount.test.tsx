import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCount } from '../CharacterCount';
import { LanguageProvider } from '../../../contexts/LanguageContext';

const renderWithLanguage = (component: React.ReactElement, language: 'ja' | 'en' = 'ja') => {
  return render(
    <LanguageProvider defaultLanguage={language}>
      {component}
    </LanguageProvider>
  );
};

describe('CharacterCount', () => {
  const mockOnHistoryAdd = vi.fn();

  beforeEach(() => {
    mockOnHistoryAdd.mockClear();
  });

  it('renders correctly in Japanese', () => {
    renderWithLanguage(<CharacterCount onHistoryAdd={mockOnHistoryAdd} />);
    
    expect(screen.getByText('テキストを入力してください')).toBeInTheDocument();
    expect(screen.getByText('文字数: 0')).toBeInTheDocument();
    expect(screen.getByText('バイト数: 0')).toBeInTheDocument();
    expect(screen.getByText('行数: 1')).toBeInTheDocument();
  });

  it('renders correctly in English', () => {
    renderWithLanguage(<CharacterCount onHistoryAdd={mockOnHistoryAdd} />, 'en');
    
    expect(screen.getByPlaceholderText('Enter text to count characters')).toBeInTheDocument();
    expect(screen.getByText('Characters: 0')).toBeInTheDocument();
    expect(screen.getByText('Bytes: 0')).toBeInTheDocument();
    expect(screen.getByText('Lines: 1')).toBeInTheDocument();
  });

  it('counts characters correctly', () => {
    renderWithLanguage(<CharacterCount onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello World' } });

    expect(screen.getByText('文字数: 11')).toBeInTheDocument();
    expect(screen.getByText('バイト数: 11')).toBeInTheDocument();
    expect(screen.getByText('行数: 1')).toBeInTheDocument();
  });

  it('counts Japanese characters correctly', () => {
    renderWithLanguage(<CharacterCount onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'こんにちは' } });

    expect(screen.getByText('文字数: 5')).toBeInTheDocument();
    expect(screen.getByText('バイト数: 15')).toBeInTheDocument(); // UTF-8 encoding: 3 bytes per Japanese char
    expect(screen.getByText('行数: 1')).toBeInTheDocument();
  });

  it('counts lines correctly', () => {
    renderWithLanguage(<CharacterCount onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2\nLine 3' } });

    expect(screen.getByText('文字数: 17')).toBeInTheDocument();
    expect(screen.getByText('行数: 3')).toBeInTheDocument();
  });

  it('handles empty input', () => {
    renderWithLanguage(<CharacterCount onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '' } });

    expect(screen.getByText('文字数: 0')).toBeInTheDocument();
    expect(screen.getByText('バイト数: 0')).toBeInTheDocument();
    expect(screen.getByText('行数: 1')).toBeInTheDocument();
  });

  it('shows detailed statistics when expanded', () => {
    renderWithLanguage(<CharacterCount onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello こんにちは 123' } });

    // Check if detailed statistics are visible
    expect(screen.getByText('文字数: 15')).toBeInTheDocument();
    expect(screen.getByText('バイト数: 21')).toBeInTheDocument();
  });

  it('copies text to clipboard when copy button is clicked', async () => {
    renderWithLanguage(<CharacterCount onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test text' } });

    const copyButton = screen.getByRole('button', { name: /コピー/i });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test text');
  });

  it('clears text when clear button is clicked', () => {
    renderWithLanguage(<CharacterCount onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Test text' } });
    expect(textarea.value).toBe('Test text');

    const clearButton = screen.getByRole('button', { name: /クリア/i });
    fireEvent.click(clearButton);

    expect(textarea.value).toBe('');
    expect(screen.getByText('文字数: 0')).toBeInTheDocument();
  });
});