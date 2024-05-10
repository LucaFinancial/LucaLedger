import { enums } from '@luca-financial/luca-schema';

import SchemaDrivenTable from '@comp/schemaDrivenTable/SchemaDrivenTable';
import { ListTypeEnum } from '@store/schemaDrivenSlice';
import AddEntityButton from './components/AddEntityButton';

export default function EntitiesPage() {
  const { SchemasEnum } = enums;
  const schemaKey = SchemasEnum.ENTITY;

  return (
    <div>
      <h1>Entities Management</h1>
      <AddEntityButton />
      <SchemaDrivenTable
        schemaKey={schemaKey}
        listType={ListTypeEnum.MAIN}
        readOnly={false}
        displayIsValid={false}
      />
    </div>
  );
}
