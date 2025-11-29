'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Loader } from 'lucide-react';
import { initializeSocket, getSocket, disconnectSocket } from '@/utils/socket';
import { useAuthStore } from '@/store/authStore';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function ChatWidget() {
  const { user, token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    if (token && isOpen) {
      try {
        const socket = initializeSocket(token);

        // Listen for new messages
        socket.on('new-message', (data) => {
          if (data.chatId === chatId) {
            setMessages(prev => [...prev, data.message]);
            if (data.sender.id !== user?.id) {
              setUnreadCount(prev => prev + 1);
            }
          }
        });

        // Listen for typing indicators
        socket.on('user-typing', (data) => {
          if (data.role !== 'user') {
            setIsTyping(true);
          }
        });

        socket.on('user-stopped-typing', (data) => {
          if (data.role !== 'user') {
            setIsTyping(false);
          }
        });

        // Listen for chat updates
        socket.on('chat-updated', (data) => {
          if (data.chat._id === chatId) {
            toast.success('Chat updated');
          }
        });

        socket.on('chat-assigned', (data) => {
          if (data.chat._id === chatId) {
            toast.success('An admin has joined the chat');
          }
        });

        socket.on('chat-closed', (data) => {
          if (data.chat._id === chatId) {
            toast.info('Chat has been closed');
            loadUserChats();
          }
        });

        socket.on('error', (data) => {
          toast.error(data.message || 'An error occurred');
        });

        return () => {
          socket.off('new-message');
          socket.off('user-typing');
          socket.off('user-stopped-typing');
          socket.off('chat-updated');
          socket.off('chat-assigned');
          socket.off('chat-closed');
          socket.off('error');
        };
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    }

    return () => {
      if (!isOpen) {
        disconnectSocket();
      }
    };
  }, [token, isOpen, chatId, user]);

  // Load user's existing chats
  const loadUserChats = async () => {
    try {
      const response = await api.get('/chat/my-chats?status=open');
      if (response.data.chats && response.data.chats.length > 0) {
        const openChat = response.data.chats[0];
        setChatId(openChat._id);
        setMessages(openChat.messages || []);
        joinChat(openChat._id);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  // Join a chat room
  const joinChat = (id) => {
    try {
      const socket = getSocket();
      socket.emit('join-chat', id);
    } catch (error) {
      console.error('Failed to join chat:', error);
    }
  };

  // Create new chat
  const createNewChat = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/chat', {
        subject: 'Customer Support',
        category: 'general',
        priority: 'medium',
        message: 'Hello, I need assistance.'
      });

      const newChat = response.data.chat;
      setChatId(newChat._id);
      setMessages(newChat.messages || []);
      joinChat(newChat._id);
      toast.success('Chat created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create chat');
      if (error.response?.data?.chatId) {
        // User already has an active chat
        setChatId(error.response.data.chatId);
        loadChatById(error.response.data.chatId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load specific chat by ID
  const loadChatById = async (id) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/chat/${id}`);
      setMessages(response.data.chat.messages || []);
      joinChat(id);
    } catch (error) {
      toast.error('Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening chat
  const handleOpen = async () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);

    if (!chatId) {
      await loadUserChats();
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    // If no chat exists, create one first
    if (!chatId) {
      await createNewChat();
      return;
    }

    try {
      setIsSending(true);
      const socket = getSocket();

      socket.emit('send-message', {
        chatId,
        message: newMessage.trim(),
        messageType: 'text'
      });

      setNewMessage('');

      // Stop typing indicator
      socket.emit('stop-typing', chatId);
    } catch (error) {
      // Fallback to REST API
      try {
        await api.post(`/chat/${chatId}/messages`, {
          message: newMessage.trim()
        });
        setNewMessage('');
      } catch (apiError) {
        toast.error('Failed to send message');
      }
    } finally {
      setIsSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!chatId) return;

    try {
      const socket = getSocket();
      socket.emit('typing', chatId);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', chatId);
      }, 2000);
    } catch (error) {
      console.error('Typing indicator error:', error);
    }
  };

  // Close chat
  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 z-50"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 ${isMinimized ? 'h-16' : 'h-[600px]'}`}>
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">Customer Support</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-blue-700 p-1 rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="hover:bg-blue-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet.</p>
                    <p className="text-sm mt-2">Send a message to start chatting!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isOwnMessage = msg.sender_role === 'user';
                      return (
                        <div
                          key={index}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg p-3 ${
                              isOwnMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-800 border border-gray-200'
                            }`}
                          >
                            {!isOwnMessage && (
                              <p className="text-xs font-semibold mb-1 text-gray-600">
                                Support
                              </p>
                            )}
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                  >
                    {isSending ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
