import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Backend email aur username dono check karta hai, to hum usko accordingly set karke bhejenge
    const isEmail = formData.emailOrUsername.includes('@');
    const loginData = {};
    if (isEmail) {
      loginData.email = formData.emailOrUsername;
    } else {
      loginData.username = formData.emailOrUsername;
    }
    loginData.password = formData.password;

    try {
      setLoading(true);
      // Backend ko request bhejte hain, kyuki isme images nahi hain, simple json jaayega
      // Credentials true karte hain taaki browser cookies set kar paye (auth tokens ke liye)
      const response = await axios.post('http://localhost:8000/api/v1/users/login', loginData, {
        withCredentials: true 
      });

      // Agar successfully login ho gaya, to app ko reload karo taaki backend se naya user data fetch ho sake
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Incorrect credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-form">
        <h2>Welcome Back</h2>
        
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email or Username</label>
            <input 
              type="text" name="emailOrUsername" placeholder="Enter your email or username" 
              value={formData.emailOrUsername} onChange={handleChange} required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" name="password" placeholder="••••••••" 
              value={formData.password} onChange={handleChange} required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          Don't have an account? <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
