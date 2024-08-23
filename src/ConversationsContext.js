import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import { AppContext } from './context';
import { Spinner } from 'react-bootstrap';


const ConversationsContext = createContext();

const getUserPrivileges = async (roleId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/privileges-role/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user privileges:', error);
    return [];
  }
};

const getPhases = async (departmentId, companyId, userPrivileges) => {
  try {
    if (userPrivileges.includes("Admin") || userPrivileges.includes("Show all departments")) {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/company/${companyId}/phases`);
      return response.data.reduce((acc, phase) => {
        acc[phase.id] = { phase_id: phase.id, name: phase.name, color: phase.color };
        return acc;
      }, {});
    } else {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/departments/${departmentId}/phases`);
      return response.data.reduce((acc, phase) => {
        acc[phase.id] = { phase_id: phase.id, name: phase.name, color: phase.color };
        return acc;
      }, {});
    }
  } catch (error) {
    console.error('Error fetching department phases:', error);
    return {};
  }
};

export const ConversationsProvider = ({ children, socket, userHasInteracted }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [userPrivileges, setUserPrivileges] = useState([]);
  const [phases, setPhases] = useState({});
  const [defaultUser, setDefaultUser] = useState(null);
  const {state} = useContext(AppContext)
  
  const loadMessages = async (conversationId, offset = 0) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/messages/${conversationId}?offset=${offset}`);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
      return [];
    }
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

  const handleResponsibleChange = (newUserId, oldUserId) => {
    if (!socket) {
      console.error("Socket no está disponible");
      return;
    }
    socket.emit('changeResponsible', {
      conversationId: currentConversation.conversation_id,
      newUserId,
      oldUserId
    });
  };

  const handleEndConversation = async (conversationId) => {
    const companyId = localStorage.getItem("company_id");
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/end-conversation`, {
        conversationId: conversationId,
        companyId: companyId
      });
      console.log('Conversación finalizada exitosamente:', response.data);
      
      const defaultUserResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/default-user/${companyId}`);
      const defaultUserId = defaultUserResponse.data.id_usuario;
      setDefaultUser(defaultUserId);
      
      handleResponsibleChange(defaultUserId, currentConversation.id_usuario);
    } catch (error) {
      console.error('Error al finalizar la conversación:', error);
    }
  };
  
  useEffect(() => {
    const roleId = localStorage.getItem("user_role");
    const companyId = localStorage.getItem("company_id");
    const departmentId = localStorage.getItem("department_id");
    if (roleId) {
      console.log('Fetching user privileges');
      getUserPrivileges(roleId).then(privileges => {
        console.log('User privileges:', privileges);
        setUserPrivileges(privileges);
        getPhases(departmentId, companyId, privileges).then(phases => {
          console.log('Fetched phases:', phases);
          setPhases(phases);
        }).catch(error => {
          console.error('Error fetching phases:', error);
        });
      }).catch(error => {
        console.error('Error fetching user privileges:', error);
        setUserPrivileges([]);
      });
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleResponsibleChanged = async (data) => {
      const { conversationId, newUserId, updatedConversation } = data;
      console.log(`Responsible changed for conversation ${conversationId} to user ${newUserId}`, updatedConversation);

      try {
        const fullConversationResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/conversations/${conversationId}`);
        const fullConversation = fullConversationResponse.data;

        const messagesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/messages/${conversationId}?offset=0`);
        const messages = messagesResponse.data;

        setConversations(prevConversations => {
          const index = prevConversations.findIndex(convo => convo.conversation_id === conversationId);
          if (index !== -1) {
            return prevConversations.map(convo =>
              convo.conversation_id === conversationId ? fullConversation : convo
            );
          } else {
            return [...prevConversations, fullConversation];
          }
        });

        setMessages(prevMessages => ({
          ...prevMessages,
          [conversationId]: messages
        }));

        if (currentConversation && currentConversation.conversation_id === conversationId) {
          setCurrentConversation(fullConversation);
        }
      } catch (error) {
        console.error('Error fetching full conversation details or messages:', error);
      }
    };

    const handleResponsibleRemoved = async (data) => {
      const { conversationId } = data;

      console.log(`Responsible removed for conversation ${conversationId}, checking role.`);

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/conversations/${conversationId}`);
        const updatedConversation = response.data;

        if (!userPrivileges.includes('Admin') && !userPrivileges.includes('Show All Conversations')) {
          console.log(`Removing conversation ${conversationId} from list as the user is not Admin.`);
          setConversations(prevConversations =>
            prevConversations.filter(convo => convo.conversation_id !== conversationId)
          );

          if (currentConversation && currentConversation.conversation_id === conversationId) {
            setCurrentConversation(null);
            console.log(`Current conversation set to null as responsible was removed.`);
          }
        } else {
          setConversations(prevConversations =>
            prevConversations.map(convo =>
              convo.conversation_id === conversationId ? updatedConversation : convo
            )
          );
          if (currentConversation && currentConversation.conversation_id === conversationId) {
            setCurrentConversation(updatedConversation);
            console.log(`Admin user, updated current conversation: ${conversationId}`);
          }
          console.log(`Admin user, conversation ${conversationId} updated in list but not removed.`);
        }
      } catch (error) {
        console.error('Error fetching updated conversation details:', error);
      }
    };

    const updateConversationInfo = async (data) => {
      const { conversationId, updatedConversation } = data;

      if (!userPrivileges.includes('Admin') && !userPrivileges.includes('Show All Conversations')) {
        console.log("User is not admin, skipping full update.");
        return;
      }

      console.log(`Updating conversation info for ${conversationId}`);

      try {
        const fullConversationResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/conversations/${conversationId}`);
        const fullConversation = fullConversationResponse.data;

        const messagesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/messages/${conversationId}?offset=0`);
        const messages = messagesResponse.data;

        setConversations(prevConversations => {
          const index = prevConversations.findIndex(convo => convo.conversation_id === conversationId);
          if (index !== -1) {
            return prevConversations.map(convo =>
              convo.conversation_id === conversationId ? fullConversation : convo
            );
          } else {
            return [...prevConversations, fullConversation];
          }
        });

        setMessages(prevMessages => ({
          ...prevMessages,
          [conversationId]: messages
        }));

        if (currentConversation && currentConversation.conversation_id === conversationId) {
          setCurrentConversation(fullConversation);
        }
      } catch (error) {
        console.error('Error fetching full conversation details or messages:', error);
      }
    };

    socket.on('responsibleChanged', handleResponsibleChanged);
    socket.on('responsibleRemoved', handleResponsibleRemoved);
    socket.on('updateConversationInfo', updateConversationInfo);

    return () => {
      socket.off('responsibleChanged', handleResponsibleChanged);
      socket.off('responsibleRemoved', handleResponsibleRemoved);
      socket.off('updateConversationInfo', updateConversationInfo);
    };
  }, [socket, setCurrentConversation, setConversations, currentConversation, userPrivileges]);

  const updateContact = useCallback((contactData) => {
    if (!socket) {
      console.error("Socket no está disponible");
      return;
    }

    const updatedContact = {
      ...contactData,
      id: contactData.id
    };

    socket.emit('updateContact', updatedContact);

    console.log('Contact Updated:', updatedContact);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const contactUpdatedHandler = (updatedContact) => {
      console.log('Contacto actualizado recibido:', updatedContact);
      setConversations(prevConversations =>
        prevConversations.map(convo =>
          convo.contact_id === updatedContact.id ? { ...convo, ...updatedContact } : convo
        )
      );

      setCurrentConversation(current => {
        if (current && current.contact_id === updatedContact.id) {
          return { ...current, ...updatedContact };
        }
        return current;
      });
    };

    socket.on('contactUpdated', contactUpdatedHandler);

    return () => {
      socket.off('contactUpdated', contactUpdatedHandler);
    };
  }, [socket, setCurrentConversation, setConversations]);



  useEffect(() => {
    if (!socket) return;
  
    const newMessageHandler = async (newMessage) => {
  
      const userId = localStorage.getItem("user_id");
      const userCompanyId = localStorage.getItem("company_id");
  
      // Validar si el mensaje pertenece a la empresa del usuario conectado
      if (String(newMessage.company_id) !== userCompanyId) {
        console.log('Mensaje recibido de otra empresa. Ignorando.');
        return;
      }else{
  
      const isResponsibleOrAdmin = String(newMessage.responsibleUserId) === userId || userPrivileges.includes('Admin') || userPrivileges.includes('Show All Conversations');
  
      if (isResponsibleOrAdmin) {
        const isCurrentActive = currentConversation && currentConversation.conversation_id === newMessage.conversationId;
  
        if (isCurrentActive) {
          resetUnreadMessages(newMessage.conversationId);
          setCurrentConversation(prev => ({
            ...prev,
            last_message: newMessage.text,
            last_message_time:  newMessage.timestamp ? newMessage.timestamp : state.conversacion_Actual.last_message_time,
            unread_messages: newMessage.unread_messages,
            phase_id: prev.phase_id // Asegurar que phase_id se mantenga
          })
        );
        }

        const conversationExists = conversations.some(convo => convo.conversation_id === newMessage.conversationId);
  
        if (!conversationExists) {
          try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/conversations/${newMessage.conversationId}`);
            const newConversation = response.data;
            if (newConversation) {
              console.log("Datos de supuesto mensaje:", newConversation)
              setConversations(prevConversations => {
                const updatedConversations = [...prevConversations, newConversation];
                return Array.from(new Set(updatedConversations.map(convo => convo.conversation_id)))
                  .map(id => updatedConversations.find(convo => convo.conversation_id === id));
              });
            }
          } catch (error) {
            console.error('Error fetching new conversation:', error);
          }
        } else {
          setConversations(prevConversations => prevConversations.map(convo => {
            if (String(convo.conversation_id) === String(newMessage.conversationId)) {
              return {
                ...convo,
                last_message: newMessage.text,
                last_message_time: newMessage.timestamp ? newMessage.timestamp : state.conversacion_Actual.last_message_time,
                unread_messages: newMessage.unread_messages
              };
            }
            return convo;
          }));
        }
  
        setMessages(prevMessages => {
          const updatedMessages = { ...prevMessages };
          const messagesForConversation = updatedMessages[newMessage.conversationId] || [];
          updatedMessages[newMessage.conversationId] = [...messagesForConversation, newMessage];
          return updatedMessages;
        });
  
        if (activeConversation !== newMessage.conversationId && newMessage.type === 'message') {
          if (userHasInteracted) {
            const audio = new Audio('/whistle-campana-whatsapp.mp3');
            audio.play().catch(error => console.error('Error playing sound:', error));
            console.log('reproduciendo audio');
          }
        }
      }
    }
   };
  
    socket.on('newMessage', newMessageHandler);
  
    return () => {
      socket.off('newMessage', newMessageHandler);
    };
  }, [socket, currentConversation, setCurrentConversation, setConversations, setMessages, activeConversation, userHasInteracted, userPrivileges, state]);
  

  const messageStatusUpdateHandler = ({ messageId, status }) => {
      console.log(`nuevo estado recibido ${status} para el mensaje ${messageId}`);
      setMessages(prevMessages => {
        const updatedMessages = { ...prevMessages };
        for (const conversationId in updatedMessages) {
          updatedMessages[conversationId] = updatedMessages[conversationId].map(message =>
            message.id === messageId || message.replies_id === messageId ? { ...message, state: status } : message
          );
        }

        // Actualiza currentConversation si contiene el mensaje actualizado
        if (currentConversation) {
          const updatedCurrentMessages = updatedMessages[currentConversation.conversation_id] || [];
          const messageExistsInCurrent = updatedCurrentMessages.some(message => message.id === messageId || message.replies_id === messageId);
          if (messageExistsInCurrent) {
            setCurrentConversation(prev => ({
              ...prev,
              messages: updatedCurrentMessages
            }));
          }
        }

        return updatedMessages;
      });
    };

  useEffect(() => {
    if (!socket) return;

    const messageStatusUpdateHandler = ({ messageId, status }) => {
      console.log(`nuevo estado recibido ${status} para el mensaje ${messageId}`);
      setMessages(prevMessages => {
        const updatedMessages = { ...prevMessages };
        for (const conversationId in updatedMessages) {
          updatedMessages[conversationId] = updatedMessages[conversationId].map(message =>
            message.id === messageId || message.replies_id === messageId ? { ...message, state: status } : message
          );
        }

        // Actualiza currentConversation si contiene el mensaje actualizado
        if (currentConversation) {
          const updatedCurrentMessages = updatedMessages[currentConversation.conversation_id] || [];
          const messageExistsInCurrent = updatedCurrentMessages.some(message => message.id === messageId || message.replies_id === messageId);
          if (messageExistsInCurrent) {
            setCurrentConversation(prev => ({
              ...prev,
              messages: updatedCurrentMessages
            }));
          }
        }

        return updatedMessages;
      });
    };

    socket.on('replyStatusUpdate', messageStatusUpdateHandler);

    return () => {
      socket.off('replyStatusUpdate', messageStatusUpdateHandler);
    };
  }, [socket, currentConversation, setMessages]);

  const isCancelledRef = useRef(false);

  useEffect(() => {
    isCancelledRef.current = false;
    if (loading) return;

    const fetchConversationsAndMessages = async () => {
      const id_usuario = localStorage.getItem("user_id");
      const rol = localStorage.getItem("user_role");
      const company_id = localStorage.getItem("company_id");
      setLoading(true);

      try {
        const convResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/conversations?id_usuario=${id_usuario}&rol=${rol}&company_id=${company_id}`);
        console.log('Conversations:', convResponse.data);
        if (!isCancelledRef.current && convResponse.data) {
          const sortedConversations = convResponse.data.sort((a, b) => new Date(b.last_update) - new Date(a.last_update));

          const messagesByConvoId = {};

          const messageFetchPromises = sortedConversations.map(convo =>
            axios.get(`${process.env.REACT_APP_API_URL}/api/messages/${convo.conversation_id}?offset=0`).then(response => {
              messagesByConvoId[convo.conversation_id] = response.data;
            })
          );

          await Promise.all(messageFetchPromises);

          if (!isCancelledRef.current) {
            setConversations(sortedConversations);
            setMessages(messagesByConvoId);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversationsAndMessages();

    return () => {
      isCancelledRef.current = true;
    };
  }, [userPrivileges]);

  useEffect(() => {
    const companyId = localStorage.getItem("company_id");
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?company_id=${companyId}`);
        setAllUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);
   
  return (
    conversations.length == 0 ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <Spinner animation="border" variant="success" role="status">
              <span className="visually-hidden">Cargando conversaciones...</span>
            </Spinner>
            <div>Cargando conversaciones</div>
          </div>
        </div>
    ) : (

      <ConversationsContext.Provider value={{
        conversations,
        setConversations,
        currentConversation,
        setCurrentConversation,
        messages,
        setMessages,
        loading,
        loadMessages,
        activeConversation,
        userHasInteracted,
        setActiveConversation,
        updateContact,
        allUsers,
        handleResponsibleChange,
        handleEndConversation,
        phases
      }}>
        {children}
      </ConversationsContext.Provider>
    )
  );
};

export const useConversations = () => useContext(ConversationsContext);
