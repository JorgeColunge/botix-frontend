import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, CardHeader, CardContent, Button } from './components'; // Importar los componentes de Shadcn
import './Calendar.css'; // Importar los estilos personalizados

const ScheduleManager = ({ entityType, selectedEntityId, companyId }) => {
    const [schedule, setSchedule] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    useEffect(() => {
        // Cargar horarios al cambiar la entidad seleccionada
        if (entityType && selectedEntityId) {
            loadSchedule();
        }
    }, [entityType, selectedEntityId]);

    // Función para cargar el horario desde el backend
    const loadSchedule = async () => {
        if (!companyId) {
            console.error('Company ID no disponible');
            return;
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/schedules?tipo_asignacion=${entityType}&id_asignacion=${selectedEntityId}&company_id=${companyId}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                console.error('Failed to fetch schedule:', response.status, response.statusText);
                throw new Error('Failed to fetch schedule');
            }

            const scheduleData = await response.json();
            const formattedSchedule = scheduleData.reduce((acc, item) => {
                const { dia, hora_inicio, hora_fin } = item;
                if (!acc[dia]) {
                    acc[dia] = [];
                }
                acc[dia].push({ startTime: hora_inicio, endTime: hora_fin });
                return acc;
            }, {});

            setSchedule(formattedSchedule);
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    };

    // Función para abrir el modal y seleccionar el día
    const openModal = (day) => {
        setSelectedDay(day);
        setStartTime('');
        setEndTime('');
        setModalIsOpen(true);
    };

    // Función para cerrar el modal
    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedDay(null);
        setStartTime('');
        setEndTime('');
    };

    // Función para añadir un horario
    const addSchedule = async () => {
        if (!companyId) {
            console.error('Company ID no disponible');
            return;
        }

        const newSchedule = {
            dia: selectedDay,
            hora_inicio: startTime,
            hora_fin: endTime,
            tipo_asignacion: entityType,
            id_asignacion: selectedEntityId,
            company_id: companyId
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSchedule),
                credentials: 'include'
            });

            if (!response.ok) {
                console.error('Failed to create schedule:', response.status, response.statusText);
                throw new Error('Failed to create schedule');
            }

            // Recargar los horarios desde el backend después de agregar un horario
            loadSchedule();

            closeModal(); // Cerrar el modal después de agregar el horario
        } catch (error) {
            console.error('Error creating schedule:', error);
        }
    };

    return (
        <Card className="p-4">
            <CardContent>
                {/* Lista de horarios por día de la semana */}
                <Row className="schedule-list justify-content-start">
                    {daysOfWeek.map((day) => (
                        <Col key={day} md={3} className="mb-4">
                            <Card className="schedule-day p-3 shadow-md border rounded-lg">
                                <CardHeader>
                                    <h5 className="text-lg font-medium mb-3">{day}</h5>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        {(schedule[day] || []).map((timeSlot, index) => (
                                            <div key={index} className="time-slot flex justify-between items-center bg-gray-100 p-2 rounded-md mb-2">
                                                <span className="font-medium text-gray-700">
                                                    {timeSlot.startTime} - {timeSlot.endTime}
                                                </span>
                                            </div>
                                        ))}
                                        <Button
                                            onClick={() => openModal(day)}
                                            className="bg-fuchsia-500 text-white w-full mt-3 hover:bg-fuchsia-600"
                                        >
                                            Añadir Horario
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Modal para agregar horario */}
                <Modal show={modalIsOpen} onHide={closeModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Añadir Horario para {selectedDay}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formStartTime">
                                <Form.Label>Hora de Inicio</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="border border-gray-300 rounded-md shadow-sm"
                                />
                            </Form.Group>
                            <Form.Group controlId="formEndTime" className="mt-3">
                                <Form.Label>Hora de Fin</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="border border-gray-300 rounded-md shadow-sm"
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={addSchedule}>
                            Guardar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </CardContent>
        </Card>
    );
};

export default ScheduleManager;
