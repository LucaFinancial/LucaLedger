import useMainListSelectors from './useMainListSelectors';
import useLoadedListSelectors from './useLoadedListSelectors';

import { ListTypeEnum } from '../index';

export default function useListSelectors(
  mainListSelectors,
  loadedListSelectors
) {
  const { selectors: mainSelectors } = useMainListSelectors(mainListSelectors);
  const { selectors: loadedSelectors } =
    useLoadedListSelectors(loadedListSelectors);

  const selectList = (listType) => {
    if (listType === ListTypeEnum.MAIN) {
      return mainSelectors.selectAllItems;
    } else if (listType === ListTypeEnum.LOADED) {
      return loadedSelectors.selectLoadedItems;
    }
  };

  const selectors = {
    ...mainSelectors,
    ...loadedSelectors,
    selectList,
  };

  return { selectors };
}
