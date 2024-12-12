import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const Logout = () => {
  const setIsLoggedIn = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser  = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/logout`, { method: "POST" });
        if (response.ok) {
          console.log("Logout successful");
          if (typeof setIsLoggedIn === 'function') {
            setIsLoggedIn(false);
          }
          navigate("/login");
        } else {
          console.error("Logout failed: ", response.statusText);
        }
      } catch (error) {
        console.error("Logout failed", error);
      }
    };

    logoutUser ();

    return () => {
    
    };
  }, [setIsLoggedIn, navigate]);

  return <h2>Logging out...</h2>;
};

export default Logout;