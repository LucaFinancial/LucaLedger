import SchemaDrivenTable from '@c/tables/SchemaDrivenTable';
import { SchemaKeys, useEntities } from '@s/lucaSchema';
import { ListTypeEnum } from '@s/schemaDrivenSlice';
import AddEntityButton from './components/AddEntityButton';

export default function EntitiesPage() {
  const schemaKey = SchemaKeys.ENTITY;
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
