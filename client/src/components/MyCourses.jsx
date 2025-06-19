import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/minimalist.css';

const MyCourses = () => {
  const [activeTab, setActiveTab] = useState('my');
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User from localStorage:', u);
    setUser(u);
  }, []);

  useEffect(() => {
    if (user?.id) {
      console.log('User state updated, fetching courses for user:', user.id);
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      console.log('Starting fetchCourses...');
      console.log('Current user state:', user);
      
      console.log('Fetching all courses...');
      const allCoursesRes = await axios.get('/api/courses');
      console.log('All courses response:', allCoursesRes.data);
      
      console.log('Fetching user courses for user:', user.id);
      const userCoursesRes = await axios.get(`/api/user-courses/${user.id}`);
      console.log('User courses response:', userCoursesRes.data);
      
      setAllCourses(allCoursesRes.data || []);
      setCourses(userCoursesRes.data || []);
    } catch (error) {
      console.error('Error in fetchCourses:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setMessage({ type: 'error', text: 'Ошибка при загрузке курсов' });
    }
  };

  const handleJoin = async (courseId) => {
    if (!user?.id) {
      setMessage({ type: 'error', text: 'Необходимо войти в систему' });
      return;
    }

    try {
      await axios.post('/api/join-course', { userId: user.id, courseId });
      setMessage({ type: 'success', text: 'Вы успешно присоединились к курсу' });
      fetchCourses();
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при присоединении к курсу' });
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredCourses = (coursesList) => {
    return coursesList.filter(course =>
      course.title.toLowerCase().includes(searchQuery) ||
      (course.description || '').toLowerCase().includes(searchQuery) ||
      (course.author || '').toLowerCase().includes(searchQuery)
    );
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowEditModal(true);
  };

  const renderCourses = (coursesList, showJoinButton = false) => {
    const filtered = filteredCourses(coursesList);
    
    if (!filtered.length) {
      return (
        <div className="message message-error" style={{ marginTop: '20px' }}>
          {searchQuery ? 'Курсы не найдены' : 'Нет доступных курсов'}
        </div>
      );
    }

    return (
      <div className="courses-grid">
        {filtered.map(course => {
          console.log('Course data:', course);
          const isJoined = courses.some(c => c.id === course.id);
          const photoUrl = course.photo 
            ? course.photo.startsWith('http') 
              ? course.photo 
              : `http://localhost:5000${course.photo}`
            : 'https://via.placeholder.com/300x160?text=Нет+фото';
          console.log('Photo URL:', photoUrl);
          
          return (
            <div key={course.id} className="course-card">
              <img 
                className="course-image"
                src={photoUrl}
                alt={course.title}
                onError={(e) => {
                  console.error('Error loading image:', e);
                  e.target.src = 'https://via.placeholder.com/300x160?text=Ошибка+загрузки';
                }}
              />
              <div className="course-content">
                <h3 className="course-title">{course.title}</h3>
                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}
                <div className="course-meta">
                  <div className="course-stats">
                    {course.author && (
                      <span className="course-stat">👤 {course.author}</span>
                    )}
                    {course.lessons && course.lessons.length > 0 && (
                      <span className="course-stat">📚 {course.lessons.length} уроков</span>
                    )}
                  </div>
                  {showJoinButton && (
                    <button 
                      className={`course-btn ${isJoined ? 'secondary' : 'primary'}`}
                      onClick={() => !isJoined && handleJoin(course.id)}
                      disabled={isJoined}
                    >
                      {isJoined ? 'Вы присоединились' : 'Присоединиться'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          Мои курсы
        </div>
        <div 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Все курсы
        </div>
      </div>

      <div className="search-box">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M7.5 13.5a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0-1.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" fill="currentColor"/>
          <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder={`Поиск курсов...`}
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {activeTab === 'my' ? renderCourses(courses) : renderCourses(allCourses, true)}

      {/* Модальное окно редактирования курса */}
      {showEditModal && editingCourse && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>Редактировать курс</h2>
              <button className="modal-close" onClick={() => {
                setShowEditModal(false);
                setEditingCourse(null);
              }}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                // Здесь будет логика обновления курса
                setShowEditModal(false);
                setEditingCourse(null);
                fetchCourses();
              }}>
                <div className="form-group">
                  <label>Название курса:</label>
                  <input
                    type="text"
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Описание:</label>
                  <textarea
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Автор:</label>
                  <input
                    type="text"
                    value={editingCourse.author}
                    onChange={(e) => setEditingCourse({...editingCourse, author: e.target.value})}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">Сохранить изменения</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCourse(null);
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
