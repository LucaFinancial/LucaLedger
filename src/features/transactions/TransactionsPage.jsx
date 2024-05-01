import { enums } from '@luca-financial/luca-schema';

import SchemaDrivenTable from '@comp/tables/SchemaDrivenTable';
import { ListTypeEnum } from '@store/schemaDrivenSlice';

export default function TransactionsPage() {
  const { SchemasEnum } = enums;
  const schemaKey = SchemasEnum.TRANSACTION;

  return (
    <div>
      <h1>Transactions</h1>
      <SchemaDrivenTable
        schemaKey={schemaKey}
        listType={ListTypeEnum.MAIN}
        readOnly={true}
        displayIsValid={false}
      />
    </div>
  );
}
