import { useDispatch } from 'react-redux';

export default function useMainListActions(sliceActions) {
  const dispatch = useDispatch();

  const addItem = (item) => dispatch(sliceActions.addMainItem(item));

  const actions = {
    addItem,
  };
  return { actions };
}
