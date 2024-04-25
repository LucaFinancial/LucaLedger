import { useDispatch } from 'react-redux';

import { EntityTypeEnum } from '@/store/constants';
import { actions } from '@/store/entities';

export default function AddEntityButton() {
  const dispatch = useDispatch();

  const handleAddEntity = () => {
    dispatch(
      actions.createNewEntity(
        EntityTypeEnum.ACCOUNT,
        'New entity',
        'add a description'
      )
    );
  };

  return <button onClick={handleAddEntity}>Add New Entity</button>;
}
