import React, { useState } from 'react';
import '../styles/minimalist.css';

const AuthModal = ({ onClose }) => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Примитивная авторизация: логин admin, пароль 1234
        if (login === 'admin' && password === '1234') {
            setSuccess(true);
            setError('');
        } else {
            setError('Неверный логин или пароль');
            setSuccess(false);
        }
    };

    return (
        <div className="auth-modal-backdrop">
            <div className="auth-modal">
                <button className="auth-modal-close" onClick={onClose}>×</button>
                <h2>Вход</h2>
                {success ? (
                    <div className="auth-success">Успешный вход!</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Логин"
                            value={login}
                            onChange={e => setLogin(e.target.value)}
                            autoFocus
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button type="submit">Войти</button>
                        {error && <div className="auth-error">{error}</div>}
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
