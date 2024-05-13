import HomePage from '@feat/home/HomePage';
// import DashboardPage from '@feat/dashboard/DashboardPage';
// import AccountsPage from '@feat/accounts/AccountsPage';
// import LedgerPage from '@feat/ledger/LedgerPage';
import EntitiesPage from '@feat/entities/EntitiesPage';
// import CategoriesPage from '@feat/categories/CategoriesPage';
// import RecurringTransactionsPage from '@feat/recurringTransactions/RecurringTransactionsPage';
// import BusinessesPage from '@feat/businesses/BusinessesPage';
// import SettingsPage from '@feat/settings/SettingsPage';
// import ExportPage from '@feat/export/ExportPage';
import ImportPage from '@feat/import/ImportPage';
import NotFoundPage from '@feat/errors/NotFoundPage';

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
  {
    path: '/entities',
    component: EntitiesPage,
  },
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
