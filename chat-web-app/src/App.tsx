import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Chat } from './components/Chat';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        {isLogin ? (
          <LoginForm onToggleForm={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleForm={() => setIsLogin(true)} />
        )}
      </div>
    );
  }

  return <Chat />;
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;