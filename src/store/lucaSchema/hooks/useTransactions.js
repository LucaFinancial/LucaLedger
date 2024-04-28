import { slices } from '@store';
import { constants } from '@store/lucaSchema';
import { useListSlice } from '@store/schemaDrivenSlice';

export default function useTransactions() {
  const { actions, selectors } = useListSlice(
    slices,
    constants.SchemaKeys.TRANSACTION
  );
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
