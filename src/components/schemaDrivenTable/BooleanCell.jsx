import PropTypes from 'prop-types';

export default function BooleanCell(props) {
  const { value } = props;
  return <div>{value}</div>;
}

BooleanCell.propTypes = {
  value: PropTypes.bool.isRequired,
};
