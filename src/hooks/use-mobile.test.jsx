import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useIsMobile } from "../hooks/use-mobile";

/**
 * Tests for useIsMobile hook
 *
 * Safe: These tests validate existing working functionality without modifying it.
 * We're testing the mobile detection logic that's currently in use.
 */
describe("useIsMobile", () => {
  // Store original window.innerWidth
  let originalInnerWidth;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    // Restore original window size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("should return true for mobile screen width", async () => {
    // Set window width to mobile size (< 768px)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375, // iPhone size
    });

    const { result } = renderHook(() => useIsMobile());

    // Wait for effect to run
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("should return false for desktop screen width", async () => {
    // Set window width to desktop size (>= 768px)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024, // Desktop size
    });

    const { result } = renderHook(() => useIsMobile());

    // Wait for effect to run
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("should return false at exactly 768px breakpoint", async () => {
    // Test the breakpoint boundary
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("should return true at 767px (just below breakpoint)", async () => {
    // Test just below the breakpoint
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 767,
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
