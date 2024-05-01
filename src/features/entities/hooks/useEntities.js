import { enums } from '@luca-financial/luca-schema';

import { slices } from '@store';
import { useLucaSchemaPkg } from '@hook';
import { useListSlice } from '@store/schemaDrivenSlice';

export default function useEntities() {
  const { SchemasEnum } = enums;
  const { ENTITY } = SchemasEnum;
  const { actions, selectors } = useListSlice(slices, ENTITY);
  const entityPkg = useLucaSchemaPkg(ENTITY);

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

  const updateEntityById = (id, entity) => {
    actions.updateItemById(id, entity);
  };

  return {
    ...entityPkg,
    entities,
    loadedEntities,
    loadEntities,
    importEntities,
    importSelectedEntities,
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
