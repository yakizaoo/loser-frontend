import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/minimalist.css';

const VideoConference = () => {
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeCall, setActiveCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [connectionQuality, setConnectionQuality] = useState('excellent');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const callTimerRef = useRef(null);
  const videoRef = useRef(null);

  // Генерация случайных участников
  const generateParticipants = (count) => {
    const names = [
      'Анна Смирнова', 'Михаил Козлов', 'Елена Петрова', 'Дмитрий Иванов',
      'Ольга Сидорова', 'Алексей Волков', 'Мария Новикова', 'Сергей Морозов',
      'Татьяна Лебедева', 'Андрей Соколов', 'Наталья Козлова', 'Игорь Лебедев'
    ];
    
    return Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      name: names[index % names.length],
      avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
      isSpeaking: Math.random() > 0.7,
      isMuted: Math.random() > 0.3,
      isVideoOff: Math.random() > 0.2,
      role: index === 0 ? 'teacher' : 'student'
    }));
  };

  // Генерация сообщений чата
  const generateChatMessages = () => {
    const messages = [
      'Добрый день всем!',
      'Привет! Как дела?',
      'Отличная презентация!',
      'У меня есть вопрос по теме',
      'Спасибо за объяснение',
      'Можете повторить последний слайд?',
      'Очень интересная лекция',
      'До встречи на следующем занятии!'
    ];

    return messages.map((text, index) => ({
      id: index + 1,
      text,
      sender: participants[index % participants.length] || participants[0],
      timestamp: new Date(Date.now() - (messages.length - index) * 60000),
      type: Math.random() > 0.7 ? 'system' : 'user'
    }));
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserLessons(parsedUser.id);
    }
  }, []);

  // Таймер для длительности звонка
  useEffect(() => {
    if (activeCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        setCallDuration(0);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [activeCall]);

  // Симуляция изменения качества соединения
  useEffect(() => {
    if (activeCall) {
      const qualityInterval = setInterval(() => {
        const qualities = ['excellent', 'good', 'poor'];
        setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)]);
      }, 10000);

      return () => clearInterval(qualityInterval);
    }
  }, [activeCall]);

  const fetchUserLessons = async (userId) => {
    try {
      const userCoursesRes = await axios.get(`/api/user-courses/${userId}`);
      const userCourses = userCoursesRes.data;

      const allLessons = [];
      for (const course of userCourses) {
        const lessonsRes = await axios.get(`/api/courses/${course.id}/lessons`);
        const courseLessons = lessonsRes.data.map(lesson => ({
          ...lesson,
          courseTitle: course.title,
          participants: Math.floor(Math.random() * 15) + 3,
          status: Math.random() > 0.6 ? 'live' : 'upcoming',
          teacher: {
            name: ['Иван Петров', 'Мария Сидорова', 'Алексей Козлов', 'Елена Морозова'][Math.floor(Math.random() * 4)],
            avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10) + 1}`
          },
          roomId: `room_${Math.random().toString(36).substr(2, 9)}`,
          meetingCode: Math.random().toString().substr(2, 6).toUpperCase()
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

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
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

  const handleJoinCall = async (lesson) => {
    setShowErrorModal(true);
  };

  const handleLeaveCall = () => {
    setActiveCall(null);
    setParticipants([]);
    setChatMessages([]);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setIsRecording(false);
    setShowChat(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  const toggleScreenSharing = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: chatMessages.length + 1,
        text: newMessage,
        sender: user,
        timestamp: new Date(),
        type: 'user'
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  const getConnectionQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'poor': return '🔴';
      default: return '🟢';
    }
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

  const renderVideoCall = () => {
    if (!activeCall) return null;

    return (
      <div className="video-conference-room">
        {/* Заголовок конференции */}
        <div className="conference-header">
          <div className="conference-info">
            <h2>{activeCall.title}</h2>
            <div className="conference-meta">
              <span className="meeting-code">Код: {activeCall.meetingCode}</span>
              <span className="duration">⏱️ {formatDuration(callDuration)}</span>
              <span className="connection-quality">
                {getConnectionQualityIcon()} {connectionQuality === 'excellent' ? 'Отлично' : 
                  connectionQuality === 'good' ? 'Хорошо' : 'Плохо'}
              </span>
            </div>
          </div>
          <div className="conference-actions">
            <button className="header-btn" onClick={() => setShowChat(!showChat)}>
              💬 Чат ({chatMessages.length})
            </button>
            <button className="header-btn" onClick={handleLeaveCall}>
              ❌ Выйти
            </button>
          </div>
        </div>

        <div className="conference-content">
          {/* Основная область видео */}
          <div className="video-main-area">
            {/* Главное видео (преподаватель) */}
            <div className="main-video-container">
              <div className="main-video">
                <div className="video-frame">
                  {isVideoOff ? (
                    <div className="video-off-screen">
                      <img src={activeCall.teacher.avatar} alt="Teacher" className="teacher-avatar" />
                      <div className="video-off-text">Камера выключена</div>
                    </div>
                  ) : (
                    <img src={activeCall.teacher.avatar} alt="Teacher" className="teacher-video" />
                  )}
                  <div className="video-overlay">
                    <div className="speaker-name">{activeCall.teacher.name}</div>
                    <div className="speaker-role">Преподаватель</div>
                    {isMuted && <div className="mute-indicator">🔇</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Сетка участников */}
            <div className="participants-grid">
              {participants.slice(1, 9).map((participant, index) => (
                <div key={participant.id} className={`participant-video ${participant.isSpeaking ? 'speaking' : ''}`}>
                  <div className="video-frame">
                    {participant.isVideoOff ? (
                      <div className="video-off-screen">
                        <img src={participant.avatar} alt={participant.name} className="participant-avatar" />
                        <div className="video-off-text">Выкл.</div>
                      </div>
                    ) : (
                      <img src={participant.avatar} alt={participant.name} className="participant-video-img" />
                    )}
                    <div className="video-overlay">
                      <div className="speaker-name">{participant.name}</div>
                      {participant.isMuted && <div className="mute-indicator">🔇</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Индикатор экрана */}
            {isScreenSharing && (
              <div className="screen-share-indicator">
                <span>📺 Демонстрация экрана</span>
              </div>
            )}
          </div>

          {/* Панель управления */}
          <div className="control-panel">
            <div className="control-buttons">
              <button 
                className={`control-btn ${isMuted ? 'active' : ''}`}
                onClick={toggleMute}
                title={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
              >
                {isMuted ? '🔇' : '🎤'}
              </button>
              
              <button 
                className={`control-btn ${isVideoOff ? 'active' : ''}`}
                onClick={toggleVideo}
                title={isVideoOff ? 'Включить камеру' : 'Выключить камеру'}
              >
                {isVideoOff ? '📹' : '📷'}
              </button>
              
              <button 
                className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                onClick={toggleScreenSharing}
                title={isScreenSharing ? 'Остановить демонстрацию' : 'Демонстрация экрана'}
              >
                📺
              </button>
              
              <button 
                className={`control-btn ${isRecording ? 'active' : ''}`}
                onClick={toggleRecording}
                title={isRecording ? 'Остановить запись' : 'Начать запись'}
              >
                {isRecording ? '⏹️' : '🔴'}
              </button>
              
              <button 
                className="control-btn"
                onClick={() => setShowChat(!showChat)}
                title="Чат"
              >
                💬
              </button>
            </div>
            
            <button className="leave-call-btn" onClick={handleLeaveCall}>
              Покинуть встречу
            </button>
          </div>

          {/* Чат */}
          {showChat && (
            <div className="chat-panel">
              <div className="chat-header">
                <h3>Чат встречи</h3>
                <button className="close-chat" onClick={() => setShowChat(false)}>✕</button>
              </div>
              <div className="chat-messages">
                {chatMessages.map(message => (
                  <div key={message.id} className={`chat-message ${message.type}`}>
                    {message.type === 'system' ? (
                      <div className="system-message">{message.text}</div>
                    ) : (
                      <>
                        <div className="message-sender">{message.sender.name}</div>
                        <div className="message-text">{message.text}</div>
                        <div className="message-time">
                          {message.timestamp.toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <form className="chat-input-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="chat-input"
                />
                <button type="submit" className="send-message-btn">📤</button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUpcomingModal = () => {
    if (!showUpcomingModal || !selectedLesson) return null;

    const timeUntilStart = new Date(selectedLesson.date) - new Date();
    const minutesUntilStart = Math.floor(timeUntilStart / (1000 * 60));

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Урок не начался</h3>
            <button className="modal-close" onClick={() => setShowUpcomingModal(false)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="upcoming-lesson-info">
              <h4>{selectedLesson.title}</h4>
              <p className="course-name">Курс: {selectedLesson.courseTitle}</p>
              <p className="lesson-time">
                Начало: {formatTime(selectedLesson.date)}
              </p>
              <p className="meeting-code">Код встречи: {selectedLesson.meetingCode}</p>
              {minutesUntilStart > 0 ? (
                <p className="time-until-start">
                  До начала урока осталось: {minutesUntilStart} мин.
                </p>
              ) : (
                <p className="time-until-start">
                  Урок скоро начнется
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn secondary"
                onClick={() => setShowUpcomingModal(false)}
              >
                Закрыть
              </button>
              <button 
                className="modal-btn primary"
                onClick={() => {
                  setShowUpcomingModal(false);
                  setMessage({ 
                    type: 'success', 
                    text: 'Напоминание о начале урока добавлено в календарь' 
                  });
                }}
              >
                Добавить в календарь
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderErrorModal = () => {
    if (!showErrorModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Ошибка подключения</h3>
            <button className="modal-close" onClick={() => setShowErrorModal(false)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <h4>Не удалось присоединиться к видеоконференции</h4>
              <p>Попробуйте позднее или обратитесь к администратору.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn primary"
                onClick={() => setShowErrorModal(false)}
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="video-conference-container">
      <h1>Видеоконференции</h1>
      
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {renderUpcomingModal()}

      {isConnecting && (
        <div className="connecting-overlay">
          <div className="connecting-content">
            <div className="connecting-spinner"></div>
            <h3>Подключение к встрече...</h3>
            <p>Пожалуйста, подождите</p>
          </div>
        </div>
      )}

      {activeCall ? (
        renderVideoCall()
      ) : (
        <div className="conference-schedule">
          <div className="schedule-sidebar">
            {renderCalendar()}
          </div>

          <div className="schedule-main">
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
                      <div className="lesson-meta">
                        <span className={`lesson-status ${lesson.status}`}>
                          {lesson.status === 'live' ? '🔴 Идет сейчас' : '⏰ Скоро начнется'}
                        </span>
                        <span className="lesson-participants">
                          👥 {lesson.participants} участников
                        </span>
                        <span className="lesson-code">
                          Код: {lesson.meetingCode}
                        </span>
                      </div>
                      <button 
                        className={`join-call-btn ${lesson.status === 'live' ? 'live' : 'upcoming'}`}
                        onClick={() => handleJoinCall(lesson)}
                      >
                        {lesson.status === 'live' ? 'Присоединиться' : 'Информация'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-lessons">
                <div className="no-lessons-icon">📅</div>
                <h3>На этот день занятий нет</h3>
                <p>Выберите другую дату или создайте новое занятие</p>
              </div>
            )}
          </div>
        </div>
      )}

      {renderErrorModal()}
    </div>
  );
};

export default VideoConference; 