import React, { useState, useEffect, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Offcanvas  } from 'react-bootstrap';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CollapsibleSidebar from './CollapsibleSidebar';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import CompanyInfo from './CompanyInfo';
import Consumption from './Consumption';
import Calendar from './Calendar';
import ScheduleManager from './ScheduleManager';
import EntitySelector from './EntitySelector';
import ContactsTable from './ContactsTable';
import UsersTable from './UsersTable';
import FunnelComponent from './Funnel';
import CreateTemplate from './CreateTemplete';
import CreateCampaign from './CreateCampaign';
import { ConversationsProvider } from './ConversationsContext';
import io from 'socket.io-client';
import './App.css';
import { PrivateRoute, PublicRoute } from './PrivateRoute';
import { AppContext } from './context';
import { useMediaQuery } from 'react-responsive';
import { Campaigns } from './Campaigns';
import axios from 'axios';


function App() {
  const {state, setStatus, setCampaigns: addCampaigns, setTemplates: addTemplates, setContacts, setUsers, setPhases, setRoles, setDepartments } = useContext(AppContext)
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [socket, setSocket] = useState(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [selectedSection, setSelectedSection] = useState('chats');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const id_usuario = localStorage.getItem('user_id');

    if (!token || !id_usuario) return;

    const socket = io(`${process.env.REACT_APP_API_URL}`, {
      query: {
        token,
        id_usuario
      },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setSocket(socket);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.close();
    };
  }, []);

  useEffect(() => {
    const handleFirstUserInteraction = () => {
      setUserHasInteracted(true);
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction);
    window.addEventListener('touchstart', handleFirstUserInteraction);

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      const companyId = localStorage.getItem('company_id');
      const token = localStorage.getItem('token');
      if (!companyId || !token) {
        console.error('No company ID or token found');
        return;
      }

      try {
      
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/templates`, {
          params: { company_id: companyId },
          headers: { Authorization: `Bearer ${token}` }
        });

        addTemplates(response.data)
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    const fetchCampaigns = async () => {
      const companyId = localStorage.getItem('company_id');
      const token = localStorage.getItem('token');
      let campañas = []
      try {
        console.log('Fetching campaigns');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/campaigns`, {
          params: { company_id: companyId },
          headers: { Authorization: `Bearer ${token}` }
        });
        campañas = response.data
        console.log('Fetched campaigns:', response.data);
        addCampaigns(response.data)
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/contactsCampaign`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const contacts = response?.data
        const updatedCampaigns = campañas.map(campaign => {
          const associatedContactIds = contacts?.filter(contact => contact.campaign_id === campaign.id)?.map(contact => contact.contact_id)  || [];
      
          return {
            ...campaign,
            contactos: associatedContactIds 
          };
        });
        
        addCampaigns(updatedCampaigns);
      
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }      
    };
   
    const fetchContacts = async () => {
      const companyId = localStorage.getItem('company_id');
      const token = localStorage.getItem('token');
      if (!companyId || !token) {
        console.error('No company ID or token found');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/contacts`, {
          params: { company_id: companyId },
          headers: { Authorization: `Bearer ${token}` }
        });
        setContacts(response.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    const fetchPhases = async () => {
      const companyId = localStorage.getItem('company_id');
      const token = localStorage.getItem('token');
      if (!companyId || !token) {
        console.error('No company ID or token found');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/company/${companyId}/phases`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPhases(response.data);
      } catch (error) {
        console.error('Error fetching phases:', error);
      }
    };

    const fetchUsers = async () => {
      const companyId = localStorage.getItem('company_id');
      const token = localStorage.getItem('token');
      if (!companyId || !token) {
        console.error('No company ID or token found');
        return;
      }

      try {
        const usersResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?company_id=${companyId}`);
        const rolesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/roles/${companyId}`);
        const departmentsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/departments/${companyId}`);

        setRoles(rolesResponse.data);
        setDepartments(departmentsResponse.data);
        setUsers(usersResponse.data); 

      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchTemplates();
    fetchCampaigns();
    fetchContacts();
    fetchPhases();
    fetchUsers();
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSelectSection = (section) => {
    setSelectedSection(section);
    navigate(`/${section}`);
  };

  return (
<ConversationsProvider socket={socket} isConnected={isConnected} userHasInteracted={userHasInteracted}>
  <Container fluid className={ isMobile ? 'contendorMobile' : ''}>
    <Col>
      {isMobile ? (
        <Offcanvas show={state.status} onHide={() => { setStatus(false); setIsSidebarCollapsed(true); }} className={`px-0 ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`} style={{ width: isSidebarCollapsed ? '60px' : '230px' }}>
          <CollapsibleSidebar 
            onSelect={handleSelectSection} 
            isCollapsed={isSidebarCollapsed} 
            onToggle={handleSidebarToggle} 
          />
        </Offcanvas>
      ) : (
        <Col xs={isSidebarCollapsed ? 1 : 2} className="px-0">
          <CollapsibleSidebar 
            onSelect={handleSelectSection} 
            isCollapsed={isSidebarCollapsed} 
            onToggle={handleSidebarToggle} 
          />
        </Col>
      )}
      
      <Row xs={isMobile ? 12 : (isSidebarCollapsed ? 11 : 10)} className={!isMobile ? `ms-5` : 'pe-0 scrollrender'}>
        <Row className={selectedSection == 'chats' ? `renderContent me-0 pe-0` : `renderContent `}>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <div>Login Component</div>
              </PublicRoute>
            } />
            <Route path="/chats" element={
              <PrivateRoute>
                <>
                  {isMobile ? (
                    state.conversacion_Actual.conversation_id ? (
                      <Col xs={12} className="px-0 wallpaper_messages">
                        <ChatWindow socket={socket} />
                      </Col>
                    ) : (
                      <Col xs={12} className="px-0 conversations_bar">
                        <Sidebar />
                      </Col>
                    )
                  ) : (
                    <>
                      <Col xs={3} className="px-0 conversations_bar d-none d-md-block">
                        <Sidebar />
                      </Col>
                      <Col xs={9} className="px-0 wallpaper_messages d-none d-md-block">
                        <ChatWindow socket={socket} />
                      </Col>
                    </>
                  )}
                </>
              </PrivateRoute>
            } />
            <Route path="/contacts" element={<PrivateRoute><ContactsTable /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><UsersTable /></PrivateRoute>} />
            <Route path="/funnel" element={<PrivateRoute><FunnelComponent /></PrivateRoute>} />
            <Route path="/statistics" element={<PrivateRoute><div>Statistics</div></PrivateRoute>} />
            <Route path="/inspection" element={<PrivateRoute><div>Inspection</div></PrivateRoute>} />
            <Route path="/campaigns" element={<PrivateRoute><Campaigns /></PrivateRoute>} />
            <Route path="/consumption" element={<PrivateRoute><Consumption /></PrivateRoute>} />
            <Route path="/calendar" element={<PrivateRoute><EntitySelector /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><div>Settings</div></PrivateRoute>} />
            <Route path="/company" element={<PrivateRoute><CompanyInfo /></PrivateRoute>} />
            <Route path="/create-template" element={<PrivateRoute><CreateTemplate /></PrivateRoute>} />
            <Route path="/edit-template/:id_plantilla" element={<PrivateRoute><CreateTemplate /></PrivateRoute>} />
            <Route path="/create-campaign" element={<PrivateRoute><CreateCampaign /></PrivateRoute>} />
            <Route path="/create-campaign/:id_plantilla" element={<PrivateRoute><CreateCampaign /></PrivateRoute>} />
            <Route path="/edit-campaign/:id_camp" element={<PrivateRoute><CreateCampaign /></PrivateRoute>} />
            <Route path="*" element={<PrivateRoute><CompanyInfo /></PrivateRoute>} />
          </Routes>
        </Row>
      </Row>
    </Col>
  </Container>
</ConversationsProvider>

  );
}

export default App;
