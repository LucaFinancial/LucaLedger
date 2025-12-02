/**
 * Tests for Categories Redux Slice
 * Tests category state management actions and reducers
 */

import { describe, it, expect } from 'vitest';
import categoriesReducer, {
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
} from '@/store/categories/slice';
import { flatCategories } from '../fixtures';

describe('Categories Slice', () => {
  const initialState = [];

  describe('reducers', () => {
    describe('setCategories', () => {
      it('should replace all categories', () => {
        const state = categoriesReducer(
          initialState,
          setCategories(flatCategories)
        );

        expect(state).toHaveLength(flatCategories.length);
        expect(state[0].id).toBe(flatCategories[0].id);
      });

      it('should replace existing categories', () => {
        const existingCategories = [
          { id: 'old-cat', slug: 'old', name: 'Old', parentId: null },
        ];
        const state = categoriesReducer(
          existingCategories,
          setCategories(flatCategories)
        );

        expect(state).toHaveLength(flatCategories.length);
        expect(state.find((c) => c.id === 'old-cat')).toBeUndefined();
      });
    });

    describe('addCategory', () => {
      it('should add a new parent category', () => {
        const newCategory = {
          id: 'new-parent',
          slug: 'new-parent',
          name: 'New Parent',
          parentId: null,
        };
        const state = categoriesReducer(initialState, addCategory(newCategory));

        expect(state).toHaveLength(1);
        expect(state[0]).toEqual(newCategory);
      });

      it('should add a new child category', () => {
        const stateWithParent = [
          {
            id: 'parent-cat',
            slug: 'parent',
            name: 'Parent',
            parentId: null,
          },
        ];
        const childCategory = {
          id: 'child-cat',
          slug: 'child',
          name: 'Child',
          parentId: 'parent-cat',
        };
        const state = categoriesReducer(
          stateWithParent,
          addCategory(childCategory)
        );

        expect(state).toHaveLength(2);
        expect(state[1].parentId).toBe('parent-cat');
      });

      it('should append to existing categories', () => {
        const state = categoriesReducer(
          flatCategories,
          addCategory({
            id: 'new-cat',
            slug: 'new-cat',
            name: 'New Category',
            parentId: null,
          })
        );

        expect(state).toHaveLength(flatCategories.length + 1);
      });
    });

    describe('updateCategory', () => {
      it('should update existing category', () => {
        const state = categoriesReducer(
          flatCategories,
          updateCategory({
            id: flatCategories[0].id,
            slug: flatCategories[0].slug,
            name: 'Updated Name',
            parentId: null,
          })
        );

        expect(state[0].name).toBe('Updated Name');
      });

      it('should update slug', () => {
        const state = categoriesReducer(
          flatCategories,
          updateCategory({
            id: flatCategories[0].id,
            slug: 'updated-slug',
            name: flatCategories[0].name,
            parentId: null,
          })
        );

        expect(state[0].slug).toBe('updated-slug');
      });

      it('should not modify other categories', () => {
        const state = categoriesReducer(
          flatCategories,
          updateCategory({
            id: flatCategories[0].id,
            slug: 'updated',
            name: 'Updated',
            parentId: null,
          })
        );

        expect(state[1].name).toBe(flatCategories[1].name);
      });

      it('should do nothing if category not found', () => {
        const state = categoriesReducer(
          flatCategories,
          updateCategory({
            id: 'non-existent',
            slug: 'non-existent',
            name: 'Non Existent',
            parentId: null,
          })
        );

        expect(state).toHaveLength(flatCategories.length);
      });
    });

    describe('removeCategory', () => {
      it('should remove category by id', () => {
        const state = categoriesReducer(
          flatCategories,
          removeCategory(flatCategories[0].id)
        );

        expect(
          state.find((c) => c.id === flatCategories[0].id)
        ).toBeUndefined();
      });

      it('should also remove child categories', () => {
        // flatCategories[1] has parentId of flatCategories[0]
        const state = categoriesReducer(
          flatCategories,
          removeCategory(flatCategories[0].id)
        );

        // Parent and its child should both be removed
        expect(
          state.find((c) => c.id === flatCategories[0].id)
        ).toBeUndefined();
        expect(
          state.find((c) => c.parentId === flatCategories[0].id)
        ).toBeUndefined();
      });

      it('should not remove unrelated categories', () => {
        const state = categoriesReducer(
          flatCategories,
          removeCategory(flatCategories[0].id)
        );

        // flatCategories[2] has parentId null, should remain
        expect(state.find((c) => c.id === flatCategories[2].id)).toBeDefined();
      });

      it('should do nothing if category not found', () => {
        const state = categoriesReducer(
          flatCategories,
          removeCategory('non-existent')
        );

        expect(state).toHaveLength(flatCategories.length);
      });

      it('should handle removing child category only', () => {
        const state = categoriesReducer(
          flatCategories,
          removeCategory(flatCategories[1].id)
        );

        // Only the child should be removed
        expect(
          state.find((c) => c.id === flatCategories[1].id)
        ).toBeUndefined();
        expect(state.find((c) => c.id === flatCategories[0].id)).toBeDefined();
      });
    });
  });
});
