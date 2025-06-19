import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const styles = {
  container: {
    display: 'flex', gap: 0, height: '80vh', background: '#f7f8fa', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden', maxWidth: 1100, margin: '32px auto', minHeight: 500,
    flexDirection: 'row',
  },
  chatsList: {
    width: 320, minWidth: 220, background: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column',
  },
  chatsHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 12px 24px', borderBottom: '1px solid #eee',
  },
  chatsTitle: { fontSize: 22, fontWeight: 600, color: '#222' },
  newChatBtn: { background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 500, fontSize: 15 },
  chatSearch: { padding: '12px 24px', borderBottom: '1px solid #eee' },
  chatSearchInput: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 },
  chatsScroll: { flex: 1, overflowY: 'auto', padding: '0 0 10px 0' },
  chatItem: isActive => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', cursor: 'pointer', background: isActive ? '#f0f2f5' : 'transparent', borderLeft: isActive ? '4px solid #111' : '4px solid transparent', transition: 'background 0.2s', borderRadius: isActive ? '0 12px 12px 0' : 0 }),
  chatAvatar: { width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#444' },
  chatInfo: { flex: 1, minWidth: 0 },
  chatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  chatName: { fontWeight: 600, fontSize: 16, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  chatTime: { fontSize: 13, color: '#888', marginLeft: 8 },
  chatLastMessage: { fontSize: 14, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  messagesArea: { flex: 1, display: 'flex', flexDirection: 'column', background: '#f7f8fa', minWidth: 0 },
  messagesHeader: { display: 'flex', alignItems: 'center', gap: 14, padding: '24px 32px', borderBottom: '1px solid #eee', background: '#fff' },
  messagesHeaderInfo: { flex: 1 },
  messagesHeaderName: { fontWeight: 600, fontSize: 18, color: '#222' },
  messagesContent: { flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 14 },
  message: isSent => ({ alignSelf: isSent ? 'flex-end' : 'flex-start', background: isSent ? '#111' : '#fff', color: isSent ? '#fff' : '#222', borderRadius: 16, padding: '12px 18px', maxWidth: '70%', boxShadow: isSent ? '0 2px 8px rgba(0,0,0,0.07)' : '0 1px 4px rgba(0,0,0,0.04)', fontSize: 15, position: 'relative', wordBreak: 'break-word' }),
  messageTime: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'right' },
  messagesInput: { padding: '20px 32px', background: '#fff', borderTop: '1px solid #eee' },
  messageForm: { display: 'flex', alignItems: 'center', gap: 12 },
  messageInput: { flex: 1, borderRadius: 10, border: '1px solid #ddd', padding: '12px 16px', fontSize: 15, resize: 'none', background: '#fafbfc' },
  sendButton: { background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '0 22px', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18 },
  error: { color: '#c00', background: '#fff0f0', padding: 10, borderRadius: 6, margin: 16 },
  newChatModalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  newChatModal: { background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxWidth: 350, width: '95%', padding: 32, position: 'relative' },
  newChatHeader: { fontWeight: 600, fontSize: 18, marginBottom: 18 },
  newChatUser: { padding: '12px 0', borderBottom: '1px solid #eee', cursor: 'pointer', fontSize: 15, color: '#222' },
  closeModal: { position: 'absolute', top: 10, right: 14, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' },
  '@media (max-width: 900px)': {
    container: { flexDirection: 'column', height: 'auto', minHeight: 400 },
    chatsList: { width: '100%', minWidth: 0, borderRight: 'none', borderBottom: '1px solid #eee' },
    messagesArea: { minWidth: 0 },
    messagesHeader: { padding: '18px 12px' },
    messagesContent: { padding: '18px 10px' },
    messagesInput: { padding: '12px 10px' },
  },
};

const Messages = () => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    if (userData.id) {
      fetchChats(userData.id);
      fetchAvailableUsers(userData.id);
    }
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      const interval = setInterval(() => fetchMessages(activeChat), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async (userId) => {
    try {
      const res = await axios.get(`/api/user-chats/${userId}`);
      setChats(res.data || []);
    } catch (error) {
      setError('Ошибка при загрузке чатов');
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await axios.get(`/api/chat-messages/${chatId}`);
      const messagesArray = Array.isArray(res.data) ? res.data : 
                          (res.data?.messages ? Object.values(res.data.messages) : []);
      setMessages(messagesArray);
    } catch (error) {
      setError('Ошибка при загрузке сообщений');
    }
  };

  const fetchAvailableUsers = async (userId) => {
    try {
      const res = await axios.get(`/api/available-users/${userId}`);
      setAvailableUsers(res.data || []);
    } catch (error) {
      setError('Ошибка при загрузке пользователей');
    }
  };

  const handleCreateChat = async (userId) => {
    try {
      const res = await axios.post('/api/chats', {
        userId1: user.id,
        userId2: userId
      });

      if (res.data.chatId) {
        setShowNewChatModal(false);
        setSearchQuery('');
        await fetchChats(user.id);
        setActiveChat(res.data.chatId);
      }
    } catch (error) {
      setError('Ошибка при создании чата');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id || !activeChat) return;

    try {
      console.log('Sending message:', {
        chatId: activeChat,
        senderId: user.id,
        content: newMessage.trim()
      });

      const res = await axios.post('/api/chat-messages', {
        chatId: activeChat,
        senderId: user.id,
        content: newMessage.trim()
      });

      console.log('Send message response:', res.data);

      if (res.data?.message) {
        setMessages(prev => [...prev, res.data.message]);
        setNewMessage('');
        await fetchChats(user.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Ошибка при отправке сообщения');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getChatName = (chat) => {
    if (!chat) return '';
    if (chat.user_id === user?.id) {
      return `${chat.participant_name || ''} ${chat.participant_surname || ''}`.trim() || 'Пользователь';
    }
    return `${chat.name || ''} ${chat.surname || ''}`.trim() || 'Пользователь';
  };

  const getMessageSenderName = (msg) => {
    if (msg.sender_id === user?.id) {
      return 'Вы';
    }
    const chat = chats.find(c => c.id === activeChat);
    if (!chat) return 'Пользователь';
    return getChatName(chat);
  };

  return (
    <div style={styles.container}>
      {error && <div style={styles.error}>{error}</div>}

      {/* Список чатов */}
      <div style={styles.chatsList}>
        <div style={styles.chatsHeader}>
          <span style={styles.chatsTitle}>Сообщения</span>
          <button 
            style={styles.newChatBtn}
            onClick={() => setShowNewChatModal(true)}
          >
            Новый чат
          </button>
        </div>

        <div style={styles.chatSearch}>
          <input
            type="text"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.chatSearchInput}
          />
        </div>

        <div style={styles.chatsScroll}>
          {chats
            .filter(chat => {
              const searchLower = searchQuery.toLowerCase();
              const name = getChatName(chat).toLowerCase();
              return name.includes(searchLower);
            })
            .map(chat => (
              <div
                key={chat.id}
                style={styles.chatItem(activeChat === chat.id)}
                onClick={() => setActiveChat(chat.id)}
              >
                <div style={styles.chatAvatar}>
                  {getChatName(chat)[0] || 'П'}
                </div>
                <div style={styles.chatInfo}>
                  <div style={styles.chatHeader}>
                    <span style={styles.chatName}>{getChatName(chat)}</span>
                    <span style={styles.chatTime}>
                      {chat.last_message_time ? formatTime(chat.last_message_time) : ''}
                    </span>
                  </div>
                  <div style={styles.chatLastMessage}>
                    {chat.last_message || 'Нет сообщений'}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Область чата */}
      <div style={styles.messagesArea}>
        {activeChat ? (
          <>
            <div style={styles.messagesHeader}>
              <div style={styles.chatAvatar}>
                {getChatName(chats.find(c => c.id === activeChat))[0] || 'П'}
              </div>
              <div style={styles.messagesHeaderInfo}>
                <div style={styles.messagesHeaderName}>
                  {getChatName(chats.find(c => c.id === activeChat))}
                </div>
              </div>
            </div>

            <div style={styles.messagesContent}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={styles.message(msg.sender_id === user?.id)}
                >
                  <div>{msg.content}</div>
                  <div style={styles.messageTime}>{formatTime(msg.created_at)}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={styles.messagesInput}>
              <form onSubmit={handleSendMessage} style={styles.messageForm}>
                <textarea
                  style={styles.messageInput}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  rows="1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button type="submit" style={styles.sendButton}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#888',fontSize:18}}>
            Выберите чат или создайте новый
          </div>
        )}
      </div>

      {/* Модальное окно нового чата */}
      {showNewChatModal && (
        <div style={styles.newChatModalOverlay}>
          <div style={styles.newChatModal}>
            <button style={styles.closeModal} onClick={() => setShowNewChatModal(false)}>✕</button>
            <div style={styles.newChatHeader}>Новый чат</div>
            {availableUsers.length === 0 && <div style={{color:'#888'}}>Нет доступных пользователей</div>}
            {availableUsers.map(u => (
              <div key={u.id} style={styles.newChatUser} onClick={() => handleCreateChat(u.id)}>
                {u.name} {u.surname} ({u.login})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages; 