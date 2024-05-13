import { useEntities } from '@feat/entities/hooks';
import { useTransactions } from '@feat/transactions/hooks';

export default function useLoader() {
  const { loadEntities } = useEntities();
  const { loadTransactions } = useTransactions();

  const loadJsonData = (jsonData) => {
    if (jsonData.entities) {
      loadEntities(jsonData.entities);
    }
    if (jsonData.transactions) {
      loadTransactions(jsonData.transactions);
    }
  };

  return { loadJsonData };
}
