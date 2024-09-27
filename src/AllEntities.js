import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Table, Modal, Form, FormControl, InputGroup } from 'react-bootstrap';
import { Telephone, Envelope, Chat, PencilSquare, Trash, PlusCircle } from 'react-bootstrap-icons';
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
  const [userData, setUserData] = useState({});
  const [profileFile, setProfileFile] = useState(null);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const companyId = localStorage.getItem('company_id');

  // Estados de colaboradores
  const [colaboradores, setColaboradores] = useState(state.colaboradores || []);
  const [showColaboradorModal, setShowColaboradorModal] = useState(false);
  const [showCreateColaboradorModal, setShowCreateColaboradorModal] = useState(false);
  const [colaboradorData, setColaboradorData] = useState({});
  const [colaboradorIdToDelete, setColaboradorIdToDelete] = useState(null);

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

  const handleCreateColaboradorClick = () => {
    setShowCreateColaboradorModal(true);
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    const stats = getConversationStats(user.id_usuario);
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
    setShowDeleteConfirmationModal(true);
  };

  const handleDeleteColaboradorConfirm = () => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/colaboradores/${colaboradorIdToDelete}`)
      .then(() => {
        setColaboradores(colaboradores.filter(colaborador => colaborador.id_colaborador !== colaboradorIdToDelete));
        setShowDeleteConfirmationModal(false);
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

      {/* Modales de Usuarios */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Contenido del formulario para editar usuario */}
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modales de Colaboradores */}
      <Modal show={showColaboradorModal} onHide={() => setShowColaboradorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Colaborador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Contenido del formulario para editar colaborador */}
          </Form>
        </Modal.Body>
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
