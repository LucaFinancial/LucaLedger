import { useDispatch } from 'react-redux';

export default function useMainListActions(sliceActions) {
  const dispatch = useDispatch();

  const addItem = (item) => dispatch(sliceActions.addMainItem(item));

  const updateItemById = (id, changes) =>
    dispatch(sliceActions.updateMainItem({ id, changes }));

  const actions = {
    addItem,
    updateItemById,
  };

  return { actions };
}
