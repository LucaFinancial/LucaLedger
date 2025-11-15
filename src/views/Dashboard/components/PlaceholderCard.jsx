import { Paper, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PropTypes from 'prop-types';

export default function PlaceholderCard({
  title,
  description,
  color = '#9e9e9e',
  backgroundColor = '#f5f5f5',
  borderColor = '#bdbdbd',
}) {
  return (
    <Paper
      sx={{
        p: 3,
        backgroundColor,
        border: `2px dashed ${borderColor}`,
        textAlign: 'center',
      }}
    >
      <InfoOutlinedIcon sx={{ fontSize: 40, color, mb: 1 }} />
      <Typography
        variant='h6'
        sx={{ color: 'text.secondary', mb: 1 }}
      >
        {title}
      </Typography>
      <Typography
        variant='body2'
        sx={{ color: 'text.secondary' }}
      >
        {description}
      </Typography>
    </Paper>
  );
}

PlaceholderCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  color: PropTypes.string,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string,
};
