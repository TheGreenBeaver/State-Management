import { FC } from 'react';
import { logicDefinerNames } from '../../logic';
import { NavLink } from 'react-router-dom';
import styles from './Nav.module.scss';

const Nav: FC = () => (
  <header className={styles.appHeader}>
    Choose a state manager:
    <nav className={styles.managerSelectContainer}>
      {logicDefinerNames.map(name => (
        <NavLink
          key={name}
          to={`/${name}`}
          className={styles.navLink as string}
        >
          {name}
        </NavLink>
      ))}
    </nav>
  </header>
);

export default Nav;