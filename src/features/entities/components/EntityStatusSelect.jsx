import { Select, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';

import { EntityStatusEnum } from '@/store/constants';

const EntityStatusSelect = ({ entityStatus, onChange }) => {
  return (
    <Select
      value={entityStatus}
      onChange={(e) => onChange(e.target.value)}
    >
      {Object.keys(EntityStatusEnum).map((statusKey) => (
        <MenuItem
          key={EntityStatusEnum[statusKey]}
          value={EntityStatusEnum[statusKey]}
        >
          {EntityStatusEnum[statusKey]}
        </MenuItem>
      ))}
    </Select>
  );
};

EntityStatusSelect.propTypes = {
  entityStatus: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default EntityStatusSelect;
