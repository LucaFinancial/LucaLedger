import { useEntities } from '../hooks';

export default function AddEntityButton() {
  const { actions } = useEntities();

  const handleClickAddNewEntity = () => {
    actions.createNewEntity('New entity', 'add a description');
  };

  return <button onClick={handleClickAddNewEntity}>Add New Entity</button>;
}
