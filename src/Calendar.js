import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Card, CardHeader, CardContent, Button } from './components'; // Componentes de Shadcn
import { ChevronLeft, ChevronRight, Plus } from 'react-bootstrap-icons'; // Iconos de React Bootstrap Icons
import { Modal, Form, Col, Row } from 'react-bootstrap'; // Importar componentes de react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'; // Importar CSS de Bootstrap
import './Calendar.css'; // Importar los estilos personalizados

const Calendar = ({ entityType, selectedEntityId, companyId }) => {
    const [events, setEvents] = useState([]);
    const calendarRef = useRef(null);
    const [currentView, setCurrentView] = useState('timeGridWeek'); // Vista inicial por defecto
    const [modalIsOpen, setModalIsOpen] = useState(false); // Estado para controlar el modal
    const [eventTitle, setEventTitle] = useState(''); // Título del evento
    const [selectedStartDate, setSelectedStartDate] = useState(''); // Fecha de inicio
    const [selectedEndDate, setSelectedEndDate] = useState(''); // Fecha de fin
    const [selectedStartTime, setSelectedStartTime] = useState(''); // Hora de inicio
    const [selectedEndTime, setSelectedEndTime] = useState(''); // Hora de fin
    const [allDay, setAllDay] = useState(false); // Evento de todo el día
    const [multiDay, setMultiDay] = useState(false); // Estado para saber si es un evento de varios días

    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            const currentHour = new Date().getHours();
            calendarApi.scrollToTime(`${currentHour}:00:00`);
        }
    }, []);

    useEffect(() => {
        // Cargar eventos cuando cambie la entidad seleccionada
        if (entityType && selectedEntityId) {
            forceLoadEvents();
        }
    }, [entityType, selectedEntityId]);

    // Función para cargar eventos
    const loadEvents = async () => {
        try {
            console.log('Fetching events for:', { entityType, selectedEntityId, companyId });
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/events?tipo_asignacion=${entityType}&id_asignacion=${selectedEntityId}&company_id=${companyId}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                console.error('Failed to fetch events:', response.status, response.statusText);
                throw new Error('Failed to fetch events');
            }

            const events = await response.json();
            console.log('Events fetched:', events); // Log de los eventos obtenidos

            // Formatear los eventos para FullCalendar
            const formattedEvents = events.map(event => ({
                id: event.id_evento,
                title: event.titulo,
                start: event.fecha_inicio,
                end: event.fecha_fin,
                allDay: event.all_day
            }));

            setEvents(formattedEvents); // Actualizar el estado con eventos formateados
        } catch (error) {
            console.error('Error loading events:', error); // Log de error en el proceso
        }
    };

    // Función para forzar la carga de eventos después de un cambio
    const forceLoadEvents = () => {
        setTimeout(() => {
            if (entityType && selectedEntityId) { // Asegúrate de que el tipo de entidad e id no sean null
                loadEvents();
            } else {
                console.error("El tipo de entidad o el ID no son válidos.");
            }
        }, 100); // Ajusta el tiempo según sea necesario
    };

    // Función para manejar la selección de eventos
    const handleEventSelect = (selectInfo) => {
        const startDateTime = selectInfo.startStr.split('T');
        const endDateTime = selectInfo.endStr.split('T');

        // Comparar si las fechas de inicio y fin son diferentes
        if (startDateTime[0] !== endDateTime[0]) {
            setMultiDay(true); // Evento de varios días
            setSelectedStartDate(startDateTime[0]);
            setSelectedEndDate(endDateTime[0]);
            setSelectedStartTime('00:00'); // Establecer la hora en 00:00 para multi-day
            setSelectedEndTime('23:59'); // Establecer la hora en 23:59 para multi-day
        } else {
            setMultiDay(false); // Evento de un solo día
            setSelectedStartDate(startDateTime[0]);
            setSelectedEndDate(startDateTime[0]);
            setSelectedStartTime(startDateTime[1] ? startDateTime[1].substring(0, 5) : ''); // Extraer la hora de inicio
            setSelectedEndTime(endDateTime[1] ? endDateTime[1].substring(0, 5) : ''); // Extraer la hora de fin
        }

        setModalIsOpen(true); // Abrir el modal
    };

    // Función para cerrar el modal
    const handleModalClose = () => {
        setModalIsOpen(false); // Cerrar el modal
        setEventTitle(''); // Limpiar el campo del título del evento
        setSelectedStartDate('');
        setSelectedEndDate('');
        setSelectedStartTime('');
        setSelectedEndTime('');
        setAllDay(false); // Restablecer evento de todo el día
        setMultiDay(false); // Restablecer evento de varios días
    };

    // Función para crear un evento
    const handleEventCreate = async () => {
        const newEvent = {
            titulo: eventTitle,
            descripcion: '', // Puedes agregar un campo para descripción si es necesario
            fecha_inicio: `${selectedStartDate}T${allDay ? '00:00' : selectedStartTime}`,
            fecha_fin: multiDay ? selectedEndDate : `${selectedStartDate}T${allDay ? '23:59' : selectedEndTime}`,
            all_day: allDay || multiDay, // Si es todo el día o multi-día, se establece como true
            tipo_asignacion: entityType,
            id_asignacion: selectedEntityId,
            company_id: companyId
        };

        try {
            console.log('Creating event with data:', newEvent); // Log del evento a crear

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent),
                credentials: 'include'
            });

            if (!response.ok) {
                console.error('Failed to create event:', response.status, response.statusText);
                throw new Error('Failed to create event');
            }

            const createdEvent = await response.json();
            console.log('Event created:', createdEvent); // Log del evento creado

            // Formatear y agregar el evento al estado
            setEvents((prevEvents) => [
                ...prevEvents, 
                {
                    id: createdEvent.id_evento,
                    title: createdEvent.titulo,
                    start: createdEvent.fecha_inicio,
                    end: createdEvent.fecha_fin,
                    allDay: createdEvent.all_day
                }
            ]);

            handleModalClose(); // Cerrar el modal después de crear el evento
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    // Función para cambiar la vista del calendario
    const changeView = (view) => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(view);
        setCurrentView(view);
    };

    // Función para ir a la fecha de hoy
    const handleTodayClick = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.today();
    };

    return (
        <Card className="p-6 shadow-md">
            <CardHeader>
                {/* Barra de navegación y control del calendario */}
                <div className="header-row">
                    <div className="header-col left">
                        <Button
                            className="bg-neutral-200 text-neutral-700 hover:bg-neutral-300 me-2"
                            onClick={() => calendarRef.current.getApi().prev()}
                        >
                            <ChevronLeft />
                        </Button>
                        <Button
                            className="bg-neutral-200 text-neutral-700 hover:bg-neutral-300 me-2"
                            onClick={() => calendarRef.current.getApi().next()}
                        >
                            <ChevronRight />
                        </Button>
                        <Button
                            className="bg-neutral-200 text-neutral-700 hover:bg-neutral-300 me-2"
                            onClick={handleTodayClick}
                        >
                            Hoy
                        </Button>
                    </div>
                    {/* Selector de vista y botón para añadir evento */}
                    <div className="header-col right">
                        <Button
                            className={`${
                                currentView === 'dayGridMonth'
                                    ? 'bg-black text-white'
                                    : 'bg-fuchsia-500 text-white'
                            } flex items-center space-x-2 hover:bg-fuchsia-600 me-2`}
                            onClick={() => changeView('dayGridMonth')}
                        >
                            Mes
                        </Button>
                        <Button
                            className={`${
                                currentView === 'timeGridWeek'
                                    ? 'bg-black text-white'
                                    : 'bg-fuchsia-500 text-white'
                            } flex items-center space-x-2 hover:bg-fuchsia-600 me-2`}
                            onClick={() => changeView('timeGridWeek')}
                        >
                            Semana
                        </Button>
                        <Button
                            className={`${
                                currentView === 'timeGridDay'
                                    ? 'bg-black text-white'
                                    : 'bg-fuchsia-500 text-white'
                            } flex items-center space-x-2 hover:bg-fuchsia-600 me-2`}
                            onClick={() => changeView('timeGridDay')}
                        >
                            Día
                        </Button>
                        <Button
                            className="bg-fuchsia-500 text-white flex items-center space-x-2 hover:bg-fuchsia-600 me-2"
                            onClick={() => {
                                setModalIsOpen(true);
                            }}
                        >
                            <Plus className="mr-1" /> Añadir
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="custom-calendar">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={currentView}
                    headerToolbar={false} // Desactivar la barra de herramientas por defecto
                    locale={esLocale}
                    events={events}
                    editable={true} // Habilitar arrastrar y soltar
                    selectable={true} // Habilitar selección de rango
                    select={handleEventSelect} // Manejar selección de rango
                    height="70vh"
                    nowIndicator={true} // Muestra la línea roja en la hora actual
                    slotLabelFormat={{
                        hour: 'numeric',
                        hour12: true,
                        meridiem: 'short'
                    }}
                    // Personalizar los encabezados de los días para todas las vistas
                    dayHeaderContent={(args) => (
                        <div className="day-header">
                            <div className="day-name text-sm text-gray-500">{args.text.slice(0, 3).toUpperCase()}</div>
                            {args.view.type !== 'dayGridMonth' && (
                                <div className="day-number text-lg font-bold">{args.date.getDate()}</div>
                            )}
                        </div>
                    )}
                    eventContent={({ event, view }) => {
                        if (event.allDay) {
                            return (
                                <div className="all-day-event">
                                    <span className="event-title">{event.title}</span>
                                </div>
                            );
                        }
                        return (
                            <div className="event-content">
                                <span className="event-title">{event.title}</span>
                            </div>
                        );
                    }}
                />
            </CardContent>

            {/* Modal para agregar eventos */}
            <Modal
                show={modalIsOpen}
                onHide={handleModalClose}
                backdrop="static"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Agregar Evento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formEventTitle">
                            <Form.Label>Título del Evento</Form.Label>
                            <Form.Control
                                type="text"
                                value={eventTitle}
                                onChange={(e) => setEventTitle(e.target.value)}
                                placeholder="Ingresa el título del evento"
                            />
                        </Form.Group>
                        {/* Ocultar la casilla "Todo el día" si es un evento de varios días */}
                        {!multiDay && (
                            <Form.Group controlId="formAllDay" className="mt-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Todo el día"
                                    checked={allDay}
                                    onChange={(e) => setAllDay(e.target.checked)}
                                />
                            </Form.Group>
                        )}
                        <Row className="mt-3">
                            <Col>
                                <Form.Group controlId="formStartDate">
                                    <Form.Label>Fecha de Inicio</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={selectedStartDate}
                                        onChange={(e) => setSelectedStartDate(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            {/* Mostrar las horas solo si no es un evento de varios días */}
                            {!multiDay && (
                                <>
                                    <Col>
                                        <Form.Group controlId="formStartTime">
                                            <Form.Label>Hora de Inicio</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={selectedStartTime}
                                                onChange={(e) => setSelectedStartTime(e.target.value)}
                                                disabled={allDay}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formEndTime">
                                            <Form.Label>Hora de Fin</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={selectedEndTime}
                                                onChange={(e) => setSelectedEndTime(e.target.value)}
                                                disabled={allDay}
                                            />
                                        </Form.Group>
                                    </Col>
                                </>
                            )}
                        </Row>
                        {multiDay && (
                            <Row className="mt-3">
                                <Col>
                                    <Form.Group controlId="formEndDate">
                                        <Form.Label>Fecha de Fin</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={selectedEndDate}
                                            onChange={(e) => setSelectedEndDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleEventCreate}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default Calendar;
