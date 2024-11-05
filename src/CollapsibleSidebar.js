import React, { useState, useEffect, useContext } from 'react';
import './CollapsibleSidebar.css';
import { List, ChatLeftDots, People, Person, Funnel, FileBarGraph, Search, Megaphone, CurrencyDollar, Gear, Building, BoxArrowLeft, Calendar, Calendar3 } from 'react-bootstrap-icons';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';
import { AppContext } from './context';
import { useConversations } from './ConversationsContext';
import {Button,
} from "./components"
import { useNavigate } from 'react-router-dom';

const CollapsibleSidebar = ({ onSelect, isCollapsed, onToggle, currentSection }) => {
  const {setConversacionActual, setUsuario, setCompania, state} = useContext(AppContext);
  const {
    setCurrentConversation,
  } = useConversations();

  const [userData, setUserData] = useState({});
  const [companyData, setCompanyData] = useState({});
  const [roleName, setRoleName] = useState('');
  const userId = localStorage.getItem('user_id');

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const navigate = useNavigate();
// `onSelectOption` modificado:
const onSelectOption = (selectedOption) => {
  // Si ya estamos en la sección seleccionada, restablece el estado para recargarla.
  if (selectedOption === 'chats' && selectedOption === currentSection) {
    setConversacionActual({ position_scroll: false });
    setCurrentConversation(null);
    navigate('/temp'); // Navega a una ruta temporal para forzar la recarga
    setTimeout(() => navigate('/chats'), 0); // Vuelve a la ruta actual
  } else {
    onSelect(selectedOption);
    if (!isCollapsed) {
      onToggle();
    }
    setConversacionActual({ position_scroll: false });
    setCurrentConversation(null);
  }
};


  useEffect(() => {
    // Fetch user data
    axios.get(`${process.env.REACT_APP_API_URL}/api/user/${userId}`)
      .then(response => {
        setUserData(response.data);
        console.log('User data:', response.data); // Log de datos del usuario
        setUsuario(response.data)
        return axios.get(`${process.env.REACT_APP_API_URL}/api/company/${response.data.company_id}`);
      })
      .then(response => {
        setCompanyData(response.data);
        console.log('Company data:', response.data); // Log de datos de la empresa
        setCompania(response.data)
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [userId]);

  useEffect(() => {
    if (userData.rol) {
      // Fetch role name
      axios.get(`${process.env.REACT_APP_API_URL}/api/role/${userData.rol}`)
        .then(response => {
          setRoleName(response.data.name);
          console.log('Role name:', response.data.name); // Log de nombre del rol
        })
        .catch(error => {
          console.error('Error fetching role name:', error);
        });
    }
  }, [userData.rol]);

  useEffect(() => {
  if (state.usuario) {
       setUserData(state.usuario)
  }
  }, [state.usuario])
  
  const userPhoto = userData.link_foto ? `${process.env.REACT_APP_API_URL}${userData.link_foto}` : "/icono WA.png";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className={`collapsible-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="toggle-button" onClick={onToggle}>
        <List color="white" size={30} />
      </div>
      <div className="user-info">
        <img src={userPhoto} alt="User" className={`user-photo ${isCollapsed ? 'small' : 'large'}`} />
        {!isCollapsed && (
          <div className="user-details">
            <h5>{userData.nombre} {userData.apellido}</h5>
            <p>{roleName}</p>
            {
              isMobile ? (
                <strong variant="link" className="text-white w-100 flex gap-1 justify-center">
                {companyData.name}  <Building color="white" size={15} title="Company Info" className='mt-1' />
               </strong> 
              ) : (

             <Button variant="link" className="text-white w-100" onClick={() => onSelectOption('company')}>
               {companyData.name}  <Building color="white" size={15} title="Company Info" />
              </Button> 
              )
            }
          </div>
        )}
      </div>
      <div className="nav-item" onClick={() => onSelectOption('chats')}>
        <ChatLeftDots color="white" size={20} />
        {!isCollapsed && <span>Chats</span>}
      </div>
      <div className="nav-item" onClick={() => onSelectOption('contacts')}>
        <People color="white" size={20} />
        {!isCollapsed && <span>Contactos</span>}
      </div>
      <div className="nav-item" onClick={() => onSelectOption('allentities')}>
        <Person color="white" size={20} />
        {!isCollapsed && <span>Usuarios</span>}
      </div>
 { !isMobile && (
            <>

                  <div className="nav-item" onClick={() => onSelectOption('funnel')}>
                    <Funnel color="white" size={20} />
                    {!isCollapsed && <span>Funnel</span>}
                  </div>
                  <div className="nav-item" onClick={() => onSelectOption('statistics')}>
                    <FileBarGraph color="white" size={20} />
                    {!isCollapsed && <span>Estadísticas</span>}
                  </div>
                  <div className="nav-item" onClick={() => onSelectOption('inspection')}>
                    <Search color="white" size={20} />
                    {!isCollapsed && <span>Inspección</span>}
                  </div>
                  <div className="nav-item" onClick={() => onSelectOption('campaigns')}>
                    <Megaphone color="white" size={20} />
                    {!isCollapsed && <span>Campañas</span>}
                  </div>
                  <div className="nav-item" onClick={() => onSelectOption('calendar')}>
                    <Calendar3 color="white" size={20} />
                    {!isCollapsed && <span>Calendario</span>}
                  </div>
                  <div className="nav-item" onClick={() => onSelectOption('consumption')}>
                    <CurrencyDollar color="white" size={20} />
                    {!isCollapsed && <span>Consumos</span>}
                  </div>
            </>   )}
      <div className="nav-item" onClick={() => onSelectOption('settings')}>
        <Gear color="white" size={20} />
        {!isCollapsed && <span>Configuración</span>}
      </div>
      <div className="nav-item" onClick={handleLogout}>
        <BoxArrowLeft color="white" size={20} />
        {!isCollapsed && <span>Cerrar sesión</span>}
      </div>
    </div>
  );
};

export default CollapsibleSidebar;