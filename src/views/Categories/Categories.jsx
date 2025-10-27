import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import config from '@/config';
import CategoryTotals from './CategoryTotals';

export default function Categories() {
  const categories = config.categories || [];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography
        variant='h4'
        sx={{ mb: 3 }}
      >
        Categories
      </Typography>

      {/* Search/Filter Placeholder */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          border: '1px dashed rgba(25, 118, 210, 0.5)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            fullWidth
            placeholder='Search categories...'
            disabled
            variant='outlined'
            size='small'
          />
          <Chip
            label='Coming Soon'
            color='primary'
            variant='outlined'
          />
        </Box>
        <Typography
          variant='caption'
          sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}
        >
          Search/Filter feature coming soon
        </Typography>
      </Paper>

      {/* Categories List */}
      <Box sx={{ mb: 3 }}>
        {categories.map((category) => (
          <Accordion
            key={category.id}
            defaultExpanded={false}
            sx={{ mb: 1 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${category.slug}-content`}
              id={`${category.slug}-header`}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  width: '100%',
                }}
              >
                <Typography
                  variant='h6'
                  component='h2'
                >
                  {category.name}
                </Typography>
                <Chip
                  label={`${category.subcategories.length} ${
                    category.subcategories.length === 1
                      ? 'subcategory'
                      : 'subcategories'
                  }`}
                  size='small'
                  variant='outlined'
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* Category Totals */}
              <CategoryTotals category={category} />

              {/* Subcategories List */}
              {category.subcategories.length > 0 ? (
                <List sx={{ pl: 2 }}>
                  {category.subcategories.map((subcategory) => (
                    <ListItem
                      key={subcategory.id}
                      sx={{
                        py: 1,
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        mb: 0.5,
                      }}
                    >
                      <ListItemText
                        primary={subcategory.name}
                        primaryTypographyProps={{
                          variant: 'body1',
                          color: 'text.secondary',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography
                  variant='body2'
                  sx={{ pl: 2, fontStyle: 'italic', color: 'text.secondary' }}
                >
                  No subcategories
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
