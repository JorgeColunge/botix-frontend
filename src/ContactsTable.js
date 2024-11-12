import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import CreateContactModal from './CreateContactModal'; // Asegúrate de que la ruta sea correcta
import UploadCSVModal from './UploadCSVModal'; // Asegúrate de que la ruta sea correcta
import './ContactsTable.css'; // Import the CSS file
import { AppContext } from './context';
import { UserDate } from './UserDate';
import { useConversations } from './ConversationsContext';
import Swal from 'sweetalert2';
import { useMediaQuery } from 'react-responsive';

const geoUrl = '/ne_110m_admin_0_countries.json'; // Ruta al archivo GeoJSON en la carpeta public

const ContactsTable = () => {
  const {state, setConversacionActual, setRouter} = useContext(AppContext)
  const {
    conversations,
    setCurrentConversation,
    setConversations,
  } = useConversations();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [showUploadCSVModal, setShowUploadCSVModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactData, setContactData] = useState({});
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    phase: '',
    country: '',
    lastContact: '',
  });
  const companyId = localStorage.getItem('company_id');

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => { 

    const fetchContactsData = async () => {
      try {
        setContacts(state.contactos || []);
      } catch (error) {
        console.error('Error fetching contacts data:', error);
      }
    };

    fetchContactsData();
  }, [companyId]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [search, filters, contacts]);



  const applyFiltersAndSearch = () => {
    let tempContacts = [...contacts];

    if (search) {
      const lowercasedSearch = search.toLowerCase();
      tempContacts = tempContacts.filter(contact =>
        (contact.first_name?.toLowerCase() || '').includes(lowercasedSearch) ||
        (contact.last_name?.toLowerCase() || '').includes(lowercasedSearch) ||
        (contact.phone_number || '').includes(search) ||
        (contact.email?.toLowerCase() || '').includes(lowercasedSearch)
      );
    }

    if (filters.phase) {
      tempContacts = tempContacts.filter(contact => contact.phase_name === filters.phase);
    }

    if (filters.country) {
      tempContacts = tempContacts.filter(contact => contact.nacionalidad === filters.country);
    }

    if (filters.lastContact) {
      const now = new Date();
      tempContacts = tempContacts.filter(contact => {
        const lastContactDate = new Date(contact.last_message_time);
        const timeDiff = (now - lastContactDate) / 1000;
        switch (filters.lastContact) {
          case 'today':
            return timeDiff <= 86400;
          case 'yesterday':
            return timeDiff > 86400 && timeDiff <= 172800;
          case 'thisWeek':
            return timeDiff <= 604800;
          case 'lastWeek':
            return timeDiff > 604800 && timeDiff <= 1209600;
          case 'thisMonth':
            return now.getMonth() === lastContactDate.getMonth() && now.getFullYear() === lastContactDate.getFullYear();
          case 'lastMonth':
            const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
            return lastContactDate.getMonth() === lastMonth.getMonth() && lastContactDate.getFullYear() === lastMonth.getFullYear();
          case 'beforeLastMonth':
            return lastContactDate < new Date(now.setMonth(now.getMonth() - 2));
          default:
            return true;
        }
      });
    }

    setFilteredContacts(tempContacts);
  };

  const handleEditContactClick = (contact) => {
    setContactData(contact);
    setShowContactModal(true);
  };

  const handleDeleteContactClick = (id) => {

    Swal.fire({
      title: "Esta seguro que desea eliminar este Contacto?",
      showDenyButton: true,
      confirmButtonText: "Eliminar",
    }).then(async (result) => { 
      if (result.isConfirmed) {
        try {
          axios.delete(`${process.env.REACT_APP_API_URL}/api/contacts/${id}`)
          .then(() => {
            setContacts(contacts.filter(contact => contact.id !== id));
          })
          .catch(error => {
            console.log('Error deleting contact:', error);
          });
          await Swal.fire({
            title: "Perfecto",
            text: `Plantilla Eliminada.`,
            icon: "success"
          });
        } catch (error) {
          console.log(error)
          Swal.fire({
            title: "Error",
            text: `Error al eliminar Plantilla.
            Error: ${error.response.data.error}`,
            icon: "error"
          });
        }
      } 
    });

  };

  const handleCreateContactClick = () => {
    setShowCreateContactModal(true);
  };

  const handleUploadCSVClick = () => {
    setShowUploadCSVModal(true);
  };

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactData({
      ...contactData,
      [name]: value
    });
  };

  const handleContactFormSubmit = (e) => {
    e.preventDefault();
    axios.put(`${process.env.REACT_APP_API_URL}/api/contacts/${contactData.id}`, contactData)
      .then(response => {
        setContacts(contacts.map(contact => contact.id === contactData.id ? response.data : contact));
        setShowContactModal(false);
      })
      .catch(error => {
        console.error('Error updating contact data:', error);
      });
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

  const handleSelectContactChat = async (contacto) => {
    const integracion = state.integraciones.find( integ => integ.type == 'whatsapp')
    console.log("integracion", integracion)
    const conver = conversations.find(conv => conv.phone_number == contacto.telefono)
    if (conver) {
      await resetUnreadMessages(conver.conversation_id);
      setCurrentConversation(conver);
      setConversacionActual({...conver, position_scroll: false})
    }else{
      const usuario = state.usuarios.find(us => us.id_usuario == Number(localStorage.getItem('user_id')))
      const {nombre, apellido, telefono, direccion, correo, ciudad, ultimo_mensaje, tiempo_ultimo_mensaje, fase, conversacion, ...rest} = contacto
      let cont = {
        ...rest,
        conversation_id: 'nuevo',
        integration_id: integracion.id,
        integration_name: integracion.name,
        first_name: nombre,
        last_name: apellido,
        phone_number: telefono,
        direccion_completa: direccion,
        email: correo,
        ciudad_residencia: ciudad,
        last_message_time: ultimo_mensaje,
        time_since_last_message: tiempo_ultimo_mensaje,
        phase_name: fase,
        has_conversation: conversacion,
        id_usuario: usuario.id_usuario,
        responsable_nombre: usuario.nombre,
        responsable_apellido: usuario.apellido,
      }
      console.log("datos a enviar", cont)
      setRouter('chats')
      setCurrentConversation(cont);
      setConversacionActual({...cont, position_scroll: false})
    }
  }

  const formatTimeSinceLastMessage = (seconds) => {
    if (!seconds) return '-';
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    return `${days}d ${hours}h`;
  };

  const countryContactCounts = contacts.reduce((acc, contact) => {
    const country = contact.nacionalidad;
    if (acc[country]) {
      acc[country] += 1;
    } else {
      acc[country] = 1;
    }
    return acc;
  }, {});

  const colorScale = scaleQuantize()
    .domain([0, Math.max(...Object.values(countryContactCounts))])
    .range([
      "#f2e1f7",
      "#e0aaf1",
      "#d47ce7",
      "#cc3ddc",
      "#b933c6",
      "#a629b0",
      "#8f2197",
      "#78187e",
      "#5f105f"
    ]);

  return (
    <div className="contacts-container">
      {
        !isMobile && (
          <div className="map-container">
            <ComposableMap projectionConfig={{ scale: 150 }}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const country = geo.properties.NAME;
                    const count = countryContactCounts[country] || 0;
                    return (
                      <OverlayTrigger
                        key={geo.rsmKey}
                        placement="top"
                        overlay={
                          <Tooltip>
                            {country}: {count}
                          </Tooltip>
                        }
                      >
                        <Geography
                          geography={geo}
                          fill={colorScale(count)}
                          stroke="#D033B9"
                          strokeWidth={0.5}
                          onMouseEnter={() => {
                            console.log(`${country}: ${count}`);
                          }}
                        />
                      </OverlayTrigger>
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
        )
      }
    
      <div className="table-responsive">
        <UserDate 
        tipo_tabla={'contactos'}
        contacts={filteredContacts}
        handleEditContactClick={handleEditContactClick}
        handleDeleteContactClick={handleDeleteContactClick}
        formatTimeSinceLastMessage={formatTimeSinceLastMessage}
        handleCreateContactClick={handleCreateContactClick}
        handleUploadCSVClick={handleUploadCSVClick}
        handleSelectContactChat={handleSelectContactChat}
        />
      </div>

      <CreateContactModal
        show={showCreateContactModal}
        onHide={() => setShowCreateContactModal(false)}
        companyId={companyId}
        onContactCreated={(newContact) => setContacts([...contacts, newContact])}
      />

      <UploadCSVModal
        show={showUploadCSVModal}
        onHide={() => setShowUploadCSVModal(false)}
        companyId={companyId}
        onCSVUploaded={(newContacts) => setContacts([...contacts, ...newContacts])}
      />

      <Modal show={showContactModal} onHide={() => setShowContactModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Contacto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleContactFormSubmit}>
            <Form.Group controlId="formContactName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={contactData.first_name || ''}
                onChange={handleContactFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formContactSurname">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={contactData.last_name || ''}
                onChange={handleContactFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formContactPhone">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="phone_number"
                value={contactData.phone_number || ''}
                onChange={handleContactFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formContactEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={contactData.email || ''}
                onChange={handleContactFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formContactAddress">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion_completa"
                value={contactData.direccion_completa || ''}
                onChange={handleContactFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formContactCity">
              <Form.Label>Ciudad</Form.Label>
              <Form.Control
                type="text"
                name="ciudad_residencia"
                value={contactData.ciudad_residencia || ''}
                onChange={handleContactFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formContactNationality">
              <Form.Label>Nacionalidad</Form.Label>
              <Form.Control
                type="text"
                name="nacionalidad"
                value={contactData.nacionalidad || ''}
                onChange={handleContactFormChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ContactsTable;
