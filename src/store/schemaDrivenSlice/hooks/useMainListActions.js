import { useDispatch } from 'react-redux';

export default function useMainListActions(sliceActions) {
  const dispatch = useDispatch();

  const addItem = (item) => dispatch(sliceActions.addMainItem(item));

  const updateItemById = (id, item) =>
    dispatch(sliceActions.updateMainItem({ id, item }));

  const actions = {
    addItem,
    updateItemById,
  };

  return { actions };
}
