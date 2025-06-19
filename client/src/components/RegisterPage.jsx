import React, { useState } from 'react';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';
import '../styles/minimalist.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    surname: '',
    name: '',
    login: '',
    password: '',
    role: 'student',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const history = useHistory();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' }); // Очищаем предыдущие сообщения

    try {
      const res = await axios.post('/api/register', formData);
      console.log('Registration response:', res.data);
      setMessage({ type: 'success', text: 'Регистрация успешна! Вы можете войти.' });
      // Optionally redirect to login page after a delay
      // setTimeout(() => history.push('/login'), 2000);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        // Сервер ответил с ошибкой
        setMessage({ type: 'error', text: error.response.data.error || 'Ошибка при регистрации' });
      } else if (error.request) {
        // Запрос был сделан, но ответа не получено
        setMessage({ type: 'error', text: 'Ошибка сети или сервера не отвечает' });
      } else {
        // Что-то пошло не так при настройке запроса
        setMessage({ type: 'error', text: 'Неизвестная ошибка при регистрации' });
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Регистрация</h1>
        {message.text && (
          <div className={`auth-${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="surname"
            placeholder="Фамилия"
            value={formData.surname}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Имя"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="login"
            placeholder="Логин"
            value={formData.login}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {/* Поле для выбора роли, если это разрешено при регистрации */}
          {/* <select name="role" value={formData.role} onChange={handleChange} className="form-input"> */}
          {/*   <option value="student">Студент</option> */}
          {/*   <option value="teacher">Преподаватель</option> */}
          {/*   <option value="admin">Администратор</option> */}
          {/* </select> */}
          <button type="submit">Зарегистрироваться</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 