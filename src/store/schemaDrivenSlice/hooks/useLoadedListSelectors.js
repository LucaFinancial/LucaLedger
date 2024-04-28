import { useSelector } from 'react-redux';

export default function useLoadedListSelectors(loadedListSelectors) {
  const selectLoadedItems = useSelector(loadedListSelectors.selectAll);

  const selectors = {
    selectLoadedItems,
  };

  return { selectors };
}
