import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/minimalist.css';

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    surname: '',
    name: '',
    login: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        surname: parsedUser.surname || '',
        name: parsedUser.name || '',
        login: parsedUser.login || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Валидация
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Новые пароли не совпадают' });
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Новый пароль должен содержать минимум 6 символов' });
      return;
    }

    try {
      const updateData = {
        surname: formData.surname,
        name: formData.name,
        login: formData.login
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await axios.put(`/api/users/${user.id}`, updateData);
      
      if (response.data) {
        // Обновляем данные пользователя в localStorage
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        setMessage({ type: 'success', text: 'Профиль успешно обновлен!' });
        setIsEditing(false);
        
        // Очищаем поля паролей
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Ошибка при обновлении профиля' 
      });
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      'admin': 'Администратор',
      'teacher': 'Преподаватель',
      'student': 'Студент'
    };
    return roles[role] || role;
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="profile-settings">
      <div className="profile-header">
        <h1>Настройки профиля</h1>
        <p>Управляйте своими личными данными и настройками аккаунта</p>
      </div>

      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          
          <div className="profile-details">
            <h2>{user.name} {user.surname}</h2>
            <p className="profile-role">{getRoleLabel(user.role)}</p>
            <p className="profile-login">Логин: {user.login}</p>
          </div>
        </div>

        <div className="profile-form-section">
          <div className="form-header">
            <h3>Редактировать профиль</h3>
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Отмена' : 'Редактировать'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="surname">Фамилия</label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Имя</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login">Логин</label>
              <input
                type="text"
                id="login"
                name="login"
                value={formData.login}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            {isEditing && (
              <>
                <div className="password-section">
                  <h4>Изменить пароль</h4>
                  <p className="password-hint">Оставьте поля пустыми, если не хотите менять пароль</p>
                  
                  <div className="form-group">
                    <label htmlFor="currentPassword">Текущий пароль</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Введите текущий пароль"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">Новый пароль</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Минимум 6 символов"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Подтвердите новый пароль</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Повторите новый пароль"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    Сохранить изменения
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <div className="profile-stats">
          <h3>Статистика аккаунта</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{user.id}</div>
              <div className="stat-label">ID пользователя</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{getRoleLabel(user.role)}</div>
              <div className="stat-label">Роль</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{user.login}</div>
              <div className="stat-label">Логин</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 