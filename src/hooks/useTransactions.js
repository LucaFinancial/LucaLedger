import { useSelector } from 'react-redux';

import { selectors } from '@/store/transactions';

export default function useTransactions() {
  const transactions = useSelector(selectors.selectAllTransactions);
  return { transactions };
}
