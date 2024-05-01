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

  return {
    ...entityPkg,
    entities,
    loadedEntities,
    loadEntities,
    importEntities,
    importSelectedEntities,
  };
}
