import { useEntities, useTransactions } from '@store/lucaSchema';

export default function useImport() {
  const { importEntities, importSelectedEntities } = useEntities();
  const { importTransactions, importSelectedTransactions } = useTransactions();

  const importAllItems = () => {
    importEntities();
    importTransactions();
  };

  const importSelectedItems = () => {
    importSelectedEntities();
    importSelectedTransactions();
  };

  return { importAllItems, importSelectedItems };
}
