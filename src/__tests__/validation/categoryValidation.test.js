/**
 * Tests for Category Validation Schemas
 * Tests category validation including parent and subcategory structures
 */

import { describe, it, expect } from 'vitest';
import { validateCategory, validateCategorySync } from '@/validation/validator';
import {
  validParentCategory,
  validCategoryWithSubcategories,
  categoryMissingId,
  categoryMissingSlug,
  categoryMissingName,
  categoryMissingSubcategories,
  categoryEmptyId,
  categoryEmptyName,
  categoryInvalidSlug,
  categoryInvalidSlugUppercase,
} from '../fixtures';

describe('Category Validation', () => {
  describe('validateCategory', () => {
    describe('Valid Categories', () => {
      it('should validate a parent category with empty subcategories', () => {
        const result = validateCategory(validParentCategory);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a category with subcategories', () => {
        const result = validateCategory(validCategoryWithSubcategories);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Invalid Categories', () => {
      it('should reject category missing id', () => {
        const result = validateCategory(categoryMissingId);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('id is required');
      });

      it('should reject category missing slug', () => {
        const result = validateCategory(categoryMissingSlug);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('slug is required');
      });

      it('should reject category missing name', () => {
        const result = validateCategory(categoryMissingName);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('name is required');
      });

      it('should reject category missing subcategories array', () => {
        const result = validateCategory(categoryMissingSubcategories);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('subcategories is required');
      });

      it('should reject category with empty id', () => {
        const result = validateCategory(categoryEmptyId);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('id must not be empty');
      });

      it('should reject category with empty name', () => {
        const result = validateCategory(categoryEmptyName);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('name must not be empty');
      });

      it('should reject category with invalid slug format (spaces)', () => {
        const result = validateCategory(categoryInvalidSlug);
        expect(result.valid).toBe(false);
        // Slug pattern validation should fail
      });

      it('should reject category with invalid slug format (uppercase)', () => {
        const result = validateCategory(categoryInvalidSlugUppercase);
        expect(result.valid).toBe(false);
        // Slug pattern validation should fail
      });
    });

    describe('Subcategory Validation', () => {
      it('should validate subcategory within parent category', () => {
        const category = {
          id: 'test-parent',
          slug: 'test-parent',
          name: 'Test Parent',
          subcategories: [
            {
              id: 'test-child',
              slug: 'test-child',
              name: 'Test Child',
            },
          ],
        };
        const result = validateCategory(category);
        expect(result.valid).toBe(true);
      });

      it('should validate multiple subcategories', () => {
        const category = {
          id: 'test-parent',
          slug: 'multi-sub-parent',
          name: 'Multi Sub Parent',
          subcategories: [
            { id: 'sub-1', slug: 'sub-one', name: 'Sub One' },
            { id: 'sub-2', slug: 'sub-two', name: 'Sub Two' },
            { id: 'sub-3', slug: 'sub-three', name: 'Sub Three' },
          ],
        };
        const result = validateCategory(category);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validateCategorySync', () => {
    it('should return category when valid', () => {
      const result = validateCategorySync(validParentCategory);
      expect(result.id).toBe(validParentCategory.id);
    });

    it('should throw error when invalid', () => {
      expect(() => {
        validateCategorySync(categoryMissingId);
      }).toThrow('id is required');
    });

    it('should include all errors in thrown error', () => {
      try {
        validateCategorySync(categoryMissingId);
      } catch (error) {
        expect(error.errors).toBeDefined();
        expect(error.errors).toContain('id is required');
      }
    });
  });
});
