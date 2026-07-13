// frontend/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Establish a clean singular connection to the backend
const socket = io('http://localhost:3001');

export default function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load message history on app startup
  useEffect(() => {
    fetch('http://localhost:3001/api/messages')
      .then((res) => res.json())
      .then((data) => setChat(data))
      .catch((err) => console.error("Error fetching history:", err));
  }, []);

  // Set up real-time WebSocket event streams
  useEffect(() => {
    socket.on('receive_message', (newMessage) => {
      setChat((prev) => [...prev, newMessage]);
    });

    socket.on('user_typing', (typingUsername) => {
      setTypingUser(typingUsername);
    });

    socket.on('user_stop_typing', () => {
      setTypingUser('');
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, []);

  // Smooth scroll to view newest incoming text messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, typingUser]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) setIsLoggedIn(true);
  };

  // Broadcast typing status and handle idle time-out detection
  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Emit typing status
    socket.emit('typing', username);

    // Clear previous timeout handler
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // If user rests for 1 second without keydowns, declare active typing stopped
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing');
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Clear active typing delays out cleanly on absolute submit
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('stop_typing');

    const messageData = {
      username,
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const savedMessage = await response.json();
        socket.emit('send_message', savedMessage);
        setMessage('');
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <form onSubmit={handleLogin} style={styles.card}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Enter Chatroom</h2>
          <input
            style={styles.input}
            type="text"
            placeholder="Choose a username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button style={styles.button} type="submit">Join Chat</button>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>Public Lounge — Guest: {username}</h3>
        </div>
        
        <div style={styles.messageArea}>
          {chat.map((msg) => (
            <div 
              key={msg.id} 
              style={{
                ...styles.messageBubble,
                alignSelf: msg.username === username ? 'flex-end' : 'flex-start',
                backgroundColor: msg.username === username ? '#007bff' : '#e9ecef',
                color: msg.username === username ? '#fff' : '#000',
              }}
            >
              <span style={styles.userLabel}>{msg.username}</span>
              <p style={{ margin: '4px 0' }}>{msg.text}</p>
              <span style={{...styles.timeLabel, color: msg.username === username ? '#ddd' : '#666'}}>
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Typing Indicator Display */}
          {typingUser && (
            <div style={styles.typingIndicator}>
              💬 {typingUser} is typing...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={styles.inputArea}>
          <input
            style={styles.chatInput}
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={handleInputChange}
          />
          <button style={styles.sendButton} type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

// Single-file embedded styles to keep code clean and self-contained
const styles = {
  container: { display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', fontFamily: 'Arial, sans-serif' },
  card: { padding: '40px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '300px' },
  input: { width: '90%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' },
  button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' },
  chatBox: { width: '450px', height: '650px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '20px', backgroundColor: '#007bff', color: '#fff', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' },
  messageArea: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fafafa' },
  messageBubble: { padding: '10px 16px', borderRadius: '16px', maxWidth: '70%', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  userLabel: { fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.8 },
  timeLabel: { fontSize: '0.65rem', textAlign: 'right', marginTop: '2px' },
  typingIndicator: { fontSize: '0.85rem', color: '#555', fontStyle: 'italic', padding: '4px', alignSelf: 'flex-start' },
  inputArea: { display: 'flex', borderTop: '1px solid #eee', padding: '15px', backgroundColor: '#fff' },
  chatInput: { flex: 1, padding: '12px 18px', borderRadius: '24px', border: '1px solid #ddd', outline: 'none', fontSize: '0.95rem' },
  sendButton: { marginLeft: '12px', padding: '12px 24px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold' }
};