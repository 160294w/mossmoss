import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JSONFormatter } from '../JSONFormatter';
import { LanguageProvider } from '../../../contexts/LanguageContext';

const renderWithLanguage = (component: React.ReactElement, language: 'ja' | 'en' = 'ja') => {
  return render(
    <LanguageProvider defaultLanguage={language}>
      {component}
    </LanguageProvider>
  );
};

describe('JSONFormatter', () => {
  const mockOnHistoryAdd = vi.fn();

  const validJSON = '{"name":"John","age":30,"city":"Tokyo"}';
  const formattedJSON = `{
  "name": "John",
  "age": 30,
  "city": "Tokyo"
}`;

  beforeEach(() => {
    mockOnHistoryAdd.mockClear();
  });

  it('renders correctly in Japanese', () => {
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />);
    
    expect(screen.getByText('JSONを入力してください')).toBeInTheDocument();
    expect(screen.getByText('整形')).toBeInTheDocument();
    expect(screen.getByText('圧縮')).toBeInTheDocument();
  });

  it('renders correctly in English', () => {
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />, 'en');
    
    expect(screen.getByPlaceholderText('Enter JSON to format')).toBeInTheDocument();
    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.getByText('Minify')).toBeInTheDocument();
  });

  it('formats JSON correctly', async () => {
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: validJSON } });

    const formatButton = screen.getByText('整形');
    fireEvent.click(formatButton);

    await waitFor(() => {
      expect(textarea.value).toContain('  "name": "John"');
      expect(textarea.value).toContain('  "age": 30');
      expect(textarea.value).toContain('  "city": "Tokyo"');
    });
  });

  it('minifies JSON correctly', async () => {
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: formattedJSON } });

    const minifyButton = screen.getByText('圧縮');
    fireEvent.click(minifyButton);

    await waitFor(() => {
      expect(textarea.value).toBe(validJSON);
      expect(textarea.value).not.toContain('  ');
      expect(textarea.value).not.toContain('\n');
    });
  });

  it('shows validation status for valid JSON', async () => {
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: validJSON } });

    await waitFor(() => {
      expect(screen.getByText('有効なJSON')).toBeInTheDocument();
      expect(screen.getByText(/サイズ:/)).toBeInTheDocument();
    });
  });

  it('shows validation status for invalid JSON', async () => {
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"invalid": json}' } });

    await waitFor(() => {
      expect(screen.getByText(/構文エラー/)).toBeInTheDocument();
    });
  });

  it('handles empty input gracefully', () => {
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '' } });

    // Should not show validation status for empty input
    expect(screen.queryByText('有効なJSON')).not.toBeInTheDocument();
    expect(screen.queryByText(/構文エラー/)).not.toBeInTheDocument();
  });

  it('copies JSON to clipboard when copy button clicked', async () => {
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: validJSON } });

    const copyButton = screen.getByRole('button', { name: /コピー/i });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(validJSON);
  });

  it('clears JSON when clear button clicked', () => {
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: validJSON } });
    expect(textarea.value).toBe(validJSON);

    const clearButton = screen.getByRole('button', { name: /クリア/i });
    fireEvent.click(clearButton);

    expect(textarea.value).toBe('');
  });

  it('shows size statistics correctly', async () => {
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: validJSON } });

    await waitFor(() => {
      expect(screen.getByText(/サイズ: 38 バイト/)).toBeInTheDocument();
    });
  });

  it('disables format/minify buttons for invalid JSON', async () => {
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"invalid": json}' } });

    await waitFor(() => {
      const formatButton = screen.getByText('整形');
      const minifyButton = screen.getByText('圧縮');
      
      expect(formatButton).toBeDisabled();
      expect(minifyButton).toBeDisabled();
    });
  });

  it('processes complex nested JSON', async () => {
    const complexJSON = '{"users":[{"name":"John","details":{"age":30,"address":{"city":"Tokyo","country":"Japan"}}}]}';
    
    renderWithLanguage(<JSONFormatter onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: complexJSON } });

    const formatButton = screen.getByText('整形');
    fireEvent.click(formatButton);

    await waitFor(() => {
      expect(textarea.value).toContain('  "users": [');
      expect(textarea.value).toContain('    {');
      expect(textarea.value).toContain('      "name": "John"');
    });
  });
});