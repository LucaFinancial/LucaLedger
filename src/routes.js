import HomePage from '@/features/home/HomePage';
// import DashboardPage from '@/features/dashboard/DashboardPage';
// import AccountsPage from '@/features/accounts/AccountsPage';
// import LedgerPage from '@/features/ledger/LedgerPage';
// import EntitiesPage from '@/features/entities/EntitiesPage';
// import CategoriesPage from '@/features/categories/CategoriesPage';
// import RecurringTransactionsPage from '@/features/recurringTransactions/RecurringTransactionsPage';
// import BusinessesPage from '@/features/businesses/BusinessesPage';
// import SettingsPage from '@/features/settings/SettingsPage';
// import ExportPage from '@/features/export/ExportPage';
import ImportPage from '@/features/import/ImportPage';
import NotFoundPage from '@/features/errors/NotFoundPage';

export const routes = [
  {
    path: '/',
    component: HomePage,
  },
  // {
  //   path: '/dashboard',
  //   component: DashboardPage,
  // },
  // {
  //   path: '/accounts',
  //   component: AccountsPage,
  // },
  // {
  //   path: '/accounts/:accountId',
  //   component: LedgerPage,
  // },
  // {
  //   path: '/entities',
  //   component: EntitiesPage,
  // },
  // {
  //   path: '/categories',
  //   component: CategoriesPage,
  // },
  // {
  //   path: '/recurring',
  //   component: RecurringTransactionsPage,
  // },
  // {
  //   path: '/businesses',
  //   component: BusinessesPage,
  // },
  // {
  //   path: '/settings',
  //   component: SettingsPage,
  // },
  // {
  //   path: '/export',
  //   component: ExportPage,
  // },
  {
    path: '/import',
    component: ImportPage,
  },
  {
    path: '*',
    component: NotFoundPage,
  },
];
