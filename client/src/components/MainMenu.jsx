import React, { useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import '../styles/minimalist.css';

const MainMenu = () => {
    const history = useHistory();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        history.push('/login');
    };

    return (
        <nav className="main-menu">
            <Link to="/" className="logo">Видеоуроки</Link>
            <ul>
                <li><Link to="/">Главная</Link></li>
                <li><Link to="/tutorials">Видеоуроки</Link></li>
                <li><Link to="/courses">Курсы</Link></li>
                <li><Link to="/about">О нас</Link></li>
                <li><Link to="/contact">Контакты</Link></li>
                {user && <li><Link to="/my-courses">Мои курсы</Link></li>}
                {user && <li><Link to="/messages">Сообщения</Link></li>}
                {user && <li><Link to="/schedule">Расписание</Link></li>}
                {(user && (user.role === 'admin' || user.role === 'teacher')) && <li><Link to="/admin">Админ-панель</Link></li>}
            </ul>
            {user ? (
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <span style={{fontWeight:600}}>{user.login}</span>
                    <button className="auth-btn" onClick={handleLogout}>Выйти</button>
                </div>
            ) : (
                <Link to="/login" className="auth-btn">Войти</Link>
            )}
        </nav>
    );
};

export default MainMenu;