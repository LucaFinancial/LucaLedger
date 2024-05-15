import PropTypes from 'prop-types';

export default function CheckboxCell(props) {
  const { value } = props;
  return <div>{value}</div>;
}

CheckboxCell.propTypes = {
  value: PropTypes.bool.isRequired,
};
