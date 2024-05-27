import NavItem from './NavItem';

import { routes } from '@/routesConfig';

export default function NavItems() {
  return routes
    .filter((route) => route.navBar)
    .map((route) => (
      <NavItem
        key={route.id}
        path={route.path}
        text={route.title}
        Icon={route.icon}
        showIcon={route.navBarIcon}
      />
    ));
}
