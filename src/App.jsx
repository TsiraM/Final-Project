// App.js
import React, { useState, useEffect, createContext } from 'react';
import { Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from './ui/Nav';
import Cookies from 'js-cookie';

export const AppContext = createContext();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState(0);

  // Effect for updating cookies on cart and session changes
  useEffect(() => {
    try {
      // Update cart cookie
      Cookies.set('cart', JSON.stringify(cartItems), {
        sameSite: 'None', 
        secure: true,  // Use secure cookies for production
        expires: 7,    // Expires in 7 days
      });

      // Update session cookie based on login status
      if (isLoggedIn) {
        Cookies.set('session', 'some-session-data', { sameSite: 'None', secure: true });
      } else {
        Cookies.remove('session');
      }
    } catch (error) {
      console.error("Error setting cookies:", error);
    }
  }, [cartItems, isLoggedIn]);

  return (
    <AppContext.Provider value={{ isLoggedIn, setIsLoggedIn, cartItems, setCartItems }}>
      <div className="container">
        {/* Header with logo */}
        <header className="mb-4">
          <img 
            src="/Logo.png" 
            alt="Store Logo" 
            className="logo img-fluid mb-2" 
            style={{ maxWidth: "200px", maxHeight: "200px" }} 
            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
          />
        </header>

        {/* Page Title */}
        <h1 className="text-center mb-4">Welcome to Festive Glow</h1>
        
        {/* Navigation Bar */}
        <Nav isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

        {/* Outlet for child components */}
        <Outlet />
      </div>
    </AppContext.Provider>
  );
}

export default App;