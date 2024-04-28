import { useEntities, useTransactions } from '@s/lucaSchema';

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
