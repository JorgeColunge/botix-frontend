import React, { useContext, useEffect, useState, useCallback } from 'react';
import { ListGroup, Tooltip, OverlayTrigger, Dropdown, InputGroup, FormControl, Form } from 'react-bootstrap';
import { PlusSquare, Funnel, PersonCircle, BookmarkFill, List } from 'react-bootstrap-icons';
import moment from 'moment';
import { useConversations } from './ConversationsContext';
import axios from 'axios';
import { AppContext } from './context';
import { useMediaQuery } from 'react-responsive';
import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './components';
import { NewChatContacts } from './NewChatContacts';

function Sidebar() {
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    setConversations,
    socket,
    phases
  } = useConversations();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedOrigins, setSelectedOrigins] = useState([]);
  const [selectedPhases, setSelectedPhases] = useState([]);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const {setConversacionActual, setStatus, state} = useContext(AppContext)

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  function toggleLabel(label) {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter(l => l !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  }

  function toggleOrigin(origin) {
    if (selectedOrigins.includes(origin)) {
      setSelectedOrigins(selectedOrigins.filter(o => o !== origin));
    } else {
      setSelectedOrigins([...selectedOrigins, origin]);
    }
  }

  function togglePhase(phaseId) {
    console.log(`Has seleccionado la opción de filtro "${phases[phaseId]?.name}" con el id de fase "${phaseId}"`);
    if (selectedPhases.includes(phaseId)) {
      setSelectedPhases(selectedPhases.filter(p => p !== phaseId));
    } else {
      setSelectedPhases([...selectedPhases, phaseId]);
    }
  }

  const filteredConversations = conversations
    .sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time))
    .filter(convo => {
      const name = `${convo.first_name || ''} ${convo.last_name || ''}`.trim();
      const matchesLabel = selectedLabels.length > 0 ? selectedLabels.includes(convo.label) : true;
      const matchesOrigin = selectedOrigins.length > 0 ? selectedOrigins.includes(convo.origin) : true;
      const matchesPhase = selectedPhases.length > 0 ? selectedPhases.includes(String(convo.label)) : true;

      const labelStr = typeof convo.label === 'string' ? convo.label.toLowerCase() : '';

      return (
        matchesLabel &&
        matchesOrigin &&
        matchesPhase &&
        (convo.phone_number?.includes(searchTerm) ||
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          labelStr.includes(searchTerm.toLowerCase()))
      );
    });

  useEffect(() => {
    if (!socket) return;

    const updateConversationListHandler = (updatedConversations) => {
      setConversations(prevConversations => {
        const updatedConversationsIds = new Set(updatedConversations.map(convo => convo.conversation_id));
        const filteredPrevConversations = prevConversations.filter(convo => !updatedConversationsIds.has(convo.conversation_id));
        const mergedConversations = [...filteredPrevConversations, ...updatedConversations];
        const uniqueConversations = Array.from(new Set(mergedConversations.map(convo => convo.conversation_id)))
          .map(id => mergedConversations.find(convo => convo.conversation_id === id));
        return uniqueConversations;
      });
    };

    socket.on('updateConversationList', updateConversationListHandler);

    return () => {
      socket.off('updateConversationList');
    };
  }, [socket, setConversations]);

  const truncateText = (text, maxLength) => {
    return text && text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  };

  const formatTime = (time) => {
    if (!time) return "Unknown time";
    const messageDate = moment(time);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');

    if (messageDate.isSame(today, 'd')) {
      return messageDate.format('LT');
    } else if (messageDate.isSame(yesterday, 'd')) {
      return 'Ayer';
    } else {
      return messageDate.format('L');
    }
  };

  const getMessagePreview = (lastMessage, messageType) => {
    if (!lastMessage && messageType !== 'text') {
      switch (messageType) {
        case 'image':
          return '📷 Imagen';
        case 'video':
          return '🎥 Video';
        case 'audio':
          return '🎵 Audio';
        default:
          return 'Attachment';
      }
    }
    return truncateText(lastMessage, 30);
  };

  const renderLabelBadge = (label) => {
    const phase = phases[label];
    if (!phase) return null;

    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{phase.name}</Tooltip>}
      >
        <span className="badge-label" style={{ color: phase.color }}>
          <BookmarkFill />
        </span>
      </OverlayTrigger>
    );
  };

  const resetUnreadMessages = async (conversationId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/reset-unread/${conversationId}`);
      setConversations(prevConversations =>
        prevConversations.map(convo => {
          if (convo.conversation_id === conversationId) {
            return { ...convo, unread_messages: 0 };
          }
          return convo;
        })
      );
    } catch (error) {
      console.error('Error resetting unread messages:', error);
    }
  };

  const handleConversationSelect = async (conversation) => {
    await resetUnreadMessages(conversation.conversation_id);
    setCurrentConversation(conversation);
    setConversacionActual({...conversation, position_scroll: false})
  };

  const handleSelectContactChat = async (contacto) => {
    const conver = conversations.find(conv => conv.phone_number == contacto.phone_number)

    if (conver) {
      await resetUnreadMessages(conver.conversation_id);
      setCurrentConversation(conver);
      setConversacionActual({...conver, position_scroll: false})
    }else{
      const usuario = state.usuarios.find(us => us.id_usuario == Number(localStorage.getItem('user_id')))
      let cont = {
        ...contacto,
        id_usuario: usuario.id_usuario,
        responsable_nombre: usuario.nombre,
        responsable_apellido: usuario.apellido,
      }
      setCurrentConversation(cont);
      setConversacionActual({...cont, position_scroll: false})
    }
  }
 
 const datesConversation = useCallback((conversacion, integraciones, usuarios, usuario) => {
    
     const integracion = integraciones.find( intr => intr.id === conversacion.integration_id)
     
    switch (integracion?.type) {
      case 'Interno':    
      
       const usuario_conversacion = usuarios.find(usu => usu.id_usuario == conversacion.contact_user_id)
       const usuario_remitente = usuarios.find(usu => usu.id_usuario == conversacion.id_usuario)
          return (
            <div className="d-flex justify-content-between align-items-center">
              {conversacion.id_usuario == usuario.id_usuario ? (
                <>
                  <img
                    src={`${process.env.REACT_APP_API_URL}${usuario_conversacion.link_foto}`}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: 50, height: 50 }}
                  />
                <div style={{ flex: 1, marginLeft: 10 }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>
                      {usuario_conversacion.nombre && usuario_conversacion.nombre
                        ? `${usuario_conversacion.nombre} ${usuario_conversacion.apellido}`
                        : usuario_conversacion.nombre
                        ? usuario_conversacion.nombre
                        : usuario_conversacion.apellido
                        ? usuario_conversacion.apellido
                        : null}
                    </strong>
                    {conversacion.label && renderLabelBadge(conversacion.label)}
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{conversacion.last_message ? conversacion.last_message.substring(0, 30) + '...' : 'No messages'}</span>
                    <div>
                      {conversacion.unread_messages > 0 && (
                        <span className="badge badge-pill badge-primary">{conversacion.unread_messages}</span>
                      )}
                      <small className="text-muted">{formatTime(conversacion.last_message_time)}</small>
                    </div>
                  </div>
                </div>
                </>
              ) : (
                <>
                  <img
                    src={`${process.env.REACT_APP_API_URL}${usuario_remitente.link_foto}`}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: 50, height: 50 }}
                  />
                <div style={{ flex: 1, marginLeft: 10 }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>
                      {usuario_remitente.nombre && usuario_remitente.nombre
                        ? `${usuario_remitente.nombre} ${usuario_remitente.apellido}`
                        : usuario_remitente.nombre
                        ? usuario_remitente.nombre
                        : usuario_remitente.apellido
                        ? usuario_remitente.apellido
                        : null}
                    </strong>
                    {conversacion.label && renderLabelBadge(conversacion.label)}
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{conversacion.last_message ? conversacion.last_message.substring(0, 30) + '...' : 'No messages'}</span>
                    <div>
                      {conversacion.unread_messages > 0 && (
                        <span className="badge badge-pill badge-primary">{conversacion.unread_messages}</span>
                      )}
                      <small className="text-muted">{formatTime(conversacion.last_message_time)}</small>
                    </div>
                  </div>
                </div>
                </>
              )}
            </div>
          );
    
      default:
       return (
        <div className="d-flex justify-content-between align-items-center">
        {conversacion.profile_url ? (
          <img
            src={`${process.env.REACT_APP_API_URL}${conversacion.profile_url}`}
            alt="Profile"
            className="rounded-circle"
            style={{ width: 50, height: 50 }}
          />
        ) : (
          <PersonCircle className='rounded-circle' size={50} />
        )}
        <div style={{ flex: 1, marginLeft: 10 }}>
          <div className="d-flex justify-content-between align-items-center">
            <strong>
              {conversacion.first_name && conversacion.last_name
                ? `${conversacion.first_name} ${conversacion.last_name}`
                : conversacion.first_name
                ? conversacion.first_name
                : conversacion.last_name
                ? conversacion.last_name
                : conversacion.phone_number}
            </strong>
            {conversacion.label && renderLabelBadge(conversacion.label)}
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">{conversacion.last_message ? conversacion.last_message.substring(0, 30) + '...' : 'No messages'}</span>
            <div>
              {conversacion.unread_messages > 0 && (
                <span className="badge badge-pill badge-primary">{conversacion.unread_messages}</span>
              )}
              <small className="text-muted">{formatTime(conversacion.last_message_time)}</small>
            </div>
          </div>
        </div>
      </div>
       )
    }
 },[state.usuario, state.usuarios, conversations])
  
 console.log("conversaciones", conversations)
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center p-3 shadow-sm">
    
     { isMobile && <List color="black" size={30}  onClick={() => {setStatus(true); console.log("click")}}/>}

        <h5 className="mb-0">Chats</h5>
        <div className="d-flex gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon"><PlusSquare className="h-4 w-4"/></Button>
            </SheetTrigger>
            <SheetContent side='left' className={isMobile ? `w-[100%] !max-w-none pe-0 ps-1` : `w-[30.6em] !max-w-none ms-[4em] pe-0 ps-1`}>
              <SheetHeader>
                <SheetTitle>Lista de contactos</SheetTitle>
              </SheetHeader>
                  <NewChatContacts selectContact={handleSelectContactChat} />
              <SheetFooter>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Funnel />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filtrar por fase</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedPhases.length === 0}
                onCheckedChange={() => setSelectedPhases([])}
              >
                Todas las fases
              </DropdownMenuCheckboxItem>
              {Object.entries(phases).map(([key, phase]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={selectedPhases.includes(key)}
                  onCheckedChange={() => togglePhase(key)}
                >
                  {phase.name}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filtrar por origen</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={selectedOrigins.length === 0}
                onCheckedChange={() => setSelectedOrigins([])}
              >
                Todos los orígenes
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedOrigins.includes('Origen 1')}
                onCheckedChange={() => toggleOrigin('Origen 1')}
              >
                Origen 1
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedOrigins.includes('Origen 2')}
                onCheckedChange={() => toggleOrigin('Origen 2')}
              >
                Origen 2
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedOrigins.includes('Origen 3')}
                onCheckedChange={() => toggleOrigin('Origen 3')}
              >
                Origen 3
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <InputGroup className="mb-3 p-3">
        <FormControl
          placeholder="Buscar..."
          aria-label="Buscar"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </InputGroup>
      <ListGroup>
        {filteredConversations.map(convo => (
          <ListGroup.Item key={convo.conversation_id} action onClick={() => handleConversationSelect(convo)}>
           {datesConversation(convo, state.integraciones, state.usuarios, state.usuario)}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default Sidebar;
