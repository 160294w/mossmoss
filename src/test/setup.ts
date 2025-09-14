import '@testing-library/jest-dom';

// Mock GSAP for tests
vi.mock('gsap', () => ({
  default: {
    from: vi.fn(),
    to: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => ({
      from: vi.fn(),
      to: vi.fn(),
      set: vi.fn(),
    })),
  },
  gsap: {
    from: vi.fn(),
    to: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => ({
      from: vi.fn(),
      to: vi.fn(),
      set: vi.fn(),
    })),
  },
}));

// Mock QRCode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mock')),
  },
}));

// Mock Clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);