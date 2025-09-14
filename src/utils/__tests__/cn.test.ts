import { cn } from '../cn';

describe('cn utility function', () => {
  it('combines multiple class names', () => {
    const result = cn('class1', 'class2', 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles conditional class names', () => {
    const condition = true;
    const result = cn('base-class', condition && 'conditional-class');
    expect(result).toBe('base-class conditional-class');
  });

  it('filters out falsy values', () => {
    const result = cn('class1', false, null, undefined, 'class2', '', 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('merges conflicting Tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });

  it('handles arrays of class names', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles objects with conditional classes', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true,
    });
    expect(result).toBe('class1 class3');
  });

  it('preserves important modifiers', () => {
    const result = cn('text-red-500', '!text-blue-500');
    expect(result).toBe('!text-blue-500');
  });

  it('handles responsive prefixes correctly', () => {
    const result = cn('text-sm', 'md:text-lg', 'lg:text-xl');
    expect(result).toBe('text-sm md:text-lg lg:text-xl');
  });

  it('handles hover and focus states', () => {
    const result = cn('bg-blue-500', 'hover:bg-blue-600', 'focus:bg-blue-700');
    expect(result).toBe('bg-blue-500 hover:bg-blue-600 focus:bg-blue-700');
  });

  it('merges conflicting background colors', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('merges conflicting text colors', () => {
    const result = cn('text-gray-500', 'text-black');
    expect(result).toBe('text-black');
  });

  it('handles dark mode variants', () => {
    const result = cn('bg-white', 'dark:bg-gray-800');
    expect(result).toBe('bg-white dark:bg-gray-800');
  });

  it('handles multiple responsive breakpoints for same property', () => {
    const result = cn('w-full', 'sm:w-1/2', 'md:w-1/3', 'lg:w-1/4');
    expect(result).toBe('w-full sm:w-1/2 md:w-1/3 lg:w-1/4');
  });

  it('handles complex real-world scenario', () => {
    const isActive = true;
    const isDisabled = false;
    const variant = 'primary';

    const result = cn(
      'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md',
      {
        'bg-blue-600 hover:bg-blue-700 text-white': variant === 'primary',
        'bg-gray-600 hover:bg-gray-700 text-white': variant === 'secondary',
        'ring-2 ring-blue-500': isActive,
        'opacity-50 cursor-not-allowed': isDisabled,
      },
      'transition-colors duration-200'
    );

    expect(result).toContain('inline-flex items-center px-4 py-2');
    expect(result).toContain('bg-blue-600 hover:bg-blue-700 text-white');
    expect(result).toContain('ring-2 ring-blue-500');
    expect(result).toContain('transition-colors duration-200');
    expect(result).not.toContain('opacity-50 cursor-not-allowed');
  });
});