import { enums } from '@luca-financial/luca-schema';

import { slices } from '@store';
import { useLucaSchemaPkg } from '@hooks';
import { useListSlice } from '@store/schemaDrivenSlice';

export default function useEntities() {
  const { SchemasEnum } = enums;
  const { ENTITY } = SchemasEnum;
  const { actions: listActions, selectors } = useListSlice(slices, ENTITY);
  const entityPkg = useLucaSchemaPkg(ENTITY);

  const entities = selectors.selectItems;
  const loadedEntities = selectors.selectLoadedItems;

  const createNewEntity = (type, title, description) => {
    const entity = {
      title,
      description,
      type,
    };
    listActions.addItem(entity);
  };

  const loadEntities = (entities) => {
    listActions.loadItems(entities);
  };

  const importEntities = () => {
    listActions.importAllItems();
  };

  const importSelectedEntities = () => {
    listActions.importSelectedItems();
  };

  const updateEntityById = (id, entity) => {
    listActions.updateItemById(id, entity);
  };

  const actions = {
    createNewEntity,
    loadEntities,
    importEntities,
    importSelectedEntities,
    updateEntityById,
  };

  return {
    ...entityPkg,
    entities,
    loadedEntities,
    actions,
  };

  /**
   * Returns an object with the following properties:
   * - title: string
   * - description: string
   * - schema: object
   * - validator: object
   * - columns: array
   * - entities: array
   * - loadedEntities: array
   * - loadEntities: function
   * - importEntities: function
   * - importSelectedEntities: function
   */
}
