import { useMemo, useState } from 'react';

import {
  buildSpendingSelectionFromDropdownValues,
  getAggregatePeriodConfig,
  getSpendingSelectionDropdownValues,
} from '@/utils/spendingAnalytics';

import {
  AGGREGATE_RANGES_WITH_VISIBLE_DATES,
  DEFAULT_SELECTION,
} from './spendingHistoryConstants';

export default function useSpendingHistorySectionState() {
  const [activeSelection, setActiveSelection] = useState(DEFAULT_SELECTION);
  const [customRange, setCustomRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [expandedSubcategoryIds, setExpandedSubcategoryIds] = useState([]);
  const [hideSubcategories, setHideSubcategories] = useState(false);
  const [transactionSortDirection, setTransactionSortDirection] =
    useState('asc');

  const dropdownValues = useMemo(
    () => getSpendingSelectionDropdownValues(activeSelection),
    [activeSelection],
  );

  const resetExpandedState = () => {
    setExpandedCategoryId(null);
    setExpandedSubcategoryIds([]);
  };

  const clearCustomRange = () =>
    setCustomRange({
      startDate: null,
      endDate: null,
    });

  const syncCustomRangeForAggregate = (aggregateKey) => {
    if (!AGGREGATE_RANGES_WITH_VISIBLE_DATES.has(aggregateKey)) {
      clearCustomRange();
      return;
    }

    const aggregateConfig = getAggregatePeriodConfig(aggregateKey);

    setCustomRange({
      startDate: aggregateConfig.startDate,
      endDate: aggregateConfig.endDate,
    });
  };

  const handleAggregateChange = (_event, newValue) => {
    if (!newValue) return;

    syncCustomRangeForAggregate(newValue);
    setActiveSelection({ type: 'aggregate', value: newValue });
    resetExpandedState();
  };

  const handleMonthChange = (event) => {
    clearCustomRange();
    setActiveSelection(
      buildSpendingSelectionFromDropdownValues(
        {
          month: event.target.value,
          year: dropdownValues.year,
        },
        DEFAULT_SELECTION,
      ),
    );
    resetExpandedState();
  };

  const handleYearChange = (event) => {
    clearCustomRange();
    setActiveSelection(
      buildSpendingSelectionFromDropdownValues(
        {
          month: dropdownValues.month,
          year: event.target.value,
        },
        DEFAULT_SELECTION,
      ),
    );
    resetExpandedState();
  };

  const updateCustomRange = (nextRange) => {
    setCustomRange(nextRange);

    if (!nextRange.startDate || !nextRange.endDate) return;

    setActiveSelection({
      type: 'custom',
      startDate: nextRange.startDate,
      endDate: nextRange.endDate,
    });
    resetExpandedState();
  };

  const handleCustomStartChange = (value) => {
    updateCustomRange({
      ...customRange,
      startDate: value,
    });
  };

  const handleCustomEndChange = (value) => {
    updateCustomRange({
      ...customRange,
      endDate: value,
    });
  };

  const handleHideSubcategoriesChange = (event) => {
    setHideSubcategories(event.target.checked);
    setExpandedSubcategoryIds([]);
  };

  const handleTransactionSortToggle = () => {
    setTransactionSortDirection((currentDirection) =>
      currentDirection === 'asc' ? 'desc' : 'asc',
    );
  };

  const toggleCategoryExpanded = (categoryId) => {
    setExpandedCategoryId((currentCategoryId) =>
      currentCategoryId === categoryId ? null : categoryId,
    );
    setExpandedSubcategoryIds([]);
  };

  const toggleSubcategoryExpanded = (categoryId, subcategoryId) => {
    const subcategoryKey = `${categoryId}:${subcategoryId}`;

    setExpandedSubcategoryIds((currentExpandedIds) =>
      currentExpandedIds.includes(subcategoryKey)
        ? currentExpandedIds.filter((id) => id !== subcategoryKey)
        : [...currentExpandedIds, subcategoryKey],
    );
  };

  return {
    activeSelection,
    customRange,
    dropdownValues,
    expandedCategoryId,
    expandedSubcategoryIds,
    hideSubcategories,
    transactionSortDirection,
    handleAggregateChange,
    handleMonthChange,
    handleYearChange,
    handleCustomStartChange,
    handleCustomEndChange,
    handleHideSubcategoriesChange,
    handleTransactionSortToggle,
    toggleCategoryExpanded,
    toggleSubcategoryExpanded,
  };
}
