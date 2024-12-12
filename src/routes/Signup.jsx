import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom'; 

const SignUp = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsSubmitting(true); // Set submitting state to true

    try {
      // Updated API URL to the backend server on port 3000
      const response = await fetch('http://localhost:3000/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage('User registered successfully!');
        setTimeout(() => {
          navigate('/login'); 
        }, 2000); // Redirect after 2 seconds
      } else {
        setErrorMessage(result.message || 'An error occurred during signup');
      }
    } catch (error) {
      setErrorMessage('An error occurred during signup');
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className="signup-form container">
      <h2>Sign Up</h2>

      {errorMessage && <p className="text-danger">{errorMessage}</p>}
      {successMessage && <p className="text-success">{successMessage}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <span className="text-danger">{errors.email.message}</span>}
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <span className="text-danger">{errors.password.message}</span>}
        </div>

        <div className="mb-3">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            {...register('first_name', { required: 'First name is required' })}
          />
          {errors.first_name && <span className="text-danger">{errors.first_name.message}</span>}
        </div>

        <div className="mb-3">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            {...register('last_name', { required: 'Last name is required' })}
          />
          {errors.last_name && <span className="text-danger">{errors.last_name.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
