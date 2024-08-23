import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Card, InputGroup, FormControl, Table, Collapse } from 'react-bootstrap';
import axios from 'axios';
import './CreateCampaign.css';
import { PersonCircle, Robot } from 'react-bootstrap-icons';
import TemplatePreview from './TemplatePreview';
import { AppContext } from './context';

const CreateCampaign = () => {
  const { id_plantilla, id_camp } = useParams();

  const {state} = useContext(AppContext);

  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [phases, setPhases] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [templateId, setTemplateId] = useState(id_plantilla || '');
  const [scheduledLaunch, setScheduledLaunch] = useState('');
  const [type, setType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [bots, setBots] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [filters, setFilters] = useState({
    phase: '',
    country: '',
    minAge: '',
    maxAge: '',
    hasConversation: '',
    gender: '',
    incomeLevel: '',
    educationLevel: '',
    occupation: '',
    maritalStatus: '',
    childrenCount: '',
    lifestyle: '',
    personality: '',
    culture: '',
    purchaseHistory: '',
    creationDateStart: '',
    creationDateEnd: '',
    lastInteractionStart: '',
    lastInteractionEnd: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('new');
  const [responsible, setResponsible] = useState('');
  const [bot, setBot] = useState('');
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filteredBots, setFilteredBots] = useState([]);

  useEffect(() => {
      if (id_camp) {
          const campania = state.campañas.find(camp => camp.id == id_camp)
          const plantilla = state.plantillas.find(plant => plant.id == campania.template_id)
     
           setName(campania.name)
           setObjective(campania.objective)
           setType(campania.type)
           setRole(campania.type_responsible)
           setSelectedTemplate(plantilla)
           setTemplateSearchTerm(plantilla.nombre)
           setTemplateId(plantilla.id)
           setTemplates(state.plantillas)
           setFilteredTemplates(state.plantillas)
           setScheduledLaunch(campania.scheduled_launch)
      }
  }, [])
  
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!id_camp) {        
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
            setTemplates(response.data);
            setFilteredTemplates(response.data);
          
            if (id_plantilla) {
                const templete = response.data.find(temp => temp.id == id_plantilla)
                setSelectedTemplate(templete)
                setTemplateSearchTerm(templete.nombre)
            }
          } catch (error) {
            console.error('Error fetching templates:', error);
          }
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

        const humanUsers = usersResponse.data.filter(user => {
          const userRole = rolesResponse.data.find(role => role.id === user.rol);
          return userRole && userRole.type === 'Humano';
        });

        const botUsers = usersResponse.data.filter(user => {
          const userRole = rolesResponse.data.find(role => role.id === user.rol);
          return userRole && (userRole.type === 'Bot de Chat' || userRole.type === 'Bot de Chat IA');
        });

        setFilteredUsers(humanUsers);
        setUsers(humanUsers); // Store the users for filtering
        setFilteredBots(botUsers);
        setBots(botUsers); // Store the bots for filtering
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchTemplates();
    fetchContacts();
    fetchPhases();
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        setSelectedTemplate(null);
        return;
      }

      const companyId = localStorage.getItem('company_id');
      const token = localStorage.getItem('token');
      if (!companyId || !token) {
        console.error('No company ID or token found');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/templates/${templateId}`, {
          params: { company_id: companyId },
          headers: { Authorization: `Bearer ${token}` }
        });
        setSelectedTemplate(response.data);
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    };
     
    if (!id_camp) {
      fetchTemplate();
    }
  }, [templateId]);


  const handleCreateCampaign = async () => {
    const companyId = localStorage.getItem('company_id');
    const token = localStorage.getItem('token');
   
    if (id_camp) {
      try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/campaigns/${id_camp}`, {
          name,
          objective,
          type_responsible: role,
          template_id: templateId,
          scheduled_launch: scheduledLaunch || null,
          type,
          state_conversation: status || null,
          company_id: companyId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        await axios.post(`${process.env.REACT_APP_API_URL}/api/campaigns/${response.data.id}/contacts`, {
          contact_ids: selectedContacts
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (selectedUsers.length > 0) {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/campaigns/${response.data.id}/responsibles`, {
            responsible_ids: selectedUsers
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
  
        console.log('Campaign created:', response.data);
        navigate('/campaigns');
      } catch (error) {
        console.error('Error creating campaign:', error);
      }
    } else {  
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/campaigns`, {
          name,
          objective,
          template_id: templateId,
          scheduled_launch: scheduledLaunch || null,
          type,
          type_responsible: role,
          state_conversation: status || null,
          company_id: companyId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        await axios.post(`${process.env.REACT_APP_API_URL}/api/campaigns/${response.data.id}/contacts`, {
          contact_ids: selectedContacts
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (selectedUsers.length > 0) {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/campaigns/${response.data.id}/responsibles`, {
            responsible_ids: selectedUsers
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
  
        console.log('Campaign created:', response.data);
        navigate('/campaigns');
      } catch (error) {
        console.error('Error creating campaign:', error);
      }
    }
  };

  const handleContactSelect = (contactId) => {
    setSelectedContacts(prevState =>
      prevState.includes(contactId) ? prevState.filter(id => id !== contactId) : [...prevState, contactId]
    );
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      const filteredIds = filteredContacts.map(contact => contact.id);
      setSelectedContacts(filteredIds);
    }
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      const filteredIds = filteredUsers.map(user => user.id_usuario);
      setSelectedUsers(filteredIds);
    }
  };

  const handleTemplateSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase().replace(/\s+/g, '_');
    console.log(e.target.value)
    setTemplateSearchTerm(searchTerm);
    if (searchTerm === '') {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(template =>
        template.nombre.toLowerCase().includes(searchTerm)
      ));
    }
  };

  const handleUserSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setUserSearchTerm(searchTerm);
    if (searchTerm === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user =>
        user.nombre.toLowerCase().includes(searchTerm) ||
        user.apellido.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      ));
    }
  };

  const handleDepartmentFilterChange = (e) => {
    const departmentId = e.target.value;
    setSelectedDepartment(departmentId);
    if (departmentId === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.department_id === parseInt(departmentId, 10)));
    }
  };

  const handleRoleFilterChange = (e) => {
    const roleId = e.target.value;
    setSelectedRole(roleId);
    if (roleId === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.rol === parseInt(roleId, 10)));
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'N/A';
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'N/A';
  };

  const filteredContacts = contacts.filter(contact => {
    const searchTermLower = searchTerm.toLowerCase();
    const phaseMatch = !filters.phase || contact.phase_name?.toLowerCase().includes(filters.phase.toLowerCase());
    const countryMatch = !filters.country || contact.nacionalidad?.toLowerCase().includes(filters.country.toLowerCase());
    const minAgeMatch = !filters.minAge || (contact.edad_approx >= parseInt(filters.minAge, 10));
    const maxAgeMatch = !filters.maxAge || (contact.edad_approx <= parseInt(filters.maxAge, 10));
    const hasConversationMatch = filters.hasConversation === '' || (contact.has_conversation === (filters.hasConversation === 'true'));
    const genderMatch = !filters.gender || contact.genero?.toLowerCase() === filters.gender.toLowerCase();
    const incomeLevelMatch = !filters.incomeLevel || contact.nivel_ingresos?.toLowerCase() === filters.incomeLevel.toLowerCase();
    const educationLevelMatch = !filters.educationLevel || contact.nivel_educativo?.toLowerCase() === filters.educationLevel.toLowerCase();
    const occupationMatch = !filters.occupation || contact.ocupacion?.toLowerCase().includes(filters.occupation.toLowerCase());
    const maritalStatusMatch = !filters.maritalStatus || contact.estado_civil?.toLowerCase() === filters.maritalStatus.toLowerCase();
    const childrenCountMatch = !filters.childrenCount || contact.cantidad_hijos?.toString() === filters.childrenCount;
    const lifestyleMatch = !filters.lifestyle || contact.estilo_de_vida?.toLowerCase().includes(filters.lifestyle.toLowerCase());
    const personalityMatch = !filters.personality || contact.personalidad?.toLowerCase().includes(filters.personality.toLowerCase());
    const cultureMatch = !filters.culture || contact.cultura?.toLowerCase().includes(filters.culture.toLowerCase());
    const purchaseHistoryMatch = !filters.purchaseHistory || contact.historial_compras?.toLowerCase().includes(filters.purchaseHistory.toLowerCase());
    const creationDateMatch = (!filters.creationDateStart || new Date(contact.fecha_creacion_cliente) >= new Date(filters.creationDateStart)) &&
                              (!filters.creationDateEnd || new Date(contact.fecha_creacion_cliente) <= new Date(filters.creationDateEnd));
    const lastInteractionMatch = (!filters.lastInteractionStart || new Date(contact.last_message_time) >= new Date(filters.lastInteractionStart)) &&
                                 (!filters.lastInteractionEnd || new Date(contact.last_message_time) <= new Date(filters.lastInteractionEnd));
    const searchMatch = (
      contact.first_name?.toLowerCase().includes(searchTermLower) ||
      contact.last_name?.toLowerCase().includes(searchTermLower) ||
      contact.organization?.toLowerCase().includes(searchTermLower)
    );
    return phaseMatch && countryMatch && minAgeMatch && maxAgeMatch && hasConversationMatch && genderMatch && incomeLevelMatch && educationLevelMatch && occupationMatch && maritalStatusMatch && childrenCountMatch && lifestyleMatch && personalityMatch && cultureMatch && purchaseHistoryMatch && creationDateMatch && lastInteractionMatch && searchMatch;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleNext = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  const handleTemplateSelect = (template) => {
    console.log(template)
    setSelectedTemplate(template);
    setTemplateId(template.id);
    setTemplateSearchTerm(template.nombre);
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prevState =>
      prevState.includes(userId) ? prevState.filter(id => id !== userId) : [...prevState, userId]
    );
  };

  const handleBotSelect = (botId) => {
    const selectedBot = bots.find(bot => bot.id_usuario === botId);
    setBot(selectedBot ? `${selectedBot.nombre} ${selectedBot.apellido}` : '');
  };

  const handleBotSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setBot(searchTerm);
    if (searchTerm === '') {
      setFilteredBots(bots);
    } else {
      setFilteredBots(bots.filter(bot =>
        bot.nombre.toLowerCase().includes(searchTerm) ||
        bot.apellido.toLowerCase().includes(searchTerm)
      ));
    }
  };

  return (
    <Container className="create-campaign-container">
      <Row className="justify-content-center text-center mb-4">
        <Col md={7}>
          <h2>Crear Campaña</h2>
        </Col>
      </Row>
      <Row className="justify-content-center mb-4">
        <Col md={7}>
          <div className="d-flex justify-content-between">
            {currentStep > 1 && (
              <Button variant="dark" onClick={handlePrevious} className="me-2">
                Anterior
              </Button>
            )}
            {currentStep < 3 && (
              <Button variant="primary" onClick={handleNext}>
                Siguiente
              </Button>
            )}
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={7}>
          {currentStep === 1 && (
            <Form>
              <Form.Group className="mb-3" controlId="formCampaignName">
                <Form.Label>Nombre de la Campaña</Form.Label>
                <Form.Control type="text" placeholder="Ingrese el nombre de la campaña" value={name} onChange={(e) => setName(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formCampaignObjective">
                <Form.Label>Objetivo de la Campaña</Form.Label>
                <Form.Control type="text" placeholder="Ingrese el objetivo de la campaña" value={objective} onChange={(e) => setObjective(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formCampaignType">
                <Form.Label>Tipo de Campaña</Form.Label>
                <Form.Control type="text" placeholder="Ingrese el tipo de la campaña" value={type} onChange={(e) => setType(e.target.value)} />
              </Form.Group>
            </Form>
          )}

          {currentStep === 2 && (
            <Form>
              <Form.Group className="mb-3" controlId="formContactSearch">
                <Form.Label>Buscar Contactos</Form.Label>
                <InputGroup>
                  <FormControl
                    placeholder="Buscar por nombre, apellido o empresa"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formContactFilters">
                <Button
                  onClick={() => setFilterOpen(!filterOpen)}
                  aria-controls="filter-collapse"
                  aria-expanded={filterOpen}
                >
                  Filtros
                </Button>
                <Collapse in={filterOpen}>
                  <div id="filter-collapse">
                    <Form.Label>Filtros</Form.Label>
                    <Row className="mt-2">
                      <Col>
                        <Form.Select name="phase" value={filters.phase} onChange={handleFilterChange}>
                          <option value="">Fase</option>
                          {phases.map(phase => (
                            <option key={phase.id} value={phase.name}>{phase.name}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col>
                        <Form.Control placeholder="País" name="country" value={filters.country} onChange={handleFilterChange} />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <Form.Control type="number" placeholder="Edad Mínima" name="minAge" value={filters.minAge} onChange={handleFilterChange} />
                      </Col>
                      <Col>
                        <Form.Control type="number" placeholder="Edad Máxima" name="maxAge" value={filters.maxAge} onChange={handleFilterChange} />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <Form.Select name="hasConversation" value={filters.hasConversation} onChange={handleFilterChange}>
                          <option value="">Conversación Asignada</option>
                          <option value="true">Sí</option>
                          <option value="false">No</option>
                        </Form.Select>
                      </Col>
                      <Col>
                        <Form.Select name="gender" value={filters.gender} onChange={handleFilterChange}>
                          <option value="">Género</option>
                          <option value="masculino">Masculino</option>
                          <option value="femenino">Femenino</option>
                          <option value="no binario">No Binario</option>
                        </Form.Select>
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <Form.Select name="incomeLevel" value={filters.incomeLevel} onChange={handleFilterChange}>
                          <option value="">Nivel de Ingresos</option>
                          <option value="Muy altos">Muy Altos</option>
                          <option value="Altos">Altos</option>
                          <option value="Medios">Medios</option>
                          <option value="Bajos">Bajos</option>
                        </Form.Select>
                      </Col>
                      <Col>
                        <Form.Select name="educationLevel" value={filters.educationLevel} onChange={handleFilterChange}>
                          <option value="">Nivel Educativo</option>
                          <option value="sin estudios">Sin Estudios</option>
                          <option value="bachiller">Bachiller</option>
                          <option value="tecnico">Técnico</option>
                          <option value="profesional">Profesional</option>
                          <option value="maestria">Maestría</option>
                          <option value="doctorado">Doctorado</option>
                        </Form.Select>
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <Form.Control placeholder="Ocupación" name="occupation" value={filters.occupation} onChange={handleFilterChange} />
                      </Col>
                      <Col>
                        <Form.Select name="maritalStatus" value={filters.maritalStatus} onChange={handleFilterChange}>
                          <option value="">Estado Civil</option>
                          <option value="soltero">Soltero</option>
                          <option value="casado">Casado</option>
                          <option value="union libre">Unión Libre</option>
                        </Form.Select>
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <Form.Control placeholder="Cantidad de Hijos" name="childrenCount" value={filters.childrenCount} onChange={handleFilterChange} />
                      </Col>
                      <Col>
                        <Form.Control placeholder="Estilo de Vida" name="lifestyle" value={filters.lifestyle} onChange={handleFilterChange} />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <Form.Control placeholder="Personalidad" name="personality" value={filters.personality} onChange={handleFilterChange} />
                      </Col>
                      <Col>
                        <Form.Control placeholder="Cultura" name="culture" value={filters.culture} onChange={handleFilterChange} />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <Form.Control placeholder="Historial de Compras" name="purchaseHistory" value={filters.purchaseHistory} onChange={handleFilterChange} />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <Form.Label>Fecha de Creación</Form.Label>
                        <Form.Control type="date" placeholder="Desde" name="creationDateStart" value={filters.creationDateStart} onChange={handleFilterChange} />
                      </Col>
                      <Col>
                        <Form.Label>&nbsp;</Form.Label>
                        <Form.Control type="date" placeholder="Hasta" name="creationDateEnd" value={filters.creationDateEnd} onChange={handleFilterChange} />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <Form.Label>Última Interacción</Form.Label>
                        <Form.Control type="date" placeholder="Desde" name="lastInteractionStart" value={filters.lastInteractionStart} onChange={handleFilterChange} />
                      </Col>
                      <Col>
                        <Form.Label>&nbsp;</Form.Label>
                        <Form.Control type="date" placeholder="Hasta" name="lastInteractionEnd" value={filters.lastInteractionEnd} onChange={handleFilterChange} />
                      </Col>
                    </Row>
                  </div>
                </Collapse>
              </Form.Group>
              <Button variant="outline-dark" onClick={handleSelectAllContacts}>
                {selectedContacts.length === filteredContacts.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
              </Button>
              <div className="contacts-list mt-3">
                {filteredContacts.map(contact => (
                  <Card key={contact.id} className="contact-card">
                    <Card.Body>
                      <Row className='text-center'>
                        <Col md={1} className='mt-auto mb-auto'>
                          <Form.Check
                            type="checkbox"
                            label=""
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleContactSelect(contact.id)}
                          />
                        </Col>
                        <Col md={1} className='mt-auto mb-auto'>
                          {contact.profile_url ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL}${contact.profile_url}`}
                              alt="Profile"
                              className="rounded-circle"
                              style={{ width: 50, height: 50 }}
                            />
                          ) : (
                            <PersonCircle className='rounded-circle' size={50} />
                          )}
                        </Col>
                        <Col md={2} className='mt-auto mb-auto'>
                          <Card.Text><strong>{contact.first_name} {contact.last_name}</strong></Card.Text>
                        </Col>
                        <Col md={2} className='mt-auto mb-auto'>
                          <Card.Text>{contact.organization}</Card.Text>
                        </Col>
                        <Col md={2} className='mt-auto mb-auto'>
                          <Card.Text style={{ color: contact.phase_color, padding: '5px', borderRadius: '5px' }}>
                            {contact.phase_name}
                          </Card.Text>
                        </Col>
                        <Col md={2} className='mt-auto mb-auto'>
                          <Card.Text>{contact.has_conversation ? 'En Conversación' : 'Sin Conversación'}</Card.Text>
                        </Col>
                        <Col md={2} className='mt-auto mb-auto'>
                          <Card.Text>{contact.last_message_time ? new Date(contact.last_message_time).toLocaleString() : '-'}</Card.Text>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Form>
          )}

          {currentStep === 3 && (
            <Form>
              <Form.Group className="mb-3" controlId="formTemplate">
                <Form.Label>Seleccionar Plantilla</Form.Label>
                <InputGroup>
                  <FormControl
                    placeholder="Buscar y seleccionar una plantilla"
                    value={templateSearchTerm}
                    onChange={handleTemplateSearchChange}
                  />
                </InputGroup>
                <div className="templates-dropdown d-flex" style={{ maxHeight: '50vh' }}>
                  <div className="templates-list" style={{ flex: 1, maxHeight: '48vh', overflowY: 'auto' }}>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Seleccionar</th>
                          <th>Nombre</th>
                          <th>Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTemplates.map(template => (
                          <tr key={template.id}>
                            <td>
                              <Form.Check
                                type="radio"
                                name="templateSelect"
                                checked={selectedTemplate?.id == template.id}
                                onChange={() => handleTemplateSelect(template)}
                              />
                            </td>
                            <td>{template.nombre}</td>
                            <td>{template.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  <div className="template-preview" style={{ flex: 1, maxHeight: '50vh', overflowY: 'auto' }}>
                    <TemplatePreview template={selectedTemplate} />
                  </div>
                </div>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formScheduledLaunch">
                <Form.Label>Programar Lanzamiento</Form.Label>
                <Form.Control type="datetime-local" value={scheduledLaunch} onChange={(e) => setScheduledLaunch(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formRole">
                <Form.Label>Seleccionar Tipo de Responsable</Form.Label>
                <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="">Seleccionar</option>
                  <option value="usuario">Usuario</option>
                  <option value="bot">Bot</option>
                </Form.Select>
              </Form.Group>

              {role === 'usuario' && (
                <>
                  <Form.Group className="mb-3" controlId="formUserSearch">
                    <Form.Label>Buscar Usuario</Form.Label>
                    <InputGroup>
                      <FormControl
                        placeholder="Buscar por nombre, apellido o email"
                        value={userSearchTerm}
                        onChange={handleUserSearchChange}
                      />
                    </InputGroup>
                    <Form.Select value={selectedDepartment} onChange={handleDepartmentFilterChange}>
                      <option value="">Todos los departamentos</option>
                      {departments.map(department => (
                        <option key={department.id} value={department.id}>{department.name}</option>
                      ))}
                    </Form.Select>
                    <Form.Select value={selectedRole} onChange={handleRoleFilterChange} className="mt-2">
                      <option value="">Todos los roles</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Button variant="outline-dark" onClick={handleSelectAllUsers}>
                    {selectedUsers.length === filteredUsers.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </Button>
                  <div className="contacts-list mt-3">
                    {filteredUsers.map(user => (
                      <Card key={user.id_usuario} className="contact-card">
                        <Card.Body>
                          <Row className='text-center'>
                            <Col md={1} className='mt-auto mb-auto'>
                              <Form.Check
                                type="checkbox"
                                label=""
                                checked={selectedUsers.includes(user.id_usuario)}
                                onChange={() => handleUserSelect(user.id_usuario)}
                              />
                            </Col>
                            <Col md={1} className='mt-auto mb-auto'>
                              {user.link_foto ? (
                                <img
                                  src={`${process.env.REACT_APP_API_URL}${user.link_foto}`}
                                  alt="Profile"
                                  className="rounded-circle"
                                  style={{ width: 50, height: 50 }}
                                />
                              ) : (
                                <PersonCircle className='rounded-circle' size={50} />
                              )}
                            </Col>
                            <Col md={2} className='mt-auto mb-auto'>
                              <Card.Text><strong>{user.nombre} {user.apellido}</strong></Card.Text>
                            </Col>
                            <Col md={2} className='mt-auto mb-auto'>
                              <Card.Text>{user.email}</Card.Text>
                            </Col>
                            <Col md={2} className='mt-auto mb-auto'>
                              <Card.Text>{getDepartmentName(user.department_id)}</Card.Text>
                            </Col>
                            <Col md={2} className='mt-auto mb-auto'>
                              <Card.Text style={{ padding: '5px', borderRadius: '5px' }}>
                                {getRoleName(user.rol)}
                              </Card.Text>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </>
              )}
              {role === 'bot' && (
                <>
                  <Form.Group className="mb-3" controlId="formBotSearch">
                    <Form.Label>Buscar Bot</Form.Label>
                    <InputGroup>
                      <FormControl
                        placeholder="Buscar por nombre o apellido"
                        value={bot}
                        onChange={handleBotSearchChange}
                      />
                    </InputGroup>
                  </Form.Group>
                  <div className="contacts-list mt-3">
                    {filteredBots.map(botUser => (
                      <Card key={botUser.id_usuario} className="contact-card">
                        <Card.Body>
                          <Row className='text-center'>
                            <Col md={1} className='mt-auto mb-auto'>
                              <Form.Check
                                type="radio"
                                label=""
                                name="botSelect"
                                checked={bot === `${botUser.nombre} ${botUser.apellido}`}
                                onChange={() => handleBotSelect(botUser.id_usuario)}
                              />
                            </Col>
                            <Col md={1} className='mt-auto mb-auto'>
                              <Robot color="grey" className='ms-auto me-auto' size={50} />
                            </Col>
                            <Col md={2} className='mt-auto mb-auto'>
                              <Card.Text><strong>{botUser.nombre}</strong></Card.Text>
                            </Col>
                            <Col md={8} className='mt-auto mb-auto'>
                              <Card.Text><strong>{botUser.apellido}</strong></Card.Text>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              <Form.Group className="mb-3" controlId="formStatus">
                <Form.Label>Estado de la Conversación</Form.Label>
                <Form.Control type="text" placeholder="Ingrese el estado de la conversación" value={status} onChange={(e) => setStatus(e.target.value)} />
              </Form.Group>

              <Button variant="primary" onClick={handleCreateCampaign}>
               {id_camp ? 'Actualizar campaña' : 'Crear Campaña'}
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CreateCampaign;
