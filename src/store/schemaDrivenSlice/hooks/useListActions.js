import { useDispatch } from 'react-redux';

import useLoadedListActions from './useLoadedListActions';
import useMainListActions from './useMainListActions';

export default function useListActions(sliceActions) {
  const dispatch = useDispatch();
  const { actions: mainActions } = useMainListActions(sliceActions);
  const { actions: loadedActions } = useLoadedListActions(sliceActions);

  const importAllItems = () => {
    dispatch(sliceActions.importLoadedItems({ requireIsSelected: false }));
  };

  const importSelectedItems = () => {
    dispatch(sliceActions.importLoadedItems({ requireIsSelected: true }));
  };

  const actions = {
    ...mainActions,
    ...loadedActions,
    importAllItems,
    importSelectedItems,
  };

  return { actions };
}
