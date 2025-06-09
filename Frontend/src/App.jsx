import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/SignupPage.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("http://localhost:8001/api/v2/users/get-current-user", {
          withCredentials: true,
        });
        setUser(res.data?.data);
      } catch (error) {
        console.log("Not logged in");
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8001/api/v2/users/logout", {}, {
        withCredentials: true,
      });
      setUser(null);
      setAuthView('login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Welcome, {user.fullName || user.username}</h1>
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div>
      {authView === 'login' ? (
        <>
          <LoginPage onLoginSuccess={handleLoginSuccess} />
          <p className="text-center mt-4">
            Don’t have an account?{' '}
            <button onClick={() => setAuthView('register')} className="text-blue-500 underline">
              Register
            </button>
          </p>
        </>
      ) : (
        <>
          <RegisterPage onRegisterSuccess={handleLoginSuccess} />
          <p className="text-center mt-4">
            Already have an account?{' '}
            <button onClick={() => setAuthView('login')} className="text-blue-500 underline">
              Login
            </button>
          </p>
        </>
      )}
    </div>
  );
}

export default App;
