"use client"
import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { ListGroup, Tooltip, OverlayTrigger, InputGroup, FormControl } from 'react-bootstrap';
import { PersonCircle, BookmarkFill } from 'react-bootstrap-icons';
import moment from 'moment';
import { useConversations } from './ConversationsContext';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import './Funnel.css';
import {
  ArrowUpCircle,
  CheckCircle2,
  Circle,
  HelpCircle,
  LucideIcon,
  XCircle,
} from "lucide-react"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Card,
  CardHeader,
  CardContent,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "./components"
import { AppContext } from './context';

const ItemType = 'CONVERSATION';


const DraggableConversation = ({ conversation, phaseId, moveConversation, handleConversationDrop, phases }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { conversation, phaseId },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        handleConversationDrop(item.conversation, dropResult.phaseId);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(ref);

  const formatTime = (time) => {
    if (!time) return "Unknown time";
    const messageDate = moment(time);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');

    if (messageDate.isSame(today, 'd')) {
      return messageDate.format('LT');
    } else if (messageDate.isSame(yesterday, 'd')) {
      return 'Ayer';
    } else {
      return messageDate.format('L');
    }
  };

  const getMessagePreview = (lastMessage) => {
    return lastMessage && lastMessage.length > 30 ? lastMessage.substring(0, 30) + '...' : lastMessage;
  };

  return (
    <ListGroup.Item ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className="d-flex justify-content-between align-items-center">
      {conversation.profile_url ? (
        <img
          src={`${process.env.REACT_APP_API_URL}${conversation.profile_url}`}
          alt="Profile"
          className="rounded-circle"
          style={{ width: 50, height: 50 }}
        />
      ) : (
        <PersonCircle className='rounded-circle' size={50} />
      )}
      <div style={{ flex: 1, marginLeft: 10 }}>
        <div className="d-flex justify-content-between align-items-center">
          <strong>
            {conversation.first_name && conversation.last_name
              ? `${conversation.first_name} ${conversation.last_name}`
              : conversation.first_name
              ? conversation.first_name
              : conversation.last_name
              ? conversation.last_name
              : conversation.phone_number}
          </strong>
          {conversation.label && (
          (() => {
            // Buscar la fase que coincida con el phaseId
            const matchingPhase = phases.find(phase => phase.id === phaseId);
            
            // Si encuentra la fase, usa su color y nombre
            if (matchingPhase) {
              return (
                <OverlayTrigger placement="top" overlay={<Tooltip>{matchingPhase.name}</Tooltip>}>
                  <span className="badge-label" style={{ color: matchingPhase.color }}>
                    <BookmarkFill />
                  </span>
                </OverlayTrigger>
              );
            }
            
            // Si no encuentra la fase, no muestra nada o puedes manejarlo como prefieras
            return null;
          })()
        )}
        </div>
        <div className="d-flex justify-content-between">
          <span className="text-muted">{getMessagePreview(conversation.last_message)}</span>
          <div>
            {conversation.unread_messages > 0 && (
              <span className="badge badge-pill badge-primary">{conversation.unread_messages}</span>
            )}
            <small className="text-muted">{formatTime(conversation.last_message_time)}</small>
          </div>
        </div>
      </div>
    </ListGroup.Item>
  );
};

const DroppableColumn = ({ phaseId, phase, groupedConversations, moveConversation, handleConversationDrop, phases }) => {
  
  const [, drop] = useDrop({
    accept: ItemType,
    drop: () => ({ phaseId }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const filteredConversations = groupedConversations[phaseId]
    ? groupedConversations[phaseId].filter(convo => convo.label === phase.id) 
    : [];

  return (
    <div ref={drop} className="funnel-column">
      <div className="funnel-column-header" style={{ backgroundColor: phase.color }}>
        <h5 className="text-white text-center">{phase.name}</h5>
      </div>
      <ListGroup>
        {filteredConversations.length > 0 ? (
          filteredConversations.map(convo => (
            <DraggableConversation
              key={convo.conversation_id}
              conversation={convo}
              phaseId={phase.id}
              moveConversation={moveConversation}
              handleConversationDrop={handleConversationDrop}
              phases={phases}
            />
          ))
        ) : (
          <p className="text-center text-muted">Sin Conversaciones</p>
        )}
      </ListGroup>
    </div>
  );
};

const FunnelGraph = ({ phases, groupedConversations }) => {

  const phasesArray = phases
  .filter((phase) => {
    const phaseId = phase.id;
    const conversations = groupedConversations[phaseId] || [];

    return conversations.some(convo => convo.label === phaseId);
  })
  .map((phase) => {
    const phaseId = phase.id;
    const conversations = groupedConversations[phaseId] || [];

    const phaseCount = conversations.length;

    return {
      name: phase.name,
      fill: phase.color,
      Cantidad: phaseCount,
    };
  });


  const chartConfig = {
    ...Object.entries(phases).reduce((acc, [key, fas], index) => {
      acc[fas.name] = {
        label: fas.name,
        color: fas.color ,
      };
      return acc;
    }, {}),
  }

  return (
    <Card className='w-full h-[100%] mb-5'>
      <CardHeader>
        <CardTitle>Descripción de Fases</CardTitle>
      </CardHeader>
      <CardContent>
      <CardContent>
        <ChartContainer className='h-[20vh]' config={chartConfig}>
        <BarChart
          accessibilityLayer
          data={phasesArray}
          layout="vertical"
          margin={{
            top: 0,
            right: 5,
            bottom: 0,
            left: 115,
          }}
        >
          <YAxis
            dataKey="name" 
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fontSize: 15, width: 150, wordBreak: "break-word" }}
            tickFormatter={(name) => name} 
            margin={{
              top: 0,
              botton: 0
            }}
          />
          <XAxis dataKey="Cantidad" type="number" hide />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="Cantidad" layout="vertical" radius={6} barSize={30} minPointSize={15}/>
        </BarChart>
          </ChartContainer>
        </CardContent>
      </CardContent>
    </Card>
  );
};

function FunnelComponent() {
  const {
    conversations,
    setCurrentConversation,
    setConversations,
    phases
  } = useConversations();
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(null);
  const {state} = useContext(AppContext)
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  
  const filterPhases = state.fases
  .filter(fase => 
    selectedStatus?.id ? fase.department_id == selectedStatus.id : true
  )
  .map(fase => ({
    phase_id: fase.department_id,
    name: fase.name,
    color: fase.color,
    id: fase.id
  }))

  const handleConversationDrop = async (conversation, newPhaseId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/edit-contact/${conversation.contact_id}`, { label: newPhaseId });
      setConversations(prevConversations =>
        prevConversations.map(convo => convo.conversation_id === conversation.conversation_id ? { ...convo, label: newPhaseId } : convo)
      );
    } catch (error) {
      console.error('Error updating conversation label:', error);
    }
  };

  const moveConversation = (conversation, newPhaseId) => {
    setConversations(prevConversations =>
      prevConversations.map(convo => convo.conversation_id === conversation.conversation_id ? { ...convo, label: newPhaseId } : convo)
    );
  };

  // Filtramos las conversaciones según el término de búsqueda
  const filteredConversations = conversations.filter(convo => {
    const name = `${convo.first_name || ''} ${convo.last_name || ''}`.trim().toLowerCase();
    const phoneNumber = convo.phone_number?.toLowerCase() || '';
    const phaseName = phases[convo.label]?.name.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();
  
    return (
      (name.includes(searchTermLower) ||
      phoneNumber.includes(searchTermLower) ||
      phaseName.includes(searchTermLower))
    );
  });

  // Agrupamos las conversaciones por fases
  const groupedConversations = filteredConversations.reduce((acc, convo) => {
    const phaseId = String(convo.label);
    if (!acc[phaseId]) {
      acc[phaseId] = [];
    }
    acc[phaseId].push(convo);
    return acc;
  }, {});

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="container mt-5">
      <div className="row justify-content-center align-items-center" >
        <div className="col-md-8 d-flex justify-content-between align-items-center">
          
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Buscar..."
              aria-label="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </InputGroup>

          <div className="d-flex align-items-center ms-3 mb-3">
            <p className="text-sm text-muted-foreground mb-0 me-2">Departamentos:</p>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[150px] justify-start"
                >
                  {selectedStatus ? (
                    <>
                      {selectedStatus.name}
                    </>
                  ) : (
                    <>Todos</>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" side="right" align="start">
                <Command>
                  <CommandInput placeholder="Cambiar departamento..." />
                  <CommandList>
                    <CommandEmpty>Sin resultado</CommandEmpty>
                    <CommandGroup>
                      {state?.departamentos?.map((dep) => (
                        <CommandItem
                          key={dep.id}
                          value={dep.id}
                          onSelect={(value) => {
                            setSelectedStatus(
                              state.departamentos.find((priority) => priority.name === value) ||
                              null
                            )
                            setOpen(false)
                          }}
                        >
                          <span>{dep.name}</span>
                        </CommandItem>
                      ))}
                      <CommandItem 
                        onSelect={ () =>
                          {setSelectedStatus('')
                            setOpen(false)}
                        } >
                      <span>Todos</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

        </div>
      </div>
    </div>
      <div className="funnel-container">
        <div className="funnel-columns">
          {Object.entries(filterPhases).map(([phase_id, phase]) => (
            <DroppableColumn
              key={phase_id}
              phaseId={phase.id}
              phase={phase}
              groupedConversations={groupedConversations}
              moveConversation={moveConversation}
              handleConversationDrop={handleConversationDrop}
              phases={filterPhases}
            />
          ))}
        </div>
        <br></br><br></br>
      </div>
      <div className='funnel-container w-full mt-5'>
        <FunnelGraph phases={filterPhases} groupedConversations={groupedConversations} />
      </div>
    </DndProvider>
  );
}

export default FunnelComponent;
