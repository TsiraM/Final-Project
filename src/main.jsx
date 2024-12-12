import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Home from './routes/Home';
import Details from './routes/Details';
import Signup from './routes/Signup';
import Login from './routes/Login';
import Logout from './routes/Logout';
import Cart from './routes/Cart';
import Checkout from './routes/Checkout';
import Confirmation from './routes/Confirmation';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      
      {path: "/home",
       element: <Home />},
      {
        path: "/details/:id",
        element: <Details />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/logout",
        element: <Logout />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/confirmation",
        element: <Confirmation />,
      },
    ]
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <RouterProvider router={router} /> {/* Pass the router to RouterProvider */}
  </React.StrictMode>
);
