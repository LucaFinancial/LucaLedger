import { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';

import { centsToDollars } from '@/utils';

import { formatCurrency } from './spendingHistoryHelpers';
import {
  COLORS,
  PIE_CHART_PADDING,
  PIE_CHART_RADIUS,
} from './spendingHistoryConstants';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SpendingHistoryPieChart({ pieData }) {
  const [pieLegendHeight, setPieLegendHeight] = useState(0);
  const pieChartHeight =
    PIE_CHART_RADIUS * 2 + pieLegendHeight + PIE_CHART_PADDING;

  const pieLegendMeasurementPlugin = useMemo(
    () => ({
      id: 'spending-history-legend-measurement',
      afterLayout(chart) {
        const nextLegendHeight = Math.ceil(chart.legend?.height ?? 0);

        if (!nextLegendHeight) return;

        setPieLegendHeight((currentLegendHeight) =>
          currentLegendHeight === nextLegendHeight
            ? currentLegendHeight
            : nextLegendHeight,
        );
      },
    }),
    [],
  );

  return (
    <Box
      sx={{
        flex: '0 0 320px',
        minWidth: 280,
        p: 1.5,
        boxSizing: 'border-box',
      }}
    >
      <Typography
        variant='subtitle2'
        sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}
      >
        Spending by Category
      </Typography>
      <Box
        sx={{
          height: pieChartHeight,
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        <Pie
          plugins={[pieLegendMeasurementPlugin]}
          data={{
            labels: pieData.map((item) => item.name),
            datasets: [
              {
                data: pieData.map((item) => centsToDollars(item.value)),
                backgroundColor: COLORS,
                borderColor: '#fff',
                borderWidth: 2,
                radius: PIE_CHART_RADIUS,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'bottom' },
              tooltip: {
                callbacks: {
                  label: (context) => formatCurrency(context.parsed ?? 0),
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
