import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Login from './Login';
import Register from './Register';
import LandingPage from './LandingPage';
import { PrivateRoute, PublicRoute } from './PrivateRoute';
import { useMediaQuery } from 'react-responsive';

const Root = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/" element={ isMobile ?
           <PublicRoute>
           <Login />
         </PublicRoute>
          : <LandingPage />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <App />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
