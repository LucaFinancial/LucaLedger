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

  console.log('slice actions', sliceActions);

  const { loading, error } = useSelector(sliceSelector);
  const { actions } = useListActions(sliceActions);
  const { selectors } = useListSelectors(
    mainListSelectors,
    loadedListSelectors
  );

  console.log('actions', actions);

  return {
    loading,
    error,
    actions,
    selectors,
  };
}
