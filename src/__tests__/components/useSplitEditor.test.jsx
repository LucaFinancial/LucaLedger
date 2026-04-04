import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer as transactionSplitsReducer } from '@/store/transactionSplits';
import { useSplitEditor } from '@/components/SplitEditorModal/hooks/useSplitEditor';

const transaction = {
  id: '11111111-1111-1111-1111-111111111111',
  amount: -2500,
  categoryId: '22222222-2222-2222-2222-222222222222',
};

describe('useSplitEditor', () => {
  let container = null;
  let root = null;

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
      root = null;
    }

    if (container) {
      container.remove();
      container = null;
    }
  });

  it('preserves local split edits while the modal is open', async () => {
    const store = configureStore({
      reducer: {
        transactionSplits: transactionSplitsReducer,
      },
    });

    let latestHookState = null;

    function TestComponent() {
      latestHookState = useSplitEditor(true, transaction);
      return null;
    }

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root.render(
        <Provider store={store}>
          <TestComponent />
        </Provider>,
      );
    });

    expect(latestHookState.splits).toHaveLength(1);

    await act(async () => {
      latestHookState.handleAddSplit();
    });

    expect(latestHookState.splits).toHaveLength(2);
    expect(latestHookState.splits[0].amount).toBe(2500);
    expect(latestHookState.splits[1].amount).toBe(0);
    expect(latestHookState.amountInputs[latestHookState.splits[0].id]).toBe(
      '25.00',
    );
    expect(latestHookState.amountInputs[latestHookState.splits[1].id]).toBe('');
  });

  it('preserves partial decimal input while updating numeric cents', async () => {
    const store = configureStore({
      reducer: {
        transactionSplits: transactionSplitsReducer,
      },
    });

    let latestHookState = null;

    function TestComponent() {
      latestHookState = useSplitEditor(true, transaction);
      return null;
    }

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root.render(
        <Provider store={store}>
          <TestComponent />
        </Provider>,
      );
    });

    const splitId = latestHookState.splits[0].id;

    await act(async () => {
      latestHookState.handleAmountChange(splitId, '12.');
    });

    expect(latestHookState.amountInputs[splitId]).toBe('12.');
    expect(latestHookState.splits[0].amount).toBe(1200);

    await act(async () => {
      latestHookState.handleAmountChange(splitId, '.5');
    });

    expect(latestHookState.amountInputs[splitId]).toBe('.5');
    expect(latestHookState.splits[0].amount).toBe(50);
  });
});
