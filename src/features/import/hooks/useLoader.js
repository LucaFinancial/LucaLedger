import { useEntities, useTransactions } from '@s/lucaSchema';

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
