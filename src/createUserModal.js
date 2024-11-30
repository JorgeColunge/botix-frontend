import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const CreateUserModal = ({ show, onHide, companyId, roles, departments, onUserCreated }) => {
  const [newUserData, setNewUserData] = useState({
    id_usuario: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    link_foto: '',
    rol: '',
    contraseña: '',
    department_id: ''
  });

  const handleNewUserFormChange = (e) => {
    const { name, value } = e.target;
    console.log("nombre ", name, "valor", value)
    setNewUserData({
      ...newUserData,
      [name]: value
    });
  };
console.log("departamentos", departments)
  const handleNewUserFormSubmit = async (e) => {
    e.preventDefault();
   console.log("ingresandddd")
    const newUser = {
      ...newUserData,
      company_id: companyId
    };
    console.log("#ss", newUser)

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register-user`, newUser);
      onUserCreated(response.data);
      onHide();
    } catch (error) {
      console.error('Error creating new user:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleNewUserFormSubmit}>
          <Form.Group controlId="newUserId">
            <Form.Label>Número de identificación</Form.Label>
            <Form.Control
              type="number"
              name="id_usuario"
              value={newUserData.id_usuario}
              onChange={handleNewUserFormChange}
            />
          </Form.Group>
          <Form.Group controlId="newUserName">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={newUserData.nombre}
              onChange={handleNewUserFormChange}
            />
          </Form.Group>
          <Form.Group controlId="newUserSurname">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={newUserData.apellido}
              onChange={handleNewUserFormChange}
            />
          </Form.Group>
          <Form.Group controlId="newUserPhone">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={newUserData.telefono}
              onChange={handleNewUserFormChange}
            />
          </Form.Group>
          <Form.Group controlId="newUserEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={newUserData.email}
              onChange={handleNewUserFormChange}
            />
          </Form.Group>
          <Form.Group controlId="newUserPassword">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="contraseña"
              value={newUserData.contraseña}
              onChange={handleNewUserFormChange}
            />
          </Form.Group>
          <Form.Group controlId="newUserRole">
            <Form.Label>Rol</Form.Label>
            <Form.Control
              as="select"
              name="rol"
              value={newUserData.rol}
              onChange={handleNewUserFormChange}
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="newUserDepartment">
            <Form.Label>Departamento</Form.Label>
            <Form.Control
              as="select"
              name="department_id"
              value={newUserData.department_id}
              onChange={handleNewUserFormChange}
            >
              {departments.map(department => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Button variant="primary" type="submit">
            Crear
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateUserModal;
