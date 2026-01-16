import "@testing-library/jest-dom";
import { vi } from "vitest";

// Safe: Mock window.matchMedia for testing hooks that depend on it
// This is a standard test setup that doesn't affect production code
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
