import { useDispatch } from 'react-redux';

export default function useLoadedListActions(sliceActions) {
  const dispatch = useDispatch();

  const loadItems = (items) => dispatch(sliceActions.addLoadedItems(items));

  const toggleIsSelected = (id, updatedItem) =>
    dispatch(
      sliceActions.updateLoadedItem({
        id,
        changes: updatedItem,
      })
    );

  const actions = {
    loadItems,
    toggleIsSelected,
  };
  return { actions };
}
