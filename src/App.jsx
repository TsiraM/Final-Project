import React from 'react'; 
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';  
import Nav from './ui/Nav';

function App() {

  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('http://localhost:3000'); 
  }, []);

  return (
    <div className="container">
      {/* Header with logo */}
      <header className="mb-4">
        <img src="/Logo.png" alt="Store Logo" className="logo img-fluid mb-2" 
        style={{ maxWidth: "200px", maxHeight: "200px" }} />
      </header>

      {/* Page Title */}
      <h1 className="text-center mb-4">Welcome to Festive Glow</h1>
      
      {/* Navigation Bar */}
      <Nav />

      {/* Outlet for child components (Home, Details, Cart, etc.) */}
      <Outlet />
    </div>
  );
}

export default App;
