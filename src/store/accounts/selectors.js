// Basic selectors with migration-safe fallbacks
export const selectAccounts = (state) => {
  // Handle migration transition: accounts might still be an array during load
  if (Array.isArray(state.accounts)) {
    return state.accounts;
  }
  return state.accounts?.data || [];
};

export const selectAccountsLoading = (state) => {
  if (Array.isArray(state.accounts)) {
    return false;
  }
  return state.accounts?.loading || false;
};

export const selectAccountsError = (state) => {
  if (Array.isArray(state.accounts)) {
    return null;
  }
  return state.accounts?.error || null;
};

export const selectLoadingAccountIds = (state) => {
  if (Array.isArray(state.accounts)) {
    return [];
  }
  return state.accounts?.loadingAccountIds || [];
};

export const selectIsAccountLoading = (accountId) => (state) => {
  if (Array.isArray(state.accounts)) {
    return false;
  }
  return state.accounts?.loadingAccountIds?.includes(accountId) || false;
};

// Account selectors
export const selectAccountById = (accountId) => (state) => {
  const accounts = selectAccounts(state);
  return accounts.find((account) => account.id === accountId);
};
