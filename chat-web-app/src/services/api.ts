const API_URL = 'http://localhost:8080/api';

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const register = async (name: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
};

export const getAllUsers = async (token: string) => {
  const response = await fetch(`${API_URL}/auth/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const getConversation = async (token: string, receiverId: string) => {
  const response = await fetch(`${API_URL}/messages/get/${receiverId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const sendMessage = async (token: string, receiverId: string, message: string) => {
  const response = await fetch(`${API_URL}/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ receiverId, message }),
  });
  return response.json();
};