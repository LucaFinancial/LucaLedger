import { Route, Routes } from 'react-router-dom';

import { routes } from '@/routesConfig';

export default function AppRoutes() {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.id}
          path={route.path}
          element={<route.component />}
        />
      ))}
    </Routes>
  );
}
