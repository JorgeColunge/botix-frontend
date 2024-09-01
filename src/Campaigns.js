import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Form, InputGroup, FormControl, DropdownButton, Dropdown } from 'react-bootstrap';
import TemplatePreview from './TemplatePreview';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Campaigns.css';
import { ArrowUpSquare, CheckCircle, Clock, RocketFill, ThreeDotsVertical, XCircle } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import { AppContext } from './context';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Card,
  CardContent,
 ChartContainer,
  Button,
} from "./components"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import moment from 'moment';

const socket = io(process.env.REACT_APP_API_URL);

export const Campaigns = () => {

  const {state, setTemplates, setCampaigns} = useContext(AppContext);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [timeLefts, setTimeLefts] = useState({});

  useEffect(() => {
    socket.on('templateStatusUpdate', ({ templateId, status }) => {
      console.log(`Estado de la plantilla "${templateId}" actualizada a: ${status}`);
      setTemplates(prevTemplates =>
        prevTemplates.map(template =>
          template.id === templateId.toString() ? { ...template, state: status } : template
        )
      );
    });

    return () => {
      socket.off('templateStatusUpdate');
    };
  }, [])
  
  const handleCreateTemplateClick = () => {
    navigate('/create-template');
  };

  const handleCreateCampaignClick = () => {
    navigate('/create-campaign');
  };

  const handleUseTemplateClick = (template) => {
    navigate(`/create-campaign/${template.id}`);
  };

  const handleEditTemplateClick = (template) => {
    navigate(`/edit-template/${template.id}`);
  };

  const handleDeleteTemplateClick = async (template) => {
    const token = localStorage.getItem('token');
    const company_id = localStorage.getItem('company_id')
    console.log(template)
    Swal.fire({
      title: "Esta seguro que desea eliminar esta Plantilla?",
      showDenyButton: true,
      confirmButtonText: "Eliminar",
    }).then(async (result) => { 
      if (result.isConfirmed) {
        try {
          console.log('Deleting template with ID:', template.id);
          await axios.delete(`${process.env.REACT_APP_API_URL}/api/templates/${template.id}/${template.nombre}/${company_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTemplates(state.plantillas.filter(templ => templ.id !== template.id));
          await Swal.fire({
            title: "Perfecto",
            text: `Plantilla Eliminada.`,
            icon: "success"
          });
        } catch (error) {
          console.log(error)
          Swal.fire({
            title: "Error",
            text: `Error al eliminar Plantilla.
            Error: ${error.response.data.error}`,
            icon: "error"
          });
        }
      } 
    });
  };

  const handleEditCampaignClick = (campaign) => {
    navigate(`/edit-campaign/${campaign.id}`);
  };

  const handleDetailsCampaignClick = (campaign) => {
    setSelectedCampaign(campaign); 
    console.log(campaign)
    setShowDialog(true); // Muestra el diálogo
  };

  const handleCloseDialog = () => {
    setShowDialog(false); 
    setSelectedCampaign(null); 
  };

  const handleDeleteCampaignClick = async (campaignId) => {
    const token = localStorage.getItem('token');
    Swal.fire({
      title: "Esta seguro que desea eliminar esta Campaña?",
      showDenyButton: true,
      confirmButtonText: "Eliminar",
    }).then(async (result) => { 
      if (result.isConfirmed) {
        try {
          console.log('Deleting campaign with ID:', campaignId);
          await axios.delete(`${process.env.REACT_APP_API_URL}/api/campaigns/${campaignId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCampaigns(state.campañas.filter(campaign => campaign.id !== campaignId));
          await Swal.fire({
            title: "Perfecto",
            text: `Campaña Eliminada.`,
            icon: "success"
          });
        } catch (error) {
          console.error('Error deleting campaign:', error);
          Swal.fire({
            title: "Error",
            text: `Error al eliminar Campaña.
            Error: ${error}`,
            icon: "error"
          });
        }
      }
   
    });
  }

  const handleLaunchCampaignClick = async (campaignId) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Launching campaign with ID:', campaignId);
      await axios.post(`${process.env.REACT_APP_API_URL}/api/launch-campaign/${campaignId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({
        title: "Perfecto",
        text: `Se envio la campaña a los usuarios de la lista.`,
        icon: "success"
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `Error al Crear Campaña.
        Error: ${error}`,
        icon: "error"
      });
    }
  };

  const replaceVariables = (text, variables) => {
    let replacedText = text;
    variables.forEach(variable => {
      replacedText = replacedText.replace(variable.name, variable.example);
    });
    return replacedText;
  };

  const filteredTemplates = state.plantillas.filter(template => {
    return (
      template.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterType ? template.type === filterType : true)
    );
  });

  const formatTimeLeft = (timeLeft) => {
    const days = timeLeft.days > 0 ? String(timeLeft.days).padStart(2, '0') : '00';
    const hours = String(timeLeft.hours).padStart(2, '0');
    const minutes = String(timeLeft.minutes).padStart(2, '0');
    const seconds = String(timeLeft.seconds).padStart(2, '0');
  
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const calculateTimeLeft = (scheduledLaunch) => {
    const launchTime = moment(scheduledLaunch);
    const now = moment();
    const duration = moment.duration(launchTime.diff(now));

    if (duration.asMilliseconds() <= 0) {
      return null;  // El tiempo ha pasado o es inválido
    }

    return {
      days: Math.floor(duration.asDays()),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds()
    };
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const updatedTimeLefts = state.campañas.reduce((acc, campaign) => {
        acc[campaign.id] = calculateTimeLeft(campaign.scheduled_launch);
        return acc;
      }, {});
      setTimeLefts(updatedTimeLefts);
    }, 1000);

    return () => clearInterval(intervalId); // Limpiar el temporizador al desmontar
  }, [state.campañas]);

  const renderLaunchButtonOrTimer = (campaign) => {
    const timeLeft = timeLefts[campaign.id];

    if (!campaign.scheduled_launch || !timeLeft) {
      
      return (
        <Button variant="outline" className="w-100  hover:bg-sky-400" onClick={() => handleLaunchCampaignClick(campaign.id)}>
          <RocketFill  className="mr-2 h-4 w-4"/> Lanzar
        </Button>
      );
    }

  // Mostrar la cuenta regresiva con un formato fijo
  const formattedTimeLeft = formatTimeLeft(timeLeft);

  return (
    <Button
      variant="primary"
      disabled
      style={{
        display: 'inline-block',
        width: `90%`,
        textAlign: 'center',
      }}
    >
      {formattedTimeLeft}
    </Button>
  );
  };

  return (
    <Container className="campaigns-container">
      <Col md={9} className='ms-auto me-auto'>
        <Row className="mb-4 justify-content-center">
          <Col >
            <h2>Plantillas</h2>
          </Col>
          <Col md={4} className="text-end">
            <Button onClick={handleCreateTemplateClick} className="bg-blue-500 hover:bg-blue-600 text-white w-100" variant="secondary">Crear Plantilla</Button>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={8} className="templates-list-column">
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Buscar por nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Filtrar por tipo</option>
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utilidad</option>
              </Form.Select>
            </InputGroup>
            <div className="templates-list">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th width="1">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.length > 0 ? (
                    filteredTemplates.map(template => (
                      <tr key={template.id} onClick={() => setSelectedTemplate(template)}>
                        <td>
                          {template.state === "APPROVED" 
                            ? (<CheckCircle className='text-success me-1' title='Aprobada para usar' />)
                            : template.state === "REJECTED"
                              ? (<XCircle className='text-danger me-1' title='Rechazada para usar' />)
                              : (<Clock className='text-secondary me-1' title='Pendiente por aprobar' />)}
                          {template.nombre}
                        </td>
                        <td>{template.type}</td>
                        <td className="d-flex justify-content-between align-items-center">
                          <Button className="bg-green-500 hover:bg-green-600 text-white" variant="primary" onClick={() => handleUseTemplateClick(template)}>
                            <ArrowUpSquare className="mr-2 h-4 w-4"/> Usar
                          </Button>
                          <DropdownButton id="dropdown-basic-button" className="custom-dropdown-toggle" title={<ThreeDotsVertical />} variant="ghost" size="sm">
                            <Dropdown.Item onClick={() => handleUseTemplateClick(template)}>
                              Usar
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEditTemplateClick(template)}>
                              Editar
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item className="text-danger" onClick={() => handleDeleteTemplateClick(template)}>
                              Eliminar
                            </Dropdown.Item>
                          </DropdownButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">No se encontraron plantillas.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Col>
          <Col md={4} className="preview-column">
            <TemplatePreview template={selectedTemplate} />
          </Col>
        </Row>
        <Row className="mt-5">
          <Col>
            <h2>Campañas de WhatsApp</h2>
          </Col>
          <Col className="text-end">
            <Button onClick={handleCreateCampaignClick} className="bg-blue-500 hover:bg-blue-600 text-white w-100" variant="primary">Crear Campaña</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table  bordered hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Objetivo</th>
                  <th>Tipo</th>
                  <th>Plantilla Utilizada</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {state.campañas.length > 0 ? (
                  state.campañas.map(campaign => (
                    <tr key={campaign.id}>
                      <td>{campaign.name}</td>
                      <td>{campaign.objective}</td>
                      <td>{campaign.type}</td>
                      <td>{campaign.template_name}</td>
                      <td className="d-flex justify-content-between align-items-center">
                     
                        {renderLaunchButtonOrTimer(campaign)}
                        
                        <DropdownButton id="dropdown-basic-button" className="custom-dropdown-toggle" title={<ThreeDotsVertical />} variant="ghost" size="sm">
                          <Dropdown.Item onClick={() => handleDetailsCampaignClick(campaign)}>
                            Detalles
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleEditCampaignClick(campaign)}>
                            Editar
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleLaunchCampaignClick(campaign.id)}>
                            Lanzar
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item className="text-danger" onClick={() => handleDeleteCampaignClick(campaign.id)}>
                            Eliminar
                          </Dropdown.Item>
                        </DropdownButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No se encontraron campañas.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Col>
      {showDialog && (
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogTrigger asChild>
          {/* Un solo botón que actúa como trigger */}
          <button style={{ display: 'none' }}>Open</button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Detalles de la campaña</AlertDialogTitle>
            <AlertDialogDescription>
              <Card
                  className="max-w-full" x-chunk="charts-01-chunk-5"
                >
                  <CardContent className="flex gap-4 p-4">
                    <div className="grid items-center gap-2">
                      <div className="grid flex-1 auto-rows-min gap-0.5">
                        <div className="text-sm text-muted-foreground">Total enviadas</div>
                        <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                          {`${selectedCampaign.conversions}`}/{`${selectedCampaign.contactos.length}`}
                          <span className="text-sm font-normal text-muted-foreground">
                            Personas
                          </span>
                        </div>
                      </div>
                      <div className="grid flex-1 auto-rows-min gap-0.5">
                        <div className="text-sm text-muted-foreground">Recibidas</div>
                        <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                        {`${selectedCampaign.delivered}`}
                          <span className="text-sm font-normal text-muted-foreground">
                            Mensajes
                          </span>
                        </div>
                      </div>
                      <div className="grid flex-1 auto-rows-min gap-0.5">
                        <div className="text-sm text-muted-foreground">Leídas</div>
                        <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                        {`${selectedCampaign.read}`}
                          <span className="text-sm font-normal text-muted-foreground">
                            Mensajes
                          </span>
                        </div>
                      </div>
                      <div className="grid flex-1 auto-rows-min gap-0.5">
                        <div className="text-sm text-muted-foreground">Respondidos</div>
                        <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                        {`${selectedCampaign.interactions}`}
                          <span className="text-sm font-normal text-muted-foreground">
                          Mensajes
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChartContainer
                      config={{
                        inter: {
                          label: "Respondidos",
                          color: "hsl(var(--chart-1))",
                        },
                        move: {
                          label: "Totales",
                          color: "hsl(var(--chart-2))",
                        },
                        exercise: {
                          label: "Recibidas",
                          color: "hsl(var(--chart-3))",
                        },
                        stand: {
                          label: "Leídas",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                      className="mx-auto aspect-square w-full max-w-[80%]"
                    >
                      <RadialBarChart
                        margin={{
                          left: -10,
                          right: -10,
                          top: -10,
                          bottom: -10,
                        }}
                        data={[
                          {
                            name: "Leidos",
                            activity: "stand",
                            value: (selectedCampaign.delivered / selectedCampaign.contactos.length)* 100,
                            fill: "var(--color-stand)",
                          },
                          {
                            name: "Recibidos",
                            activity: "exercise",
                            value: (selectedCampaign.read / selectedCampaign.conversions) * 100,
                            fill: "var(--color-exercise)",
                          },
                          {
                            name: "Enviados",
                            activity: "move",
                            value: (selectedCampaign.conversions / selectedCampaign.conversions) * 100,
                            fill: "var(--color-move)",
                          },
                          {
                            name: "Respondidos",
                            activity: "inter",
                            value: (selectedCampaign.interactions / selectedCampaign.conversions) * 100,
                            fill: "var(--color-inter)",
                          },
                        ]}
                        innerRadius="15%"                       
                        barSize={27}
                        startAngle={-120}
                        endAngle={450}
                      >
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          dataKey="value"
                          tick={false}
                        />
                        <RadialBar dataKey="value" background cornerRadius={5} > 
                          <LabelList
                            position="insideStart"
                            dataKey="name"
                            className="fill-white capitalize mix-blend-luminosity"
                            fontSize={15}
                          />
                        </RadialBar>
                      </RadialBarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDialog}>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
     )}
    </Container>
  );
};
