import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AppContext } from '../App'; // Import the context

const Checkout = () => {
  const { isLoggedIn, setIsLoggedIn, setCartItems } = useContext(AppContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    province: '',
    country: '',
    postal_code: '',
    credit_card: '',
    credit_expire: '',
    credit_cvv: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debugging log to check if isLoggedIn is correct
  useEffect(() => {
    console.log('Is user logged in? ', isLoggedIn);
  }, [isLoggedIn]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateInputs = () => {
    const { credit_card, credit_expire, credit_cvv, postal_code } = formData;
    const cardRegex = /^\d{16}$/;
    const expireRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3}$/;
    const postalCodeRegex = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/;

    if (!cardRegex.test(credit_card)) return 'Invalid credit card number.';
    if (!expireRegex.test(credit_expire)) return 'Invalid expiration date format.';
    if (!cvvRegex.test(credit_cvv)) return 'Invalid CVV.';
    if (!postalCodeRegex.test(postal_code)) return 'Invalid postal code.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
  
    if (!isLoggedIn) {
      setError('You must be logged in to complete the purchase.');
      return;
    }
  
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log('Token:', token);
  
      const response = await fetch('http://localhost:3000/products/purchase', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Origin": "http://localhost:3000"
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          cart: JSON.parse(localStorage.getItem("cart")) || []
        })
      });
  
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
  
      if (response.ok) {
        // Remove cart from localStorage and reset cart items
        localStorage.removeItem('cart');
        setCartItems(0);
  
        // Set the cart cookie correctly with secure attributes
        Cookies.set('cart', JSON.stringify([]), {
          secure: false,    
          sameSite: 'None', // Necessary for cross-origin cookies
        });
  
        navigate('/confirmation');
      } else {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        setError(errorData.message || 'An error occurred while processing the purchase.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div>
        <p>You must be logged in to complete the purchase.</p>
        <a href="/login?redirect=/checkout">Log in</a>
      </div>
    );
  }

  return (
    <div>
  <h1>Checkout</h1>
  {error && <p style={{ color: 'red' }} aria-live="assertive">{error}</p>}
  <form onSubmit={handleSubmit} noValidate>
<div className="mb-3">
  <label htmlFor="street" className="mb-1">Street:</label>
  <input
    type="text"
    id="street"
    name="street"
    value={formData.street}
    onChange={handleInputChange}
    required
    aria-label="Street address"
    aria-describedby="street-error"
  />
  {error && error.includes('street') && (
    <div id="street-error" aria-live="assertive">
      {error}
    </div>
  )}
</div>
    <div className="mb-3">
      <label htmlFor="city" className="mb-1">City:</label>
      <input
        type="text"
        id="city"
        name="city"
        value={formData.city}
        onChange={handleInputChange}
        required
        aria-label="City"
      />
    </div>
    <div className="mb-3">
      <label htmlFor="province" className="mb-1">Province:</label>
      <input
        type="text"
        id="province"
        name="province"
        value={formData.province}
        onChange={handleInputChange}
        required
        aria-label="Province"
      />
    </div>
    <div className="mb-3">
      <label htmlFor="country" className="mb-1">Country:</label>
      <input
        type="text"
        id="country"
        name="country"
        value={formData.country}
        onChange={handleInputChange}
        required
        aria-label="Country"
      />
    </div>
    <div className="mb-3">
      <label htmlFor="postal_code" className="mb-1">Postal Code:</label>
      <input
        type="text"
        id="postal_code"
        name="postal_code"
        value={formData.postal_code}
        onChange={handleInputChange}
        pattern="[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d"
        required
        aria-label="Postal Code"
      />
    </div>
    <div className="mb-3">
  <label htmlFor="credit_card" className="mb-1">Credit Card Number:</label>
  <input
    type="password"
    id="credit_card"
    name="credit_card"
    value={formData.credit_card}
    onChange={handleInputChange}
    required
    aria-label="Credit Card Number"
  />
</div>
    <div className="mb-3">
      <label htmlFor="credit_expire" className="mb-1">Expiration Date (MM/YY):</label>
      <input
        type="text"
        id="credit_expire"
        name="credit_expire"
        value={formData.credit_expire}
        onChange={handleInputChange}
        pattern="(0[1-9]|1[0-2])\/\d{2}"
        required
        aria-label="Credit Card Expiration Date"
      />
    </div>
    <div className="mb-3">
      <label htmlFor="credit_cvv" className="mb-1">CVV:</label>
      <input
        type="password"
        id="credit_cvv"
        name="credit_cvv"
        value={formData.credit_cvv}
        onChange={handleInputChange}
        pattern="\d{3}"
        required
        aria-label="CVV"
      />
    </div>
    <button type="submit" disabled={loading} aria-busy={loading}>
      {loading ? 'Processing...' : 'Complete Purchase'}
    </button>
  </form>
</div>
  );
};

export default Checkout;
