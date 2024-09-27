import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const CreateColaboradoresModal = ({ show, onHide, companyId, roles, departments, onColaboradorCreated }) => {
  const [newColaboradorData, setNewColaboradorData] = useState({
    id_colaborador: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    link_foto: '',
    rol: '',
    department_id: ''
  });

  const handleNewColaboradorFormChange = (e) => {
    const { name, value } = e.target;
    setNewColaboradorData({
      ...newColaboradorData,
      [name]: value
    });
  };

  const handleNewColaboradorFormSubmit = async (e) => {
    e.preventDefault();

    const newColaborador = {
      ...newColaboradorData,
      company_id: companyId
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/colaboradores`, newColaborador);
      onColaboradorCreated(response.data);
      onHide();
    } catch (error) {
      console.error('Error creating new colaborador:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Colaborador</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleNewColaboradorFormSubmit}>
          <Form.Group controlId="newColaboradorId">
            <Form.Label>Número de identificación</Form.Label>
            <Form.Control
              type="number"
              name="id_colaborador"
              value={newColaboradorData.id_colaborador}
              onChange={handleNewColaboradorFormChange}
            />
          </Form.Group>
          <Form.Group controlId="newColaboradorName">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={newColaboradorData.nombre}
              onChange={handleNewColaboradorFormChange}
            />
          </Form.Group>
          <Form.Group controlId="newColaboradorSurname">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={newColaboradorData.apellido}
              onChange={handleNewColaboradorFormChange}
            />
          </Form.Group>
          <Form.Group controlId="newColaboradorPhone">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={newColaboradorData.telefono}
              onChange={handleNewColaboradorFormChange}
            />
          </Form.Group>
          <Form.Group controlId="newColaboradorEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={newColaboradorData.email}
              onChange={handleNewColaboradorFormChange}
            />
          </Form.Group>
          <Form.Group controlId="newColaboradorRole">
            <Form.Label>Rol</Form.Label>
            <Form.Control
              as="select"
              name="rol"
              value={newColaboradorData.rol}
              onChange={handleNewColaboradorFormChange}
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="newColaboradorDepartment">
            <Form.Label>Departamento</Form.Label>
            <Form.Control
              as="select"
              name="department_id"
              value={newColaboradorData.department_id}
              onChange={handleNewColaboradorFormChange}
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

export default CreateColaboradoresModal;
