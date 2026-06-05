'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';

const POLL_INTERVAL = 3000;

export default function ChatWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [chatStatus, setChatStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const lastMessageCount = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const fetchMessages = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/chat/${id}`);
      const msgs = data.messages || [];
      setMessages(msgs);
      setChatStatus(data.chat?.status || data.status);
      const newCount = msgs.length;
      if (newCount > lastMessageCount.current && lastMessageCount.current > 0) {
        setUnreadCount(prev => prev + (newCount - lastMessageCount.current));
      }
      lastMessageCount.current = newCount;
    } catch {}
  }, []);

  const loadChat = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data } = await api.get('/chat/my-chats');
      const chats = data.chats || data || [];
      const active = chats.find(c => ['open', 'assigned'].includes(c.status));
      if (active) {
        setChatId(active.id);
        setChatStatus(active.status);
        await fetchMessages(active.id);
      }
    } catch {}
    finally { setIsLoading(false); }
  }, [user, fetchMessages]);

  // Poll when open
  useEffect(() => {
    if (isOpen && !isMinimized && chatId) {
      pollRef.current = setInterval(() => fetchMessages(chatId), POLL_INTERVAL);
      return () => clearInterval(pollRef.current);
    }
  }, [isOpen, isMinimized, chatId, fetchMessages]);

  useEffect(() => {
    if (isOpen && !chatId) loadChat();
    if (isOpen) setUnreadCount(0);
  }, [isOpen, chatId, loadChat]);

  const startNewChat = async (text) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/chat', {
        subject: 'Support Request',
        category: 'general',
        priority: 'medium',
        message: text || 'Hello, I need help.',
      });
      const id = data.chat?.id || data.id;
      setChatId(id);
      setChatStatus('open');
      setNewMessage('');
      await fetchMessages(id);
    } catch {}
    finally { setIsLoading(false); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const text = newMessage.trim();

    if (!chatId) {
      setNewMessage('');
      await startNewChat(text);
      return;
    }

    setIsSending(true);
    setNewMessage('');

    const optimistic = {
      id: `tmp-${Date.now()}`,
      message: text,
      sender: { username: user?.username, role: user?.role },
      sender_id: user?.id,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      await api.post(`/chat/${chatId}/messages`, { message: text });
      await fetchMessages(chatId);
    } catch {}
    finally { setIsSending(false); }
  };

  const closeChat = async () => {
    if (!chatId) return;
    try {
      await api.post(`/chat/${chatId}/close`);
      setChatStatus('closed');
    } catch {}
  };

  const resetChat = () => {
    setChatId(null);
    setChatStatus(null);
    setMessages([]);
    lastMessageCount.current = 0;
  };

  if (!user) return null;

  const isClosed = chatStatus === 'closed';

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000 }}>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--purple), oklch(0.62 0.18 320))',
            color: '#fff', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s', position: 'relative',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title="Chat with support"
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              background: '#ef4444', color: '#fff', fontSize: '0.65rem',
              fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
            }}>{unreadCount}</span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div style={{
          width: 340, background: 'var(--bg-raised)',
          border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', height: isMinimized ? 'auto' : 480,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1rem',
            background: 'linear-gradient(135deg, var(--purple), oklch(0.62 0.18 320))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={16} color="#fff" />
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Support Chat</span>
              {chatStatus === 'assigned' && (
                <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.65rem', padding: '1px 7px', borderRadius: 99 }}>
                  Agent online
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button onClick={() => setIsMinimized(m => !m)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, opacity: 0.8 }}>
                {isMinimized ? <ChevronDown size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={() => { setIsOpen(false); setUnreadCount(0); }}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, opacity: 0.8 }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {isLoading ? (
                  <div style={{ textAlign: 'center', color: 'var(--ink-tertiary)', fontSize: '0.82rem', marginTop: '2rem' }}>
                    Loading...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.82rem', marginTop: '2rem', lineHeight: 1.8 }}>
                    <MessageCircle size={32} style={{ opacity: 0.25, display: 'block', margin: '0 auto 0.75rem' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>Hi {user?.username}! 👋</p>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--ink-tertiary)', fontSize: '0.78rem' }}>Send a message to reach our support team.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id || msg.sender?.username === user?.username;
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '80%', padding: '0.5rem 0.75rem',
                          borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: isOwn ? 'var(--purple)' : 'var(--bg-elevated)',
                          color: isOwn ? '#fff' : 'var(--ink)',
                          fontSize: '0.82rem', lineHeight: 1.5,
                        }}>
                          {!isOwn && (
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--purple-light)', marginBottom: 2 }}>
                              {msg.sender?.username || 'Support'}
                            </div>
                          )}
                          <p style={{ margin: 0 }}>{msg.message}</p>
                          <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: 3, textAlign: 'right' }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {isClosed && (
                  <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--ink-tertiary)', padding: '0.5rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
                    This conversation has been closed.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {isClosed ? (
                <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <button onClick={resetChat}
                    style={{ background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: '0.5rem 1.25rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                    New conversation
                  </button>
                </div>
              ) : (
                <form onSubmit={sendMessage} style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-md)', padding: '0.5rem 0.75rem',
                      color: 'var(--ink)', fontSize: '0.82rem', outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--purple)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button type="submit" disabled={!newMessage.trim() || isSending}
                    style={{
                      background: 'var(--purple)', color: '#fff', border: 'none',
                      borderRadius: 'var(--r-md)', padding: '0.5rem 0.75rem',
                      cursor: newMessage.trim() ? 'pointer' : 'default',
                      opacity: newMessage.trim() ? 1 : 0.4,
                      display: 'flex', alignItems: 'center',
                    }}>
                    <Send size={15} />
                  </button>
                  {chatId && !isClosed && (
                    <button type="button" onClick={closeChat} title="End chat"
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.5rem', color: 'var(--ink-tertiary)', cursor: 'pointer' }}>
                      <X size={13} />
                    </button>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
