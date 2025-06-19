import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/minimalist.css';

const Overview = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        coursesCount: 0,
        messagesCount: 0,
        lastActivity: null
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchUserStats(parsedUser.id);
        }
    }, []);

    const fetchUserStats = async (userId) => {
        try {
            const [coursesRes, messagesRes] = await Promise.all([
                axios.get(`/api/user-courses/${userId}`),
                axios.get(`/api/user-chats/${userId}`)
            ]);

            const courses = coursesRes.data || [];
            const chats = messagesRes.data || [];
            
            // Подсчитываем общее количество непрочитанных сообщений
            const unreadMessages = chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
            
            // Находим последнюю активность (последнее сообщение или присоединение к курсу)
            const lastMessage = chats.reduce((latest, chat) => {
                if (!chat.last_message_time) return latest;
                return !latest || new Date(chat.last_message_time) > new Date(latest) 
                    ? chat.last_message_time 
                    : latest;
            }, null);

            setStats({
                coursesCount: courses.length,
                messagesCount: unreadMessages,
                lastActivity: lastMessage
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Нет активности';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleLabel = (role) => {
        const roles = {
            'admin': 'Администратор',
            'teacher': 'Преподаватель',
            'student': 'Студент'
        };
        return roles[role] || role;
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div className="welcome-card">
                <div className="welcome-header">
                    <h1>Добро пожаловать{user ? `, ${user.name} ${user.surname}` : ''}!</h1>
                    {user && (
                        <div className="user-role-badge">
                            {getRoleLabel(user.role)}
                        </div>
                    )}
                </div>
                
                <div className="welcome-content">
                    <p className="welcome-text">
                        Добро пожаловать на платформу EduLearn! Здесь вы найдёте видеоматериалы и курсы 
                        по разным предметам для эффективного обучения. Начните свой путь к знаниям прямо сейчас!
                    </p>

                    {user && (
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📚</div>
                                <div className="stat-info">
                                    <div className="stat-value">{stats.coursesCount}</div>
                                    <div className="stat-label">Мои курсы</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💬</div>
                                <div className="stat-info">
                                    <div className="stat-value">{stats.messagesCount}</div>
                                    <div className="stat-label">Непрочитанные сообщения</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🕒</div>
                                <div className="stat-info">
                                    <div className="stat-value">{formatDate(stats.lastActivity)}</div>
                                    <div className="stat-label">Последняя активность</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!user && (
                        <div className="welcome-actions">
                            <a href="/login" className="btn btn-primary">Войти в систему</a>
                            <a href="/register" className="btn btn-secondary">Зарегистрироваться</a>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .welcome-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    padding: 24px;
                    margin-bottom: 24px;
                }

                .welcome-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }

                .welcome-header h1 {
                    margin: 0;
                    font-size: 24px;
                    color: #333;
                }

                .user-role-badge {
                    background: #f0f0f0;
                    padding: 6px 12px;
                    border-radius: 16px;
                    font-size: 14px;
                    color: #666;
                }

                .welcome-text {
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 24px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-top: 24px;
                }

                .stat-card {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .stat-icon {
                    font-size: 24px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .stat-info {
                    flex: 1;
                }

                .stat-value {
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                }

                .stat-label {
                    font-size: 14px;
                    color: #666;
                    margin-top: 4px;
                }

                .welcome-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                }

                @media (max-width: 600px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .welcome-actions {
                        flex-direction: column;
                    }

                    .welcome-actions .btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default Overview;