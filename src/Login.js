import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Google, Facebook } from 'react-bootstrap-icons';
import CustomModal from './CustomModal';
import "./Login.css";
import { AppContext } from "./context";

const Login = () => {
  const {setUsuario} = useContext(AppContext)
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!email || !contraseña) {
      setError("Por favor, complete todos los campos.");
      return;
    }
  
    const payload = {
      email,
      contraseña,
    };
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, payload);
      const { token, user } = response.data;
      setUserName(user.nombre);
      setShowModal(true);
  
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user.id_usuario);
      localStorage.setItem("user_role", user.rol);
      localStorage.setItem("userName", user.nombre);
      localStorage.setItem("company_id", user.company_id);
      localStorage.setItem("department_id", user.department_id);
      setUsuario(user)
      navigate('/chats'); // Redirige al usuario después de iniciar sesión
    } catch (error) {
      if (error.response) {
        setError("Error al iniciar sesión. Intente nuevamente.");
      } else {
        setError("Error de red o respuesta no recibida.");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/chats');
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <img src="/Portada.png" alt="CRM" className="crm-image" />
      </div>
      <div className="right-side">
        <img src="/FaviconAR.png" alt="Logo" className="logo" />
        {error && <p className="error-message">{error}</p>}
        <form className="form_login" onSubmit={handleSubmit}>
          <label htmlFor="email">Correo Electrónico:</label>
          <input 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="login-input" 
          />
          <label htmlFor="password">Contraseña:</label>
          <input 
            type="password" 
            id="password" 
            value={contraseña} 
            onChange={(e) => setContraseña(e.target.value)} 
            className="login-input" 
          />
          <input type="submit" value="Iniciar sesión" className="btn btn-primary" />
          <Link to="/register" className="register-link">¿No tienes cuenta? Regístrate</Link>
        </form>
        <div className="social-login-container">
          <button onClick={() => window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`} className="social-login-button google-button">
            <Google className="social-icon" />
          </button>
          <button onClick={() => window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/facebook`} className="social-login-button facebook-button">
            <Facebook className="social-icon" />
          </button>
        </div>
      </div>
      <CustomModal show={showModal} handleClose={handleCloseModal} userName={userName} />
    </div>
  );
};

export default Login;
