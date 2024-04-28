import { useSelector } from 'react-redux';

export default function useMainListSelectors(mainListSelectors) {
  const selectAllItems = useSelector(mainListSelectors.selectAll);
  const selectItemById = useSelector(mainListSelectors.selectById);
  const selectItemsById = useSelector(mainListSelectors.selectIds);

  const selectors = {
    selectAllItems,
    selectItemById,
    selectItemsById,
  };

  return { selectors };
}
