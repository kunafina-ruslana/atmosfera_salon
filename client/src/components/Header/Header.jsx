import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const logoSrc = isDark ? '/icons/logo-dark.svg' : '/icons/logo-light.svg';

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.mobile_logo}>
            <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
            <img src={logoSrc} alt="Логотип салона красоты" /></Link>
          </div>
          <div className={styles.nav_left}>
            <Link to="/" onClick={closeMobileMenu}>Главная</Link>
            <Link to="/services" onClick={closeMobileMenu}>Услуги</Link>
            <Link to="/about" onClick={closeMobileMenu}>О салоне</Link>
          </div>
          <div className={styles.desktop_logo}> <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
          <img src={logoSrc} alt="Логотип салона красоты" /></Link> </div>
          <div className={styles.nav_right}>
            {user && (
              <>
                <Link to="/profile" onClick={closeMobileMenu}>Профиль</Link>
                {user.role === 'master' && (
                  <><Link to="/master-schedule" onClick={closeMobileMenu}>Моё расписание</Link></>)}
                {user.role === 'admin' && (
                  <><Link to="/admin" onClick={closeMobileMenu}>Админ-панель</Link></>)}
              </>
            )}            
            {!user ? (
              <><Link to="/login" onClick={closeMobileMenu}>Войти</Link>
                <Link to="/register" onClick={closeMobileMenu}>Регистрация</Link></>
            ) : (<button onClick={handleLogout} className={styles.logout_btn}>Выйти</button>)}            
            <button onClick={toggleTheme} className={styles.theme_toggle} aria-label="Переключить тему">
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />} </button>
          </div>
          <button className={styles.menu_toggle} onClick={toggleMobileMenu}> 
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />} </button>
        </div>
      </nav>

      {/* Мобильное меню */}
      <div className={`${styles.mobile_menu} ${mobileMenuOpen ? styles.mobile_menu_active : ''}`}>
        <div className={styles.mobile_nav_links}>
          <Link to="/" onClick={closeMobileMenu} className={styles.mobile_nav_link}>
            Главная
          </Link>
          <Link to="/services" onClick={closeMobileMenu} className={styles.mobile_nav_link}>
            Услуги
          </Link>
          <Link to="/about" onClick={closeMobileMenu} className={styles.mobile_nav_link}>
            О салоне
          </Link>
          
          {user && (
            <>
              <Link to="/profile" onClick={closeMobileMenu} className={styles.mobile_nav_link}>
                Профиль
              </Link>
              {user.role === 'master' && (
                <>
                  <Link to="/master-schedule" onClick={closeMobileMenu} className={styles.mobile_nav_link}>
                    Моё расписание
                  </Link>
                  <Link to="/master-schedule" onClick={closeMobileMenu} className={styles.mobile_nav_link}>
                    Моё расписание
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" onClick={closeMobileMenu} className={styles.mobile_nav_link}>
                    Админ-панель
                  </Link>
                </>
              )}
            </>
          )}
          
          {!user ? (
            <>
              <Link to="/login" onClick={closeMobileMenu} className={styles.mobile_nav_link}>
                Войти
              </Link>
              <Link to="/register" onClick={closeMobileMenu} className={styles.mobile_nav_link}>
                Регистрация
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className={styles.mobile_logout_btn}>
              Выйти
            </button>
          )}
          
          <button onClick={toggleTheme} className={styles.mobile_theme_toggle}>
            {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            <span>{isDark ? 'Светлая тема' : 'Тёмная тема'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;