import { enums } from '@luca-financial/luca-schema';
import { v4 as uuidv4 } from 'uuid';

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

  const createNewEntity = (
    name = '',
    description = '',
    entityType = enums.EntityTypeEnum.ACCOUNT
  ) => {
    const entity = {
      id: uuidv4(),
      name,
      description,
      entityType,
      entityStatus: enums.EntityStatusEnum.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: null,
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
   * - actions: object
   */
}
