import React from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import '../styles/minimalist.css';

const navItems = [
  { key: 'main', label: 'Главная', path: '/' },
  { key: 'my-courses', label: 'Мои курсы', path: '/my-courses' },
  { key: 'schedule', label: 'Расписание', path: '/schedule' },
  { key: 'messages', label: 'Сообщения', path: '/messages' },
  { key: 'videocalls', label: 'Видеоконференции', path: '/video-conference' },
  { key: 'profile', label: 'Настройки профиля', path: '/profile' },
  { key: 'admin', label: 'Админ-панель', path: '/admin' },
];

const AppLayout = ({ pageTitle, children, user, onLogout }) => {
  const location = useLocation();
  
  // Фильтруем пункты меню для обычных пользователей
  const filteredNavItems = navItems.filter(item => {
    if (item.key === 'admin') {
      return user && (user.role === 'admin' || user.role === 'teacher');
    }
    return true;
  });

  return (
    <div className="app-layout">
      <aside className="app-navbar">
        <div className="app-navbar-title">Меню</div>
        <ul style={{flex:1}}>
          {filteredNavItems.map(item => (
            <li key={item.key}>
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <button className="logout-btn" onClick={onLogout}>Выйти</button>
      </aside>
      <main className="app-main">
        <header className="app-header">
          <div className="app-header-title">EduLearn</div>
          <div className="app-header-page">{pageTitle}</div>
          <div className="app-header-user">
            {user ? `${user.surname || ''} ${user.name || ''}`.trim() : ''}
          </div>
        </header>
        <div className="app-content">
          {React.isValidElement(children) ? children : null}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
