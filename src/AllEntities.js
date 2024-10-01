import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Modal, Form, FormControl } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';
import CreateUserModal from './createUserModal';
import CreateColaboradoresModal from './CreateColaboradoresModal';
import './UsersTable.css'; // Import the CSS file
import { AppContext } from './context';
import { useConversations } from './ConversationsContext';
import Swal from 'sweetalert2';
import { Button, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './components';
import { UserDate } from './UserDate';
import { ColaboradoresDate } from './ColaboradoresDate';

const AllEntities = () => {
  const { state, setConversacionActual } = useContext(AppContext);
  const { userPrivileges, conversationStats: status, conversations, setCurrentConversation, setConversations } = useConversations();

  // Estados de usuarios
  const [users, setUsers] = useState(state.usuarios);
  const [roles, setRoles] = useState(state.roles);
  const [departments, setDepartments] = useState(state.departamentos);
  const [conversationStats, setConversationStats] = useState(status);
  const [privileges, setPrivileges] = useState(userPrivileges);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateColaboradoresModal, setShowCreateColaboradoresModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  // Define estos estados junto con los demás en la parte superior del componente
  const [showCreateColaboradorModal, setShowCreateColaboradorModal] = useState(false);
  const [showDeleteColaboradorModal, setShowDeleteColaboradorModal] = useState(false); // Nuevo modal para eliminar colaboradores
  const [userData, setUserData] = useState({});
  const [profileFile, setProfileFile] = useState(null);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [colaboradorIdToDelete, setColaboradorIdToDelete] = useState(null); // Estado para el ID del colaborador a eliminar
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const companyId = localStorage.getItem('company_id');
  const [colaboradores, setColaboradores] = useState(state.colaboradores || []);
  const [showColaboradorModal, setShowColaboradorModal] = useState(false);
  const [colaboradorData, setColaboradorData] = useState({});
  const [colaboradorProfileFile, setColaboradorProfileFile] = useState(null); // Foto de perfil del colaborador


  useEffect(() => {
    if (selectedDepartment === 'Todos') {
      setSelectedDepartment('');
    }
  }, [selectedDepartment]);

  useEffect(() => {
    setUsers(state.usuarios);
    setRoles(state.roles);
    setDepartments(state.departamentos);
    setConversationStats(status);
    setPrivileges(userPrivileges);
    setColaboradores(state.colaboradores);
  }, [state]);

  // Utilitarios de usuarios
  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'N/A';
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'N/A';
  };

  const getConversationStats = (userId) => {
    const stats = conversationStats.find(stat => stat.id_usuario === userId);
    return stats ? stats : { total_conversations: 0, pending_conversations: 0, attended_conversations: 0 };
  };

  const hasPrivilege = (privilege) => {
    return privileges.includes(privilege);
  };

  const handleEditUserClick = (user) => {
    setUserData(user);
    setShowUserModal(true);
  };

  const handleDeleteUserClick = (id) => {
    setUserIdToDelete(id);
    setShowDeleteConfirmationModal(true);
  };

  const handleColaboradorProfileFileChange = (e) => {
    setColaboradorProfileFile(e.target.files[0]);
  };
  
  

  const handleDeleteUserConfirm = () => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userIdToDelete}`)
      .then(() => {
        setUsers(users.filter(user => user.id_usuario !== userIdToDelete));
        setShowDeleteConfirmationModal(false);
      })
      .catch(error => {
        console.error('Error deleting user:', error);
        Swal.fire({
          title: "Error",
          text: `Error al intentar eliminar usuario. Error: ${error.message}`,
          icon: "error"
        });
      });
  };

  const handleCreateUserClick = () => {
    setShowCreateUserModal(true);
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();

    const updateUser = { ...userData };

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

  const handleProfileFileChange = (e) => {
    setProfileFile(e.target.files[0]);
  };

  const handleCreateColaboradorClick = () => {
    setShowCreateColaboradorModal(true);
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleColaboradorFormChange = (e) => {
    const { name, value } = e.target;
    setColaboradorData({
      ...colaboradorData,
      [name]: value,
    });
  };
  
  const handleColaboradorFormSubmit = async (e) => {
    e.preventDefault();
  
    const updatedColaborador = { ...colaboradorData };
  
    // Si hay una nueva foto de perfil, primero subimos la imagen.
    if (colaboradorProfileFile) {
      const formData = new FormData();
      formData.append('profile', colaboradorProfileFile);
  
      try {
        const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-profile`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        updatedColaborador.link_foto = uploadResponse.data.profileUrl; // Actualizamos la URL de la imagen en el objeto del colaborador.
      } catch (error) {
        console.error('Error uploading profile image:', error);
        return;
      }
    }
  
    // Realizamos la actualización del colaborador.
    axios
      .put(`${process.env.REACT_APP_API_URL}/api/colaboradores/${updatedColaborador.id_colaborador}`, updatedColaborador)
      .then((response) => {
        setColaboradores(
          colaboradores.map((colaborador) =>
            colaborador.id_colaborador === updatedColaborador.id_colaborador ? response.data : colaborador
          )
        );
        setShowColaboradorModal(false); // Cerramos el modal tras guardar.
      })
      .catch((error) => {
        console.error('Error updating collaborator data:', error);
        Swal.fire({
          title: 'Error',
          text: `Error al intentar actualizar colaborador. Error: ${error.message}`,
          icon: 'error',
        });
      });
  };  
  

  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm?.toLowerCase();
    const telefono = user.telefono ? user.telefono.toLowerCase() : '';

    return (
      (!selectedDepartment || user.department_id === parseInt(selectedDepartment)) &&
      (user.nombre.toLowerCase().includes(searchTermLower) ||
        user.apellido.toLowerCase().includes(searchTermLower) ||
        telefono.includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        user.id_usuario.toString().includes(searchTermLower))
    );
  });

  const regularUsers = filteredUsers.filter(user => roles.find(r => r.id === user.rol && r.type === 'Humano'));

  // Utilitarios de colaboradores
  const handleEditColaboradorClick = (colaborador) => {
    setColaboradorData(colaborador);
    setShowColaboradorModal(true);
  };

  const handleDeleteColaboradorClick = (id) => {
    setColaboradorIdToDelete(id);
    setShowDeleteColaboradorModal(true); // Mostrar modal de confirmación para colaboradores
  };

  const handleDeleteColaboradorConfirm = () => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/colaboradores/${colaboradorIdToDelete}`)
      .then(() => {
        setColaboradores(colaboradores.filter(colaborador => colaborador.id_colaborador !== colaboradorIdToDelete));
        setShowDeleteColaboradorModal(false);
      })
      .catch(error => {
        console.error('Error eliminando colaborador:', error);
        Swal.fire({
          title: "Error",
          text: `Error al intentar eliminar colaborador. Error: ${error.message}`,
          icon: "error"
        });
      });
  };

  const handleSearchColaboradorTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredColaboradores = colaboradores.filter(colaborador => {
    const searchTermLower = searchTerm?.toLowerCase();
    const telefono = colaborador.telefono ? colaborador.telefono.toLowerCase() : '';

    return (
      (!selectedDepartment || colaborador.department_id === parseInt(selectedDepartment)) &&
      (colaborador.nombre.toLowerCase().includes(searchTermLower) ||
        colaborador.apellido.toLowerCase().includes(searchTermLower) ||
        telefono.includes(searchTermLower) ||
        colaborador.email.toLowerCase().includes(searchTermLower) ||
        colaborador.id_colaborador.toString().includes(searchTermLower))
    );
  });

  return (
    <div className="users-container">
      {/* Tabla de Usuarios */}
      <h3>Usuarios de la Empresa</h3>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div>
          {(hasPrivilege('Create users') || hasPrivilege('Admin')) && (
            <Button variant="outline" className="bg-fuchsia-700 text-white" onClick={handleCreateUserClick}>
              <PlusCircle className="mr-2 h-6 w-6" /> Crear Usuario
            </Button>
          )}
        </div>
        <div className="d-flex">
          <FormControl
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearchTermChange}
            className="mr-2 p-2"
          />
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Departamentos</SelectLabel>
                <SelectItem key="todos" value="Todos">Todos</SelectItem>
                {departments.map(department => (
                  <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="table-responsive">
        <UserDate
          users={regularUsers}
          departments={departments}
          getConversationStats={getConversationStats}
          getRoleName={getRoleName}
          getDepartmentName={getDepartmentName}
          hasPrivilege={hasPrivilege}
          handleEditUserClick={handleEditUserClick}
          handleDeleteUserClick={handleDeleteUserClick}
          tipo_tabla={'usuarios'}
        />
      </div>

      {/* Tabla de Colaboradores */}
      <h3>Colaboradores de la Empresa</h3>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <Button variant="outline" className="bg-fuchsia-700 text-white" onClick={handleCreateColaboradorClick}>
            <PlusCircle className="mr-2 h-6 w-6" /> Crear Colaborador
          </Button>
        </div>
        <div className="d-flex">
          <FormControl
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearchColaboradorTermChange}
            className="mr-2 p-2"
          />
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Departamentos</SelectLabel>
                <SelectItem key="todos" value="Todos">Todos</SelectItem>
                {departments.map(department => (
                  <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="table-responsive">
        <ColaboradoresDate
          colaboradores={filteredColaboradores}
          roles={roles}
          departments={departments}
          getRoleName={getRoleName}
          getDepartmentName={getDepartmentName}
          handleEditColaboradorClick={handleEditColaboradorClick}
          handleDeleteColaboradorClick={handleDeleteColaboradorClick}
        />
      </div>

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
            <br />
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
            <br />
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
            <br />
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showColaboradorModal} onHide={() => setShowColaboradorModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Editar Colaborador</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleColaboradorFormSubmit}>
      <Form.Group controlId="formColaboradorProfileImage">
        <Form.Label>Foto de Perfil</Form.Label>
        <Form.Control
          type="file"
          name="profile"
          onChange={handleColaboradorProfileFileChange}
        />
      </Form.Group>
      <br />
      <Form.Group controlId="formColaboradorName">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          name="nombre"
          value={colaboradorData.nombre || ''}
          onChange={handleColaboradorFormChange}
        />
      </Form.Group>
      <Form.Group controlId="formColaboradorSurname">
        <Form.Label>Apellido</Form.Label>
        <Form.Control
          type="text"
          name="apellido"
          value={colaboradorData.apellido || ''}
          onChange={handleColaboradorFormChange}
        />
      </Form.Group>
      <Form.Group controlId="formColaboradorPhone">
        <Form.Label>Teléfono</Form.Label>
        <Form.Control
          type="text"
          name="telefono"
          value={colaboradorData.telefono || ''}
          onChange={handleColaboradorFormChange}
        />
      </Form.Group>
      <Form.Group controlId="formColaboradorEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={colaboradorData.email || ''}
          onChange={handleColaboradorFormChange}
        />
      </Form.Group>
      <Form.Group controlId="formColaboradorRole">
        <Form.Label>Rol</Form.Label>
        <Form.Control
          as="select"
          name="rol"
          value={colaboradorData.rol || ''}
          onChange={handleColaboradorFormChange}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="formColaboradorDepartment">
        <Form.Label>Departamento</Form.Label>
        <Form.Control
          as="select"
          name="department_id"
          value={colaboradorData.department_id || ''}
          onChange={handleColaboradorFormChange}
        >
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <br />
      <Button variant="primary" type="submit">
        Guardar
      </Button>
    </Form>
  </Modal.Body>
</Modal>


      {/* Modal de Confirmación de Eliminación de Colaborador */}
      <Modal show={showDeleteColaboradorModal} onHide={() => setShowDeleteColaboradorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación de Colaborador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este colaborador?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteColaboradorModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteColaboradorConfirm}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación de Eliminación de Usuario */}
      <Modal show={showDeleteConfirmationModal} onHide={() => setShowDeleteConfirmationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación de Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este usuario?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmationModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteUserConfirm}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      <CreateUserModal
        show={showCreateUserModal}
        onHide={() => setShowCreateUserModal(false)}
        companyId={companyId}
        roles={roles}
        departments={departments}
        onUserCreated={(newUser) => setUsers([...users, newUser])}
      />

      <CreateColaboradoresModal
        show={showCreateColaboradorModal}
        onHide={() => setShowCreateColaboradorModal(false)}
        companyId={companyId}
        roles={roles}
        departments={departments}
        onColaboradorCreated={(newColaborador) => setColaboradores([...colaboradores, newColaborador])}
      />
    </div>
  );
};

export default AllEntities;
