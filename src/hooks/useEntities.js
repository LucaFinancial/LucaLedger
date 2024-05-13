import { useSelector } from 'react-redux';

import { selectors } from '@/store/entities';

export default function useEntities() {
  const entities = useSelector(selectors.selectAllEntities);

  return { entities };
}
