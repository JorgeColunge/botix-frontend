import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Calendar3, Clock } from 'react-bootstrap-icons'; // Importar iconos de react-bootstrap-icons
import 'bootstrap/dist/css/bootstrap.min.css';
import Calendar from './Calendar'; // Importar el componente Calendar
import { Card, CardHeader, CardContent, Button } from './components'; // Componentes de Shadcn
import ScheduleManager from './ScheduleManager'; // Importar el componente ScheduleManager

const EntitySelector = () => {
    const [entityType, setEntityType] = useState('usuario'); // Tipo de entidad seleccionado
    const [entities, setEntities] = useState({ usuarios: [], colaboradores: [], instalaciones: [] });
    const [selectedEntityId, setSelectedEntityId] = useState(null);
    const [activeComponent, setActiveComponent] = useState('calendario'); // Componente activo ('calendario' o 'horario')
    const companyId = localStorage.getItem('company_id'); // Obtener company_id desde localStorage
    const userId = localStorage.getItem('user_id'); // Obtener user_id desde localStorage

    useEffect(() => {
        // Cargar todas las entidades al cargar el componente
        loadAllEntities();
    }, []);

    // Función para cargar todas las entidades (usuarios, colaboradores, instalaciones)
    const loadAllEntities = async () => {
        try {
            const usuarios = await fetchEntities('users');
            const colaboradores = await fetchEntities('colaboradores');
            const instalaciones = await fetchEntities('instalaciones');

            setEntities({ usuarios, colaboradores, instalaciones });

            // Establecer la entidad inicial como el usuario conectado
            if (userId) {
                setSelectedEntityId(userId);
                setEntityType('usuario');
            }
        } catch (error) {
            console.error('Error loading entities:', error);
        }
    };

    // Función para obtener entidades desde la API
    const fetchEntities = async (entityType) => {
        if (!companyId) {
            console.error('Company ID no disponible');
            return [];
        }

        let url = '';
        switch (entityType) {
            case 'users':
                url = `${process.env.REACT_APP_API_URL}/api/users?company_id=${companyId}`;
                break;
            case 'colaboradores':
                url = `${process.env.REACT_APP_API_URL}/api/colaboradores?company_id=${companyId}`;
                break;
            case 'instalaciones':
                url = `${process.env.REACT_APP_API_URL}/api/instalaciones?company_id=${companyId}`;
                break;
            default:
                console.error('Invalid entity type:', entityType);
                return [];
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!response.ok) {
            console.error(`Failed to fetch ${entityType}:`, response.status, response.statusText);
            throw new Error(`Failed to fetch ${entityType}`);
        }

        return await response.json();
    };

    // Obtener la lista de entidades según el tipo seleccionado
    const getEntitiesByType = () => {
        switch (entityType) {
            case 'usuario':
                return entities.usuarios;
            case 'colaborador':
                return entities.colaboradores;
            case 'instalacion':
                return entities.instalaciones;
            default:
                return [];
        }
    };

    // Función para cambiar el tipo de entidad y restablecer el ID de entidad seleccionado
    const handleEntityTypeChange = (newEntityType) => {
        setEntityType(newEntityType);
        setSelectedEntityId(null); // Restablecer el ID seleccionado a null
    };

    return (
        <Card className="p-4">
            <CardContent>
                <Row className="mb-4">
                    <Col md={2}>
                        <Form.Select
                            value={entityType}
                            onChange={(e) => {
                                handleEntityTypeChange(e.target.value);
                            }}
                            className="border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="usuario">Usuarios</option>
                            <option value="colaborador">Colaboradores</option>
                            <option value="instalacion">Instalaciones</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Select
                            value={selectedEntityId || ''}
                            onChange={(e) => {
                                setSelectedEntityId(e.target.value);
                            }}
                            className="border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Seleccionar entidad</option>
                            {getEntitiesByType().map((entity) => (
                                <option
                                    key={entity.id_usuario || entity.id_colaborador || entity.id_instalacion}
                                    value={entity.id_usuario || entity.id_colaborador || entity.id_instalacion}
                                >
                                    {entity.nombre || entity.descripcion} {entity.apellido || ''}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={5}></Col>
                    <Col md={2} className="d-flex justify-content-end gap-2 align-items-center">
                        <Button
                            className={`${
                                activeComponent === 'calendario' ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 me-2' : 'bg-neutral-200 text-neutral-400 hover:bg-neutral-300 me-2'
                            } p-2 d-flex align-items-center justify-content-center`}
                            onClick={() => setActiveComponent('calendario')}
                        >
                            <Calendar3 size={20} /> {/* Icono de Calendario */}
                        </Button>
                        <Button
                            className={`${
                                activeComponent === 'horario' ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 me-2' : 'bg-neutral-200 text-neutral-400 hover:bg-neutral-300 me-2'
                            } p-2 d-flex align-items-center justify-content-center`}
                            onClick={() => setActiveComponent('horario')}
                        >
                            <Clock size={20} /> {/* Icono de Horario */}
                        </Button>
                    </Col>
                </Row>

                {/* Renderizar el componente Calendar o ScheduleManager según el botón seleccionado */}
                {activeComponent === 'calendario' && (
                    <Calendar entityType={entityType} selectedEntityId={selectedEntityId} companyId={companyId} />
                )}
                {activeComponent === 'horario' && (
                    <ScheduleManager entityType={entityType} selectedEntityId={selectedEntityId} companyId={companyId} />
                )}
            </CardContent>
        </Card>
    );
};

export default EntitySelector;
