import { enums } from '@luca-financial/luca-schema';
import { v4 as uuidv4 } from 'uuid';

import { useLucaSchemaPkg } from '@hooks';
import { slices } from '@store';
import { useListSlice } from '@store/schemaDrivenSlice';

export default function useTransactions() {
  const { SchemasEnum } = enums;
  const { TRANSACTION } = SchemasEnum;
  const { actions: listActions, selectors } = useListSlice(slices, TRANSACTION);
  const transactionPkg = useLucaSchemaPkg(TRANSACTION);

  const transactions = selectors.selectAllItems;
  const loadedTransactions = selectors.selectLoadedItems;

  const createNewTransaction = (payorId, payeeId, description = '') => {
    console.log('Add new transaction');
    console.log('description:', description);
    const transaction = {
      id: uuidv4(),
      payorId,
      payeeId,
      categoryId: null,
      amount: 0.0,
      date: new Date().toISOString().split('T')[0],
      description,
      transactionState: enums.TransactionStateEnum.PLANNED,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    console.log('transaction:', transaction);
    listActions.addItem(transaction);
  };

  const loadTransactions = (transactions) => {
    listActions.loadItems(transactions);
  };

  const importTransactions = () => {
    listActions.importAllItems();
  };

  const importSelectedTransactions = () => {
    listActions.importSelectedItems();
  };

  const updateTransactionById = (id, transaction) => {
    listActions.updateItemById(id, transaction);
  };

  const actions = {
    createNewTransaction,
    loadTransactions,
    importTransactions,
    importSelectedTransactions,
    updateTransactionById,
  };

  return {
    ...transactionPkg,
    transactions,
    loadedTransactions,
    actions,
  };
}

/**
 * Returns an object with the following properties:
 * - title: string
 * - description: string
 * - schema: object
 * - validator: object
 * - columns: array
 * - transactions: array
 * - loadedTransactions: array
 * - actions: object
 */
