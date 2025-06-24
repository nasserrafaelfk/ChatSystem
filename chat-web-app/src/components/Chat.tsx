import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Message, User } from '../types';
import { getConversation, sendMessage, getAllUsers } from '../services/api';
import { Send, LogOut, Users, MessageSquare } from 'lucide-react';

export const Chat: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (token) {
        const response = await getAllUsers(token);
        if (response.status === 200) {
          // Filter out the current user
          const filteredUsers = response.data.filter((u: User) => u.id !== user?.id);
          setUsers(filteredUsers);
        }
      }
    };
    fetchUsers();
  }, [token, user?.id]);

  useEffect(() => {
    if (token && selectedUser) {
      const fetchMessages = async () => {
        const response = await getConversation(token, selectedUser.id);
        if (response.status === 200) {
          setMessages(response.data);
        }
      };
      fetchMessages();

      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [token, selectedUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !token || !selectedUser) return;

    try {
      const response = await sendMessage(token, selectedUser.id, newMessage);
      if (response.status === 200) {
        setMessages([...messages, response.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${isMobileMenuOpen ? 'block' : 'hidden'
          } md:block md:w-80 bg-white border-r border-gray-200`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-800">Contatos</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setSelectedUser(u);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${selectedUser?.id === u.id ? 'bg-indigo-50' : ''
                }`}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {u.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {u.name}
                </p>
                <p className="text-sm text-gray-500 truncate">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-600"
            >
              <Users className="w-6 h-6" />
            </button>
            {selectedUser ? (
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {selectedUser.name}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
            ) : (
              <h2 className="text-lg font-semibold text-gray-800">
                Selecione um contato para começar a conversar
              </h2>
            )}
          </div>
        </div>

        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.senderId === user?.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-800'
                        }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form onSubmit={handleSend} className="bg-white p-4 border-t border-gray-200">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Nenhum chat selecionado
              </h3>
              <p className="text-gray-500">
                Selecione um contato no menu lateral para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};