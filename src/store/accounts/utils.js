import { format, isValid, parseISO } from 'date-fns';

export const isAccountClosed = (account) => Boolean(account?.closedAt);

export const formatAccountClosedAt = (
  closedAt,
  formatString = 'MMM d, yyyy',
) => {
  if (!closedAt) {
    return null;
  }

  try {
    const parsedDate = parseISO(closedAt);

    if (!isValid(parsedDate)) {
      return null;
    }

    return format(parsedDate, formatString);
  } catch {
    return null;
  }
};
