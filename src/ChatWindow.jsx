import React, { useEffect, useRef, useCallback, useState, useContext } from 'react';
import { Button, DropdownButton, Dropdown, NavDropdown } from 'react-bootstrap';
import { PersonCircle, TelephoneFill, EnvelopeFill, Globe, Instagram, Facebook, Linkedin, Twitter, Tiktok, Youtube, Check, CheckAll, Clock } from 'react-bootstrap-icons';
import './App.css';
import { CameraIcon, ChevronDown, File, Mic, Video, X } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import { Badge, Card, CardContent, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger,Label } from './components';

function ChatWindow() {
  const { currentConversation, messages, loadMessages, socket, isConnected, setMessages, setCurrentConversation, allUsers, handleResponsibleChange, handleEndConversation, phases } = useConversations();
  const {state, setConversacionActual} = useContext(AppContext)

  const messagesEndRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContact, setEditContact] = useState({});
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [middleMessageId, setMiddleMessageId] = useState(null);
  const [firstMessageId, setFirstMessageId] = useState(null);
  const [updateMoreMsj, setUpdateMoreMsj] = useState(null);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(true); 
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);
  const [messageReply, setMessageReply] = useState(null);

  const [showEmojiResponse, setShowEmojiResponse] = useState(false);
  const [referenceElementReact, setReferenceElementReact] = useState(null);
  const [popperElementReact, setPopperElementReact] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [selectedImage, setSelectedImage] = useState(null);
  const [clearView, setClearView] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const replyBarRef = useRef(null); // Elemento sobre el cual se posicionará el popover
  const popoverTriggerRef = useRef(null);
  const [timer, setTimer] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTable = useMediaQuery({ maxWidth: 1240 });
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState(messages);
  const integration = state.integraciones.find(integ => integ?.id == currentConversation?.integration_id) 

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const handleScroll = useCallback(async (e) => {
    const target = e.target;
    if (target.scrollTop === 0 && messages[currentConversation.conversation_id].length) {
      setIsLoadingMore(true);
  
      // Obtener altura del contenedor antes de cargar más mensajes
      const previousHeight = target.scrollHeight;
  
      // Cargar los mensajes
      const moreMessages = await loadMessages(currentConversation.conversation_id, offset + 50);
      if (moreMessages.length) {
        setMessages(prevMessages => ({
          ...prevMessages,
          [currentConversation.conversation_id]: [...prevMessages[currentConversation.conversation_id], ...moreMessages]
        }));
        setOffset(prevOffset => prevOffset + 50);
  
        // Esperar a que el DOM se actualice
        setTimeout(() => {
          // Calcular la nueva altura del contenedor después de cargar mensajes
          const newHeight = target.scrollHeight;
          const heightDifference = newHeight - previousHeight;
  
          // Ajustar la posición del scroll para compensar la nueva altura
          target.scrollTop = heightDifference;
        }, 100); // Tiempo para asegurar que el DOM haya actualizado
      }
  
      setIsLoadingMore(false);
    }
  }, [offset, isLoadingMore, loadMessages, setMessages, currentConversation, messages, state.conversacion_Actual]);
  
  const typeMessageVerificad = useCallback((mensaje, integracion, usuario) => {
    if (!integracion) {
      return `message-bubble ${mensaje.type}`;
    }
    switch (integracion.type) {
      case 'Interno':
        if (usuario.id_usuario == mensaje.responsibleUserId || usuario.id_usuario == mensaje.sender_id) {
          return `message-bubble reply`;
        } else {
          return `message-bubble message`;
        }
  
      default:
        return `message-bubble ${mensaje.type}`;
    }
  }, []);  

  const handleDropdownClick = (msj) => {
    setMessageReply({...messageReply,msj}); // Ajusta según tu lógica de mensaje
    // Asegurarse de que popoverTriggerRef esté disponible antes de intentar hacer clic
    if (popoverTriggerRef.current) {
      popoverTriggerRef.current.click();
    } else {
      console.warn("popoverTriggerRef no está disponible.");
    }
  };

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      console.log("Botón de regresar presionado");

      // Lógica personalizada al presionar el botón de regreso
      setConversacionActual({ position_scroll: false });
      setCurrentConversation(null);

      // Navegar a la ruta "/chats"
      navigate("/chats");
    };

    const onDeviceReady = () => {
      console.log("Cordova está listo");
      document.addEventListener('backbutton', handleBackButton, false);
    };

    if (window.cordova) {
      console.log("Simulación de botón de regreso en el corodova");
      document.addEventListener('deviceready', onDeviceReady, false);
    } else {
      // Si estamos en el navegador, escucha el evento 'popstate' para simular el botón de regreso
      console.log("Simulación de botón de regreso en el navegador");
      window.addEventListener('popstate', handleBackButton);
    }

    // Limpiar los listeners al desmontar el componente
    return () => {
      if (window.cordova) {
        document.removeEventListener('deviceready', onDeviceReady, false);
        document.removeEventListener('backbutton', handleBackButton, false);
      } else {
        window.removeEventListener('popstate', handleBackButton);
      }
    };
  }, [navigate]);
  
  useEffect(() => {
    const handleClickOutsideEmoji = (event) => {
      if (popperElementReact && !popperElementReact.contains(event.target) && !referenceElementReact.contains(event.target)) {
        setShowEmojiResponse(false); // Cierra el selector de emojis.
        setActiveMessageId(null)
      }
    };
    document.addEventListener('mousedown', handleClickOutsideEmoji); // Escucha clics en cualquier parte del documento.
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideEmoji); // Limpia el listener al desmontar.
    };
  }, [popperElementReact, referenceElementReact]);

  
  useEffect(() => {
     if (state.conversacion_Actual.conversation_id != messageReply?.msj?.conversation_fk) {
      setMessageReply(null)
     }
  }, [state.conversacion_Actual])
  
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

  // useEffect(() => {
 
  //   if (!socket) return;
  //   const newMessageHandler = (newMessage) => {
  //     if (['image', 'video', 'audio'].includes(newMessage.message_type)) {
  //       newMessage.url = ensureFullUrl(newMessage.url);
  //     }
  //     setMessages(prevMessages => {
  //       const updatedMessages = { ...prevMessages };
  //       const messagesForConversation = updatedMessages[newMessage.conversationId] || [];
  //       updatedMessages[newMessage.conversationId] = [...messagesForConversation, newMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  //       return updatedMessages;
  //     });
  //     setLastMessageId(new Date(newMessage[0].timestamp).getTime())
  //     if (currentConversation && ((currentConversation.conversation_id === newMessage.conversationId )|| (currentConversation.phone_number == newMessage.senderId))) {
  //       setCurrentConversation(prev => ({
  //         ...prev,
  //         last_message: newMessage.text,
  //         last_message_time: newMessage.timestamp,
  //       }));
  //     }
  //   };
  //   socket.on('newMessage', newMessageHandler);
  //   return () => {
  //     socket.off('newMessage', newMessageHandler);
  //   };
  // }, [socket, currentConversation, setMessages, setCurrentConversation, setCurrentMessage]);

  useEffect(() => {
    const handleScroll = () => {
      if (messagesEndRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesEndRef.current;
        setIsScrolledToEnd(scrollTop + clientHeight + 200 >= scrollHeight);
      }
    };
    const currentElement = messagesEndRef.current;
  
    if (currentElement) {
      currentElement.addEventListener('scroll', handleScroll);
      handleScroll(); // check initial state
      return () => currentElement.removeEventListener('scroll', handleScroll);
    }
  }, [messages, state.conversacion_Actual]);

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

 const handleCloseChat = () => {
  setConversacionActual({ position_scroll: false});
  setCurrentConversation(null)
 }

  const startPress = (id) => {
    // Cancela cualquier temporizador previo
    if (timer) clearTimeout(timer);

    // Configura un nuevo temporizador
    const newTimer = setTimeout(() => {
      setActiveDropdown(id); // Activa el menú después de 1 segundo
    }, 800);

    setTimer(newTimer); // Almacena el temporizador actual
  };

  const closeDropdown = () => {
    setActiveDropdown(null); // Cierra el menú activo
    if (timer) clearTimeout(timer); // Limpia el temporizador
  };;

  const ContactInfoBar = ({usuario, usuarios, conversacion}) => {

    const usuario_remitente = usuarios.find(user => user.id_usuario === conversacion.contact_user_id);
    const usuario_conversacion = usuarios.find(user => user.id_usuario === conversacion.id_usuario);
   
    const getContactName = useCallback(() => {
      if (!integration) {
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
      }
    
      switch (integration.type) {
        case 'Interno':
          if (conversacion.id_usuario === usuario.id_usuario) {
            return `${usuario_remitente?.nombre || conversacion.nombre || ''} ${usuario_remitente?.apellido || conversacion.apellido || ''}`;
          } else {
            return `${usuario_conversacion?.nombre || ''} ${usuario_conversacion?.apellido || ''}`;
          }
    
        default:
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
      }
    }, [usuarios, conversacion, integration, currentConversation, usuario]);
    
    if (!messageReply?.nombre_usuario_destino) {
      const nombre_usuario_destino = getContactName()
      setMessageReply({...messageReply, nombre_usuario_destino}) 
    }
    const  getImage = useCallback(() => {
      if (conversacion.id_usuario === usuario.id_usuario) {
        return (
          <Button variant="outline" size="icon" className='d-flex items-center p-0' onClick={() => handleCloseChat()}>
              <img
              src={`${process.env.REACT_APP_API_URL}${usuario_remitente.link_foto}`}
              alt="Profile"
              className="rounded-circle"
              style={{ width: 50, height: 50 }}
            />
          </Button>
        )        
      } else {   
        return (
          <Button variant="outline" size="icon" className='d-flex items-center p-0' onClick={() => handleCloseChat()}>
              <img
              src={`${process.env.REACT_APP_API_URL}${usuario_conversacion.link_foto}`}
              alt="Profile"
              className="rounded-circle"
              style={{ width: 50, height: 50 }}
            />
          </Button>
        )
      }
    },[usuarios, conversacion, integration?.type, currentConversation, usuario])

    return (
      <div className="contact-info-bar d-flex align-items-center p-2 shadow-sm" style={{ gap: "10px",  height: "80px" }}>
        {currentConversation.profile_url ? (
          <Button variant="outline" size="icon" className='d-flex items-center p-0' onClick={() => handleCloseChat()}>
            <img
              src={`${process.env.REACT_APP_API_URL}${currentConversation.profile_url}`}
              alt="Profile"
              className="rounded-circle"
              style={{ width: 50, height: 50 }}
            />
           </Button>
        ) : integration?.type == 'Interno' ?(
            getImage()
        ) :
          (
            <Button variant="outline" size="icon" className='d-flex items-center p-0' onClick={() => handleCloseChat()}>
          <PersonCircle className='rounded-circle' size={50} />
          </Button>)
              }
        <div style={{ flex: 1 }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="w[70%] d-flex align-items-center">
              <strong>{getContactName()} </strong>
              <span className="ms-2">{currentConversation.label && renderLabelBadge(currentConversation.label)}</span>
              { integration?.type !== 'Interno' ? (
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
              ) : null}

            </div>
            <div className={isMobile ? `w-[40%] d-flex align-items-center` : `w-[55%] d-flex align-items-center mt-1`}>
            { !isMobile ? ( 
              <>
              {!isTable && integration.type !='Interno' ? (
              <article className="w-100 d-flex">
              <strong>Responsable: <span className='font-normal'>{`${currentConversation.responsable_nombre} ${currentConversation.responsable_apellido}` || 'No asignado'}</span></strong>  
              <DropdownButton className="custom-dropdown" variant="light">
                {allUsers.map((user) => (
                  <Dropdown.Item 
                    key={user.id_usuario} 
                    onClick={() => {handleResponsibleChange(user.id_usuario, currentConversation.id_usuario); setConversacionActual({...state.conversacion_Actual,position_scroll:false})}}>
                    {user.nombre} {user.apellido}
                  </Dropdown.Item>
                ))}
                <hr></hr>
                <Dropdown.Item  className='text-danger'
                  key="finalizar-conversacion" 
                  onClick={() => {handleEndConversation(currentConversation.conversation_id); setConversacionActual({...state.conversacion_Actual,position_scroll:false})}}>
                  Finalizar Conversación
                </Dropdown.Item>
              </DropdownButton>
            </article>
              ) : integration?.type !='Interno' ? (
                  <NavDropdown
                    id="nav-dropdown-dark-example"
                    title="Responsasble"
                    menuVariant="white"
                    className="ms-3"
                  >
                    {allUsers.map((user) => (
                      <Dropdown.Item
                        key={user.id_usuario}
                        onClick={() => {handleResponsibleChange(user.id_usuario, currentConversation.id_usuario); setConversacionActual({...state.conversacion_Actual,position_scroll:false})}}
                        className={user.id_usuario === currentConversation.id_usuario ? 'bg-info text-white' : ''}
                      >
                        {user.nombre} {user.apellido}
                      </Dropdown.Item>
                    ))}
                    <hr />
                    <Dropdown.Item
                      className="text-danger"
                      key="finalizar-conversacion"
                      onClick={() => {handleEndConversation(currentConversation.conversation_id); setConversacionActual({...state.conversacion_Actual,position_scroll:false})}}
                    >
                      Finalizar Conversación
                    </Dropdown.Item>
                  </NavDropdown>
                ): null}
                {
                  !isTable ? (
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
                  ) : null
                }
             { integration?.type !='Interno' ?   (  <Button variant="outline-secondary edit_profile" size="sm" onClick={() => {
                        setEditContact(currentConversation);
                        setShowEditModal(true);
                      }}>
                        Más
                   </Button>): null}
              </>
               ) : integration?.type !='Interno' ? (
                 <div className="w-100 mb-3">
             
                    <Button variant="outline-secondary edit_profile me-1" size="sm" onClick={() => {
                        setEditContact(currentConversation);
                        setShowEditModal(true);
                      }}>
                        Más
                     </Button>
                </div>
              ): null}

            </div>
          </div>
          <div>
            <span>{currentConversation.organization}</span>
          </div>
        </div>
      </div>
    );
  };

  const sendWhatsAppMessageImage = async (imageUrl, caption) => {
    try {
      console.log("Preparando para enviar imagen con caption:");
      console.log("URL de la imagen:", imageUrl);
      console.log("Texto del caption:", caption);

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/send-image`, {
        phone: currentConversation.phone_number,
        imageUrl: imageUrl,
        conversationId: currentConversation.conversation_id,
        messageText: caption
      });
      console.log('Image sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending image:', error);
    }
  };

  const handleVideoUpload = async (videoFile, messageText) => {
    if (!videoFile) return;
  
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
  
      if (messageText) {
        formData.append('messageText', messageText); // Agrega el caption al FormData
      }
  
      // Subir el video al backend
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const videoUrl = response.data.videoUrl;
      const videoDuration = response.data.videoDuration;
      const videoThumbnail = response.data.videoThumbnail;
  
      console.log("Video subido exitosamente, URL:", videoUrl);
  
      // Enviar el video a WhatsApp
      await sendWhatsAppMessageVideo(videoUrl, videoDuration, videoThumbnail, messageText);
    } catch (error) {
      console.error('Error al subir el video:', error);
    }
  };
  
  const sendWhatsAppMessageVideo = async (videoUrl, videoDuration, videoThumbnail, messageText) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/send-video`, {
        phone: currentConversation.phone_number,
        videoUrl: videoUrl,
        videoDuration: videoDuration,
        videoThumbnail: videoThumbnail,
        conversationId: currentConversation.conversation_id,
        messageText: messageText,
      });
  
      console.log('Video enviado exitosamente:', response.data);
    } catch (error) {
      console.error('Error al enviar el video:', error);
    }
  };  

  const handleDocumentUpload = async (documentFile, messageText) => {
    if (!documentFile) return;
  
    try {
      const formData = new FormData();
      formData.append('document', documentFile);
      if (messageText) formData.append('messageText', messageText);
  
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      const documentUrl = response.data.documentUrl;
      await sendWhatsAppMessageDocument(documentUrl, documentFile.name, messageText);
    } catch (error) {
      console.error('Error al subir el documento:', error);
    }
  };  

  const sendWhatsAppMessageDocument = async (documentUrl, documentName, messageText) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/send-document`, {
        phone: currentConversation.phone_number,
        documentUrl: documentUrl,
        documentName: documentName,
        messageText: messageText,
        conversationId: currentConversation.conversation_id,
        integration_name : state.integraciones?.find(intra => intra.id == currentConversation?.integration_id)?.type,
        integration_id: currentConversation?.integration_id,
        usuario_send: state?.conversacion_Actual?.contact_id || state?.conversacion_Actual?.contact_user_id,
        id_usuario: state?.usuario?.id_usuario,
        companyId: state?.usuario?.company_id,
        remitent: state?.usuario?.id_usuario,
        reply_from: messageReply?.msj?.id || null,
      });
      console.log('Document sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending document:', error);
    }
  };
  
  const handleSendAudio = async (backendAudioUrl, duration, mimeType) => {
    
    var usuario_remitente = state.usuario.id_usuario;;
    var usuario_destino = null;

    var currentSend = {
      ...currentConversation,
      last_message_time: new Date().toISOString()
    };
     const integracionInterna = state?.integraciones?.find(integr => integr.type == "Interno")
     console.log("current", currentConversation)
     if (currentConversation?.integration_id == integracionInterna.id) {
      if (state.usuario.id_usuario == state?.conversacion_Actual?.contact_id || state?.usuario?.id_usuario == state?.conversacion_Actual?.contact_user_id) {
        usuario_remitente = state.conversacion_Actual.contact_id || state.conversacion_Actual.contact_user_id;
        usuario_destino = state?.conversacion_Actual?.id_usuario || state?.conversacion_Actual?.id_usuario;
      }else{
        usuario_remitente = state?.conversacion_Actual?.id_usuario;;
        usuario_destino =  state.conversacion_Actual.contact_id || state.conversacion_Actual.contact_user_id;
      }
  }
    try {
      setLastMessageId(new Date(currentSend.last_message_time).getTime())
      setMessageReply(null)
      setConversacionActual({...currentSend, position_scroll: false})
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/send-audio`, {
        phone: currentConversation.phone_number,
        audioUrl: backendAudioUrl,
        conversationId: currentConversation.conversation_id,
        mimeType: mimeType,
        integration_name : state.integraciones?.find(intra => intra.id == currentConversation?.integration_id)?.type,
        integration_id: currentConversation?.integration_id,
        usuario_send: usuario_destino || null,
        id_usuario: usuario_remitente,
        companyId: state?.usuario?.company_id,
        remitent: state?.usuario?.id_usuario,
        reply_from: messageReply?.msj?.id || null,
        audioDuration: duration
      });
      if (response.data) {
        setMessages(prevMessages => ({
          ...prevMessages,
          [currentConversation.conversation_id]: [...prevMessages[currentConversation.conversation_id], response.data.data]
        }));
      } else {
        console.log("La respuesta no tiene datos:", response);
      }
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  };

   const isLastMessageOlderThan24Hours  =  useCallback(() => {
 
      if (!currentConversation || !currentMessage[currentConversation.conversation_id] || currentMessage[currentConversation.conversation_id].length === 0) {
        return true; // Si no hay conversación o mensajes, consideramos que han pasado más de 24 horas.
      }

      const messages = currentMessage[currentConversation.conversation_id];
      const firstMessage = messages.find(msg => {
        const isMessageType = msg.type === "message";
        
        // Obtener la fecha actual y el timestamp del mensaje
        const currentTime = new Date();
        const messageTime = new Date(msg.timestamp); // Asegúrate de que el timestamp sea un formato de fecha válido
    
        // Calcular la diferencia en horas entre la fecha actual y la del mensaje
        const timeDifferenceInHours = (currentTime - messageTime) / (1000 * 60 * 60);
    
        // Verificar si es del tipo "message" y si la diferencia de tiempo es menor a 24 horas
        return isMessageType && timeDifferenceInHours <= 24;
    });

      if (!firstMessage) {
        return true;
      }
      const messageDate = new Date(firstMessage.timestamp);
      const now = new Date();

      return (now.getTime() - messageDate.getTime()) >= (24 * 60 * 60 * 1000); // 24 horas en milisegundos
    }, [currentConversation, currentMessage, messages, state.conversacion_Actual, lastMessageId]);

  
  const handleOpenTemplateModal = () => {
    setShowTemplateModal(true);
  };

  const handleEmojiReaction = (messageId) => {
    setShowEmojiResponse(true)
    setActiveMessageId((prevId) => (prevId === messageId ? null : messageId));
};

  const onEmojiClickReact = async(emojiObject, message_id, message_type) => {
    const integracionInterna = state?.integraciones?.find(integr => integr.type == "Interno")
    var usuario_remitente = state.usuario.id_usuario;;
    var usuario_destino = null;
    var currentSend = {
      ...currentConversation,
      last_message_time: new Date().toISOString()
    };

    if (currentConversation?.integration_id == integracionInterna.id) {
      if (state.usuario.id_usuario == state?.conversacion_Actual?.contact_id || state?.usuario?.id_usuario == state?.conversacion_Actual?.contact_user_id) {
        usuario_remitente = state.conversacion_Actual.contact_id || state.conversacion_Actual.contact_user_id;
        usuario_destino = state?.conversacion_Actual?.id_usuario || state?.conversacion_Actual?.id_usuario;
      }else{
        usuario_remitente = state?.conversacion_Actual?.id_usuario;;
        usuario_destino =  state.conversacion_Actual.contact_id || state.conversacion_Actual.contact_user_id;
      }
  }

     try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/react-message`,{
          conversationId: currentConversation.conversation_id,
          phone: String(currentSend.phone_number),
          message_id: message_id,
          message_type: message_type,
          emoji: emojiObject.emoji,
          integration_name : state.integraciones?.find(intra => intra.id == currentSend?.integration_id)?.type,
          integration_id: currentSend?.integration_id,
          usuario_send: usuario_destino || null,
          id_usuario: usuario_remitente,
          companyId: state?.usuario?.company_id,
          remitent: state?.usuario?.id_usuario,
          reply_from: messageReply?.msj?.id || null
        })

        const messageReact = response.data.messageReact || '';
        console.log("mensaje reaccion",messageReact)
        setMessages(prevMessages => {
          const updatedMessages = { ...prevMessages };
          const messagesForConversation = updatedMessages[messageReact.conversation_fk] || [];
          
          const updatedConversationMessages = messagesForConversation.map(msg => {
            if (msg.id == (messageReact.replies_id || messageReact.id)) {
              return { ...msg, reaction: messageReact.reaction };
            }
            return msg; 
          });
        
          updatedMessages[messageReact.conversation_fk] = updatedConversationMessages;
        
          return updatedMessages;
        });

        setShowEmojiResponse(false); // Cierra el selector de emojis.
        setActiveMessageId(null)

     } catch (error) {
      console.log("error al reaccionar:",error)
     }
  };

  const integracion = state?.integraciones?.find(intr => intr?.id == currentConversation?.integration_id) || null;

  const ReplyBar = () => {
    const [referenceElement, setReferenceElement] = useState(null);
    const [popperElement, setPopperElement] = useState(null);
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
      placement: 'top', // Cambia según donde quieras que se coloque: 'top', 'bottom', etc.
      strategy: 'fixed', // Asegura que se posicione respecto al viewport
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 10], // Ajusta el desplazamiento horizontal y vertical
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport', // Limita el desbordamiento al viewport
            tether: false,        // Permite que el elemento se salga si es necesario
          },
        },
        {
          name: 'computeStyles',
          options: {
            adaptive: false, // Asegura que se calculen correctamente los estilos en `fixed`
          },
        },
      ],
    });
    
    const [messageText, setMessageText] = useState('');
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

    const handleCameraFile = (event) => {
      const file = event.target.files[0];
      if (!file) return;
    
      if (file.type.startsWith("image/")) {
        setSelectedImage(file); // Procesar como imagen
      } else if (file.type.startsWith("video/")) {
        setSelectedVideo(file); // Procesar como video
      } else {
        console.warn("Archivo capturado no válido");
      }
    };    

    const handleSendMessage = async () => {
      if (!currentConversation || !messageText.trim()) return;
    
      const textToSend = messageText;
      console.log("Texto a enviar:", textToSend);
    
      setMessageText('');
      var usuario_remitente = state.usuario.id_usuario;;
      var usuario_destino = null;

      var currentSend = {
        ...currentConversation,
        last_message_time: new Date().toISOString()
      };
    
      const integracionInterna = state?.integraciones?.find(integr => integr.type == "Interno")
     console.log("current", currentConversation)
    if (currentConversation?.integration_id == integracionInterna.id) {
        if (state.usuario.id_usuario == state?.conversacion_Actual?.contact_id || state?.usuario?.id_usuario == state?.conversacion_Actual?.contact_user_id) {
          usuario_remitente = state.conversacion_Actual.contact_id || state.conversacion_Actual.contact_user_id;
          usuario_destino = state?.conversacion_Actual?.id_usuario || state?.conversacion_Actual?.id_usuario;
        }else{
          usuario_remitente = state?.conversacion_Actual?.id_usuario;;
          usuario_destino =  state.conversacion_Actual.contact_id || state.conversacion_Actual.contact_user_id;
        }
    }
      try {
        setMessageReply(null)
        setConversacionActual({...currentSend, position_scroll: false})
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/send-text`, {
          phone: String(currentSend.phone_number),
          messageText: textToSend,
          conversation_id: currentSend?.conversation_id || null,
          integration_name : state.integraciones?.find(intra => intra.id == currentSend?.integration_id)?.type,
          integration_id: currentSend?.integration_id,
          usuario_send: usuario_destino || null,
          id_usuario: usuario_remitente,
          companyId: state?.usuario?.company_id,
          remitent: state?.usuario?.id_usuario,
          reply_from: messageReply?.msj?.id || null
        });
    
        console.log('Respuesta recibida:', response);
    
        if (response.data) {
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
    }
    };
    
    const handleKeyDown = async(event) => {
      if (event.key === 'Enter' && event.shiftKey) {
        // Allow line break
      } else if (event.key === 'Enter') {
         event.preventDefault();
        await handleSendMessage();
        console.log("actual despues", state.conversacion_Actual.position_scroll)
      }
    };

    const onEmojiClick = (emojiObject, event) => {
      const cursorPosition = textInputRef.current.selectionStart;
      const newText = messageText.substring(0, cursorPosition) + emojiObject.emoji + messageText.substring(cursorPosition);
      setMessageText(newText);
      setCursorPosition(cursorPosition + 1);
    };

    const handleEmojiClick = () => {
      setShowEmojiPicker(!showEmojiPicker);
    };

    const handleAttachClick = () => {
      setFileMenuVisible(!fileMenuVisible);
    };

    const resetFileInput = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleFileMenuClick = (type) => {
      resetFileInput();
      setFileInputType(type);
      setTimeout(() => {
        fileInputRef.current.click();
      }, 100);
    };

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
    
      if (file.type.startsWith('image/')) {
        setSelectedImage(file); // Imagen seleccionada
      } else if (file.type.startsWith('video/')) {
        setSelectedVideo(file); // Video seleccionado
      } else {
        setSelectedDocument(file); // Documento seleccionado
      }
    };
    
    

    const handleTextChange = (e) => {
      setMessageText(e.target.value);
      setCursorPosition(e.target.selectionStart);
    };
    
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (!replyBarRef.current.contains(event.target)) {
            setSelectedImage(null); 
            setSelectedVideo(null); 
            setSelectedDocument(null); 
          }
        };
      
        const handleKeyDown = (event) => {
          if (event.key === 'Escape') {
            setSelectedImage(null); 
            setSelectedVideo(null);
            setSelectedDocument(null);
          }
        };
      
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
      
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('keydown', handleKeyDown);
        };
      }, [replyBarRef]);      

    const renderMessageContent = () => {
      switch (messageReply?.msj?.message_type) {
        case 'audio':
          return <aside className='d-flex '> <Mic/> <p className='p-0 m-0'>{formatVideoDuration(messageReply.msj.duration)}</p></aside>
        case 'video':
          return (
            <aside className="flex items-center justify-between">
              {/* Icono y texto alineados a la izquierda */}
              <div className="flex items-center space-x-1">
                <Video className="w-8 h-8 text-gray-600" />
                <p className="text-sm text-gray-800 ms-1 m-0 p-0">Video</p>
              </div>
          
              <img 
                src={ensureFullUrl(messageReply.msj.thumbnail_url)} 
                alt="Original media" 
                className="w-12 h-12 object-cover rounded-md" 
              />
            </aside>
          );  
        case 'text':
          return <p className=" flex text-sm text-gray-800 overflow-hiden text-ellipsis ">{messageReply?.msj?.text}</p>;
        case 'template':
          return <p className="max-h-[100%] text-sm flex text-gray-800 overflow-hiden">{messageReply?.msj?.text}</p>;
        case 'image':
          return (
            <aside className="flex items-center justify-between">
              {/* Icono y texto alineados a la izquierda */}
              <div className="flex items-center space-x-1">
                <CameraIcon className="w-8 h-8 text-gray-600" />
                <p className="text-sm text-gray-800 ms-1 m-0 p-0">Foto</p>
              </div>
          
              <img 
                src={ensureFullUrl(messageReply.msj.media_url)} 
                alt="Original media" 
                className="w-12 h-12 object-cover rounded-md" 
              />
            </aside>
          ); 
        case 'document':
            return (
              <aside className="flex items-center justify-between">
                {/* Icono y texto alineados a la izquierda */}
                <div className="flex items-center space-x-1">
                  <File className="w-8 h-8 text-gray-600" />
                  <p className="text-sm text-gray-800 ms-1 m-0 p-0">Documento</p>
                </div>
            
                <img 
                  src={getFileIcon(messageReply.msj.file_name)}
                  alt="Original media" 
                  className="w-12 h-12 object-cover rounded-md" 
                />
              </aside>
            );                    
        default:
          return null;
      }
    };

  
    return (
      <section className='flex flex-col'>
      {!isScrolledToEnd && messageReply?.msj != null && (
           <section className="flex floating-svg-reply" onClick={handleViewNewMsj} style={{ display: !isScrolledToEnd && messageReply?.msj ? 'block' : 'none' }}>
                <ChevronDown  
                color='#798287'
                fill='#525151'
                className='new-message'
                height="40"
                width="40"/>
            </section>
          )}
      <article className={`max-h-[100px] flex overflow-hiden flex-row items-center space-x-3 bg-gray-100 p-2 rounded-md shadow-sm ${messageReply?.msj ? '' : 'hidden'} `}>
          <section className='w-100 flex col'>
            <Card className="bg-white border rounded-md flex-grow max-h-[90px] overflow-hiden" >
              <CardContent className="p-3 overflow-hidden max-h-[100%]">
                <div className="flex items-center space-x-2 mb-0">
                <Label className=" font-semibold text-gray-700 text-ellipsis whitespace-nowrap">
                    {messageReply?.msj?.type === 'reply' ? "Tú" : messageReply?.nombre_usuario_destino}
                  </Label>
                </div>
                  {renderMessageContent()}
              </CardContent>
            </Card>
            <Button
              variant="ghost"
              size="lg"
              
              onClick={() => setMessageReply(null)}
              className="text-gray-500 hover:text-gray-700 self-center"
            >
              <X className="w-4 h-4" />
            </Button>
          </section>
    </article>
        
      <article className="reply-bar-container" ref={replyBarRef}>
        {!isMobile && integracion?.name != 'Interno' && (
          <Button variant="light" className="reply-button p-0 m-0" onClick={handleOpenTemplateModal}>
            <i className="far fa-file-alt"></i>
          </Button>
        )}

        {showEmojiPicker && (
          <div
            ref={setPopperElement}
            style={{ ...styles.popper, zIndex: 9999 }} // Asegura un z-index alto si está detrás de otros elementos
            {...attributes.popper}
          >
            <EmojiPicker
              disabled={integracion.name === 'Interno' ? false : isLastMessageOlderThan24Hours()}
              onEmojiClick={onEmojiClick}
            />
          </div>
        )}

        {selectedDocument && !clearView && (
          <div className="selected-document-preview-overlay">
            <div className="document-preview">
              <div className="document-info" onClick={() => window.open(URL.createObjectURL(selectedDocument), '_blank')}>
                <img src={getFileIcon(selectedDocument.name)} alt="Document icon" className="document-icon" />
                <p className="document-name text-dark">{selectedDocument.name}</p>
              </div>
              <div className="document-actions">
                <button className="btn btn-light document-button open" onClick={(e) => {
                  e.stopPropagation();
                  window.open(URL.createObjectURL(selectedDocument), '_blank');
                }}>Abrir</button>
                <button className="btn btn-light document-button save" onClick={(e) => {
                  e.stopPropagation();
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(selectedDocument);
                  link.download = selectedDocument.name;
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}>Guardar como...</button>
              </div>
            </div>
          </div>
        )}

        {selectedVideo && !clearView && (
          <div className="selected-video-preview-overlay">
            <video src={URL.createObjectURL(selectedVideo)} controls />
          </div>
        )}

        {selectedImage && !clearView && (
          <div
            className="selected-image-preview-overlay"
          >
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Preview"
            />
          </div>
        )}

        <TextareaAutosize
          className="message-input"
          placeholder="Escribe un mensaje aquí..."
          onKeyDown={handleKeyDown}
          maxRows={4}
          ref={textInputRef}
          disabled={ integracion?.name == 'Interno' ? false : isLastMessageOlderThan24Hours()}
        />
        
        {fileMenuVisible && (
          <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
            <div className='d-flex flex-column'>
              <Button variant="light" disabled={ integracion?.name == 'Interno' ? false : isLastMessageOlderThan24Hours()} onClick={() => handleFileMenuClick('image/*')}>Cargar Imagen</Button>
              <Button variant="light" disabled={ integracion?.name == 'Interno' ? false : isLastMessageOlderThan24Hours()} onClick={() => handleFileMenuClick('video/*')}>Cargar Video</Button>
              <Button variant="light" disabled={ integracion?.name == 'Interno' ? false : isLastMessageOlderThan24Hours()} onClick={() => handleFileMenuClick('.pdf,.doc,.docx,.txt')}>Cargar Documento</Button>
              {isMobile && (
                <Button variant="light" onClick={() => handleOpenTemplateModal()}>Cargar Plantillas</Button>
              )}
            </div>
          </div>
        )}
        <Button variant="light" disabled={ integracion?.name == 'Interno' ? false : false } className="reply-button" onClick={handleAttachClick}>
          <i className="fas fa-paperclip"></i> {/* Icono del clip */}
        </Button>
        <Button variant="light" disabled={ integracion?.name == 'Interno' ? false : isLastMessageOlderThan24Hours()} className="reply-button" onClick={handleEmojiClick} ref={setReferenceElement}>
          <i className="far fa-smile"></i> {/* Icono de la cara feliz */}
        </Button>
        
        <AudioRecorder inactivo={integracion?.name == 'Interno' ? false : isLastMessageOlderThan24Hours} onSend={handleSendAudio} />
        <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={fileInputType} 
        onChange={handleFileChange} 
      />
      </article>
      </section>
    );
  }

  useEffect(() => {
    const currentElement = messagesEndRef.current;
    if (currentElement) {
      currentElement.addEventListener('scroll', handleScroll);
      return () => currentElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (state.conversacion_Actual.position_scroll === false) {
        if (lastMessageId && messagesEndRef.current) {
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
    } else {
      console.log("ingresa en el segundo")

      if (firstMessageId && messagesEndRef.current && (isScrolledToEnd || updateMoreMsj != null)) {
        const scrollContainer = messagesEndRef.current;
        const element = document.getElementById(`msg-${middleMessageId ? middleMessageId : lastMessageId}`);
    
        if (element && scrollContainer) {
          // Obtener la posición del elemento deseado
          const elementTop = element.offsetTop;
    
          // Ajustar el scroll para mantener la posición deseada
          scrollContainer.scrollTop = elementTop;
          console.log("Desplazado al mensaje con ID:", middleMessageId || firstMessageId);
          
          setUpdateMoreMsj(null); // Restablecer el estado para no repetir el scroll
        }
      }
    }
  }, [lastMessageId, messages]);

  useEffect(() => {
    if (currentConversation && currentConversation.conversation_id) {
      if (!messages[currentConversation.conversation_id]) {
        loadMessages(currentConversation.conversation_id).then(initialMessages => {
          if (initialMessages.length) {
            setLastMessageId(new Date(initialMessages[0].timestamp).getTime());
            setFirstMessageId(new Date(initialMessages[initialMessages.length - 1].timestamp).getTime())
            
            console.log('Initial last message ID:', initialMessages[0].timestamp);
          }
        });
      } else {
        const initialMessages = messages[currentConversation.conversation_id];
        if (initialMessages.length) {
          console.log("id de primer mensaje", new Date(initialMessages[initialMessages.length - 1].timestamp).getTime())
          console.log("id de ultimo mensaje", new Date(initialMessages[0].timestamp).getTime())
          setLastMessageId(new Date(initialMessages[0].timestamp).getTime());
          setFirstMessageId(new Date(initialMessages[initialMessages.length - 1].timestamp).getTime())
          console.log('Initial loaded conversation last message ID:', initialMessages[0].timestamp);
        }
      }
    }
  }, [currentConversation, messages]);
  
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

 const handleViewNewMsj = async() => {
  if (messagesEndRef.current) {
    // Desplaza el elemento al final
    messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
  }
 }
 
 const validateMessageTypeView = (bubbleClass, message) => {
   const integracionInterna = state?.integraciones?.find(integr => integr.type == "Interno")
    if (integracionInterna?.id == state?.conversacion_Actual?.integration_id) {
        if (bubbleClass == 'message-bubble message') {
           return null;
        }else{
          return  getMessageStatusIcon(message.state)
        }
    }else{
         return  getMessageStatusIcon(message.state)
    }
 }

  return (
    <>
      <div className="chat-window-container">
        <ContactInfoBar usuarios={state.usuarios} usuario={state.usuario} conversacion={currentConversation} />
        <EditContactModal show={showEditModal} onHide={() => setShowEditModal(false)} contact={currentConversation} socket={socket} />
        <div className={isMobile ? `messages-container` : `messages-container`} ref={messagesEndRef} >
          {sortedDates.map((date) => (
            <React.Fragment key={date}>
              <div className="date-header">{formatDate(date)}</div>
              {groupedMessages[date].map((message, index) => {
                const isDifferentTypePrevious = index > 0 && message.type !== groupedMessages[date][index - 1].type;
                const isDifferentTypeNext = index < groupedMessages[date].length - 1 && message.type !== groupedMessages[date][index + 1].type;
                let bubbleClass = typeMessageVerificad(message, integration, state.usuario);
                var alineacionMesj= null;
                var alingMessage = null;
                if (isMobile && bubbleClass == 'message-bubble reply') {
                   alineacionMesj = 'emoji-container'; 
                } else if (isMobile && bubbleClass != 'message-bubble reply') {
                  alineacionMesj = 'emoji-containerLeft'
                }else {
                  alineacionMesj = '';
                }
                if (bubbleClass == 'message-bubble message') {
                  alingMessage = 'justify-end flex-row-reverse items-center';
                } else {
                  alingMessage = 'justify-end';
                }
                if (isDifferentTypePrevious) bubbleClass += ' different-type-previous';
                if (isDifferentTypeNext) bubbleClass += ' different-type-next max-w-fit !import';
  
                const originalMessage = message.reply_from ? findOriginalMessage(message.reply_from) : null;
  
                return (
                  <section
                  className={`w-full flex flex-row ${alingMessage}`}
                  onMouseEnter={() => setHoveredId(message.id)} // Activar el hover para este id
                  onMouseLeave={() => setHoveredId(null)} // Desactivar el hover
                >
               <article
                      className={`d-flex justify-center items-center transition-opacity duration-300 ease-in-out ${
                        isMobile ? 'opacity-0' : hoveredId === message.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                    <button
                      disabled={(integracion?.name === "Interno" ? false : isLastMessageOlderThan24Hours()) || isMobile}
                      className="reply-button"
                      onClick={() => handleEmojiReaction(message.id)}
                      ref={setReferenceElementReact}
                    >
                      <i className="far fa-smile"></i>
                    </button>
                
                    <DropdownMenu open={activeDropdown === message.id} onOpenChange={(isOpen) => !isOpen && closeDropdown()}>
                      <DropdownMenuTrigger asChild>
                        <ChevronDown className="hover:text-gray-500 hover:cursor-pointer transition-colors duration-200" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56"
                        side="right"
                        align="start"
                        sideOffset={4}
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => handleDropdownClick(message)}>
                            <span>Responder</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEmojiReaction(message.id)}>
                            <span>Reaccionar</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </article>
  
                  <article
                   onTouchStart={() =>startPress(message.id)}
                    key={message.id}
                    id={`msg-${new Date(message.timestamp).getTime()}`}
                    className={bubbleClass}
                    style={{ marginBottom: '20px', maxWidth: message.message_type === 'image' || message.message_type === 'video' ? 'none' : 'auto',  position: 'relative', }}
                  >
            
                     
                        {activeMessageId === message.id && showEmojiResponse && ( // Mostrar solo si coincide con el ID activo
                          <div 
                          className={alineacionMesj}
                            ref={setPopperElementReact}
                            >
                            <EmojiPicker
                              reactionsDefaultOpen
                              allowExpandReactions
                              disabled={integracion.name === "Interno" ? false : isLastMessageOlderThan24Hours()}
                              onEmojiClick={(emoji) => onEmojiClickReact(emoji, message.id, message.type)}
                            />
                          </div>
                        )}

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
                      {message.type === 'reply' && validateMessageTypeView(bubbleClass, message)}
                    </span>
                    {/* Reacción (Badge con Emoji) */}
                    {message.reaction && (
                      <div className="absolute top-15 left-0 right-0 flex justify-start pt-2">
                        <Badge
                          variant="icon"
                          className="p-0 transform translate-x-2/6 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700 opacity-90 hover:opacity-100 cursor-pointer"
                        >
                          <span className="text-xl">{message.reaction}</span> {/* Mostrar el emoji */}
                        </Badge>
                      </div>
                    )}
                  </article>
                  </section>
                );
              })}
            </React.Fragment>
          ))}
            {!isScrolledToEnd && messageReply?.msj == null && (
                <div className="floating-svg" onClick={handleViewNewMsj}>
                   <ChevronDown  
                   color='#798287'
                   fill='#525151'
                    className='new-message'
                    height="40"
                    width="40"/>
                </div>
              )}
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
