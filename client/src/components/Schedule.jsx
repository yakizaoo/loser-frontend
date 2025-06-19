import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/minimalist.css';

const Schedule = () => {
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserLessons(parsedUser.id);
    }
  }, []);

  const fetchUserLessons = async (userId) => {
    try {
      const userCoursesRes = await axios.get(`/api/user-courses/${userId}`);
      const userCourses = userCoursesRes.data;

      const allLessons = [];
      for (const course of userCourses) {
        const lessonsRes = await axios.get(`/api/courses/${course.id}/lessons`);
        const courseLessons = lessonsRes.data.map(lesson => ({
          ...lesson,
          courseTitle: course.title
        }));
        allLessons.push(...courseLessons);
      }

      const formattedLessons = allLessons.map(lesson => ({
        ...lesson,
        date: new Date(lesson.lesson_date + 'T' + (lesson.lesson_time || '00:00'))
      })).sort((a, b) => a.date - b.date);

      setLessons(formattedLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setMessage({ type: 'error', text: 'Ошибка при загрузке расписания' });
    }
  };

  const getLessonsForDate = (date) => {
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate.getDate() === date.getDate() &&
             lessonDate.getMonth() === date.getMonth() &&
             lessonDate.getFullYear() === date.getFullYear();
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    // Добавляем пустые ячейки для выравнивания
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    return (
      <div className="simple-calendar">
        <div className="calendar-header">
          <button onClick={handlePrevMonth}>&lt;</button>
          <h3>{currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={handleNextMonth}>&gt;</button>
        </div>
        <div className="calendar-grid">
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="calendar-day empty" />;
            }
            const hasLessons = getLessonsForDate(date).length > 0;
            const isSelected = isSameDay(date, selectedDate);
            return (
              <div
                key={date.toISOString()}
                className={`calendar-day ${hasLessons ? 'has-lessons' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                {date.getDate()}
                {hasLessons && <div className="calendar-dot" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Расписание занятий</h1>
      
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
        <div style={{ flex: '0 0 350px' }}>
          {renderCalendar()}
        </div>

        <div style={{ flex: '1' }}>
          <h2>Занятия на {selectedDate.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h2>

          {getLessonsForDate(selectedDate).length > 0 ? (
            <div className="lessons-list">
              {getLessonsForDate(selectedDate).map(lesson => (
                <div key={lesson.id} className="lesson-card">
                  <div className="lesson-time">{formatTime(lesson.date)}</div>
                  <div className="lesson-info">
                    <h3>{lesson.title}</h3>
                    <p className="course-name">Курс: {lesson.courseTitle}</p>
                    {lesson.description && (
                      <p className="lesson-description">{lesson.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-lessons">На этот день занятий нет</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule; 