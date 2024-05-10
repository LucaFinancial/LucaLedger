import { useEntities } from '@feat/entities/hooks';
import { useTransactions } from '@feat/transactions/hooks';

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
