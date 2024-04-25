import NavItem from './NavItem';

import navItemList from '../navItems.json';

export default function NavItems() {
  return navItemList.map((navItem, i) => (
    <NavItem
      key={i}
      linkTo={navItem.linkTo}
      navText={navItem.navText}
    />
  ));
}
