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
                <MenuItem key={yearValue} value={String(yearValue)}>
                  {yearValue}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 170 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={activeMonth}
              label='Month'
              onChange={onMonthChange}
              displayEmpty
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
        </Box>
      ) : (
        <>
          {(showAggregateControls || showSelectionControls) && (
            <Box sx={controlRowSx}>{selectionControls}</Box>
          )}

          {showDateControls && (
            <Box sx={controlRowSx}>{dateControls}</Box>
          )}
        </>
      )}
    </Box>
  );
}
