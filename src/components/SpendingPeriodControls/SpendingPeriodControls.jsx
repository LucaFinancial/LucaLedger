import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import {
  AGGREGATE_PERIODS,
  CALENDAR_MONTHS,
  getSpendingSelectionDropdownValues,
} from '@/utils/spendingAnalytics';

export default function SpendingPeriodControls({
  activeSelection,
  availableYears,
  customRange,
  onAggregateChange,
  onMonthChange,
  onYearChange,
  onCustomStartChange,
  onCustomEndChange,
  showAggregateControls = true,
  showSelectionControls = true,
  showDateControls = true,
  inlineDateControls = false,
  dateTrailingControls = null,
  sx,
}) {
  const activeAggregate =
    activeSelection?.type === 'aggregate' ? activeSelection.value : null;
  const { month: activeMonth, year: activeYear } =
    getSpendingSelectionDropdownValues(activeSelection);
  const controlRowSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap',
  };
  const clearButtonSx = {
    position: 'absolute',
    top: '50%',
    right: 34,
    transform: 'translateY(-50%)',
    p: 0.25,
    opacity: 0,
    zIndex: 1,
    transition: 'opacity 0.15s ease',
  };
  const selectionControls = (
    <>
      {showAggregateControls && (
        <ToggleButtonGroup
          value={activeAggregate}
          exclusive
          onChange={onAggregateChange}
          size='small'
        >
          {AGGREGATE_PERIODS.map((period) => (
            <ToggleButton key={period.key} value={period.key}>
              {period.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}

      {showSelectionControls && (
        <>
          <Box
            sx={{
              position: 'relative',
              '&:hover .period-clear-button': {
                opacity: activeYear ? 1 : 0,
              },
            }}
          >
            <FormControl size='small' sx={{ minWidth: 110 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={activeYear}
                label='Year'
                onChange={onYearChange}
                displayEmpty
                sx={{
                  '& .MuiSelect-select': {
                    pr: activeYear ? 5 : undefined,
                  },
                }}
              >
                <MenuItem value=''>Year</MenuItem>
                {availableYears.map((yearValue) => (
                  <MenuItem key={yearValue} value={String(yearValue)}>
                    {yearValue}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {activeYear && (
              <IconButton
                className='period-clear-button'
                aria-label='Clear year'
                size='small'
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onYearChange({ target: { value: '' } });
                }}
                sx={clearButtonSx}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>

          <Box
            sx={{
              position: 'relative',
              '&:hover .period-clear-button': {
                opacity: activeMonth ? 1 : 0,
              },
            }}
          >
            <FormControl size='small' sx={{ minWidth: 170 }}>
              <InputLabel>Month</InputLabel>
              <Select
                value={activeMonth}
                label='Month'
                onChange={onMonthChange}
                displayEmpty
                sx={{
                  '& .MuiSelect-select': {
                    pr: activeMonth ? 5 : undefined,
                  },
                }}
              >
                <MenuItem value=''>Month</MenuItem>
                {CALENDAR_MONTHS.map((monthOption) => (
                  <MenuItem
                    key={monthOption.value}
                    value={monthOption.value}
                  >
                    {monthOption.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {activeMonth && (
              <IconButton
                className='period-clear-button'
                aria-label='Clear month'
                size='small'
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onMonthChange({ target: { value: '' } });
                }}
                sx={clearButtonSx}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        </>
      )}
    </>
  );
  const dateControls = (
    <>
      <DatePicker
        label='Start Date'
        value={customRange.startDate}
        onChange={onCustomStartChange}
        slotProps={{
          textField: {
            size: 'small',
            sx: {
              width: { xs: '100%', sm: 220 },
            },
          },
        }}
      />

      <DatePicker
        label='End Date'
        value={customRange.endDate}
        onChange={onCustomEndChange}
        minDate={customRange.startDate || undefined}
        slotProps={{
          textField: {
            size: 'small',
            sx: {
              width: { xs: '100%', sm: 220 },
            },
          },
        }}
      />
    </>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        ...sx,
      }}
    >
      {inlineDateControls ? (
        <Box sx={controlRowSx}>
          {(showAggregateControls || showSelectionControls) && selectionControls}
          {showDateControls && dateControls}
          {showDateControls && dateTrailingControls}
        </Box>
      ) : (
        <>
          {(showAggregateControls || showSelectionControls) && (
            <Box sx={controlRowSx}>{selectionControls}</Box>
          )}

          {showDateControls && (
            <Box sx={controlRowSx}>
              {dateControls}
              {dateTrailingControls}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
