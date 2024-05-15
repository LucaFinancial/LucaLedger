import NavItem from './NavItem';

import navItemList from '../navItems.json';

export default function NavItems() {
  return navItemList
    .filter((navItem) => navItem.enabled)
    .map((navItem, i) => (
      <NavItem
        key={i}
        linkTo={navItem.linkTo}
        navText={navItem.navText}
      />
    ));
}
