import { useSelector } from 'react-redux';

import useListActions from './useListActions';
import useListSelectors from './useListSelectors';

export default function useListSlice(slices, sliceName) {
  const {
    sliceActions,
    sliceSelector,
    mainListSelectors,
    loadedListSelectors,
  } = slices[sliceName];

  const { loading, error } = useSelector(sliceSelector);
  const { actions } = useListActions(sliceActions);
  const { selectors } = useListSelectors(
    mainListSelectors,
    loadedListSelectors
  );

  return {
    loading,
    error,
    actions,
    selectors,
  };
}
