import React, { useState, useEffect, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Offcanvas  } from 'react-bootstrap';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CollapsibleSidebar from './CollapsibleSidebar';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import CompanyInfo from './CompanyInfo';
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


function App() {
  const {state, setStatus } = useContext(AppContext)
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

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSelectSection = (section) => {
    setSelectedSection(section);
    navigate(`/${section}`);
  };

  return (
    <ConversationsProvider socket={socket} isConnected={isConnected} userHasInteracted={userHasInteracted}>
      <Container fluid>
        <Row>

          { isMobile ? (<Offcanvas show={state.status} onHide={() => {setStatus(false); {setIsSidebarCollapsed(true)}}} className={`px-0 ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`} style={{ width: isSidebarCollapsed ? '60px' : '230px' }}>
            <CollapsibleSidebar 
              onSelect={handleSelectSection} 
              isCollapsed={isSidebarCollapsed} 
              onToggle={handleSidebarToggle} 
            />
          </Offcanvas>) : (
            <div className={`px-0 ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>
            <CollapsibleSidebar 
              onSelect={handleSelectSection} 
              isCollapsed={isSidebarCollapsed} 
              onToggle={handleSidebarToggle} 
            />
          </div>
          )}
          <Col className={`px-0 ${isSidebarCollapsed ? 'content-collapsed' : 'content-expanded'}`}>
            <Row className="renderContent">
              <Routes>
                <Route path="/login" element={
                  <PublicRoute>
                    <div>Login Component</div>
                  </PublicRoute>
                } />
                      <Route path="/chats" element={
                        <PrivateRoute>
                          <>
                            {isMobile && (
                              state.conversacion_Actual.conversation_id ? (
                                <>
                                  {/* Botón para regresar al sidebar */}
                                  {/* <Button
                                    className="d-md-none"
                                    onClick={() => {
                                      setConversacionActual({ position_scroll: false}); // Resetea la conversación actual
                                      navigate(-1); // Navega hacia atrás
                                    }}
                                  >
                                    Atrás
                                  </Button> */}
                                  <Col className="px-0 wallpaper_messages" style={{ flexBasis: '100%' }}>
                                    <ChatWindow socket={socket} />
                                  </Col>
                                </>
                              ) : (
                                <Col className="px-0 conversations_bar" style={{ flexBasis: '100%' }}>
                                  <Sidebar />
                                </Col>
                              )

                            )} 
                            <Col className="px-0 conversations_bar d-none d-md-block" style={{ flexBasis: '25%' }}>
                              <Sidebar />
                            </Col>
                            <Col className="px-0 wallpaper_messages d-none d-md-block" style={{ flexBasis: '75%' }}>
                              <ChatWindow socket={socket} />
                            </Col>
                          </>
                        </PrivateRoute>
                      } />
                      <Route path="/contacts" element={<PrivateRoute><ContactsTable /></PrivateRoute>} />
                      <Route path="/users" element={<PrivateRoute><UsersTable /></PrivateRoute>} />
                      <Route path="/funnel" element={<PrivateRoute><FunnelComponent /></PrivateRoute>} />
                      <Route path="/statistics" element={<PrivateRoute><div>statistics</div></PrivateRoute>} />
                      <Route path="/inspection" element={<PrivateRoute><div>Inspection</div></PrivateRoute>} />
                      <Route path="/campaigns" element={<PrivateRoute><Campaigns /></PrivateRoute>} />
                      <Route path="/consumption" element={<PrivateRoute><div>Consumption</div></PrivateRoute>} />
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
          </Col>
        </Row>
      </Container>
    </ConversationsProvider>
  );
}

export default App;
