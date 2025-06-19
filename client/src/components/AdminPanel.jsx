import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/minimalist.css';

const TABS = [
  { key: 'courses', label: 'Курсы' },
  { key: 'users', label: 'Пользователи' },
  { key: 'stats', label: 'Статистика' },
];

const ROLES = [
  { value: 'admin', label: 'Администратор' },
  { value: 'teacher', label: 'Преподаватель' },
  { value: 'student', label: 'Студент' },
];

// Стили для модальных окон админки (inline)
const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.45)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  content: {
    background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    maxWidth: 420, width: '95%', padding: 32, position: 'relative',
    animation: 'modalFadeIn 0.3s',
    maxHeight: '90vh', overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10,
  },
  close: {
    background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#888',
    padding: 4, borderRadius: 4, transition: 'background 0.2s',
  },
  closeHover: {
    background: '#f5f5f5', color: '#111',
  },
  form: {
    margin: 0, padding: 0,
  },
};

// Добавляю стили для формы и элементов формы в модалке
const modalFormStyles = {
  form: {
    margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 16,
  },
  group: {
    marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 6,
  },
  label: {
    color: '#444', fontSize: 15, marginBottom: 2,
  },
  input: {
    border: '1px solid #ccc', borderRadius: 6, padding: '8px 12px', fontSize: 15,
    marginBottom: 0, background: '#fafbfc',
  },
  textarea: {
    border: '1px solid #ccc', borderRadius: 6, padding: '8px 12px', fontSize: 15,
    minHeight: 70, resize: 'vertical', background: '#fafbfc',
  },
  actions: {
    display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10,
  },
  button: {
    padding: '8px 20px', borderRadius: 6, border: 'none', fontSize: 15, cursor: 'pointer',
  },
  buttonPrimary: {
    background: '#111', color: '#fff', fontWeight: 500,
  },
  buttonSecondary: {
    background: '#f5f5f5', color: '#222', fontWeight: 500, border: '1px solid #ccc',
  },
};

const AdminPanel = () => {
  const [tab, setTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, totalUsers: 0, activeUsers: 0 });
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', author: '' });
  const [userForm, setUserForm] = useState({ name: '', surname: '', login: '', password: '', role: 'student' });
  const [showLessonsModal, setShowLessonsModal] = useState(false);
  const [lessonsCourse, setLessonsCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState({ title: '', lesson_date: '', lesson_time: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        axios.get('/api/courses'),
        axios.get('/api/users'),
      ]);
      setCourses(coursesRes.data || []);
      setUsers(usersRes.data || []);
      setStats({
        totalCourses: coursesRes.data.length,
        totalUsers: usersRes.data.length,
        activeUsers: usersRes.data.filter(u => u.last_login).length,
      });
    } catch (e) {
      setMessage({ type: 'error', text: 'Ошибка загрузки данных' });
    }
  };

  // --- КУРСЫ ---
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/courses', courseForm);
      setShowCourseModal(false);
      setCourseForm({ title: '', description: '', author: '' });
      fetchData();
      setMessage({ type: 'success', text: 'Курс добавлен' });
    } catch {
      setMessage({ type: 'error', text: 'Ошибка добавления курса' });
    }
  };
  const handleEditCourse = (course) => {
    setEditCourse(course);
    setCourseForm({ title: course.title, description: course.description, author: course.author });
    setShowCourseModal(true);
  };
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/courses/${editCourse.id}`, courseForm);
      setShowCourseModal(false);
      setEditCourse(null);
      setCourseForm({ title: '', description: '', author: '' });
      fetchData();
      setMessage({ type: 'success', text: 'Курс обновлен' });
    } catch {
      setMessage({ type: 'error', text: 'Ошибка обновления курса' });
    }
  };
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Удалить курс?')) return;
    try {
      await axios.delete(`/api/courses/${id}`);
      fetchData();
      setMessage({ type: 'success', text: 'Курс удалён' });
    } catch {
      setMessage({ type: 'error', text: 'Ошибка удаления курса' });
    }
  };

  // --- ПОЛЬЗОВАТЕЛИ ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', userForm);
      setShowUserModal(false);
      setUserForm({ name: '', surname: '', login: '', password: '', role: 'student' });
      fetchData();
      setMessage({ type: 'success', text: 'Пользователь добавлен' });
    } catch {
      setMessage({ type: 'error', text: 'Ошибка добавления пользователя' });
    }
  };
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      fetchData();
      setMessage({ type: 'success', text: 'Пользователь удалён' });
    } catch {
      setMessage({ type: 'error', text: 'Ошибка удаления пользователя' });
    }
  };

  // --- УРОКИ ---
  const handleOpenLessons = async (course) => {
    setLessonsCourse(course);
    setShowLessonsModal(true);
    try {
      const res = await axios.get(`/api/courses/${course.id}/lessons`);
      setLessons(res.data || []);
    } catch {
      setLessons([]);
    }
  };
  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonsCourse) return;
    try {
      const res = await axios.post(`/api/courses/${lessonsCourse.id}/lessons`, lessonForm);
      setLessons([...lessons, res.data]);
      setLessonForm({ title: '', lesson_date: '', lesson_time: '', description: '' });
    } catch {}
  };
  const handleDeleteLesson = async (lessonId) => {
    if (!lessonsCourse) return;
    if (!window.confirm('Удалить урок?')) return;
    try {
      await axios.delete(`/api/courses/${lessonsCourse.id}/lessons/${lessonId}`);
      setLessons(lessons.filter(l => l.id !== lessonId));
    } catch {}
  };

  // --- UI ---
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.author?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.surname?.toLowerCase().includes(search.toLowerCase()) ||
    u.login?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-container" style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1 className="admin-title">Админ-панель</h1>
      <div className="tabs" style={{ marginBottom: 24 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}
      <div style={{ marginBottom: 16 }}>
        <input
          className="search-input"
          placeholder="Поиск..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      {/* КУРСЫ */}
      {tab === 'courses' && (
        <>
          <button className="admin-btn primary" onClick={() => { setShowCourseModal(true); setEditCourse(null); setCourseForm({ title: '', description: '', author: '' }); }}>
            ➕ Добавить курс
          </button>
          <div className="admin-grid" style={{ marginTop: 24 }}>
            {filteredCourses.map(course => (
              <div key={course.id} className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">{course.title}</h3>
                  <button className="admin-btn danger" onClick={() => handleDeleteCourse(course.id)}>✕</button>
                </div>
                <div className="admin-card-body">
                  <div className="admin-card-content">
                    <p><strong>Автор:</strong> {course.author}</p>
                    <p><strong>Описание:</strong> {course.description}</p>
                  </div>
                  <div className="admin-card-actions">
                    <button className="admin-btn" onClick={() => handleEditCourse(course)}>✎ Редактировать</button>
                    <button className="admin-btn" onClick={() => handleOpenLessons(course)}>📚 Уроки</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {showCourseModal && (
            <div style={modalStyles.overlay}>
              <div style={modalStyles.content}>
                <div style={modalStyles.header}>
                  <h3>{editCourse ? 'Редактировать курс' : 'Добавить курс'}</h3>
                  <button style={modalStyles.close} onClick={() => setShowCourseModal(false)}>✕</button>
                </div>
                <form onSubmit={editCourse ? handleUpdateCourse : handleAddCourse} style={modalFormStyles.form}>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Название</label>
                    <input style={modalFormStyles.input} type="text" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} required />
                  </div>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Описание</label>
                    <textarea style={modalFormStyles.textarea} value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} required />
                  </div>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Автор</label>
                    <input style={modalFormStyles.input} type="text" value={courseForm.author} onChange={e => setCourseForm({ ...courseForm, author: e.target.value })} required />
                  </div>
                  <div style={modalFormStyles.actions}>
                    <button type="button" style={{...modalFormStyles.button, ...modalFormStyles.buttonSecondary}} onClick={() => setShowCourseModal(false)}>Отмена</button>
                    <button type="submit" style={{...modalFormStyles.button, ...modalFormStyles.buttonPrimary}}>Сохранить</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {showLessonsModal && lessonsCourse && (
            <div style={modalStyles.overlay}>
              <div style={modalStyles.content}>
                <div style={modalStyles.header}>
                  <h3>Уроки курса: {lessonsCourse.title}</h3>
                  <button style={modalStyles.close} onClick={() => setShowLessonsModal(false)}>✕</button>
                </div>
                <form onSubmit={handleAddLesson} style={modalFormStyles.form}>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Название</label>
                    <input style={modalFormStyles.input} type="text" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} required />
                  </div>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Дата</label>
                    <input style={modalFormStyles.input} type="date" value={lessonForm.lesson_date} onChange={e => setLessonForm({ ...lessonForm, lesson_date: e.target.value })} required />
                  </div>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Время</label>
                    <input style={modalFormStyles.input} type="time" value={lessonForm.lesson_time} onChange={e => setLessonForm({ ...lessonForm, lesson_time: e.target.value })} required />
                  </div>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Описание</label>
                    <textarea style={modalFormStyles.textarea} value={lessonForm.description} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} />
                  </div>
                  <div style={modalFormStyles.actions}>
                    <button type="submit" style={{...modalFormStyles.button, ...modalFormStyles.buttonPrimary}}>Добавить урок</button>
                  </div>
                </form>
                <div className="lessons-list" style={{ marginTop: 24 }}>
                  {lessons.length === 0 && <p>Нет уроков</p>}
                  {lessons.map(lesson => (
                    <div key={lesson.id} className="lesson-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <div>
                        <strong>{lesson.title}</strong> — {lesson.lesson_date} {lesson.lesson_time}
                        {lesson.description && <div style={{ color: '#666', fontSize: 13 }}>{lesson.description}</div>}
                      </div>
                      <button className="admin-btn danger" onClick={() => handleDeleteLesson(lesson.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* ПОЛЬЗОВАТЕЛИ */}
      {tab === 'users' && (
        <>
          <button className="admin-btn primary" onClick={() => { setShowUserModal(true); setEditUser(null); setUserForm({ name: '', surname: '', login: '', password: '', role: 'student' }); }}>
            ➕ Добавить пользователя
          </button>
          <div className="admin-table-container" style={{ marginTop: 24 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Фамилия</th>
                  <th>Логин</th>
                  <th>Роль</th>
                  <th>Последний вход</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.surname}</td>
                    <td>{user.login}</td>
                    <td>{ROLES.find(r => r.value === user.role)?.label || user.role}</td>
                    <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className="admin-btn danger" onClick={() => handleDeleteUser(user.id)}>Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showUserModal && (
            <div style={modalStyles.overlay}>
              <div style={modalStyles.content}>
                <div style={modalStyles.header}>
                  <h3>Добавить пользователя</h3>
                  <button style={modalStyles.close} onClick={() => setShowUserModal(false)}>✕</button>
                </div>
                <form onSubmit={handleAddUser} style={modalFormStyles.form}>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Имя</label>
                    <input style={modalFormStyles.input} type="text" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
                  </div>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Фамилия</label>
                    <input style={modalFormStyles.input} type="text" value={userForm.surname} onChange={e => setUserForm({ ...userForm, surname: e.target.value })} required />
                  </div>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Логин</label>
                    <input style={modalFormStyles.input} type="text" value={userForm.login} onChange={e => setUserForm({ ...userForm, login: e.target.value })} required />
                  </div>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Пароль</label>
                    <input style={modalFormStyles.input} type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required />
                  </div>
                  <div style={modalFormStyles.group}>
                    <label style={modalFormStyles.label}>Роль</label>
                    <select style={modalFormStyles.input} value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div style={modalFormStyles.actions}>
                    <button type="button" style={{...modalFormStyles.button, ...modalFormStyles.buttonSecondary}} onClick={() => setShowUserModal(false)}>Отмена</button>
                    <button type="submit" style={{...modalFormStyles.button, ...modalFormStyles.buttonPrimary}}>Добавить</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
      {/* СТАТИСТИКА */}
      {tab === 'stats' && (
        <div className="admin-stats" style={{ marginTop: 32 }}>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{stats.totalCourses}</div>
            <div className="admin-stat-label">Курсов</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{stats.totalUsers}</div>
            <div className="admin-stat-label">Пользователей</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{stats.activeUsers}</div>
            <div className="admin-stat-label">Активных пользователей</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
