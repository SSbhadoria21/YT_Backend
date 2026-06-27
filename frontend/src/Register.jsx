import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  // Form ka data handle karne ke liye state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: ''
  });

  // Images ko alag se handle karna padta hai
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  // UI me messages dikhane ke liye
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Jab user input type karega to ye function call hoga
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Jab user form submit karega
  const handleSubmit = async (e) => {
    e.preventDefault(); // Page reload hone se rokna
    setError('');
    setSuccess('');
    
    // Validation
    if (!avatar) {
      return setError('Avatar (Profile Picture) zaroori hai!');
    }

    // Kyunki hum images bhej rahe hain, humein 'FormData' ka use karna padega
    // Normal JSON me files nahi jaati hain
    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('username', formData.username);
    data.append('password', formData.password);
    data.append('avatar', avatar);
    
    // Agar cover image daali hai to usko bhi jod do
    if (coverImage) {
      data.append('coverImage', coverImage);
    }

    try {
      setLoading(true);
      // Backend api ko call karna
      const response = await axios.post('http://localhost:8000/api/v1/users/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data' // Ye batana zaroori hai ki hum files bhej rahe hain
        }
      });

      setSuccess('Registration successful! Aap login kar sakte hain.');
      setFormData({ fullName: '', email: '', username: '', password: '' });
      
      // 2 second baad login page par bhej do
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration me problem aayi. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-form">
        <h2>Create an Account</h2>
        
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" name="fullName" placeholder="John Doe" 
              value={formData.fullName} onChange={handleChange} required 
            />
          </div>

          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" name="username" placeholder="johndoe123" 
              value={formData.username} onChange={handleChange} required 
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" name="email" placeholder="john@example.com" 
              value={formData.email} onChange={handleChange} required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" name="password" placeholder="••••••••" 
              value={formData.password} onChange={handleChange} required minLength="6"
            />
          </div>

          <div className="input-group">
            <label>Profile Picture (Avatar) *</label>
            <input 
              type="file" accept="image/*" required
              onChange={(e) => setAvatar(e.target.files[0])}
            />
          </div>

          <div className="input-group">
            <label>Cover Image (Optional)</label>
            <input 
              type="file" accept="image/*"
              onChange={(e) => setCoverImage(e.target.files[0])}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-links">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
