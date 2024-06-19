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

import { Home as HomeIcon } from '@mui/icons-material';
import TransactionsPage from '@feat/transactions/TransactionsPage';

export const routes = [
  {
    id: 'home',
    path: '/',
    title: 'Home',
    icon: HomeIcon,
    navBar: true,
    navBarIcon: true,
    component: HomePage,
  },
  // {
  //   id: 'dashboard',
  //   path: '/dashboard',
  //   title: 'Dashboard',
  //   icon: null,
  //   navBar: true,
  //   navBarIcon: false,
  //   component: DashboardPage,
  // },
  // {
  //   id: 'accounts',
  //   path: '/accounts',
  //   title: 'Accounts',
  //   icon: null,
  //   navBar: true,
  //   navBarIcon: false,
  //   component: AccountsPage,
  // },
  // {
  //   id: 'accountDetails',
  //   path: '/accounts/:accountId',
  //   title: 'Account Details',
  //   icon: null,
  //   navBar: false,
  //   component: LedgerPage,
  // },
  {
    id: 'entities',
    path: '/entities',
    title: 'Entities',
    icon: null,
    navBar: true,
    navBarIcon: false,
    component: EntitiesPage,
  },
  // {
  //   id: 'categories',
  //   path: '/categories',
  //   title: 'Categories',
  //   icon: null,
  //   navBar: false,
  //   component: CategoriesPage,
  // },
  // {
  //   id: 'recurringTx',
  //   path: '/recurring',
  //   title: 'Recurring Transactions',
  //   icon: null,
  //   navBar: false,
  //   component: RecurringTransactionsPage,
  // },
  // {
  //   id: 'business',
  //   path: '/businesses',
  //   title: 'Businesses',
  //   icon: null,
  //   navBar: false,
  //   component: BusinessesPage,
  // },
  // {
  //   id: 'settings',
  //   path: '/settings',
  //   title: 'Settings',
  //   icon: null,
  //   navBar: false,
  //   component: SettingsPage,
  // },
  // {
  //   id: 'export',
  //   path: '/export',
  //   title: 'Export',
  //   icon: null,
  //   navBar: true,
  //   navBarIcon: false,
  //   component: ExportPage,
  // },
  {
    id: 'import',
    path: '/import',
    title: 'Import',
    icon: null,
    navBar: true,
    navBarIcon: false,
    component: ImportPage,
  },
  {
    id: 'transactions',
    path: '/transactions',
    title: 'Transactions',
    icon: null,
    navBar: true,
    navBarIcon: false,
    component: TransactionsPage,
  },
  {
    id: 'notFound',
    path: '*',
    title: 'Page Not Found',
    icon: null,
    navBar: false,
    component: NotFoundPage,
  },
];
