import { enums } from '@luca-financial/luca-schema';

import SchemaDrivenTable from '@comp/tables/SchemaDrivenTable';
import { useEntities } from '@store/lucaSchema';
import { ListTypeEnum } from '@store/schemaDrivenSlice';
import AddEntityButton from './components/AddEntityButton';

export default function EntitiesPage() {
  console.log('EntitiesPage', enums);
  const { SchemasEnum } = enums;
  const schemaKey = SchemasEnum.ENTITY;
  const { config } = useEntities();

  console.log('Entities', config);

  return (
    <div>
      <h1>Entities Management</h1>
      <AddEntityButton />
      <SchemaDrivenTable
        schemaKey={schemaKey}
        listType={ListTypeEnum.MAIN}
        readOnly={true}
        displayIsValid={false}
      />
    </div>
  );
}
