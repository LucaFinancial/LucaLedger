import { useDispatch } from 'react-redux';

import { useEntities } from '@store/lucaSchema';

export default function AddEntityButton() {
  const dispatch = useDispatch();
  const { actions, EntityTypeEnum } = useEntities();

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
