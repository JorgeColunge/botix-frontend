import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Card, Row, Col } from 'react-bootstrap';
import { Person, PencilSquare, GeoAlt, Building, Telephone, Envelope, Robot, Puzzle, Globe, People, PlusCircle, Diagram2, Shuffle, Briefcase, Diagram3, Eye, Whatsapp, Instagram, Facebook, Telegram } from 'react-bootstrap-icons';
import './CompanyInfo.css';
import CreateUserModal from './createUserModal';
import CreateContactModal from './CreateContactModal';
import UploadCSVModal from './UploadCSVModal';
import CreateOrganizationModal from './CreateOrganizationModal';
import CreateRoleModal from './CreateRoleModal';
import CreateDepartmentModal from './CreateDepartmentModal';
import DepartmentPhasesModal from './DepartmentPhasesModal';
import CreateIntegrationModal from './CreateIntegrationModal'; // Import the new CreateIntegrationModal component

const CompanyInfo = () => {
  const [companyData, setCompanyData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [showUploadCSVModal, setShowUploadCSVModal] = useState(false);
  const [showCreateOrganizationModal, setShowCreateOrganizationModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showCreateDepartmentModal, setShowCreateDepartmentModal] = useState(false);
  const [showDepartmentPhasesModal, setShowDepartmentPhasesModal] = useState(false);
  const [showCreateIntegrationModal, setShowCreateIntegrationModal] = useState(false);  // State for showing CreateIntegrationModal
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [userData, setUserData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [license, setLicense] = useState({});
  const [privileges, setPrivileges] = useState([]);
  const [contactsCount, setContactsCount] = useState(0);
  const [rolesCount, setRolesCount] = useState(0);
  const [organizationsCount, setOrganizationsCount] = useState(0);
  const companyId = localStorage.getItem('company_id');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const companyResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/company/${companyId}`);
        setCompanyData(companyResponse.data);
        setFormData(companyResponse.data);

        const usersResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?company_id=${companyId}`);
        setUsers(usersResponse.data);

        const rolesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/roles/${companyId}`);
        setRoles(rolesResponse.data);

        const departmentsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/departments/${companyId}`);
        setDepartments(departmentsResponse.data);

        const privilegesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/privileges/${userId}`);
        setPrivileges(privilegesResponse.data);

        const licenseResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/license/${companyId}`);
        setLicense(licenseResponse.data);

        const licenseId = licenseResponse.data.id;

        const integrationsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/integrations/${licenseId}`);
        setIntegrations(integrationsResponse.data);

        const automationsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/automations/${licenseId}`);
        setAutomations(automationsResponse.data);

        const contactsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/contacts/count/${companyId}`);
        setContactsCount(contactsResponse.data.count);

        const rolesCountResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/roles/count/${companyId}`);
        setRolesCount(rolesCountResponse.data.count);

        const organizationsCountResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/organizations/count/${companyId}`);
        setOrganizationsCount(organizationsCountResponse.data.count);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCompanyData();
  }, [companyId, userId]);

  const hasPrivilege = (privilege) => {
    return privileges.includes(privilege);
  };

  const getRoleType = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.type : '';
  };

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handleEditUserClick = (user) => {
    setUserData(user);
    setShowUserModal(true);
  };

  const handleCreateUserClick = () => {
    setShowCreateUserModal(true);
  };

  const handleCreateContactClick = () => {
    setShowConfirmationModal(true);
  };

  const handleUploadCSVClick = () => {
    setShowUploadCSVModal(true);
  };

  const handleCreateOrganizationClick = () => {
    setShowCreateOrganizationModal(true);
  };

  const handleCreateRoleClick = () => {
    setShowCreateRoleModal(true);
  };

  const handleCreateDepartmentClick = () => {
    setShowCreateDepartmentModal(true);
  };

  const handleCreateIntegrationClick = () => {
    setShowCreateIntegrationModal(true);
  };

  const handleViewPhasesClick = (department) => {
    setSelectedDepartment(department);
    setShowDepartmentPhasesModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleProfileFileChange = (e) => {
    setProfileFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const updateData = { ...formData };

    if (logoFile) {
      const formData = new FormData();
      formData.append('logo', logoFile);

      try {
        const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-logo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        updateData.logo = uploadResponse.data.logoUrl;
      } catch (error) {
        console.error('Error uploading logo:', error);
        return;
      }
    }

    axios.put(`${process.env.REACT_APP_API_URL}/api/company/${companyId}`, updateData)
      .then(response => {
        setCompanyData(response.data);
        setShowModal(false);
      })
      .catch(error => {
        console.error('Error updating company data:', error);
      });
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();

    const updateUser = { ...userData };

    updateUser.contraseña = document.getElementById('formUserPassword').value;

    if (profileFile) {
      const formData = new FormData();
      formData.append('profile', profileFile);

      try {
        const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-profile`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        updateUser.link_foto = uploadResponse.data.profileUrl;
      } catch (error) {
        console.error('Error uploading profile image:', error);
        return;
      }
    }

    axios.put(`${process.env.REACT_APP_API_URL}/api/auth/users/${updateUser.id_usuario}`, updateUser)
      .then(response => {
        setUsers(users.map(user => user.id_usuario === updateUser.id_usuario ? response.data : user));
        setShowUserModal(false);
      })
      .catch(error => {
        console.error('Error updating user data:', error);
      });
  };

  const handleDeleteUser = (id) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${id}`)
      .then(() => {
        setUsers(users.filter(user => user.id_usuario !== id));
      })
      .catch(error => {
        console.error('Error deleting user:', error);
      });
  };

  const botsChat = users.filter(user => getRoleType(user.rol) === 'Bot de Chat');
  const botsChatAI = users.filter(user => getRoleType(user.rol) === 'Bot de Chat IA');
  const botsUsers = users.filter(user => getRoleType(user.rol) === 'Bot de Gestión');
  const regularUsers = users.filter(user => getRoleType(user.rol) === 'Humano');

  const admin = hasPrivilege('Admin');
  const canEditCompany = hasPrivilege('Edit company');
  const canEditUsers = hasPrivilege('Edit users');
  const canDeleteUsers = hasPrivilege('Delete users');
  const canCreateUsers = hasPrivilege('Create users');

  return (
    <div className="company-info-container">
      <div className="company-info">
        <img src={`${process.env.REACT_APP_API_URL}${companyData.logo}`} alt="Company Logo" className="company-logo" />
        <div className="company-details">
          {(canEditCompany || admin) && (
            <Button variant="primary" className="edit-button" onClick={handleEditClick}>
              <PencilSquare /> Editar Información
            </Button>
          )}
          <h2>{companyData.name}</h2>
          <p><GeoAlt /> {companyData.address}, {companyData.city}, {companyData.country}</p>
          <p><Building /> {companyData.postal_code}</p>
          <p><Telephone /> {companyData.phone}</p>
          <p><Envelope /> {companyData.email}</p>
          <p><Globe /> {companyData.web}</p>
        </div>
      </div>
      <br></br>
      <br></br>
      <h3>Licencia {license.type}</h3>
      <Row className="counters">
        <Col className="counter" sm={6} md={4} lg={2}>
          <Person size={100} />
          <br></br>
          <h5>Usuarios</h5>
          <p>{regularUsers.length} / {license.users}</p>
          {(canCreateUsers || admin) && regularUsers.length < license.users && (
            <Button variant="primary" onClick={handleCreateUserClick}>
              <PlusCircle /> Crear Usuario
            </Button>
          )}
          {(canCreateUsers || admin) && regularUsers.length >= license.users && (
            <Button variant="secondary">
              <PlusCircle /> Crear Usuario
            </Button>
          )}
        </Col>
        <Col className="counter" sm={6} md={4} lg={2}>
          <People size={100} />
          <br></br>
          <h5>Contactos</h5>
          <p>{contactsCount} / {license.contacts}</p>
          {(canCreateUsers || admin) && contactsCount < license.contacts && (
            <Button variant="primary" onClick={handleCreateContactClick}>
              <PlusCircle /> Crear Contacto(s)
            </Button>
          )}
          {(canCreateUsers || admin) && contactsCount >= license.contacts && (
            <Button variant="secondary">
              <PlusCircle /> Crear Contacto(s)
            </Button>
          )}
        </Col>
        <Col className="counter" sm={6} md={4} lg={2}>
          <Building size={100} />
          <br></br>
          <h5>Empresas</h5>
          <p>{organizationsCount}</p>
          {(canCreateUsers || admin) && (
            <Button variant="primary" onClick={handleCreateOrganizationClick}>
              <PlusCircle /> Crear Empresa
            </Button>
          )}
        </Col>
        <Col className="counter" sm={6} md={4} lg={2}>
          <Robot size={100} />
          <br></br>
          <h5>Bots de Chat</h5>
          <p>{botsChat.length} / {license.bot_messages}</p>
          {(canCreateUsers || admin) && botsChat.length < license.bot_messages && (
            <Button variant="primary" onClick={handleCreateUserClick}>
              <PlusCircle /> Crear Bot
            </Button>
          )}
          {(canCreateUsers || admin) && botsChat.length >= license.bot_messages && (
            <Button variant="secondary">
              <PlusCircle /> Crear Bot
            </Button>
          )}
        </Col>
        <Col className="counter" sm={6} md={4} lg={2}>
          <Robot size={100} />
          <br></br>
          <h5>Bots de Chat IA</h5>
          <p>{botsChatAI.length} / {license.ai_messages}</p>
          {(canCreateUsers || admin) && botsChatAI.length < license.ai_messages && (
            <Button variant="primary" onClick={handleCreateUserClick}>
              <PlusCircle /> Crear Bot
            </Button>
          )}
          {(canCreateUsers || admin) && botsChatAI.length >= license.ai_messages && (
            <Button variant="secondary">
              <PlusCircle /> Crear Bot
            </Button>
          )}
        </Col>
        <Col className="counter" sm={6} md={4} lg={2}>
          <Robot size={100} />
          <br></br>
          <h5>Bots de Gestión</h5>
          <p>{botsUsers.length} / {license.ai_analysis}</p>
          {(canCreateUsers || admin) && botsUsers.length < license.ai_analysis && (
            <Button variant="primary" onClick={handleCreateUserClick}>
              <PlusCircle /> Crear Bot
            </Button>
          )}
          {(canCreateUsers || admin) && botsUsers.length >= license.ai_analysis && (
            <Button variant="secondary">
              <PlusCircle /> Crear Bot
            </Button>
          )}
        </Col>
        <Col className="counter" sm={6} md={4} lg={2}>
          <Briefcase size={100} />
          <br></br>
          <h5>Roles</h5>
          <p>{rolesCount}</p>
          <ul>
            {roles.map(role => (
              <li key={role.id}>{role.name}</li>
            ))}
          </ul>
          {(canCreateUsers || admin) && (
            <Button variant="primary" onClick={handleCreateRoleClick}>
              <PlusCircle /> Crear Rol
            </Button>
          )}
        </Col>
        <Col className="counter" sm={6} md={4} lg={2}>
          <Diagram3 size={100} />
          <br></br>
          <h5>Departamentos</h5>
          <ul className="list-unstyled">
            {departments.map(department => (
              <li key={department.id}>
                {department.name} <Eye style={{ cursor: 'pointer' }} onClick={() => handleViewPhasesClick(department)} />
              </li>
            ))}
          </ul>
          {(canCreateUsers || admin) && (
            <Button variant="primary" onClick={handleCreateDepartmentClick}>
              <PlusCircle /> Crear Departamento
            </Button>
          )}
        </Col>
        <Col className="counter" sm={6} md={4} lg={2}>
          <Shuffle size={100} />
          <br></br>
          <h5>Automatizaciones</h5>
          <p>{automations.length} / {license.automations}</p>
          <ul>
            {automations.map(automation => (
              <li key={automation.id}>{automation.name}</li>
            ))}
          </ul>
          {(canCreateUsers || admin) && automations.length < license.automations && (
            <Button variant="primary" onClick={handleCreateUserClick}>
              <PlusCircle /> Crear Automatizaciones
            </Button>
          )}
          {(canCreateUsers || admin) && automations.length >= license.automations && (
            <Button variant="secondary">
              <PlusCircle /> Crear Automatizaciones
            </Button>
          )}
        </Col>
        <Col className="counter" sm={6} md={4} lg={2}>
          <Puzzle size={100} />
          <br></br>
          <h5>Integraciones</h5>
          <p>{integrations.length} / {license.integrations}</p>
          <ul className="list-unstyled">
            {integrations.map(integration => (
              <li key={integration.id}>
                {integration.type === 'whatsapp' && <Whatsapp />} 
                {integration.type === 'instagram' && <Instagram />} 
                {integration.type === 'facebook' && <Facebook />} 
                {integration.type === 'telegram' && <Telegram />} 
                {integration.type === 'web' && <Globe /> } 
                {integration.name}
              </li>
            ))}
          </ul>
          {(canCreateUsers || admin) && integrations.length < license.integrations && (
            <Button variant="primary" onClick={handleCreateIntegrationClick}>
              <PlusCircle /> Crear Integración
            </Button>
          )}
          {(canCreateUsers || admin) && integrations.length >= license.integrations && (
            <Button variant="secondary">
              <PlusCircle /> Crear Integración
            </Button>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Información de la Empresa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formCompanyLogo">
              <Form.Label>Logo de la Empresa</Form.Label>
              <Form.Control
                type="file"
                name="logo"
                onChange={handleFileChange}
              />
            </Form.Group>
            <Form.Group controlId="formCompanyName">
              <Form.Label>Nombre de la Empresa</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formCompanyAddress">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formCompanyCity">
              <Form.Label>Ciudad</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formCompanyCountry">
              <Form.Label>País</Form.Label>
              <Form.Control
                type="text"
                name="country"
                value={formData.country || ''}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formCompanyPostalCode">
              <Form.Label>Código Postal</Form.Label>
              <Form.Control
                type="text"
                name="postal_code"
                value={formData.postal_code || ''}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formCompanyPhone">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formCompanyEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formCompanyWeb">
              <Form.Label>Web</Form.Label>
              <Form.Control
                type="text"
                name="web"
                value={formData.web || ''}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <div className="users-container">
        <h3>Usuarios de la Empresa</h3>
        <Row>
          {regularUsers.map(user => (
            <Col key={user.id_usuario} sm={12} md={6} lg={4}>
              <Card className="user-card">
                <div className="profile-img-container">
                  <Card.Img variant="top" src={`${process.env.REACT_APP_API_URL}${user.link_foto}`} className="profile-img" />
                </div>
                <Card.Body className="text-center">
                  <Card.Title>{user.nombre} {user.apellido}</Card.Title>
                  <Card.Text>
                    <p><a href={`tel:${user.telefono}`}><Telephone /></a> {user.telefono}</p>
                    <p><a href={`mailto:${user.email}`}><Envelope /></a> {user.email}</p>
                  </Card.Text>
                  <Button variant="primary" className="w-100 mb-2" onClick={() => handleEditUserClick(user)}>
                    Enviar mensaje
                  </Button>
                  {(canEditUsers || admin) && (
                    <Button variant="dark" className="w-100 mb-2" onClick={() => handleEditUserClick(user)}>
                      Editar
                    </Button>
                  )}
                  {(canDeleteUsers || admin) && (
                    <Button variant="outline-danger" className="w-100" onClick={() => handleDeleteUser(user.id_usuario)}>
                      Eliminar
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <h3>Bots de Chat</h3>
        <Row>
          {botsChat.map(user => (
            <Col key={user.id_usuario} sm={12} md={6} lg={4}>
              <Card className="user-card">
                <div className="bot-icon-container text-center">
                  <Robot color="grey" size={100} />
                </div>
                <Card.Body className="text-center">
                  <Card.Title>{user.nombre} {user.apellido}</Card.Title>
                  <Button variant="primary" className="w-100 mb-2" onClick={() => handleEditUserClick(user)}>
                    Ver
                  </Button>
                  {(canEditUsers || admin) && (
                    <Button variant="dark" className="w-100 mb-2" onClick={() => handleEditUserClick(user)}>
                      Editar Bot
                    </Button>
                  )}
                  {(canDeleteUsers || admin) && (
                    <Button variant="outline-danger" className="w-100" onClick={() => handleDeleteUser(user.id_usuario)}>
                      Eliminar Bot
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <h3>Bots de Chat IA</h3>
        <Row>
          {botsChatAI.map(user => (
            <Col key={user.id_usuario} sm={12} md={6} lg={4}>
              <Card className="user-card">
                <div className="bot-icon-container text-center">
                  <Robot color="grey" size={100} />
                </div>
                <Card.Body className="text-center">
                  <Card.Title>{user.nombre} {user.apellido}</Card.Title>
                  <Button variant="primary" className="w-100 mb-2" onClick={() => handleEditUserClick(user)}>
                    Ver
                  </Button>
                  {(canEditUsers || admin) && (
                    <Button variant="dark" className="w-100 mb-2" onClick={() => handleEditUserClick(user)}>
                      Editar Bot
                    </Button>
                  )}
                  {(canDeleteUsers || admin) && (
                    <Button variant="outline-danger" className="w-100" onClick={() => handleDeleteUser(user.id_usuario)}>
                      Eliminar Bot
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <h3>Bots de Gestión</h3>
        <Row>
          {botsUsers.map(user => (
            <Col key={user.id_usuario} sm={12} md={6} lg={4}>
              <Card className="user-card">
                <div className="bot-icon-container text-center">
                  <Robot color="grey" size={100} />
                </div>
                <Card.Body className="text-center">
                  <Card.Title>{user.nombre} {user.apellido}</Card.Title>
                  <Button variant="primary" className="w-100 mb-2" onClick={() => handleEditUserClick(user)}>
                    Ver
                  </Button>
                  {(canEditUsers || admin) && (
                    <Button variant="dark" className="w-100 mb-2" onClick={() => handleEditUserClick(user)}>
                      Editar Bot
                    </Button>
                  )}
                  {(canDeleteUsers || admin) && (
                    <Button variant="outline-danger" className="w-100" onClick={() => handleDeleteUser(user.id_usuario)}>
                      Eliminar Bot
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <CreateUserModal
        show={showCreateUserModal}
        onHide={() => setShowCreateUserModal(false)}
        companyId={companyId}
        roles={roles}
        departments={departments}
        onUserCreated={(newUser) => setUsers([...users, newUser])}
      />

      <CreateContactModal
        show={showCreateContactModal}
        onHide={() => setShowCreateContactModal(false)}
        companyId={companyId}
        onContactCreated={() => setContactsCount(contactsCount + 1)}
      />

      <UploadCSVModal
        show={showUploadCSVModal}
        onHide={() => setShowUploadCSVModal(false)}
        companyId={companyId}
        onCSVUploaded={() => setContactsCount(contactsCount + 1)}
      />

      <CreateOrganizationModal
        show={showCreateOrganizationModal}
        onHide={() => setShowCreateOrganizationModal(false)}
        companyId={companyId}
        onOrganizationCreated={(newOrganization) => setOrganizationsCount(organizationsCount + 1)}
      />

      <CreateRoleModal
        show={showCreateRoleModal}
        onHide={() => setShowCreateRoleModal(false)}
        companyId={companyId}
        onRoleCreated={(newRole) => setRoles([...roles, newRole])}
      />

      <CreateDepartmentModal
        show={showCreateDepartmentModal}
        onHide={() => setShowCreateDepartmentModal(false)}
        companyId={companyId}
        onDepartmentCreated={(newDepartment) => setDepartments([...departments, newDepartment])}
      />

      <CreateIntegrationModal
        show={showCreateIntegrationModal}
        onHide={() => setShowCreateIntegrationModal(false)}
        licenseId={license.id}
        companyId={companyId}
        onIntegrationCreated={(newIntegration) => setIntegrations([...integrations, newIntegration])}
      />

      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUserFormSubmit}>
            <Form.Group controlId="formUserProfileImage">
              <Form.Label>Foto de Perfil</Form.Label>
              <Form.Control
                type="file"
                name="profile"
                onChange={handleProfileFileChange}
              />
            </Form.Group>
            <br></br>
            <Form.Group controlId="formUserId">
              <Form.Label>Número de Identificación</Form.Label>
              <Form.Control
                type="number"
                name="id_usuario"
                value={userData.id_usuario || ''}
                onChange={handleUserFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formUserName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={userData.nombre || ''}
                onChange={handleUserFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formUserSurname">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                name="apellido"
                value={userData.apellido || ''}
                onChange={handleUserFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formUserPhone">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="telefono"
                value={userData.telefono || ''}
                onChange={handleUserFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formUserEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userData.email || ''}
                onChange={handleUserFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formUserPassword">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="contraseña"
                onChange={handleUserFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formUserRole">
              <Form.Label>Rol</Form.Label>
              <Form.Control
                as="select"
                name="rol"
                value={userData.rol || ''}
                onChange={handleUserFormChange}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <br></br>
            <Form.Group controlId="formUserDepartment">
              <Form.Label>Departamento</Form.Label>
              <Form.Control
                as="select"
                name="department_id"
                value={userData.department_id || ''}
                onChange={handleUserFormChange}
              >
                {departments.map(department => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <br></br>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>¿Cómo deseas crear el contacto?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <br></br>
          <Button variant="primary" onClick={() => { setShowCreateContactModal(true); setShowConfirmationModal(false); }}>Formulario de Contacto Individual</Button>
          <br></br> <br></br>
          <Button variant="primary" onClick={() => { setShowUploadCSVModal(true); setShowConfirmationModal(false); }}>Cargar CSV de Multiples Contactos</Button>
        </Modal.Body>
      </Modal>

      <DepartmentPhasesModal
        show={showDepartmentPhasesModal}
        onHide={() => setShowDepartmentPhasesModal(false)}
        department={selectedDepartment}
        onPhasesUpdated={(updatedPhases) => {
          const updatedDepartments = departments.map(department =>
            department.id === updatedPhases.department_id ? { ...department, phases: updatedPhases } : department
          );
          setDepartments(updatedDepartments);
        }}
      />

    </div>
  );
};

export default CompanyInfo;
