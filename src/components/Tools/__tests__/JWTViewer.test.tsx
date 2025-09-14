import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JWTViewer } from '../JWTViewer';
import { LanguageProvider } from '../../../contexts/LanguageContext';

const renderWithLanguage = (component: React.ReactElement, language: 'ja' | 'en' = 'ja') => {
  return render(
    <LanguageProvider defaultLanguage={language}>
      {component}
    </LanguageProvider>
  );
};

describe('JWTViewer', () => {
  const mockOnHistoryAdd = vi.fn();

  // Valid JWT token for testing
  const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  // JWT with exp claim for expiration testing
  const expiredJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDAwMDB9.invalid-signature';

  beforeEach(() => {
    mockOnHistoryAdd.mockClear();
  });

  it('renders correctly in Japanese', () => {
    renderWithLanguage(<JWTViewer onHistoryAdd={mockOnHistoryAdd} />);
    
    expect(screen.getByText('JWTトークンを入力してください')).toBeInTheDocument();
    expect(screen.getByText('サンプル生成')).toBeInTheDocument();
  });

  it('renders correctly in English', () => {
    renderWithLanguage(<JWTViewer onHistoryAdd={mockOnHistoryAdd} />, 'en');
    
    expect(screen.getByPlaceholderText('Enter JWT token')).toBeInTheDocument();
    expect(screen.getByText('Generate Sample')).toBeInTheDocument();
  });

  it('decodes valid JWT token', async () => {
    renderWithLanguage(<JWTViewer onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: validJWT } });

    await waitFor(() => {
      expect(screen.getByText('HS256')).toBeInTheDocument();
      expect(screen.getByText('JWT')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
    });
  });

  it('shows error for invalid JWT format', async () => {
    renderWithLanguage(<JWTViewer onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'invalid.jwt.token' } });

    await waitFor(() => {
      expect(screen.getByText(/無効なJWTフォーマットです/)).toBeInTheDocument();
    });
  });

  it('shows error for malformed JWT', async () => {
    renderWithLanguage(<JWTViewer onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'not-a-jwt' } });

    await waitFor(() => {
      expect(screen.getByText(/無効なJWTフォーマットです/)).toBeInTheDocument();
    });
  });

  it('generates sample JWT when button clicked', () => {
    renderWithLanguage(<JWTViewer onHistoryAdd={mockOnHistoryAdd} />);
    
    const generateButton = screen.getByText('サンプル生成');
    fireEvent.click(generateButton);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toContain('eyJ');
    expect(textarea.value.split('.').length).toBe(3);
  });

  it('clears JWT when clear button clicked', () => {
    renderWithLanguage(<JWTViewer onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: validJWT } });
    expect(textarea.value).toBe(validJWT);

    const clearButton = screen.getByRole('button', { name: /クリア/i });
    fireEvent.click(clearButton);

    expect(textarea.value).toBe('');
  });

  it('copies JWT to clipboard when copy button clicked', async () => {
    renderWithLanguage(<JWTViewer onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: validJWT } });

    const copyButton = screen.getByRole('button', { name: /コピー/i });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(validJWT);
  });

  it('shows formatted dates for timestamp claims', async () => {
    renderWithLanguage(<JWTViewer onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: expiredJWT } });

    await waitFor(() => {
      // Should show formatted date for iat and exp claims
      expect(screen.getByText(/2018/)).toBeInTheDocument();
    });
  });

  it('displays all three JWT parts (header, payload, signature)', async () => {
    renderWithLanguage(<JWTViewer onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: validJWT } });

    await waitFor(() => {
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Payload')).toBeInTheDocument();
      expect(screen.getByText('Signature')).toBeInTheDocument();
    });
  });

  it('handles empty input gracefully', () => {
    renderWithLanguage(<JWTViewer onHistoryAdd={mockOnHistoryAdd} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '' } });

    // Should not show any error or decoded sections for empty input
    expect(screen.queryByText('Header')).not.toBeInTheDocument();
    expect(screen.queryByText('Payload')).not.toBeInTheDocument();
    expect(screen.queryByText(/エラー/)).not.toBeInTheDocument();
  });
});