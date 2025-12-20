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
  categoryMissingParentId,
  categoryEmptyId,
  categoryEmptyName,
  categoryInvalidSlug,
  categoryInvalidSlugUppercase,
} from '../fixtures';

describe('Category Validation', () => {
  describe('validateCategory', () => {
    describe('Valid Categories', () => {
      it('should validate a parent category (parentId null)', () => {
        const result = validateCategory(validParentCategory);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a parent category (flat parent entry)', () => {
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

      it('should reject category missing parentId', () => {
        const result = validateCategory(categoryMissingParentId);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('parentId is required');
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
      it('should validate a subcategory object with parentId set', () => {
        const subcategory = {
          id: 'test-child',
          slug: 'test-child',
          name: 'Test Child',
          parentId: 'test-parent',
        };
        const result = validateCategory(subcategory);
        expect(result.valid).toBe(true);
      });

      it('should validate multiple subcategory objects individually', () => {
        const subs = [
          {
            id: 'sub-1',
            slug: 'sub-one',
            name: 'Sub One',
            parentId: 'test-parent',
          },
          {
            id: 'sub-2',
            slug: 'sub-two',
            name: 'Sub Two',
            parentId: 'test-parent',
          },
          {
            id: 'sub-3',
            slug: 'sub-three',
            name: 'Sub Three',
            parentId: 'test-parent',
          },
        ];

        subs.forEach((s) => {
          const result = validateCategory(s);
          expect(result.valid).toBe(true);
        });
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
