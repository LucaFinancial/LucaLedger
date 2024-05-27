import { enums } from '@luca-financial/luca-schema';
import { useState } from 'react';

import SchemaDrivenTable from '@comp/schemaDrivenTable/SchemaDrivenTable';
import EntityDropdown from '@feat/entities/components/EntityDropdown';
import { ListTypeEnum } from '@store/schemaDrivenSlice';
import { useTransactions } from './hooks';

export default function TransactionsPage() {
  const { SchemasEnum } = enums;
  const { TRANSACTION } = SchemasEnum;
  const { actions } = useTransactions();
  const [payorId, setPayorId] = useState('');
  const [payeeId, setPayeeId] = useState('');

  const handleClickAddNewTransaction = () => {
    console.log('Add new transaction');
    actions.createNewTransaction(
      payorId,
      payeeId,
      'add a transaction description'
    );
  };

  return (
    <div>
      <h1>Transactions</h1>
      <button onClick={handleClickAddNewTransaction}>
        Add New Transaction
      </button>
      <EntityDropdown
        selectedEntity={payorId}
        setSelectedEntity={setPayorId}
      />
      <EntityDropdown
        selectedEntity={payeeId}
        setSelectedEntity={setPayeeId}
      />
      <SchemaDrivenTable
        schemaKey={TRANSACTION}
        listType={ListTypeEnum.MAIN}
        readOnly={false}
        displayIsValid={false}
      />
    </div>
  );
}
