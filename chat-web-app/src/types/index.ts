export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

export interface AuthResponse {
  status: number;
  message: string;
  token?: string;
  data?: User;
}