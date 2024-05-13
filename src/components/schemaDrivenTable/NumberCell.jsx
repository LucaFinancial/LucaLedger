import PropTypes from 'prop-types';

export default function NumberCell(props) {
  const { value } = props;
  return <div>{value}</div>;
}

NumberCell.propTypes = {
  value: PropTypes.number.isRequired,
};
