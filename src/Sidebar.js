import React, { useContext, useEffect, useState } from 'react';
import { ListGroup, Tooltip, OverlayTrigger, Dropdown, Button, InputGroup, FormControl, Form } from 'react-bootstrap';
import { PlusSquare, Funnel, PersonCircle, BookmarkFill, List } from 'react-bootstrap-icons';
import moment from 'moment';
import { useConversations } from './ConversationsContext';
import axios from 'axios';
import { AppContext } from './context';
import { useMediaQuery } from 'react-responsive';

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

  const {setConversacionActual, setStatus} = useContext(AppContext)

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center p-3 shadow-sm">
    
     { isMobile && <List color="black" size={30}  onClick={() => {setStatus(true); console.log("click")}}/>}

        <h5 className="mb-0">Chats</h5>
        <div className="d-flex">
          <Button variant="outline-secondary" size="sm" className="mr-2"><PlusSquare /></Button>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-basic"><Funnel /></Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header>Filtrar por fase</Dropdown.Header>
              <Dropdown.Item onClick={() => setSelectedPhases([])}>Todas las fases</Dropdown.Item>
              {Object.entries(phases).map(([key, phase]) => (
                <Form.Check
                  key={key}
                  label={phase.name}
                  onChange={() => togglePhase(key)}
                  checked={selectedPhases.includes(key)}
                />
              ))}
              <Dropdown.Divider />
              <Dropdown.Header>Filtrar por origen</Dropdown.Header>
              <Dropdown.Item onClick={() => setSelectedOrigins([])}>Todos los orígenes</Dropdown.Item>
              <Form.Check
                label="Origen 1"
                onChange={() => toggleOrigin('Origen 1')}
                checked={selectedOrigins.includes('Origen 1')}
              />
              <Form.Check
                label="Origen 2"
                onChange={() => toggleOrigin('Origen 2')}
                checked={selectedOrigins.includes('Origen 2')}
              />
              <Form.Check
                label="Origen 3"
                onChange={() => toggleOrigin('Origen 3')}
                checked={selectedOrigins.includes('Origen 3')}
              />
            </Dropdown.Menu>
          </Dropdown>
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
            <div className="d-flex justify-content-between align-items-center">
              {convo.profile_url ? (
                <img
                  src={`${process.env.REACT_APP_API_URL}${convo.profile_url}`}
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
                    {convo.first_name && convo.last_name
                      ? `${convo.first_name} ${convo.last_name}`
                      : convo.first_name
                      ? convo.first_name
                      : convo.last_name
                      ? convo.last_name
                      : convo.phone_number}
                  </strong>
                  {convo.label && renderLabelBadge(convo.label)}
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">{convo.last_message ? convo.last_message.substring(0, 30) + '...' : 'No messages'}</span>
                  <div>
                    {convo.unread_messages > 0 && (
                      <span className="badge badge-pill badge-primary">{convo.unread_messages}</span>
                    )}
                    <small className="text-muted">{formatTime(convo.last_message_time)}</small>
                  </div>
                </div>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default Sidebar;
