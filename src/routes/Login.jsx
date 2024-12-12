import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AppContext } from '../App';
import { useForm } from 'react-hook-form';

const Login = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState(null);

  const { register, handleSubmit, errors} = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setToken(result.token); // Store the token securely
        navigate('/home');
      } else {
        setError(result.message || 'An error occurred during login');
      }
    } catch (error) {
      setError('An error occurred during login');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setIsSubmitting(false);
  };

  return (
    <div className="login-form container">
      <h2>Login</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            {...register('email', { required: 'Email is required' })}
          />
          {errors?.email && <span className="text-danger">{errors.email.message}</span>}
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            {...register('password', { required: 'Password is required' })}
          />
          {errors?.password && <span className="text-danger">{errors.password.message}</span>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
        {token && (
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Log Out
          </button>
        )}
      </form>
    </div>
  );
};

export default Login;