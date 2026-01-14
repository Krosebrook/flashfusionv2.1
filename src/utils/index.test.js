import { describe, it, expect } from 'vitest'
import { createPageUrl } from '../utils/index'

/**
 * Tests for createPageUrl utility function
 * 
 * Safe: These tests validate existing working functionality without modifying it.
 * We're testing the exact behavior the app currently relies on.
 */
describe('createPageUrl', () => {
  it('should convert page name to lowercase URL', () => {
    // Test basic conversion
    expect(createPageUrl('Dashboard')).toBe('/dashboard')
    expect(createPageUrl('Analytics')).toBe('/analytics')
  })

  it('should replace spaces with hyphens', () => {
    // Test space handling - this is how the app creates URLs
    expect(createPageUrl('Agent Orchestration')).toBe('/agent-orchestration')
    expect(createPageUrl('Team Management')).toBe('/team-management')
    expect(createPageUrl('Brand Kit')).toBe('/brand-kit')
  })

  it('should handle multiple spaces', () => {
    // Test edge case with multiple spaces
    expect(createPageUrl('Test  Multiple   Spaces')).toBe('/test--multiple---spaces')
  })

  it('should handle single-word page names', () => {
    // Test simple case
    expect(createPageUrl('Home')).toBe('/home')
    expect(createPageUrl('Billing')).toBe('/billing')
  })

  it('should handle empty string', () => {
    // Test edge case
    expect(createPageUrl('')).toBe('/')
  })
})
