"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react';
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

import { cn } from "./lib/utils"
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
} from "./components"

const ItemType = 'CONVERSATION';

const statuses = [
  {
    value: "backlog",
    label: "Backlog",
    icon: HelpCircle,
  },
  {
    value: "todo",
    label: "Todo",
    icon: Circle,
  },
  {
    value: "in progress",
    label: "In Progress",
    icon: ArrowUpCircle,
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircle2,
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: XCircle,
  },
];

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
            <OverlayTrigger placement="top" overlay={<Tooltip>{phases[conversation.label]?.name}</Tooltip>}>
              <span className="badge-label" style={{ color: phases[conversation.label]?.color }}>
                <BookmarkFill />
              </span>
            </OverlayTrigger>
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

  return (
    <div ref={drop} className="funnel-column">
      <div className="funnel-column-header" style={{ backgroundColor: phase.color }}>
        <h5 className="text-white text-center">{phase.name}</h5>
      </div>
      <ListGroup>
        {groupedConversations[phaseId] ? (
          groupedConversations[phaseId].map(convo => (
            <DraggableConversation
              key={convo.conversation_id}
              conversation={convo}
              phaseId={phaseId}
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
  const totalConversations = Object.values(groupedConversations).reduce((acc, phase) => acc + phase.length, 0);

  const calculateWidth = (phaseCount) => (phaseCount / totalConversations) * 100;

  return (
    <div className="funnel-graph">
      {Object.entries(phases).map(([phaseId, phase]) => {
        const phaseCount = groupedConversations[phaseId] ? groupedConversations[phaseId].length : 0;
        const width = totalConversations === 0 ? 100 : calculateWidth(phaseCount);
        return (
          <div key={phaseId} className="funnel-graph-segment" style={{ width: `${width}%`, backgroundColor: phase.color }}>
            {phase.name} ({phaseCount})
          </div>
        );
      })}
    </div>
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

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

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
      name.includes(searchTermLower) ||
      phoneNumber.includes(searchTermLower) ||
      phaseName.includes(searchTermLower)
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
                      <selectedStatus.icon className="mr-2 h-4 w-4 shrink-0" />
                      {selectedStatus.label}
                    </>
                  ) : (
                    <>+ Set status</>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" side="right" align="start">
                <Command>
                  <CommandInput placeholder="Change status..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {statuses.map((status) => (
                        <CommandItem
                          key={status.value}
                          value={status.value}
                          onSelect={(value) => {
                            setSelectedStatus(
                              statuses.find((priority) => priority.value === value) ||
                              null
                            )
                            setOpen(false)
                          }}
                        >
                          <status.icon
                            className={cn(
                              "mr-2 h-4 w-4",
                              status.value === selectedStatus?.value
                                ? "opacity-100"
                                : "opacity-40"
                            )}
                          />
                          <span>{status.label}</span>
                        </CommandItem>
                      ))}
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
          {Object.entries(phases).map(([phaseId, phase]) => (
            <DroppableColumn
              key={phaseId}
              phaseId={phaseId}
              phase={phase}
              groupedConversations={groupedConversations}
              moveConversation={moveConversation}
              handleConversationDrop={handleConversationDrop}
              phases={phases}
            />
          ))}
        </div>
        <br></br><br></br>
      </div>
      <div className='funnel-container mt-5'>
        <FunnelGraph phases={phases} groupedConversations={groupedConversations} />
      </div>
    </DndProvider>
  );
}

export default FunnelComponent;
