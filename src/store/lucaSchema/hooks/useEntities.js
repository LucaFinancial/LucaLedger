import { slices } from '@store';
import { useLucaSchema } from '@store/lucaSchema';
import { useListSlice } from '@store/schemaDrivenSlice';

const ENTITY_SCHEMA_KEY = 'entity';

export default function useEntities() {
  const { actions, selectors } = useListSlice(slices, ENTITY_SCHEMA_KEY);
  const config = useLucaSchema(ENTITY_SCHEMA_KEY);

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
