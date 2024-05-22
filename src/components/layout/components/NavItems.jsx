import NavItem from './NavItem';

import { routes } from '@/routesConfig';

export default function NavItems() {
  return routes
    .filter((route) => route.navBar)
    .map((route, i) => (
      <NavItem
        key={route.id}
        path={route.path}
        text={route.title}
        icon={route.icon}
        showIcon={route.navBarIcon} />
    ));
}
