import { slices } from '@s';
import { SchemaKeys, useSchemaConfig } from '@s/lucaSchema';
import { useListSlice } from '@s/schemaDrivenSlice';

export default function useEntities() {
  const { actions, selectors } = useListSlice(slices, SchemaKeys.ENTITY);
  const config = useSchemaConfig(SchemaKeys.ENTITY);

  const entities = selectors.selectItems;
  const loadedEntities = selectors.selectLoadedItems;

  const loadEntities = (entities) => {
    actions.loadItems(entities);
  };

  const importEntities = () => {
    actions.importAllItems();
  };

  const importSelectedEntities = () => {
    actions.importSelectedItems();
  };

  return {
    config,
    entities,
    loadedEntities,
    loadEntities,
    importEntities,
    importSelectedEntities,
  };
}
