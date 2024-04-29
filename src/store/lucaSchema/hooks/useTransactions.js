import { slices } from '@store';
import { useListSlice } from '@store/schemaDrivenSlice';

const TRANSACTION_SCHEMA_KEY = 'transaction';

export default function useTransactions() {
  const { actions, selectors } = useListSlice(slices, TRANSACTION_SCHEMA_KEY);
  const transactions = selectors.selectItems;
  const loadedTransactions = selectors.selectLoadedItems;

  const loadTransactions = (entities) => {
    actions.loadItems(entities);
  };

  const importTransactions = () => {
    actions.importAllItems();
  };

  const importSelectedTransactions = () => {
    actions.importSelectedItems();
  };

  return {
    transactions,
    loadedTransactions,
    loadTransactions,
    importTransactions,
    importSelectedTransactions,
  };
}
