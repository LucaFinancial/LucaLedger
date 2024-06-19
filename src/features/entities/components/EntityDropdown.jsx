import PropTypes from 'prop-types';

import { useEntities } from '../hooks';

export default function EntityDropdown({ selectedEntity, setSelectedEntity }) {
  const { entities } = useEntities();

  const handleChange = (event) => {
    setSelectedEntity(event.target.value);
  };

  return (
    <select
      value={selectedEntity}
      onChange={handleChange}
    >
      <option value={null}>Select Entity</option>
      {entities.map((entity) => (
        <option
          key={entity.id}
          value={entity.id}
        >
          {entity.name}
        </option>
      ))}
    </select>
  );
}

EntityDropdown.propTypes = {
  selectedEntity: PropTypes.string,
  setSelectedEntity: PropTypes.func,
};
