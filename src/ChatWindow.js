import React, { useEffect, useRef, useCallback, useState, useContext } from 'react';
import { Button, DropdownButton, Dropdown, useAccordionButton, NavDropdown, Tooltip } from 'react-bootstrap';
import { PersonCircle, TelephoneFill, EnvelopeFill, Globe, Instagram, Facebook, Linkedin, Twitter, Tiktok, Youtube, Check, CheckAll, Clock } from 'react-bootstrap-icons';
import './App.css';
import EditContactModal from './EditContactModal';
import ModalComponent from './modalComponet';
import AudioPlayer from './audioPlayer';
import { useConversations } from './ConversationsContext';
import TextareaAutosize from 'react-textarea-autosize';
import {AudioRecorder} from './AudioRecorder';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { usePopper } from 'react-popper';
import TemplateModal from './TemplateModal';
import { AppContext } from './context';
import { useMediaQuery } from 'react-responsive';

function ChatWindow() {
  const { currentConversation, messages, loadMessages, socket, isConnected, setMessages, setCurrentConversation, updateContact, allUsers, handleResponsibleChange, handleEndConversation, phases } = useConversations();
  const messagesEndRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContact, setEditContact] = useState({});
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(null);
  const {state, setConversacionActual} = useContext(AppContext)

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [currentMessage, setCurrentMessage] = useState(messages);

  useEffect(() => {
    setCurrentMessage(messages);
  }, [messages]);

  useEffect(() => {
    if (isConnected) {
      console.log("Socket is currently active and connected.");
    } else {
      console.log("Socket is not connected.");
    }
  }, [isConnected]);

  useEffect(() => {
 
    if (!socket) return;
    const newMessageHandler = (newMessage) => {
      console.log('Nuevo mensaje recibido:', newMessage);
      if (['image', 'video', 'audio'].includes(newMessage.message_type)) {
        newMessage.url = ensureFullUrl(newMessage.url);
      }
      setMessages(prevMessages => {
        const updatedMessages = { ...prevMessages };
        const messagesForConversation = updatedMessages[newMessage.conversationId] || [];
        updatedMessages[newMessage.conversationId] = [...messagesForConversation, newMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return updatedMessages;
      });
      if (currentConversation && currentConversation.conversation_id === newMessage.conversationId) {
        setCurrentConversation(prev => ({
          ...prev,
          last_message: newMessage.text,
          last_message_time: newMessage.timestamp,
        }));
      }
    };
    socket.on('newMessage', newMessageHandler);
    return () => {
      socket.off('newMessage', newMessageHandler);
    };
  }, [socket, currentConversation, setMessages, setCurrentConversation, setCurrentMessage]);

  const handleEditContactChange = (event) => {
    const { name, value } = event.target;
    setEditContact(prev => ({ ...prev, [name]: value }));
  };

  const handleEditContactSave = () => {
    console.log('Contact Updated:', editContact);
    setShowEditModal(false);
  };

  const renderLabelBadge = (label) => {
    const phase = phases[label];
    if (!phase) return null;
    return (
      <span className="badge-label-text" style={{ color: phase.color }}>
        { phase.name}
      </span>
    );
  };

  const handleSelectLabel = useCallback(async (label) => {
    if (!currentConversation || !currentConversation.contact_id) {
      console.error('Contact ID is not defined');
      return;
    }
    setCurrentConversation(prev => ({ ...prev, label }));
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/edit-contact/${currentConversation.contact_id}`, { label });
    } catch (error) {
      console.error('Error al actualizar la etiqueta:', error);
    }
  }, [currentConversation]);

  const ContactInfoBar = () => {
    const getContactName = () => {
      const { first_name, last_name, phone_number } = currentConversation;
      if (first_name && last_name) {
        return `${first_name} ${last_name}`;
      } else if (first_name) {
        return first_name;
      } else if (last_name) {
        return last_name;
      } else {
        return phone_number;
      }
    };

    return (
      <div className="contact-info-bar d-flex align-items-center p-2 shadow-sm" style={{ gap: "10px" }}>
        {currentConversation.profile_url ? (
          <img
            src={`${process.env.REACT_APP_API_URL}${currentConversation.profile_url}`}
            alt="Profile"
            className="rounded-circle"
            style={{ width: 50, height: 50 }}
          />
        ) : (
          <PersonCircle className='rounded-circle' size={50} />
        )}
        <div style={{ flex: 1 }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <strong>{getContactName()} </strong>
              <span className="ms-2">{currentConversation.label && renderLabelBadge(currentConversation.label)}</span>
              <DropdownButton
                title=""
                onSelect={handleSelectLabel}
                className="ml-2 custom-dropdown"
                size="sm"
              >
                {Object.entries(phases).map(([phaseId, phase]) => (
                  <Dropdown.Item key={phaseId} eventKey={phaseId}>{phase.name}</Dropdown.Item>
                ))}
              </DropdownButton>
            </div>
            <div className="d-flex align-items-center">
            { !isMobile ? ( <div className="responsable mr-3">
                <strong>Responsable: </strong>
                <span>{`${currentConversation.responsable_nombre} ${currentConversation.responsable_apellido}` || 'No asignado'}</span>
                <DropdownButton className="custom-dropdown" title="" variant="light">
                  {allUsers.map((user) => (
                    <Dropdown.Item 
                      key={user.id_usuario} 
                      onClick={() => handleResponsibleChange(user.id_usuario, currentConversation.id_usuario)}>
                      {user.nombre} {user.apellido}
                    </Dropdown.Item>
                  ))}
                  <hr></hr>
                  <Dropdown.Item  className='text-danger'
                    key="finalizar-conversacion" 
                    onClick={() => handleEndConversation(currentConversation.conversation_id)}>
                    Finalizar Conversación
                  </Dropdown.Item>
                </DropdownButton>
              </div>) : (
                <div className="responsable mr-3 mt-2">
                <NavDropdown
                    id="nav-dropdown-dark-example"
                    title="R"
                    menuVariant="white"
                  >
                  {allUsers.map((user) => (
                    <Dropdown.Item 
                      key={user.id_usuario} 
                      onClick={() => handleResponsibleChange(user.id_usuario, currentConversation.id_usuario)}>
                      {user.nombre} {user.apellido}
                    </Dropdown.Item>
                  ))}
                  <hr></hr>
                  <Dropdown.Item  className='text-danger'
                    key="finalizar-conversacion" 
                    onClick={() => handleEndConversation(currentConversation.conversation_id)}>
                    Finalizar Conversación
                  </Dropdown.Item>
                  </NavDropdown>
              </div>
              )}
              <div className="icons-profile ml-2">
                {currentConversation.phone_number && <a href={`tel:${currentConversation.phone_number}`} target="_blank"><TelephoneFill /></a>}
                {currentConversation.email && <a href={`mailto:${currentConversation.email}`} target="_blank"><EnvelopeFill /></a>}
                {currentConversation.pagina_web && <a href={currentConversation.pagina_web} target="_blank"><Globe /></a>}
                {currentConversation.link_instagram && <a href={currentConversation.link_instagram} target="_blank"><Instagram /></a>}
                {currentConversation.link_facebook && <a href={currentConversation.link_facebook} target="_blank"><Facebook /></a>}
                {currentConversation.link_linkedin && <a href={currentConversation.link_linkedin} target="_blank"><Linkedin /></a>}
                {currentConversation.link_twitter && <a href={currentConversation.link_twitter} target="_blank"><Twitter /></a>}
                {currentConversation.link_tiktok && <a href={currentConversation.link_tiktok} target="_blank"><Tiktok /></a>}
                {currentConversation.link_youtube && <a href={currentConversation.link_youtube} target="_blank"><Youtube /></a>}
              </div>
              <Button variant="outline-secondary edit_profile" size="sm" onClick={() => {
                setEditContact(currentConversation);
                setShowEditModal(true);
              }}>
                Más
              </Button>
            </div>
          </div>
          <div>
            <span>{currentConversation.organization}</span>
          </div>
        </div>
      </div>
    );
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const imageUrl = response.data.imageUrl;
      await sendWhatsAppMessageImage(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const sendWhatsAppMessageImage = async (imageUrl) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/send-image`, {
        phone: currentConversation.phone_number,
        imageUrl: imageUrl,
        conversationId: currentConversation.conversation_id
      });
      console.log('Image sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending image:', error);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('video', file);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const videoUrl = response.data.videoUrl;
      const videoDuration = response.data.videoDuration;
      const videoThumbnail = response.data.videoThumbnail;
      await sendWhatsAppMessageVideo(videoUrl, videoDuration, videoThumbnail);
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const sendWhatsAppMessageVideo = async (videoUrl, videoDuration, videoThumbnail) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/send-video`, {
        phone: currentConversation.phone_number,
        videoUrl: videoUrl,
        videoDuration: videoDuration,
        videoThumbnail: videoThumbnail,
        conversationId: currentConversation.conversation_id
      });
      console.log('Video sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending video:', error);
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('document', file);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const documentUrl = response.data.documentUrl;
      await sendWhatsAppMessageDocument(documentUrl, file.name);
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const sendWhatsAppMessageDocument = async (documentUrl, documentName) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/send-document`, {
        phone: currentConversation.phone_number,
        documentUrl: documentUrl,
        documentName: documentName,
        conversationId: currentConversation.conversation_id
      });
      console.log('Document sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending document:', error);
    }
  };

  const handleSendAudio = async (backendAudioUrl, mimeType) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/send-audio`, {
        phone: currentConversation.phone_number,
        audioUrl: backendAudioUrl,
        conversationId: currentConversation.conversation_id,
        mimeType: mimeType // Pasa el tipo MIME al backend
      });
      setMessages(prevMessages => ({
        ...prevMessages,
        [currentConversation.conversation_id]: [...prevMessages[currentConversation.conversation_id], response.data.data]
      }));
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  };

   const isLastMessageOlderThan24Hours  =  useCallback(() => {
      if (!currentConversation || !currentMessage[currentConversation.conversation_id] || currentMessage[currentConversation.conversation_id].length === 0) {
        return true; // Si no hay conversación o mensajes, consideramos que han pasado más de 24 horas.
      }
  
      // Recorremos los mensajes de la conversación actual
      const messages = currentMessage[currentConversation.conversation_id];
  
      // Buscar el primer mensaje que sea de tipo "message"
      const firstMessage = messages.find(msg => msg.type === "message");
  
      // Si no hay ningún mensaje de tipo "message", asumimos que han pasado más de 24 horas
      if (!firstMessage) {
        return true;
      }
  
      const messageDate = new Date(firstMessage.timestamp); // Asumiendo que el campo con la fecha es 'timestamp'
      const now = new Date();
  
      // Retornar true si han pasado más de 24 horas desde el primer mensaje de tipo "message"
      return (now.getTime() - messageDate.getTime()) >= (24 * 60 * 60 * 1000); // 24 horas en milisegundos
    }, [currentConversation, currentMessage]); // Dependencias: se actualiza cuando cambian estos valores

  
  const handleOpenTemplateModal = () => {
    setShowTemplateModal(true);
  };

  function ReplyBar() {
    const [referenceElement, setReferenceElement] = useState(null);
    const [popperElement, setPopperElement] = useState(null);
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
      placement: 'top-start', // O 'bottom-start' si prefieres que aparezca abajo
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [30, 15], // Ajusta el desplazamiento según sea necesario
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport', // Asegura que el popper no se salga de la vista
          },
        },
      ],
    });
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [fileMenuVisible, setFileMenuVisible] = useState(false);
    const [fileInputType, setFileInputType] = useState('');

    useEffect(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        const position = cursorPosition !== null ? cursorPosition : messageText.length;
        textInputRef.current.setSelectionRange(position, position);
      }
    }, [showEmojiPicker]);

    useEffect(() => {
      const handleClickOutsideEmoji = (event) => {
        if (popperElement && !popperElement.contains(event.target) && !referenceElement.contains(event.target)) {
          setShowEmojiPicker(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutsideEmoji);
      return () => {
        document.removeEventListener('mousedown', handleClickOutsideEmoji);
      };
    }, [popperElement, referenceElement]);

    useEffect(() => {
      const handleClickOutsideFile = (event) => {
        if (popperElement && !popperElement.contains(event.target) && !referenceElement.contains(event.target)) {
          setFileMenuVisible(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutsideFile);
      return () => {
        document.removeEventListener('mousedown', handleClickOutsideFile);
      };
    }, [popperElement, referenceElement]);

    const handleSendMessage = async () => {
      if (!currentConversation || !messageText.trim()) return;
    
      const textToSend = messageText;
      console.log("Texto a enviar:", textToSend);
    
      setMessageText('');
    
      var currentSend = {
        ...currentConversation,
        last_message_time: new Date().toISOString()
      };
    
      console.log("Datos de currentSend:", currentSend);
    
      try {
        setConversacionActual({...currentSend, position_scroll: false})
        console.log("Intentando enviar mensaje...");
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/send-text`, {
          phone: currentSend.phone_number,
          messageText: textToSend,
          conversationId: currentSend.conversation_id
        });
    
        console.log('Respuesta recibida:', response);
    
        if (response.data) {
          console.log('Message sent successfullyddddddddddddddd:', response.data);
          setMessages(prevMessages => ({
            ...prevMessages,
            [currentSend.conversation_id]: [...prevMessages[currentSend.conversation_id], response.data.data]
          }));
        } else {
          console.log("La respuesta no tiene datos:", response);
        }
    
      } catch (error) {
        console.error('Error al enviar el mensaje:', error.response ? error.response.data : error.message);
      }
    };
    

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && event.shiftKey) {
        // Allow line break
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleSendMessage();
      }
    };

    const handleEmojiClick = () => {
      setShowEmojiPicker(!showEmojiPicker);
    };

    const onEmojiClick = (emojiObject, event) => {
      const cursorPosition = textInputRef.current.selectionStart;
      const newText = messageText.substring(0, cursorPosition) + emojiObject.emoji + messageText.substring(cursorPosition);
      setMessageText(newText);
      setCursorPosition(cursorPosition + 1);
    };

    const handleAttachClick = () => {
      setFileMenuVisible(!fileMenuVisible);
    };

    const resetFileInput = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleFileMenuClick = type => {
      resetFileInput();
      setFileInputType(type);
      setTimeout(() => {
        fileInputRef.current.click();
      }, 100);
    };

    const handleTextChange = (e) => {
      setMessageText(e.target.value);
      setCursorPosition(e.target.selectionStart);
    };

    return (
      <div className="reply-bar-container">
        {!isMobile && (
          <Button variant="light" className="reply-button p-0 m-0" onClick={handleOpenTemplateModal}>
            <i className="far fa-file-alt"></i> {/* Icono de la plantilla */}
          </Button>
        )}
  


        {showEmojiPicker && (
          <div style={styles.popper} {...attributes.popper}>
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
  
  
  
        <TextareaAutosize
          className="message-input"
          placeholder="Escribe un mensaje aquí..."
          value={messageText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          maxRows={4}
          ref={textInputRef}
          disabled={isLastMessageOlderThan24Hours()}
        />
        
        {fileMenuVisible && (
          <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
            <div className='d-flex flex-column'>
              <Button variant="light" onClick={() => handleFileMenuClick('image/*')}>Cargar Imagen</Button>
              <Button variant="light" onClick={() => handleFileMenuClick('video/*')}>Cargar Video</Button>
              <Button variant="light" onClick={() => handleFileMenuClick('.pdf,.doc,.docx,.txt')}>Cargar Documento</Button>
              {isMobile && (
                <Button variant="light" onClick={() => handleOpenTemplateModal()}>Cargar Plantillas</Button>
              )}
            </div>
          </div>
        )}
        <Button variant="light" className="reply-button" onClick={handleAttachClick}>
          <i className="fas fa-paperclip"></i> {/* Icono del clip */}
        </Button>
        <Button variant="light" className="reply-button" onClick={handleEmojiClick} ref={setReferenceElement}>
          <i className="far fa-smile"></i> {/* Icono de la cara feliz */}
        </Button>
        
        <AudioRecorder onSend={handleSendAudio} />
      </div>
    );
  }

  function CustomToggle({ children, eventKey }) {
    const decoratedOnClick = useAccordionButton(eventKey, () => {
      console.log('Accordion toggled!');
    });

    return (
      <div className="accordion-header" onClick={decoratedOnClick}>
        {children}
      </div>
    );
  }

  const handleScroll = useCallback(async (e) => {
    const target = e.target;
    if (target.scrollTop === 0 && !isLoadingMore && messages[currentConversation.conversation_id].length) {
      setIsLoadingMore(true);
      const moreMessages = await loadMessages(currentConversation.conversation_id, offset + 50);
      console.log('Loaded messages IDs:', moreMessages.map(m => m.id));
      if (moreMessages.length) {
        setMessages(prevMessages => ({
          ...prevMessages,
          [currentConversation.conversation_id]: [...moreMessages, ...prevMessages[currentConversation.conversation_id]]
        }));
        setOffset(prevOffset => prevOffset + 50);
        setLastMessageId(new Date(moreMessages[0].timestamp).getTime());
        console.log('Last message ID for scroll:', moreMessages[0].id);
        setIsLoadingMore(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [offset, isLoadingMore, loadMessages, setMessages, currentConversation, messages]);

  useEffect(() => {
    const currentElement = messagesEndRef.current;
    if (currentElement) {
      currentElement.addEventListener('scroll', handleScroll);
      return () => currentElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {

    if (lastMessageId && messagesEndRef.current && state.conversacion_Actual.position_scroll == false) {
      console.log("los mensajes son: ", messages)
      requestAnimationFrame(() => {
        const element = document.getElementById(`msg-${lastMessageId}`);
        setConversacionActual({...state.conversacion_Actual, position_scroll: true})
        if (element) {
          const scrollPosition = element.offsetTop - messagesEndRef.current.offsetTop;
          if (scrollPosition !== undefined) {
            messagesEndRef.current.scrollTop = scrollPosition;
            console.log("position", scrollPosition)
          }
          console.log('Scrolling to message ID:', lastMessageId);
        }
      });
    }
  }, [lastMessageId, messages]);


  useEffect(() => {
    if (currentConversation && currentConversation.conversation_id) {
      if (!messages[currentConversation.conversation_id]) {
        loadMessages(currentConversation.conversation_id).then(initialMessages => {
          if (initialMessages.length) {
            setLastMessageId(new Date(initialMessages[0].timestamp).getTime());
            console.log('Initial last message ID:', initialMessages[0].timestamp);
          }
        });
      } else {
        const initialMessages = messages[currentConversation.conversation_id];
        if (initialMessages.length) {
          setLastMessageId(new Date(initialMessages[0].timestamp).getTime());
          console.log('Initial loaded conversation last message ID:', initialMessages[0].timestamp);
        }
      }
    }
  }, [currentConversation, messages, loadMessages]);

  const groupMessagesByDate = useCallback((messages) => {
    const grouped = messages.reduce((groups, message) => {
      if (!message.timestamp) {
        console.warn(`Mensaje sin timestamp: ${JSON.stringify(message)}`);
        message.timestamp = new Date().toISOString();
      }
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
  
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    return grouped;
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today.setDate(today.getDate() - 1));
    if (date.toDateString() === new Date().toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'long' });
    }
  };

  const formatVideoDuration = (duration) => {
    if (isNaN(duration)) {
      return '';
    }
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const ensureFullUrl = (url) => {
    if (!url) return null; // Manejar URL nulo o indefinido
    if (url.startsWith('/')) {
      return `${process.env.REACT_APP_API_URL}${url}`;
    }
    return url;
  };

  const handleImageClick = useCallback((url) => {
    setModalContent(<img src={ensureFullUrl(url)} alt="Media content" className="full-width-image" />);
    setShowModal(true);
  }, []);

  const handleVideoClick = useCallback((url) => {
    setModalContent(<video src={ensureFullUrl(url)} alt="Media content" controls className="full-width-image" />);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setModalContent(null);
  }, []);

  if (!currentConversation) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>Selecciona una conversación</div>;
  }

  const groupedMessages = groupMessagesByDate(currentMessage[currentConversation.conversation_id] || []);
  const sortedDates = Object.keys(groupedMessages).sort((b, a) => new Date(b) - new Date(a));

  const getFileIcon = (fileName) => {
    if (!fileName) return 'https://cdn-icons-png.flaticon.com/512/3095/3095726.png';
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'https://cdn-icons-png.flaticon.com/512/337/337946.png';
      case 'doc':
      case 'docx':
        return 'https://cdn-icons-png.flaticon.com/512/888/888883.png';
      case 'xls':
      case 'xlsx':
        return 'https://cdn-icons-png.flaticon.com/512/732/732220.png';
      case 'ppt':
      case 'pptx':
        return 'https://cdn-icons-png.flaticon.com/512/732/732224.png';
      case 'csv':
        return 'https://cdn-icons-png.flaticon.com/512/9496/9496460.png';
      case 'txt':
        return 'https://cdn-icons-png.flaticon.com/512/136/136538.png';
      case 'apk':
        return 'https://cdn-icons-png.flaticon.com/512/8263/8263246.png';
      case 'zip':
      case 'rar':
        return 'https://cdn-icons-png.flaticon.com/512/9695/9695838.png';
      default:
        return 'https://cdn-icons-png.flaticon.com/512/8291/8291136.png';
    }
  };

  const handleButtonClick = (button) => {
    // Implementa la lógica para manejar los clics en los botones
    console.log(`Button clicked: ${button.text}`);
  };

  const findOriginalMessage = (id) => {
    for (let date in groupedMessages) {
      const message = groupedMessages[date].find(msg => msg.id === id);
      if (message) return message;
    }
    return null;
  };

  const scrollToMessage = (id) => {
    const element = document.getElementById(`msg-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getSenderName = (type) => {
    if (type === 'message') {
      const { first_name, last_name, phone_number } = currentConversation;
      if (first_name && last_name) {
        return `${first_name} ${last_name}`;
      } else if (first_name) {
        return first_name;
      } else if (last_name) {
        return last_name;
      } else {
        return phone_number;
      }
    } else {
      return 'Yo';
    }
  };

  const getMessageStatusIcon = (state) => {
    switch (state) {
      case 'sent':
        return <Check style={{ color: 'white' }} />;
      case 'delivered':
        return <CheckAll style={{ color: 'white' }} />;
      case 'read':
        return <CheckAll style={{ color: 'black' }} />;
      default:
        return <Clock style={{ color: 'white' }} />;
    }
  };

  return (
    <>
      <div className="chat-window-container">
        <ContactInfoBar />
        <EditContactModal show={showEditModal} onHide={() => setShowEditModal(false)} contact={currentConversation} socket={socket} />
        <div className="messages-container" ref={messagesEndRef} >
          {sortedDates.map((date) => (
            <React.Fragment key={date}>
              <div className="date-header">{formatDate(date)}</div>
              {groupedMessages[date].map((message, index) => {
                const isDifferentTypePrevious = index > 0 && message.type !== groupedMessages[date][index - 1].type;
                const isDifferentTypeNext = index < groupedMessages[date].length - 1 && message.type !== groupedMessages[date][index + 1].type;
                let bubbleClass = `message-bubble ${message.type}`;
                if (isDifferentTypePrevious) bubbleClass += ' different-type-previous';
                if (isDifferentTypeNext) bubbleClass += ' different-type-next';
  
                const originalMessage = message.reply_from ? findOriginalMessage(message.reply_from) : null;
  
                return (
                  <div
                    key={message.id}
                    id={`msg-${new Date(message.timestamp).getTime()}`}
                    className={bubbleClass}
                    style={{ marginBottom: '20px', maxWidth: message.message_type === 'image' || message.message_type === 'video' ? 'none' : '70%' }}
                  >
                    {originalMessage && (
                      <>
                        <div
                          className="reply-preview"
                          onClick={() => scrollToMessage(new Date(originalMessage.timestamp).getTime())}
                        >
                          <div className="reply-header" style={{ color: originalMessage.type === 'message' ? '#D033B9' : '#A645C7' }}>
                            {getSenderName(originalMessage.type)}
                          </div>
                          <div className="reply-content">
                            {originalMessage.message_type === 'text' && <span>{originalMessage.text}</span>}
                            {originalMessage.message_type === 'image' && <div className="image-preview"><img src={ensureFullUrl(originalMessage.media_url)} alt="Original media" /></div>}
                            {originalMessage.message_type === 'video' && <div className="video-preview"><img src={ensureFullUrl(originalMessage.thumbnail_url)} alt="Video thumbnail" /></div>}
                            {originalMessage.message_type === 'audio' && <AudioPlayer duration={formatVideoDuration(originalMessage.duration)} />}
                            {originalMessage.message_type === 'document' && (
                              <div className="document-preview">
                                <div className="document-info">
                                  <img src={getFileIcon(originalMessage.file_name)} alt="Document icon" className="document-icon" />
                                  <p className="document-name text-dark">{originalMessage.file_name}</p>
                                </div>
                              </div>
                            )}
                            {originalMessage.message_type === 'sticker' && <div className="image-preview"><img src={ensureFullUrl(originalMessage.url)} alt="Sent sticker" /></div>}
                            {originalMessage.message_type === 'location' && (
                              <img
                                src="https://www.google.com/images/branding/product/2x/maps_96in128dp.png"
                                alt="Ver ubicación"
                                style={{ maxWidth: '100%', marginBottom: '0.5rem' }}
                              />
                            )}
                            {originalMessage.message_type === 'template' && <span>{originalMessage.text}</span>}
                          </div>
                        </div>
                        <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
                          {originalMessage.message_type === 'template' && message.text}
                        </div>
                      </>
                    )}
                    {message.message_type === 'text' && (
                      <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.text}
                      </div>
                    )}
                    {message.message_type === 'image' && (
                      <>
                        <div className="image-preview" onClick={() => handleImageClick(message.url)}>
                          <img src={ensureFullUrl(message.url)} alt="Sent media" style={{ objectFit: 'cover' }} />
                        </div>
                        {message.text && (
                          <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
                            {message.text}
                          </div>
                        )}
                      </>
                    )}
                    {message.message_type === 'audio' && (
                      <AudioPlayer src={ensureFullUrl(message.url)} duration={formatVideoDuration(message.duration)} />
                    )}
                    {message.message_type === 'video' && (
                      <>
                        <div className="video-preview" onClick={() => handleVideoClick(message.url)}>
                          <img src={ensureFullUrl(message.thumbnail_url)} alt="Video thumbnail" />
                          <div className="play-icon">
                            <i className="fas fa-play-circle"></i>
                          </div>
                          <div className="video-duration">{formatVideoDuration(message.duration)}</div>
                        </div>
                        {message.text && (
                          <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
                            {message.text}
                          </div>
                        )}
                      </>
                    )}
                    {message.message_type === 'sticker' && <img src={ensureFullUrl(message.url)} alt="Sent sticker" />}
                    {message.message_type === 'location' && (
                      <a href={`https://maps.google.com/?q=${message.latitude},${message.longitude}`} target="_blank" rel="noopener noreferrer">
                        <img
                          src="https://www.google.com/images/branding/product/2x/maps_96in128dp.png"
                          alt="Ver ubicación"
                          style={{ maxWidth: '100%', marginBottom: '0.5rem' }}
                        />
                      </a>
                    )}
                    {message.message_type === 'document' && (
                      <>
                        <div className="document-preview">
                          <div className="document-info" onClick={() => window.open(ensureFullUrl(message.url), '_blank')}>
                            <img src={getFileIcon(message.file_name)} alt="Document icon" className="document-icon" />
                            <p className="document-name text-dark">{message.file_name}</p>
                          </div>
                          <div className="document-actions">
                            <button className="btn btn-light document-button open" onClick={(e) => {
                              e.stopPropagation();
                              window.open(ensureFullUrl(message.url), '_blank');
                            }}>Abrir</button>
                            <button className="btn btn-light document-button save" onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = ensureFullUrl(message.url);
                              link.download = message.file_name;
                              link.target = '_blank';
                              link.rel = 'noopener noreferrer';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}>Guardar como...</button>
                          </div>
                        </div>
                        {message.text && (
                          <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
                            {message.text}
                          </div>
                        )}
                      </>
                    )}
                    {message.message_type === 'template' && (
                      <div className="template-message" style={{ maxWidth: '100%' }}>
                        {message.reply_type_header === 'TEXT' && (
                          <div className="template-header">
                            <h4>{message.reply_header}</h4>
                          </div>
                        )}
                        {message.reply_type_header === 'IMAGE' && (
                          <div className="image-preview template-header" onClick={() => handleImageClick(message.media_url)}>
                            <img src={ensureFullUrl(message.media_url)} alt="Template image" style={{ maxWidth: '100%' }} />
                          </div>
                        )}
                        {message.reply_type_header === 'VIDEO' && (
                          <div className="template-header">
                            <div className="video-preview" onClick={() => handleVideoClick(message.media_url)}>
                              <img src={ensureFullUrl(message.thumbnail_url)} alt="Video thumbnail" />
                              <div className="play-icon">
                                <i className="fas fa-play-circle"></i>
                              </div>
                              <div className="video-duration">{formatVideoDuration(message.duration)}</div>
                            </div>
                          </div>
                        )}
                        {message.reply_type_header === 'DOCUMENT' && (
                          <div className="template-header">
                            <div className="document-info" onClick={() => window.open(ensureFullUrl(message.media_url), '_blank')}>
                              <img src={getFileIcon(message.file_name)} alt="Document icon" className="document-icon" />
                              <p className="document-name">{message.file_name}</p>
                            </div>
                            <div className="document-actions">
                              <button className="btn btn-light document-button open" onClick={(e) => {
                                e.stopPropagation();
                                window.open(ensureFullUrl(message.media_url), '_blank');
                              }}>Abrir</button>
                              <button className="btn btn-light document-button save" onClick={(e) => {
                                e.stopPropagation();
                                const link = document.createElement('a');
                                link.href = ensureFullUrl(message.media_url);
                                link.download = message.file_name;
                                link.target = '_blank';
                                link.rel = 'noopener noreferrer';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}>Guardar como...</button>
                            </div>
                          </div>
                        )}
                        {message.reply_type_header === 'LOCATION' && (
                          <div className="template-header">
                            <a href={`https://maps.google.com/?q=${message.latitude},${message.longitude}`} target="_blank" rel="noopener noreferrer">
                              <img
                                src="https://www.google.com/images/branding/product/2x/maps_96in128dp.png"
                                alt="Ver ubicación"
                                style={{ maxWidth: '100%', marginBottom: '0.5rem' }}
                              />
                            </a>
                          </div>
                        )}
                        <div className="template-body">
                          {message.text}
                        </div>
                        {message.reply_button && (
                          <div className="template-buttons" style={{ marginTop: '10px' }}>
                            {message.reply_button.split(';').map((buttonText, idx) => (
                              <button key={idx} className="btn btn-light" onClick={() => handleButtonClick(buttonText)}>{buttonText}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.type === 'reply' && getMessageStatusIcon(message.state)}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        {showModal && (
          <ModalComponent show={showModal} handleClose={handleCloseModal}>
            {modalContent}
          </ModalComponent>
        )}
        <ReplyBar messagesEndRef={messagesEndRef} />
        <TemplateModal
          show={showTemplateModal}
          handleClose={() => setShowTemplateModal(false)}
          conversation={currentConversation}
        />
      </div>
    </>
  );
}

export default ChatWindow;
