import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parse } from 'date-fns';

import { AGGREGATE_PERIODS } from '@/utils/spendingAnalytics';

export default function SpendingPeriodControls({
  activeSelection,
  availableMonths,
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
  sx,
}) {
  const activeAggregate =
    activeSelection?.type === 'aggregate' ? activeSelection.value : null;
  const activeMonth =
    activeSelection?.type === 'month' ? activeSelection.value : '';
  const activeYear =
    activeSelection?.type === 'year' ? activeSelection.value : '';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        ...sx,
      }}
    >
      {(showAggregateControls || showSelectionControls) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
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
              <FormControl size='small' sx={{ minWidth: 170 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={activeMonth}
                  label='Month'
                  onChange={onMonthChange}
                  displayEmpty
                >
                  <MenuItem value=''>Month</MenuItem>
                  {availableMonths.map((monthValue) => (
                    <MenuItem key={monthValue} value={monthValue}>
                      {format(
                        parse(monthValue, 'yyyy-MM', new Date()),
                        'MMMM yyyy',
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size='small' sx={{ minWidth: 110 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={activeYear}
                  label='Year'
                  onChange={onYearChange}
                  displayEmpty
                >
                  <MenuItem value=''>Year</MenuItem>
                  {availableYears.map((yearValue) => (
                    <MenuItem key={yearValue} value={yearValue}>
                      {yearValue}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </Box>
      )}

      {showDateControls && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
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
        </Box>
      )}
    </Box>
  );
}
