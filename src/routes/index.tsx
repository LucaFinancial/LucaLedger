import { createBrowserRouter } from 'react-router-dom';
import { PATHS } from './paths';
import { requireAuth } from './guards';
import { PrivateRoute } from './PrivateRoute';

export const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <RootLayout />,
    children: [
      {
        element: <PrivateRoute />,
        children: [
          {
            path: PATHS.DASHBOARD,
            element: <DashboardPage />,
            loader: requireAuth,
          },
          {
            path: PATHS.PROFILE,
            element: <ProfilePage />,
            loader: requireAuth,
          },
        ],
      },
      { path: PATHS.LOGIN, element: <LoginPage /> },
    ],
  },
]);
