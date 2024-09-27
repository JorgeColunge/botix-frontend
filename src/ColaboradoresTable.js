import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Telephone, Envelope, PencilSquare, Trash, PlusCircle } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import { Button, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './components';
import { Table, Modal, Form, FormControl, InputGroup } from 'react-bootstrap';
import './UsersTable.css'; // Mantener el mismo archivo de estilos para coherencia
import { AppContext } from './context';
import { ColaboradoresDate } from './ColaboradoresDate';

const ColaboradoresTable = () => {
  const { state } = useContext(AppContext); // Obtener el estado global del contexto
  const [colaboradores, setColaboradores] = useState(state.colaboradores || []);
  const [roles, setRoles] = useState(state.roles || []);
  const [departments, setDepartments] = useState(state.departamentos || []);
  const [showColaboradorModal, setShowColaboradorModal] = useState(false);
  const [showCreateColaboradorModal, setShowCreateColaboradorModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [colaboradorData, setColaboradorData] = useState({});
  const [profileFile, setProfileFile] = useState(null);
  const [colaboradorIdToDelete, setColaboradorIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const companyId = localStorage.getItem('company_id');

  useEffect(() => {
    setColaboradores(state.colaboradores);
    setRoles(state.roles);
    setDepartments(state.departamentos);
  }, [state]);

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'N/A';
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'N/A';
  };

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

  const handleCreateColaboradorClick = () => {
    setShowCreateColaboradorModal(true);
  };

  const handleColaboradorFormChange = (e) => {
    const { name, value } = e.target;
    setColaboradorData({
      ...colaboradorData,
      [name]: value
    });
  };

  const handleProfileFileChange = (e) => {
    setProfileFile(e.target.files[0]);
  };

  const handleColaboradorFormSubmit = async (e) => {
    e.preventDefault();

    const newColaborador = { ...colaboradorData };

    if (profileFile) {
      const formData = new FormData();
      formData.append('profile', profileFile);

      try {
        const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-profile`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        newColaborador.link_foto = uploadResponse.data.profileUrl;
      } catch (error) {
        console.error('Error subiendo imagen de perfil:', error);
        return;
      }
    }

    axios.post(`${process.env.REACT_APP_API_URL}/api/colaboradores`, newColaborador)
      .then(response => {
        setColaboradores([...colaboradores, response.data]);
        setShowCreateColaboradorModal(false);
      })
      .catch(error => {
        console.error('Error creando colaborador:', error);
      });
  };

  const handleSearchTermChange = (e) => {
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
      <h3>Colaboradores de la Empresa</h3>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <Button variant="outline" className="bg-[#007bff] text-white" onClick={handleCreateColaboradorClick}>
            <PlusCircle className="mr-2 h-6 w-6" /> Crear Colaborador
          </Button>
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

      {/* Modales para crear/editar colaboradores */}
      <Modal show={showColaboradorModal} onHide={() => setShowColaboradorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Colaborador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleColaboradorFormSubmit}>
            <Form.Group controlId="formColaboradorProfileImage">
              <Form.Label>Foto de Perfil</Form.Label>
              <Form.Control type="file" name="profile" onChange={handleProfileFileChange} />
            </Form.Group>
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
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
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
                {departments.map(department => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteConfirmationModal} onHide={() => setShowDeleteConfirmationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este colaborador?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmationModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteColaboradorConfirm}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ColaboradoresTable;
