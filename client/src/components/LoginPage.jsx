import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import '../styles/minimalist.css';

// Настройка базового URL для axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [surname, setSurname] = useState('');
    const [name, setName] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        if (isRegister) {
            // Регистрация через API
            if (!login || !password || !surname || !name) {
                setError('Заполните все поля');
                return;
            }
            try {
                const res = await axios.post('/api/register', { surname, name, login, password, role: 'student' });
                if (res.data.success) {
                    setSuccess(true);
                    setTimeout(() => {
                        setIsRegister(false);
                        setSuccess(false);
                    }, 1000);
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Ошибка регистрации');
            }
        } else {
            // Авторизация через API
            if (!login || !password) {
                setError('Введите логин и пароль');
                return;
            }
            try {
                const res = await axios.post('/api/login', { login, password });
                if (res.data.success) {
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    setSuccess(true);
                    setTimeout(() => {
                        history.push('/');
                    }, 1000);
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Ошибка входа');
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <h1>{isRegister ? 'Регистрация' : 'Вход'}</h1>
                {success ? (
                    <div className="auth-success">Успешно!</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Фамилия"
                                    value={surname}
                                    onChange={e => setSurname(e.target.value)}
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    placeholder="Имя"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </>
                        )}
                        <input
                            type="text"
                            placeholder="Логин"
                            value={login}
                            onChange={e => setLogin(e.target.value)}
                            autoFocus={!isRegister}
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button type="submit">{isRegister ? 'Зарегистрироваться' : 'Войти'}</button>
                        {error && <div className="auth-error">{error}</div>}
                    </form>
                )}
                <div style={{marginTop:16, textAlign:'center'}}>
                    {isRegister ? (
                        <span>Уже есть аккаунт?{' '}
                            <button style={{color:'#222',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}} onClick={()=>setIsRegister(false)}>Войти</button>
                        </span>
                    ) : (
                        <span>Нет аккаунта?{' '}
                            <button style={{color:'#222',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}} onClick={()=>setIsRegister(true)}>Зарегистрироваться</button>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
