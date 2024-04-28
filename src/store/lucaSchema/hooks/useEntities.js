import { slices } from '@store';
import { constants, useLucaSchema } from '@store/lucaSchema';
import { useListSlice } from '@store/schemaDrivenSlice';

export default function useEntities() {
  const { actions, selectors } = useListSlice(
    slices,
    constants.SchemaKeys.ENTITY
  );
  const config = useLucaSchema(constants.SchemaKeys.ENTITY);

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
