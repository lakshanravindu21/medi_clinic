import { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { AiOutlineSearch, AiOutlineMore, AiOutlineSend, AiOutlineSmile, AiOutlinePaperClip } from 'react-icons/ai';
import { BsCheckAll } from 'react-icons/bs';
import '../styles/messages.css';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageInput, setMessageInput] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Ravindu',
      message: 'Have you called them?',
      time: 'Just Now',
      unread: false,
      online: true,
      avatar: 'https://ui-avatars.com/api/?name=Ravindu&background=DC2626&color=fff'
    },
    {
      id: 2,
      name: 'Ishan Rathnayake',
      message: 'Have you called them?',
      time: 'Just Now',
      unread: 2,
      online: true,
      avatar: 'https://ui-avatars.com/api/?name=Ishan+Rathnayake&background=F59E0B&color=fff'
    },
    {
      id: 3,
      name: 'Hirusha Rashmika',
      message: 'Typing...',
      time: '11:49 AM',
      unread: false,
      typing: true,
      online: true,
      avatar: 'https://ui-avatars.com/api/?name=Hirusha+Rashmika&background=8B5CF6&color=fff'
    },
    {
      id: 4,
      name: 'Kavindu',
      message: 'Video',
      time: '10 mins ago',
      unread: false,
      online: false,
      avatar: 'https://ui-avatars.com/api/?name=Kavindu&background=EC4899&color=fff'
    },
    {
      id: 5,
      name: 'Adithya',
      message: 'Do you know which...',
      time: 'Yesterday',
      unread: false,
      online: false,
      avatar: 'https://ui-avatars.com/api/?name=Adithya&background=10B981&color=fff'
    },
    {
      id: 6,
      name: 'Imasha',
      message: '🎵 Audio',
      time: 'Wednesday',
      unread: false,
      online: false,
      avatar: 'https://ui-avatars.com/api/?name=Imasha&background=F59E0B&color=fff'
    },
    {
      id: 7,
      name: 'Shehan',
      message: 'Thank You',
      time: '1 week ago',
      unread: 2,
      online: false,
      avatar: 'https://ui-avatars.com/api/?name=Shehan&background=6366F1&color=fff'
    },
    {
      id: 8,
      name: 'Keshani',
      message: '📷 Photo',
      time: 'Wednesday',
      unread: false,
      online: false,
      avatar: 'https://ui-avatars.com/api/?name=Keshani&background=EC4899&color=fff'
    },
    {
      id: 9,
      name: 'Ayodhya',
      message: 'Thank You',
      time: 'Friday',
      unread: false,
      online: false,
      avatar: 'https://ui-avatars.com/api/?name=Ayodhya&background=14B8A6&color=fff'
    },
    {
      id: 10,
      name: 'Sahan',
      message: 'Excellent work!',
      time: '1 week ago',
      unread: 2,
      online: false,
      avatar: 'https://ui-avatars.com/api/?name=Sahan&background=F97316&color=fff'
    },
  ];

  const chatMessages = [
    {
      id: 1,
      sender: 'Ravindu',
      message: 'Hello @Dr. Horace Keene\nDoctor, I\'ve been feeling unwell. My blood pressure has been high for the past few days. Should I be worried?',
      time: '8:16 PM',
      isOwn: false
    },
    {
      id: 2,
      sender: 'Keshani Vinodya',
      message: 'Can you share your recent readings? Also, have you experienced dizziness, headaches, or chest discomfort?',
      time: '8:16 PM',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Ravindu',
      message: 'My readings were 140/90 and 145/92. No headaches, but I feel fatigued.',
      time: '8:16 PM',
      isOwn: false
    },
    {
      id: 4,
      sender: 'Keshani Vinodya',
      message: 'Audio message',
      time: '8:16 PM',
      isOwn: true,
      isAudio: true,
      duration: '0:05'
    },
    {
      id: 5,
      sender: 'Ravindu',
      message: 'Okay, I\'ll track my readings. If it stays high, should I schedule a visit?',
      time: '8:16 PM',
      isOwn: false
    }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="dashboard-main">
        <Header />
        
        <div className="messages-content">
          <h1>Chat</h1>

          <div className="messages-container">
            {/* Chat List */}
            <div className="chat-list">
              <div className="chat-list-header">
                <h2>Chat</h2>
                <div className="chat-list-actions">
                  <button className="icon-btn"><AiOutlineSearch /></button>
                  <button className="icon-btn"><AiOutlineMore /></button>
                </div>
              </div>

              <div className="conversations">
                {conversations.map((conv) => (
                  <div 
                    key={conv.id}
                    className={`conversation-item ${selectedChat === conv.id ? 'active' : ''}`}
                    onClick={() => setSelectedChat(conv.id)}
                  >
                    <div className="conversation-avatar">
                      <img src={conv.avatar} alt={conv.name} />
                      {conv.online && <span className="online-indicator"></span>}
                    </div>
                    <div className="conversation-info">
                      <h4>{conv.name}</h4>
                      <p className={conv.typing ? 'typing' : ''}>{conv.message}</p>
                    </div>
                    <div className="conversation-meta">
                      <span className="time">{conv.time}</span>
                      {conv.unread > 0 && (
                        <span className="unread-badge">{conv.unread}</span>
                      )}
                      {!conv.unread && <BsCheckAll className="check-icon" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="chat-window">
              <div className="chat-header">
                <div className="chat-user-info">
                  <img src="https://ui-avatars.com/api/?name=Ravindu&background=DC2626&color=fff" alt="Ravindu" />
                  <div>
                    <h3>Ravindu</h3>
                    <p>Last Seen at 07:15 PM</p>
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                <div className="date-separator">
                  <span>Today, March 28</span>
                </div>

                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.isOwn ? 'own-message' : 'other-message'}`}>
                    <img 
                      src={msg.isOwn 
                        ? 'https://ui-avatars.com/api/?name=Keshani+Vinodya&background=4F46E5&color=fff'
                        : 'https://ui-avatars.com/api/?name=Ravindu&background=DC2626&color=fff'
                      } 
                      alt={msg.sender}
                      className="message-avatar"
                    />
                    <div className="message-content">
                      <div className="message-header">
                        <span className="sender-name">{msg.sender}</span>
                        <span className="message-time">{msg.time}</span>
                        {msg.isOwn && <BsCheckAll className="check-icon" />}
                      </div>
                      {msg.isAudio ? (
                        <div className="audio-message">
                          <button className="play-btn">▶</button>
                          <div className="audio-wave">
                            {[...Array(20)].map((_, i) => (
                              <span key={i} className="wave-bar"></span>
                            ))}
                          </div>
                          <span className="audio-duration">{msg.duration}</span>
                        </div>
                      ) : (
                        <p>{msg.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input-container">
                <button className="input-icon-btn">
                  <AiOutlineSmile size={20} />
                </button>
                <button className="input-icon-btn">
                  <AiOutlinePaperClip size={20} />
                </button>
                <input 
                  type="text" 
                  placeholder="Type your message here..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button className="send-btn">
                  <AiOutlineSend size={20} />
                </button>
              </div>
            </div>
          </div>

          <footer className="dashboard-footer">
            2025 © Fuchsius, All Rights Reserved
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Messages;