import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Table, Form, InputGroup, FormControl, Row, Col, Nav, Spinner, Dropdown, DropdownButton } from 'react-bootstrap';
import { ArrowDownCircle, ArrowLeft, ArrowLeftCircle, ArrowRightCircle, ArrowUpCircle, PencilSquare } from 'react-bootstrap-icons';
import axios from 'axios';
import CodeMirror, { color } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  addEdge,
  Handle,
  useNodesState,
  useEdgesState,
  updateEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './BotDiagram.css';

const baseHeader = `(async function(
  sendTextMessage,
  sendImageMessage,
  sendVideoMessage,
  sendDocumentMessage,
  sendAudioMessage,
  sendTemplateMessage,
  sendTemplateToSingleContact,
  sendLocationMessage,
  io,
  senderId,
  messageData,
  conversationId,
  pool,
  axios,
  getContactInfo,
  updateContactName,
  createContact,
  updateContactCompany,
  updateConversationState,
  assignResponsibleUser,
  processMessage,
  getReverseGeocoding,
  getGeocoding,
  integrationDetails,
  externalData,
  clientTimezone,
  moment
) {`;

const baseFooter = `})(sendTextMessage, sendImageMessage, sendVideoMessage, sendDocumentMessage, sendAudioMessage, sendTemplateMessage, sendTemplateToSingleContact, sendLocationMessage, io, senderId, messageData, conversationId, pool, axios, getContactInfo, updateContactName, createContact, updateContactCompany, updateConversationState, assignResponsibleUser, processMessage, getReverseGeocoding, getGeocoding, integrationDetails, externalData, clientTimezone, moment);`;

const GroupNode = ({ id, data }) => {
  const [height, setHeight] = useState(data.height || 500); // Estado para la altura del primer div
  const [width, setWidth] = useState(data.width || 600); // Estado para el ancho del primer div

  const updateNodeSize = (newWidth, newHeight) => {
    data.setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              width: newWidth,
              height: newHeight,
            },
          };
        }
        return node;
      })
    );
  };

  const increaseHeight = () => {
    const newHeight = height + 50;
    setHeight(newHeight); // Incrementar altura en 50px
    updateNodeSize(width, newHeight);
  };

  const decreaseHeight = () => {
    const newHeight = Math.max(100, height - 50);
    setHeight(newHeight); // Decrementar altura, mínimo 100px
    updateNodeSize(width, newHeight);
  };

  const increaseWidth = () => {
    const newWidth = width + 50;
    setWidth(newWidth); // Incrementar ancho en 50px
    updateNodeSize(newWidth, height);
  };

  const decreaseWidth = () => {
    const newWidth = Math.max(150, width - 50);
    setWidth(newWidth); // Decrementar ancho, mínimo 150px
    updateNodeSize(newWidth, height);
  };

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, padding: '10px', paddingTop: '25px', paddingBottom: '25px', border: '1px solid #b1b1b1', borderRadius: '15px', background: '#fff', boxShadow: '0px 0px 20px #7a7a7a', position: 'relative' }}>
      <div className="node group" style={{ border: '2px solid #d033b9', padding: '10px', borderRadius: '5px', position: 'relative' }}>
        <Handle type="target" position="top" style={{ top: '-30px', background: 'gray' }} />
        <div>{data.label}</div>
        <Handle type="source" id='a' position="bottom" />
        <button
          onClick={() => data.onAddClick(id)}
          className="btn btn-primary"
          style={{
            position: 'absolute',
            bottom: '-15px', // Ajuste de la posición vertical
            left: '50%',
            transform: 'translateX(-50%)',
            width: '28px', // Ajuste del ancho del botón
            height: '28px', // Ajuste de la altura del botón
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span style={{ lineHeight: '1', fontSize: '16px', marginBottom: '4px' }}>+</span>
        </button>
        <Handle type="source" id='b' position="bottom" style={{ top: `${height - 30}px`, background: 'gray' }} />
        <button
          onClick={() => data.onAddExternalClick(id)}
          className="btn btn-primary"
          style={{
            position: 'absolute',
            bottom: `${-height + 59}px`, // Ajuste de la posición vertical
            left: '50%',
            transform: 'translateX(-50%)',
            width: '28px', // Ajuste del ancho del botón
            height: '28px', // Ajuste de la altura del botón
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span style={{ lineHeight: '1', fontSize: '16px', marginBottom: '4px' }}>+</span>
        </button>
      </div>
      <div style={{ position: 'absolute', top: '10px', left: '-40px', display: 'flex', flexDirection: 'column' }}>
        <button
          onClick={decreaseHeight}
          className="btn button-custom p-0 m-1"
        >
        <ArrowUpCircle />
        </button>
        <button
          onClick={increaseHeight}
          className="btn button-custom p-0 m-1"
        >
        <ArrowDownCircle />
        </button>
        <button
          onClick={increaseWidth}
          className="btn button-custom p-0 m-1"
        >
        <ArrowRightCircle />
        </button>
        <button
          onClick={decreaseWidth}
          className="btn button-custom p-0 m-1"
        >
        <ArrowLeftCircle />
        </button>
      </div>
    </div>
  );
};


const nodeTypes = {
  custom: ({ id, data }) => (
    <div style={{ position: 'relative', padding: '10px', paddingTop: '25px', paddingBottom: '25px', border: '1px solid #b1b1b1', borderRadius: '15px', background: '#fff', boxShadow: '0px 0px 20px #7a7a7a' }}>
      <Handle style={{ background: 'gray' }} type="target" position="top" />
      <div>{data.label}</div>
      <Handle type="source" position="bottom" />
      <button
        onClick={() => data.onAddClick(id)}
        className="btn btn-primary"
        style={{
          position: 'absolute',
          bottom: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <span style={{ lineHeight: '1', fontSize: '16px', marginBottom: '4px' }}>+</span>
      </button>
      {data.tipo && (<div style={{ position: 'absolute', top: '10px', left: '-40px', display: 'flex', flexDirection: 'column' }}>
      <button
        onClick={() => data.editarNodo(id, data.tipo, data)}
        className="btn button-custom p-0 m-1"
      >
      <PencilSquare />
      </button>
      </div>)}
    </div>
    
  ),
  conditional: ({ id, data }) => (
    <div style={{position: 'relative', padding: '10px', paddingTop: '25px', paddingBottom: '25px', border: '1px solid #b1b1b1', borderRadius: '15px', background: '#fff', boxShadow: '0px 0px 20px #7a7a7a' }}>
      <Handle type="target" position="top" />
      <div>{data.label}</div>
      <Handle type="source" position="bottom" id="a" style={{ left: '25%' }} />
      <Handle type="source" position="bottom" id="b" style={{ left: '75%' }} />
      <div style={{ position: 'absolute', top: '10px', left: '-40px', display: 'flex', flexDirection: 'column' }}>
      <button
        onClick={() => data.editarNodo(id, data.tipo, data)}
        className="btn button-custom p-0 m-1"
      >
      <PencilSquare />
      </button>
      </div>
    </div>
  ),
  switch: ({ id, data }) => (
    <div style={{ position: 'relative', padding: '10px', paddingTop: '25px', paddingBottom: '25px', border: '1px solid #b1b1b1', borderRadius: '15px', background: '#fff', boxShadow: '0px 0px 20px #7a7a7a' }}>
      <Handle type="target" position="top" />
      <div>{data.label}</div>
      <Handle type="source" position="bottom" id="default" style={{ left: '50%' }} />
      <button
        onClick={() => data.addCaseNode(id)}
        className="btn btn-primary"
        style={{
          position: 'absolute',
          bottom: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <span style={{ lineHeight: '1', fontSize: '16px', marginBottom: '4px' }}>+</span>
      </button>
      <div style={{ position: 'absolute', top: '10px', left: '-40px', display: 'flex', flexDirection: 'column' }}>
      <button
        onClick={() => data.editarNodo(id, data.tipo, data)}
        className="btn button-custom p-0 m-1"
      >
      <PencilSquare />
      </button>
      </div>
    </div>
  ),
  caseNode: GroupNode,
  groupNode: GroupNode,
};

const EditChatBotModal = ({ show, handleClose, bot }) => {
  const [selectedTab, setSelectedTab] = useState('Diagrama');
  const [code, setCode] = useState('');
  const [nodes, setNodes, onNodesChangeState] = useNodesState([]);
  const [edges, setEdges, onEdgesChangeState] = useEdgesState([]);
  const [variables, setVariables] = useState([{ name: 'Seleccione variable', displayName: 'Seleccione variable' },
    {name: 'currentTime', displayName: 'Ahora'},
    {name: 'messageData.text', displayName: 'Mensaje de Texto'},
    {name: 'conversationState', displayName: 'Estado de la conversación'},
    {name: 'responsibleUserId', displayName: 'Responsable de la conversación'},
    { name: 'contactInfo', displayName: 'Información del contacto' },
    { name: 'contactInfo.first_name', displayName: 'Nombre del contacto' },
    { name: 'contactInfo.last_name', displayName: 'Apellido del contacto' },
    { name: 'contactInfo.phone_number', displayName: 'Número del contacto' },
    { name: 'contactInfo.organization', displayName: 'Organización' },
    { name: 'contactInfo.profile_url', displayName: 'Foto perfil' },
    { name: 'contactInfo.edad_approx', displayName: 'Edad aproximada' },
    { name: 'contactInfo.fecha_nacimiento', displayName: 'Fecha de nacimiento' },
    { name: 'contactInfo.nacionalidad', displayName: 'Nacionalidad' },
    { name: 'contactInfo.ciudad_residencia', displayName: 'Ciudad de residencia' },
    { name: 'contactInfo.direccion_completa', displayName: 'Dirección completa' },
    { name: 'contactInfo.email', displayName: 'Email' }]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('==');
  const [comparisonValue, setComparisonValue] = useState('');
  const [currentParentId, setCurrentParentId] = useState(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [currentSwitchNode, setCurrentSwitchNode] = useState(null);
  const [conditions, setConditions] = useState([{ variable: '', operator: '==', value: '', logicalOperator: '' }]);
  const [showResponseTextModal, setShowResponseTextModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseTextName, setResponseTextName] = useState('');
  const [showUpdateStateModal, setShowUpdateStateModal] = useState(false);
  const [newState, setNewState] = useState('');
  const [concatVariables, setConcatVariables] = useState([{ variable: '', validateExistence: false }]);
  const [concatResultName, setConcatResultName] = useState('');
  const [showConcatVariablesModal, setShowConcatVariablesModal] = useState(false);
  const [selectedVariables, setSelectedVariables] = useState([]);
  const [showGptAssistantModal, setShowGptAssistantModal] = useState(false);
  const [assistantName, setAssistantName] = useState('');
  const [gptModel, setGptModel] = useState('gpt-3.5-turbo');
  const [personality, setPersonality] = useState('');
  const [assistants, setAssistants] = useState([{ name: 'Seleccionar asistente', displayName: 'Seleccionar asistente' }]);
  const [showGptQueryModal, setShowGptQueryModal] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [queryName, setQueryName] = useState('');
  const [queryPrompt, setQueryPrompt] = useState('');
  const [showSplitVariableModal, setShowSplitVariableModal] = useState(false);
  const [splitVariable, setSplitVariable] = useState('');
  const [splitParameter, setSplitParameter] = useState('');
  const [splitResultNames, setSplitResultNames] = useState(['']);
  const [showUpdateContactNameModal, setShowUpdateContactNameModal] = useState(false);
  const [selectedFirstName, setSelectedFirstName] = useState('');
  const [selectedLastName, setSelectedLastName] = useState('');
  const [showUpdateContactModal, setShowUpdateContactModal] = useState(false);
  const [selectedContactField, setSelectedContactField] = useState('');
  const [selectedContactVariable, setSelectedContactVariable] = useState('');
  const [showUpdateContactInitializerModal, setShowUpdateContactInitializerModal] = useState(false);
  const [showChangeResponsibleModal, setShowChangeResponsibleModal] = useState(false);
  const [responsibles, setResponsibles] = useState([]);
  const [selectedResponsible, setSelectedResponsible] = useState('');
  const [showResponseImageModal, setShowResponseImageModal] = useState(false);
  const [responseImage, setResponseImage] = useState('');
  const [responseImageName, setResponseImageName] = useState('');
  const [showResponseVideoModal, setShowResponseVideoModal] = useState(false);
  const [responseVideo, setResponseVideo] = useState('');
  const [responseVideoName, setResponseVideoName] = useState('');
  const [responseVideoDuration, setResponseVideoDuration] = useState('');
  const [responseVideoThumbnail, setResponseVideoThumbnail] = useState('');
  const [showResponseTemplateModal, setShowResponseTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variableValues, setVariableValues] = useState({});
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [phases, setPhases] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [showResponseDocumentModal, setShowResponseDocumentModal] = useState(false);
  const [responseDocument, setResponseDocument] = useState('');
  const [responseDocumentName, setResponseDocumentName] = useState('');
  const [showResponseAudioModal, setShowResponseAudioModal] = useState(false);
  const [responseAudio, setResponseAudio] = useState('');
  const [responseAudioName, setResponseAudioName] = useState('');
  const [showResponseLocationModal, setShowResponseLocationModal] = useState(false);
  const [locationLatitude, setLocationLatitude] = useState('');
  const [locationLongitude, setLocationLongitude] = useState('');
  const [locationStreetName, setLocationStreetName] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [validateExistence, setValidateExistence] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [requestData, setRequestData] = useState([{ key: '', value: '' }]);
  const [validationCondition, setValidationCondition] = useState('');
  const [nuevoStatus, setNuevoStatus] = useState('');
  const [validationConditions, setValidationConditions] = useState([{ key: '', value: '' }]);
  const [showExternalRequestModal, setShowExternalRequestModal] = useState(false);
  const [externalServiceName, setExternalServiceName] = useState('');
  const [externalServiceUrl, setExternalServiceUrl] = useState('');
  const [externalCredentials, setExternalCredentials] = useState([{ key: '', value: '' }]);
  const [externalRequests, setExternalRequests] = useState([]);
  const [credentialsLocation, setCredentialsLocation] = useState('headers');
  const [showSendRequestModal, setShowSendRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [externalDataItems, setExternalDataItems] = useState([{ variableName: '', dataPath: '' }]);
  const [showExternalDataModal, setShowExternalDataModal] = useState(false);
  const [intentions, setIntentions] = useState([]);
  const [currentIntention, setCurrentIntention] = useState({ name: '', states: [] });
  const [currentState, setCurrentState] = useState({ state: '', description: '' });
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [isInternal, setIsInternal] = useState(true);
  const [showContextModal, setShowContextModal] = useState(false);
  const [messageCount, setMessageCount] = useState(5); // Default to 5 messages
  const [selectAllMessages, setSelectAllMessages] = useState(false);
  const [currentEditingNodeId, setCurrentEditingNodeId] = useState(null);
  const [editMode, setEditMode] = useState(false); // Nuevo estado para editar
  const [selectedIntentionIndex, setSelectedIntentionIndex] = useState(null); // Índice de la intención seleccionada para edición
  const [selectedStateIndex, setSelectedStateIndex] = useState(null); // Índice del estado seleccionado para edición
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [agenda, setAgenda] = useState(null);
  const [selectedEntityType, setSelectedEntityType] = useState([]); // Almacena las selecciones de "Tipo de entidad"
  const [selectedQueryParams, setSelectedQueryParams] = useState([]); // Almacena las selecciones de "Parámetro de consulta"
  const [searchData, setSearchData] = useState({}); // Almacena los datos de búsqueda
  const [roles, setRoles] = useState([]); // Almacena los roles consultados
  const [selectedRole, setSelectedRole] = useState(''); // Almacena el rol seleccionado
  const [startDate, setStartDate] = useState({ type: '', value: '' });
  const [endDate, setEndDate] = useState({ type: '', value: '' });
  const [customStartDays, setCustomStartDays] = useState('');
  const [customEndDays, setCustomEndDays] = useState('');
  const [customStartMonths, setCustomStartMonths] = useState('');
  const [customEndMonths, setCustomEndMonths] = useState('');
  const [customStartYears, setCustomStartYears] = useState('');
  const [customEndYears, setCustomEndYears] = useState('');
  const [selectedStartVariable, setSelectedStartVariable] = useState('');
  const [selectedEndVariable, setSelectedEndVariable] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [showGetRequestModal, setShowGetRequestModal] = useState(false);
  const [getRequestType, setGetRequestType] = useState('');
  const [getRequestStatus, setGetRequestStatus] = useState('');
  const [getValidationConditions, setGetValidationConditions] = useState([{ key: '', value: '' }]);
  const [getRequestDataKeys, setGetRequestDataKeys] = useState([{ key: '' }]);
  // Controla la visibilidad del modal del nuevo elemento Crear Retardo
  const [showDelayModal, setShowDelayModal] = useState(false);

  // Almacena el valor del tiempo del retardo
  const [delayTime, setDelayTime] = useState(0);

  // Almacena la unidad de medida (Segundos, Minutos, Horas)
  const [delayUnit, setDelayUnit] = useState('Segundos');
  const [showSendMessageModal, setShowSendMessageModal] = useState(false); // Controla el modal de envío
  const [selectedRecipientType, setSelectedRecipientType] = useState(''); // Controla el tipo de destinatario
  const [selectedRecipient, setSelectedRecipient] = useState(''); // Controla el destinatario seleccionado
  const [recipients, setRecipients] = useState({ users: [], colaboradores: [], contacts: [], variables: [] }); // Almacena los datos de destinatarios
  const [messageText, setMessageText] = useState(''); // Texto del mensaje
  const [showAgendarModal, setShowAgendarModal] = useState(false);
  const [limitType, setLimitType] = useState('fixed'); // 'fixed' o 'variable'
  const [eventCount, setEventCount] = useState(''); // Número de eventos (si es fijo)
  const [maxEvents, setMaxEvents] = useState(''); // Máximo permitido (si es variable)
  const [limitVariable, setLimitVariable] = useState(''); // Variable que determina el límite (si es variable)
  const [eventFields, setEventFields] = useState([]); // Variables seleccionadas para los eventos
  const [validateAvailability, setValidateAvailability] = useState(false);
  
const openToolModal = (nodeId, isInternal) => {
  setCurrentNodeId(nodeId);
  setIsInternal(isInternal); // Nuevo estado para saber si es interno o externo
  setShowToolModal(true);
};

const closeToolModal = () => {
  setShowToolModal(false);
  setCurrentNodeId(null);
};

  const contactFields = [
    { name: 'first_name', displayName: 'Nombre' },
    { name: 'last_name', displayName: 'Apellido' },
    { name: 'organization', displayName: 'Compañía' },
    { name: 'label', displayName: 'Etiqueta' },
    { name: 'observaciones_agente', displayName: 'Observaciones del agente' },
    { name: 'edad_approx', displayName: 'Edad Aproximada' },
    { name: 'genero', displayName: 'Género' },
    { name: 'orientacion_sexual', displayName: 'Orientación Sexual' },
    { name: 'fecha_nacimiento', displayName: 'Fecha de Nacimiento' },
    { name: 'direccion_completa', displayName: 'Dirección Completa' },
    { name: 'ciudad_residencia', displayName: 'Ciudad de Residencia' },
    { name: 'nacionalidad', displayName: 'País de Residencia' },
    { name: 'preferencias_contacto', displayName: 'Preferencias de Contacto' },
    { name: 'phone_number', displayName: 'Número de Teléfono' },
    { name: 'email', displayName: 'Email' },
    { name: 'pagina_web', displayName: 'Página Web' },
    { name: 'link_instagram', displayName: 'Instagram' },
    { name: 'link_facebook', displayName: 'Facebook' },
    { name: 'link_linkedin', displayName: 'LinkedIn' },
    { name: 'link_twitter', displayName: 'Twitter' },
    { name: 'link_tiktok', displayName: 'TikTok' },
    { name: 'link_youtube', displayName: 'YouTube' },
    { name: 'nivel_ingresos', displayName: 'Nivel de Ingresos' },
    { name: 'ocupacion', displayName: 'Ocupación' },
    { name: 'nivel_educativo', displayName: 'Nivel Educativo' },
    { name: 'estado_civil', displayName: 'Estado Civil' },
    { name: 'cantidad_hijos', displayName: 'Cantidad de Hijos' },
    { name: 'estilo_de_vida', displayName: 'Estilo de Vida' },
    { name: 'personalidad', displayName: 'Personalidad' },
    { name: 'cultura', displayName: 'Cultura' }
  ];


  useEffect(() => {
    if (bot) {
      const initialCode = bot.codigo || `${baseHeader}\n// Insert generated code here\n${baseFooter}`;
      const codeWithoutWrapper = initialCode.replace(baseHeader, '').replace(baseFooter, '');
      setCode(codeWithoutWrapper.trim());
  
      if (bot.react_flow) {
        const {
          nodes: initialNodesFromCode,
          edges: initialEdgesFromCode,
          variables: initialVariables,
          assistants: initialAssistants = [],
        } = JSON.parse(bot.react_flow);
  
        // Filtra duplicados basados en nombre y displayName
        const uniqueVariables = [
          { name: 'Seleccione variable', displayName: 'Seleccione variable' },
          { name: 'messageData.text', displayName: 'Mensaje de Texto' },
          { name: 'responsibleUserId', displayName: 'Responsable de la conversación' },
          ...initialVariables,
        ].filter(
          (v, index, self) =>
            index === self.findIndex((t) => t.name === v.name && t.displayName === v.displayName)
        );
  
        // Filtrar duplicados para asistentes
        const uniqueAssistants = [
          { name: 'Seleccione asistente', displayName: 'Seleccione asistente' },
          ...initialAssistants,
        ].filter(
          (a, index, self) =>
            index === self.findIndex(
              (t) =>
                t.name === a.name &&
                t.displayName === a.displayName &&
                t.model === a.model &&
                t.personality === a.personality
            )
        );
  
        // Restaurar funciones en nodos después de deserializar
        const restoreNodeFunctions = (nodes) =>
          nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onAddClick: (id) => openToolModal(id, true),
              onAddExternalClick: (id) => openToolModal(id, false),
              addCaseNode: (id) => addCaseNode(id),
              setNodes, // Volver a asignar setNodes
              editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes), // Volver a asignar editarNodo con setNodes
            },
          }));
  
        const nodesWithFunctions = restoreNodeFunctions(initialNodesFromCode);
  
        setNodes(nodesWithFunctions);
        setEdges(initialEdgesFromCode);
        setVariables(uniqueVariables);
        setAssistants(uniqueAssistants);
      }
    }
  }, [bot, setNodes]); // Asegúrate de que setNodes y editarNodo sean dependencias
  
  const randomId = () => {
    // Recoger los ids existentes de los nodos
    const existingIds = nodes.map(node => node.id);
  
    // Función para generar un ID numérico aleatorio
    const generateRandomId = () => Math.floor(Math.random() * 1000000); // Genera un número aleatorio entre 0 y 999999
  
    let newId = generateRandomId();
  
    // Asegurarse de que el nuevo ID no esté en la lista de IDs existentes
    while (existingIds.includes(newId)) {
      newId = generateRandomId(); // Generar un nuevo ID si hay coincidencias
    }
  
    return newId.toString();
  };
  

  const editarNodo = useCallback((id, tipo, datos, setNodes) => {
    console.log('Editar Nodo');
    console.log(`ID del nodo a editar: ${id}`);
    
    setNodes((prevNodes) => {
        const nodoActual = prevNodes.find(node => node.id === id);
        console.log('Nodo encontrado:', nodoActual);
        
        if (!nodoActual) {
            console.warn('Nodo no encontrado');
            return prevNodes; // Retorna el estado actual sin cambios
        }

        // Verifica si los datos del nodo contienen la información esperada
        const { assistantName, gptModel, personality, intentions } = nodoActual.data;

        switch (tipo) {
            case 'gptAssistant':
                if (assistantName && gptModel && personality) {
                    setAssistantName(assistantName);
                    setGptModel(gptModel);
                    setPersonality(personality);
                    setShowGptAssistantModal(true);
                    setCurrentEditingNodeId(id);
                } else {
                    console.warn('Datos del asistente faltantes en el nodo:', nodoActual);
                }
                break;

            case 'queryGpt':
                setSelectedAssistant(nodoActual.data.selectedAssistant || '');
                setQueryName(nodoActual.data.queryName || '');
                setQueryPrompt(nodoActual.data.queryPrompt || '');
                setShowGptQueryModal(true);
                setCurrentEditingNodeId(id);
                break;
            
            case 'sendText':
                setResponseTextName(nodoActual.data.responseTextName || ''); 
                setResponseText(nodoActual.data.responseText || ''); 
                setShowResponseTextModal(true);
                setCurrentEditingNodeId(id);
                break;

            case 'intention':
                const currentIntentions = nodoActual.data.intentions || [];  // Asegura que 'intentions' siempre es un array
                console.log('Intentions:', currentIntentions);
                
                setCurrentIntention(currentIntentions.length > 0 ? currentIntentions[0] : { name: '', states: [] }); // Ajusta el estado de la intención actual con un valor predeterminado
                setEditMode(true);
                setShowIntentionModal(true);
                setCurrentEditingNodeId(id);
                break;

            case 'generateContext':
                const { selectAllMessages, messageCount } = nodoActual.data;
                setSelectAllMessages(selectAllMessages || false);
                setMessageCount(messageCount || 1);
                setShowContextModal(true);
                setCurrentEditingNodeId(id);
                break;

            case 'externalRequest':
                setExternalServiceName(nodoActual.data.externalServiceName || '');
                setExternalServiceUrl(nodoActual.data.externalServiceUrl || '');
                setExternalCredentials(nodoActual.data.externalCredentials || [{ key: '', value: '' }]);
                setCredentialsLocation(nodoActual.data.credentialsLocation || 'headers');
                setShowExternalRequestModal(true);
                setCurrentEditingNodeId(id);
                break;

            case 'fillRequest':
                setRequestType(nodoActual.data.requestType || '');
                setRequestStatus(nodoActual.data.requestStatus || '');
                setNuevoStatus(nodoActual.data.nuevoStatus || '');
                setRequestData(nodoActual.data.requestData || [{ key: '', value: '' }]);
                setValidationConditions(nodoActual.data.validationConditions || [{ key: '', value: '' }]);
                setValidateExistence(nodoActual.data.validateExistence || false);
                setShowRequestModal(true);
                setCurrentEditingNodeId(id);
                break;

            case 'conditional':
                setConditions(nodoActual.data.conditions || [{ variable: '', operator: '==', value: '', logicalOperator: '' }]);
                setShowModal(true);
                setCurrentEditingNodeId(id);
                break;

            case 'switch':
                setSelectedVariable(nodoActual.data.variable || '');  // Recupera la variable seleccionada
                setShowSwitchModal(true);
                setCurrentEditingNodeId(id);
                break;

                case 'agenda':
                  const agendaData = nodoActual.data.agenda || {};
                  console.log('Editando agenda con los siguientes datos:', agendaData);
              
                  if (agendaData) {
                      setAgenda(agendaData);
                      setShowAgendaModal(true);
                      setCurrentEditingNodeId(id);
                  } else {
                      console.warn('Datos de agenda faltantes o inválidos en el nodo:', nodoActual);
                  }
                  break;

            case 'delay':
                setDelayTime(nodoActual.data.delayTime || 0);  // Recupera el tiempo almacenado en el nodo
                setDelayUnit(nodoActual.data.delayUnit || 'Segundos');  // Recupera la unidad de medida
                setShowDelayModal(true);  // Abre el modal de edición
                setCurrentEditingNodeId(id);  // Almacena el ID del nodo que se está editando
                break;
  

            case 'getRequest':
                setGetRequestType(nodoActual.data.getRequestType || '');
                setGetRequestStatus(nodoActual.data.getRequestStatus || '');
                setGetValidationConditions(nodoActual.data.getValidationConditions || [{ key: '', value: '' }]);
                setGetRequestDataKeys(nodoActual.data.getRequestDataKeys || [{ key: '' }]);
                setShowGetRequestModal(true); // Abre el modal de edición
                setCurrentEditingNodeId(id); // Almacena el ID del nodo que se está editando
                break;
              

            default:
                console.warn(`Tipo de nodo no soportado para edición: ${tipo}`);
        }

        return prevNodes; // Devuelve los nodos sin cambios explícitos en esta función
    });
}, []);


  
  

    const handleAddState = () => {
      if (currentState.state && currentState.description) {
          setCurrentIntention(prevIntention => ({
              ...prevIntention,
              states: [...prevIntention.states, currentState]
          }));
          setCurrentState({ state: '', description: '' });
      }
  };


  const handleAddIntention = () => {
    if (currentIntention.name) {
        setIntentions([...intentions, currentIntention]);
        setCurrentIntention({ name: '', states: [] });
    }
};

const handleSaveIntentionModal = () => {
  setShowIntentionModal(false);
  generateCodeForIntentions();
};

const handleEditIntention = (index) => {
  const intentionToEdit = intentions[index];
  setCurrentIntention(intentionToEdit);
  setSelectedIntentionIndex(index);
  setEditMode(true); // Cambiar a modo de edición
  setShowIntentionModal(true); // Mostrar el modal para edición
};

const handleDeleteIntention = (index) => {
  const updatedIntentions = intentions.filter((_, i) => i !== index);
  setIntentions(updatedIntentions);
};

const handleEditState = (index) => {
  const stateToEdit = currentIntention.states[index];
  setCurrentState(stateToEdit);
  setSelectedStateIndex(index);
  setEditMode(true); // Cambiar a modo de edición
};

const handleDeleteState = (index) => {
  const updatedStates = currentIntention.states.filter((_, i) => i !== index);
  setCurrentIntention({ ...currentIntention, states: updatedStates });
};


const generateCodeForIntentions = async () => {
  let codeArray = [];

  // Inicio de la generación de código para las intenciones
  codeArray.push("intentions = [\n");

  intentions.forEach(intention => {
      codeArray.push(`  {\n    name: "${intention.name}",\n    states: [\n`);
      intention.states.forEach(state => {
          codeArray.push(`      { state: "${state.state}", description: "${state.description}" },\n`);
      });
      codeArray.push("    ]\n  },\n");
  });

  codeArray.push("];\n");

  // Generar código para la lógica de evaluación de intenciones usando GPT en partes
  codeArray.push(`
  async function evalIntentionGPT(prompt) {
      apiKey = process.env.OPENAI_API_KEY;
      url = "https://api.openai.com/v1/chat/completions";
      headers = {
          'Authorization': \`Bearer \${apiKey}\`,
          'Content-Type': 'application/json'
      };
      payload = {
          model: "gpt-4o",
          messages: [
              { role: "system", content: \`Compruebas la intención que tiene un cliente con el mensaje que envía. Tienes una lista de intenciones y estados con su descripción. Respondes a las consultas únicamente con la intención y el estado en esta estructura intención,estado, sin paréntesis, espacios adicionales, o cualquier otro carácter. Solo puedes devolver intenciones y estados que existan en las listas proporcionadas, quiero que la respuesta sea exactamente como en la lista que recibes de estados e intenciones, no inventes nombres, ponle exactamente el nombre que se encuentra en la lista. Si no hay coincidencia, responde "null".\` },
              { role: "user", content: prompt }
          ]
      };
      try {
          responseGpt = await axios.post(url, payload, { headers });
          gptResponse = responseGpt.data.choices[0].message.content.trim();
          console.log(\`Respuesta de GPT: \${gptResponse}\`); // Log para depuración
          return gptResponse;
      } catch (error) {
          console.error("Error al obtener respuesta de GPT:", error);
          return "Error al obtener la respuesta";
      }
  }

  async function evaluateIntentions(conversationState, messageText) {
      return new Promise(async (resolve, reject) => {
          let prompt, result;

          console.log(\`Evaluando intenciones para el estado: \${conversationState} y mensaje: "\${messageText}"\`);
          console.log("Intenciones y estados enviados a GPT:", JSON.stringify(intentions, null, 2));

          // Primera consulta: Evaluar estado actual dentro de su intención
          const currentState = intentions.flatMap(i => i.states).find(s => s.state === conversationState);
          if (currentState) {
              prompt = \`El estado actual es "\${conversationState}" y el mensaje del cliente es "\${messageText}". Evalúa si el mensaje coincide con esta descripción: "\${currentState.description}". Devuelve solo los valores de intención y estado en el formato intención,estado sin espacios adicionales, paréntesis, o cualquier otro carácter. Si no hay coincidencia, responde "null". Los únicos valores válidos para intención son: \${intentions.map(i => i.name).join(", ")}. Los únicos valores válidos para estado son: \${intentions.flatMap(i => i.states).map(s => s.state).join(", ")}.\`;
              result = await evalIntentionGPT(prompt);
              console.log(\`Resultado de la primera consulta: \${result}\`);
          }

          // Si el resultado es nulo o inválido, proceder a la segunda consulta
          if (!result || result === "null") {
              const currentIntention = intentions.find(i => i.states.some(s => s.state === conversationState));
              if (currentIntention) {
                  prompt = \`El mensaje del cliente es "\${messageText}". Evalúa si coincide con alguna de estas descripciones: \${currentIntention.states.map(s => \`"\${s.description}"\`).join(", ")}. Devuelve solo los valores de intención y estado en el formato intención,estado sin espacios adicionales, paréntesis, o cualquier otro carácter. Si no hay coincidencia, responde "null". Los únicos valores válidos para intención son: \${currentIntention.name}. Los únicos valores válidos para estado son: \${currentIntention.states.map(s => s.state).join(", ")}.\`;
                  result = await evalIntentionGPT(prompt);
                  console.log(\`Resultado de la segunda consulta: \${result}\`);
              }
          }

          // Si todavía no coincide, proceder a la tercera consulta
          if (!result || result === "null") {
              prompt = \`El mensaje del cliente es "\${messageText}". Evalúa si coincide con alguna de estas intenciones y estados:\n\`;
              intentions.forEach(intention => {
                  prompt += \`Intención: \${intention.name}\n\`;
                  intention.states.forEach(state => {
                      prompt += \`  - Estado: \${state.state}, Descripción: \${state.description}\n\`;
                  });
              });
              prompt += \`Devuelve solo los valores de intención y estado en el formato intención,estado sin espacios adicionales, paréntesis, o cualquier otro carácter. Si no hay coincidencia, responde "null". Los únicos valores válidos para intención son: \${intentions.map(i => i.name).join(", ")}. Los únicos valores válidos para estado son: \${intentions.flatMap(i => i.states).map(s => s.state).join(", ")}.\`;
              result = await evalIntentionGPT(prompt);
              console.log(\`Resultado de la tercera consulta: \${result}\`);
          }

          // Manejar el resultado final
          handleResult(result);
          resolve();
      });
  }

  function handleResult(result) {
      if (!result || result === "null" || !result.includes(",")) {
          console.log("No se encontró ninguna intención o estado relevante o el formato es incorrecto.");
          return;
      }

      const [Intent, newConversationState] = result.split(",").map(s => s.trim());

      if (!Intent || !newConversationState) {
          console.log("El formato del resultado no es válido.");
          return;
      }

      // Validar intención y estado contra los valores válidos
      const validIntentions = intentions.map(i => i.name);
      const validStates = intentions.flatMap(i => i.states).map(s => s.state);

      if (!validIntentions.includes(Intent) || !validStates.includes(newConversationState)) {
          console.log("Intención o estado inválido devuelto por GPT.");
          console.log(\`Intención devuelta: \${Intent}, Estado devuelto: \${newConversationState}\`);
          return;
      }

      const validStateForIntention = intentions.find(i => i.name === Intent).states.some(s => s.state === newConversationState);
      if (!validStateForIntention) {
          console.log("El estado devuelto no pertenece a la intención devuelta.");
          return;
      }

      conversationState = newConversationState;
      console.log(\`Nueva intención: \${Intent}, Nuevo estado: \${conversationState}\`);
  }

  let messageText;

  // Verificar si lastMessages está vacía, no existe o es null
  if (!lastMessages || lastMessages.length === 0) {
      messageText = messageData.text;  // Usa messageText si lastMessages no existe, está vacía o es null
  } else {
      messageText = lastMessages[lastMessages.length - 1];  // Usa el último mensaje en lastMessages
  }

  // Esperar a que se complete la evaluación de intenciones antes de proceder
  await evaluateIntentions(conversationState, messageText);

  console.log(\`Estado inicial para el switch: \${conversationState}\`);

  `);

  let updatedNodes, updatedEdges;

  if (currentEditingNodeId) {
    console.log("editando nodo");
      // Si estamos editando un nodo existente
      updatedNodes = nodes.map(node => {
          if (node.id === currentEditingNodeId) {
              return {
                  ...node,
                  data: {
                      ...node.data,
                      label: `Intenciones`,
                      code: codeArray,
                      intentions: intentions || [],
                      tipo: 'intention',
                  },
              };
          }
          return node;
      });
      updatedEdges = edges; // Mantén las aristas actuales
      setCurrentEditingNodeId(null);
  } else {
    console.log("creando nuevo nodo");
      // Si estamos creando un nuevo nodo
      const newId = randomId();
      const newNode = {
          id: newId,
          type: 'custom',
          position: { x: Math.random() * 250, y: Math.random() * 250 },
          data: {
              label: `Intenciones`,
              code: codeArray,
              intentions: intentions || [], // Asegúrate de que intentions siempre esté definida
              tipo: 'intention', // Añade el tipo para identificación
              onAddClick: (id) => openToolModal(id, true),
              onAddExternalClick: (id) => openToolModal(id, false),
              editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
          },
          parentId: isInternal ? currentNodeId : null,
      };

      // Creación de la nueva arista (edge)
      let newEdge;
      if (isInternal) {
          newEdge = {
              id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
              source: newNode.parentId || `${nodes.length}`,
              target: newNode.id,
              animated: true,
              style: { stroke: '#d033b9' },
              zIndex: 10,
              markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#d033b9',
              },
          };
      } else {
          newEdge = {
              id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
              source: newNode.parentId || `${nodes.length}`,
              target: newNode.id,
              animated: true,
              sourceHandle: 'b',
              style: { stroke: '#d033b9' },
              zIndex: 10,
              markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#d033b9',
              },
          };
      }

      updatedNodes = [...nodes, newNode];
      updatedEdges = [...edges, newEdge];
  }

  setNodes(updatedNodes);
  setEdges(updatedEdges);
};


    const handleAddExternalData = () => {
      setExternalDataItems([...externalDataItems, { variableName: '', dataPath: '' }]);
    };

    const handleExternalDataChange = (index, field, value) => {
      const updatedItems = [...externalDataItems];
      updatedItems[index][field] = value;
      setExternalDataItems(updatedItems);
    };

    const handleExternalDataSave = () => {
      const variablesToAdd = externalDataItems.map(item => {
        return `const ${item.variableName} = externalData.${item.dataPath};`;
      }).join('\n');
      const newId = randomId();
      // Crear el nuevo nodo y actualizar el flujo
      const newNode = {
        id: newId,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: {
          label: `Agregar Datos Externos`,
          code: [variablesToAdd],
          onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
        },
        parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

      // Crear las nuevas variables con el formato requerido
      const newVariables = externalDataItems.map(item => ({
        name: item.variableName,
        displayName: item.variableName,
        nodeId: newNode.id,
      }));

      const updatedNodes = [...nodes, newNode];
      const updatedEdges = [...edges, newEdge];
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setVariables((vars) => [...vars, ...newVariables]); // Actualiza el estado de las variables con el nuevo formato
      setShowExternalDataModal(false);
    };

    // Fetch departments on component mount or when showUpdateContactModal is set to true
    useEffect(() => {
      if (showUpdateContactModal) {
        const fetchDepartments = async () => {
          const companyId = localStorage.getItem("company_id");
          try {
            const departmentsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/departments/${companyId}`);
            setDepartments(departmentsResponse.data);
          } catch (error) {
            console.error('Error fetching departments:', error);
          }
        };
        fetchDepartments();
      }
    }, [showUpdateContactModal]);

    const addExternalRequestNode = () => {
      setShowExternalRequestModal(true);
    };

    const handleExternalRequestModalSave = () => {
      const functionName = `sendRequestTo${externalServiceName}`;
      const credentialsCode = externalCredentials
        .map(cred => `const ${cred.key} = "${cred.value}";`)
        .join('\n');
    
      let externalRequestCode = `
      async function ${functionName}(requestId) {
        console.log("Enviando solicitud a ${externalServiceName}");
        try {
          requestQueryExternal = 'SELECT * FROM requests WHERE request_id = $1';
          requestResultExternal = await pool.query(requestQueryExternal, [requestId]);
          requestDataExternal = requestResultExternal.rows[0];
      `;
    
      if (credentialsLocation === 'headers') {
        externalRequestCode += `
          headersRequest = {
            ${externalCredentials.map(cred => `"${cred.key}": "${cred.value}"`).join(',\n')}
          };
    
          responseExternal = await axios.post('${externalServiceUrl}', requestData, {
            headers: headersRequest
          });
        `;
      } else if (credentialsLocation === 'body') {
        externalRequestCode += `
          credentialsRequest = {
            ${externalCredentials.map(cred => `${cred.key}: "${cred.value}"`).join(',\n')}
          };
    
          responseExternal = await axios.post('${externalServiceUrl}', {...requestData, ...credentialsRequest});
        `;
      }
    
      externalRequestCode += `
        if (responseExternal.status === 200) {
          updateStatusQuery = 'UPDATE requests SET status = $1 WHERE request_id = $2';
          await pool.query(updateStatusQuery, ['enviada', requestId]);
        }
      } catch (error) {
        console.error("Error al enviar la solicitud a ${externalServiceName}:", error);
      }
    }
    `;
    
      let updatedNodes, updatedEdges;
    
      if (currentEditingNodeId) {
        // Si estamos editando un nodo existente
        updatedNodes = nodes.map(node => {
          if (node.id === currentEditingNodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: `Crear Solicitud Externa: ${externalServiceName}`,
                code: [externalRequestCode],
                externalServiceName,
                externalServiceUrl,
                externalCredentials,
                credentialsLocation,
                tipo: 'externalRequest',
              },
            };
          }
          return node;
        });
        updatedEdges = edges; // Mantén las aristas actuales
        setCurrentEditingNodeId(null);
      } else {
        // Si estamos creando un nuevo nodo
        const newId = randomId();
        const newNode = {
          id: newId,
          type: 'custom',
          position: { x: Math.random() * 250, y: Math.random() * 250 },
          data: {
            label: `Crear Solicitud Externa: ${externalServiceName}`,
            code: [externalRequestCode],
            externalServiceName,
            externalServiceUrl,
            externalCredentials,
            credentialsLocation,
            tipo: 'externalRequest', // Añade el tipo para identificación
            onAddClick: (id) => openToolModal(id, true),
            onAddExternalClick: (id) => openToolModal(id, false),
            editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
          },
          parentId: isInternal ? currentNodeId : null,
        };
    
        let newEdge;
        if (isInternal) {
          newEdge = {
            id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
            source: newNode.parentId || `${nodes.length}`,
            target: newNode.id,
            animated: true,
            style: { stroke: '#d033b9' },
            zIndex: 10,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#d033b9',
            },
          };
        } else {
          newEdge = {
            id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
            source: newNode.parentId || `${nodes.length}`,
            target: newNode.id,
            animated: true,
            sourceHandle: 'b',
            style: { stroke: '#d033b9' },
            zIndex: 10,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#d033b9',
            },
          };
        }
    
        updatedNodes = [...nodes, newNode];
        updatedEdges = [...edges, newEdge];
      }
    
      setNodes(updatedNodes);
      setEdges(updatedEdges);
    
      // Guardar el nombre del servicio en un arreglo de solicitudes externas
      setExternalRequests((reqs) => [...reqs, { name: externalServiceName, url: externalServiceUrl }]);
    
      generateCodeFromNodes(updatedNodes, updatedEdges);
      setShowExternalRequestModal(false);
      setExternalServiceName('');
      setExternalServiceUrl('');
      setExternalCredentials([{ key: '', value: '' }]);
      setCredentialsLocation('headers'); // Reset to default
    };
    

    const handleAddRequestComponent = () => {
      if (!selectedService) return;

      const functionName = `sendRequestTo${selectedService}`;
      const newId = randomId();
      const newNode = {
        id: newId,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: { label: `Enviar Solicitud a: ${selectedService}`, code: [`await ${functionName}(requestId);`], onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false) },
        parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

      const updatedNodes = [...nodes, newNode];
      const updatedEdges = [...edges, newEdge];

      setNodes(updatedNodes);
      setEdges(updatedEdges);
      generateCodeFromNodes(updatedNodes, updatedEdges);
      setShowSendRequestModal(false);
      setSelectedService('');
    };

    // Fetch phases when a department is selected
    useEffect(() => {
      if (selectedDepartment) {
        const fetchPhases = async () => {
          try {
            const phasesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/departments/${selectedDepartment}/phases`);
            setPhases(phasesResponse.data);
          } catch (error) {
            console.error('Error fetching phases:', error);
          }
        };
        fetchPhases();
      } else {
        setPhases([]);
      }
    }, [selectedDepartment]);

    const fetchResponsibles = async () => {
      const companyId = localStorage.getItem("company_id");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?company_id=${companyId}`);
        setResponsibles(response.data);
      } catch (error) {
        console.error('Error fetching responsibles:', error);
      }
    };

  const handleSave = async () => {
    try {
      const fullCode = `${baseHeader}\n${code}\n${baseFooter}`;
      const reactFlowData = JSON.stringify({ nodes, edges, variables, assistants });
      await axios.put(`${process.env.REACT_APP_API_URL}/api/bots/${bot.id_usuario}`, { codigo: fullCode, react_flow: reactFlowData });
      handleClose();
    } catch (error) {
      console.error('Error updating bot code:', error);
    }
  };

  const handleEdgeUpdate = (oldEdge, newConnection) => {
    console.log("Actualizando líneas");

    // Actualizar la lista de edges con la nueva conexión
    setEdges((eds) => eds.map((edge) => {
        if (edge.id === oldEdge?.id) {
            return newConnection;
        }
        return edge;
    }));

    // Actualizar el parentId en función del handle de la conexión
    setNodes((nds) => nds.map((node) => {
        if (node.id === newConnection.target) {
            
            // Si el handle es 'b', eliminar el parentId
            if (newConnection.sourceHandle === 'b') {
                return {
                    ...node,
                    parentId: null,
                };
            }
            // Si el handle es no es 'b', asignar parentId
            else{
              return {
                ...node,
                parentId: newConnection.source,
            };
            }
        }
        return node;
    }));
};



  const handleEdgeDelete = (edgeToDelete) => {
    console.log(`Nodos:`, nodes);
  
    // Eliminar el edge seleccionado
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeToDelete.id));
  
    // Actualizar los nodos después de la eliminación del edge
    setNodes((nds) => {
      // Si el nodo hijo está conectado por el edge eliminado
      const updatedNodes = nds.map((node) => {
        if (node.id === edgeToDelete.target) {
          return {
            ...node,
            parentId: null, // Restablecer parentId a null si el edge es eliminado
          };
        }
        return node;
      });
  
      // Verificar si solo queda un nodo o si el currentNodeId está en el nodo eliminado
      if (updatedNodes.length === 1 || currentNodeId === edgeToDelete.target) {
        setCurrentNodeId(null); // Restablecer currentNodeId a null si es necesario
      }
  
      return updatedNodes;
    });
  };
  
  

  const onConnect = (params) => {
    const { source, sourceHandle, target, targetHandle } = params;

    // Detectar si la conexión es al handle 'b' (externo)
    const isConnectingToB = sourceHandle === 'b';

    // Crear un nuevo edge basado en el handle de destino
    const newEdge = {
        id: `e${source}-${target}`,
        source,
        target,
        sourceHandle: isConnectingToB ? 'b' : 'a',
        animated: true,
        style: { stroke: '#d033b9' },
        zIndex: 10,
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#d033b9',
        },
    };
    handleEdgeUpdate(null, newEdge);

    // Agregar el edge independientemente de si es interno o externo
    const updatedEdges = [...edges, newEdge];
    setEdges(updatedEdges);
};



  const onEdgeUpdate = (oldEdge, newConnection) => {
    handleEdgeUpdate(oldEdge, newConnection);
  };

  const onEdgeDelete = (edgeToDelete) => {
    handleEdgeDelete(edgeToDelete);
  };


  const onElementsRemove = useCallback(
    (elementsToRemove) => {
      const nodeIdsToRemove = elementsToRemove.filter(el => el.id).map(el => el.id);
      setNodes((nds) => applyNodeChanges(nds.filter(node => !nodeIdsToRemove.includes(node.id)), nds));
      setEdges((eds) => applyEdgeChanges(eds.filter(edge => !nodeIdsToRemove.includes(edge.source) && !nodeIdsToRemove.includes(edge.target)), eds));
      setVariables((vars) => vars.filter(varObj => !nodeIdsToRemove.includes(varObj.nodeId)));
    },
    [setNodes, setEdges, setVariables]
  );

  const addConsoleLogNode = () => {
    const message = prompt("Enter the message to print:");
    if (!message) return;
    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: { label: `Imprimir: ${message}`, code: [`console.log(\`${message}\`);`], onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false) },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);
  };

  // Función para manejar la apertura del modal de contexto
  const handleOpenContextModal = () => {
    setShowContextModal(true);
    setMessageCount(5); // Resetea la cantidad de mensajes a 5 por defecto
    setSelectAllMessages(false); // Resetea el checkbox
    setShowToolModal(false);
  };

  // Función para manejar el guardado del modal de contexto
  const handleContextModalSave = () => {
    const numberOfMessages = selectAllMessages ? 'ALL' : messageCount;
    const codeArray = [
      `const getLastMessagesQuery = \`
  (SELECT 'cliente' AS origin, message_text AS text, received_at AS created_at FROM messages WHERE sender_id = $1 AND conversation_fk = $2 ORDER BY received_at DESC LIMIT ${numberOfMessages})
  UNION ALL
  (SELECT 'yo' AS origin, reply_text AS text, created_at FROM replies WHERE sender_id = $1 AND conversation_fk = $2 ORDER BY created_at DESC LIMIT ${numberOfMessages})
  ORDER BY created_at ASC\`;
  
  const messagesRes = await pool.query(getLastMessagesQuery, [senderId, conversationId]);
  const lastMessages = messagesRes.rows.map(row => \`\${row.origin}: \${row.text}\`); // Agregar el origen al mensaje
  console.log('Contexto generado:', lastMessages.join(' '));`
    ];
  
    let updatedNodes, updatedEdges;
  
    if (currentEditingNodeId) {
      // Si estamos editando un nodo existente
      updatedNodes = nodes.map(node => {
        if (node.id === currentEditingNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: `Generar Contexto: ${selectAllMessages ? 'Todos los mensajes' : messageCount + ' mensajes'}`,
              code: codeArray,
              selectAllMessages,
              messageCount,
              tipo: 'generateContext',
            },
          };
        }
        return node;
      });
      updatedEdges = edges; // Mantén las aristas actuales
      setCurrentEditingNodeId(null);
    } else {
      const newId = randomId();
      // Si estamos creando un nuevo nodo
      const newNode = {
        id: newId,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: {
          label: `Generar Contexto: ${selectAllMessages ? 'Todos los mensajes' : messageCount + ' mensajes'}`,
          code: codeArray,
          selectAllMessages,
          messageCount,
          tipo: 'generateContext', // Añade el tipo para identificación
          onAddClick: (id) => openToolModal(id, true),
          onAddExternalClick: (id) => openToolModal(id, false),
          editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
        },
        parentId: null, // Ajusta según sea necesario
      };
  
      // Crear el edge
      let newEdge
      if(isInternal){
        newEdge = {
          id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
          source: newNode.parentId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        };
      }else{
        newEdge = {
          id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
          source: currentNodeId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          sourceHandle: 'b',
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        };
      }
  
      updatedNodes = [...nodes, newNode];
      updatedEdges = [...edges, newEdge];
    }
  
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setVariables((vars) => [...vars, { name: "lastMessages", displayName: "Mensajes con contexto", nodeId: currentEditingNodeId || `${nodes.length + 1}` }]);
    setShowContextModal(false);
  };
  

  const handleConcatVariablesSave = () => {
    const variablesStr = concatVariables
      .map(({ variable, validateExistence }) => validateExistence ? `\${${variable} ? ${variable} : ''}` : `\${${variable}}`)
      .join(' ');

    const concatCode = `const ${concatResultName} = \`${variablesStr}\`;`;
    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: { label: 'Concatenar Variables', code: [concatCode], onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false) },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setVariables((vars) => [...vars, { name: concatResultName, displayName: concatResultName, nodeId: newNode.id }]);
    generateCodeFromNodes(updatedNodes, updatedEdges);
    setShowConcatVariablesModal(false);
    setConcatVariables([{ variable: '', validateExistence: false }]);
    setConcatResultName('');
  };

  const fetchTemplates = async () => {
    const companyId = localStorage.getItem('company_id');
    const token = localStorage.getItem('token');
    if (!companyId || !token) {
      console.error('No company ID or token found');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/templates`, {
        params: { company_id: companyId },
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTemplateModal = () => {
    fetchTemplates();
    setShowResponseTemplateModal(true);
  };

  const addRequestData = () => {
    setRequestData([...requestData, { key: '', value: '' }]);
  };

  const removeRequestData = (index) => {
    setRequestData(requestData.filter((_, i) => i !== index));
  };

  const updateRequestData = (index, field, value) => {
    const newRequestData = [...requestData];
    newRequestData[index][field] = value;
    setRequestData(newRequestData);
  };

  const addValidationCondition = () => {
    setValidationConditions([...validationConditions, { key: '', value: '' }]);
  };

  const removeValidationCondition = (index) => {
    setValidationConditions(validationConditions.filter((_, i) => i !== index));
  };

  const updateValidationCondition = (index, field, value) => {
    const newValidationConditions = [...validationConditions];
    newValidationConditions[index][field] = value;
    setValidationConditions(newValidationConditions);
  };


  const handleRequestModalSave = () => {
    const requestDataObject = requestData.reduce((obj, item) => {
        obj[item.key] = item.value;
        return obj;
    }, {});

    const validationConditionsArray = validationConditions
        .filter(condition => condition.key && condition.value)
        .map(condition => `(request_data->>'${condition.key}') = '${condition.value}'`);

    const validationConditionString = validationConditionsArray.length > 0
        ? ` AND ${validationConditionsArray.join(' AND ')}`
        : '';

    // Cambiar JSON.stringify para usar comillas invertidas en requestData
    const requestDataString = Object.entries(requestDataObject)
    .map(([key, value]) => `"${key}": \`${value}\``)
    .join(', ');

    let code = `requestType = "${requestType}";\n`;
    code += `requestStatus = "${requestStatus}";\n`;
    code += `nuevoStatus = "${nuevoStatus}";\n`;
    code += `requestData = {${requestDataString}};\n`;

    if (validateExistence) {
        code += `
        existingRequestQuery = \`
          SELECT request_id
          FROM requests
          WHERE conversation_id = $1
            AND request_type = $2
            AND status = $3
            AND company_id = $4
            ${validationConditionString};
        \`;
        existingRequestResult = await pool.query(existingRequestQuery, [conversationId, requestType, requestStatus, integrationDetails.company_id]);

        if (existingRequestResult.rows.length > 0) {
          requestId = existingRequestResult.rows[0].request_id;
          updateRequestQuery = \`
            UPDATE requests
            SET request_data = request_data || $1::jsonb,
                request_type = $2,
                status = $3
            WHERE request_id = $4;
          \`;
          await pool.query(updateRequestQuery, [JSON.stringify(requestData), requestType, nuevoStatus, requestId]);
        } else {
          insertRequestQuery = \`
            INSERT INTO requests (company_id, request_type, request_data, conversation_id, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING request_id;
          \`;
          await pool.query(insertRequestQuery, [integrationDetails.company_id, requestType, JSON.stringify(requestData), conversationId, nuevoStatus]);
        }
        `;
    } else {
        code += `
        updateRequestQuery = \`
          UPDATE requests
          SET request_data = request_data || $1::jsonb,
              status = $2,
              request_type = $3
          WHERE conversation_id = $4
            AND request_type = $5
            AND status = $6
            AND company_id = $7
            ${validationConditionString};
        \`;
        await pool.query(updateRequestQuery, [JSON.stringify(requestData), nuevoStatus, requestType, conversationId, requestType, requestStatus, integrationDetails.company_id]);
        `;
    }

    let updatedNodes, updatedEdges;

    if (currentEditingNodeId) {
        // Si estamos editando un nodo existente
        updatedNodes = nodes.map(node => {
            if (node.id === currentEditingNodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: `Llenar Solicitud: ${requestType}`,
                        code: [code],
                        requestType,
                        requestStatus,
                        nuevoStatus,
                        requestData,
                        validationConditions,
                        validateExistence,
                        tipo: 'fillRequest', // Añade el tipo para identificación
                    },
                };
            }
            return node;
        });
        updatedEdges = edges; // Mantén las aristas actuales
        setCurrentEditingNodeId(null);
    } else {
      const newId = randomId();
        // Si estamos creando un nuevo nodo
        const newNode = {
            id: newId,
            type: 'custom',
            position: { x: Math.random() * 250, y: Math.random() * 250 },
            data: {
                label: `Llenar Solicitud: ${requestType}`,
                code: [code],
                requestType,
                requestStatus,
                nuevoStatus,
                requestData,
                validationConditions,
                validateExistence,
                tipo: 'fillRequest', // Añade el tipo para identificación
                onAddClick: (id) => openToolModal(id, true),
                onAddExternalClick: (id) => openToolModal(id, false),
                editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
            },
            parentId: isInternal ? currentNodeId : null,
        };

        let newEdge;
        if (isInternal) {
            newEdge = {
                id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
                source: newNode.parentId || `${nodes.length}`,
                target: newNode.id,
                animated: true,
                style: { stroke: '#d033b9' },
                zIndex: 10,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#d033b9',
                },
            };
        } else {
            newEdge = {
                id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
                source: newNode.parentId || `${nodes.length}`,
                target: newNode.id,
                animated: true,
                sourceHandle: 'b',
                style: { stroke: '#d033b9' },
                zIndex: 10,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#d033b9',
                },
            };
        }

        updatedNodes = [...nodes, newNode];
        updatedEdges = [...edges, newEdge];
    }

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);
    setShowRequestModal(false);
    setValidateExistence(false);
    setRequestType('');
    setRequestStatus('');
    setNuevoStatus('');
    setRequestData([{ key: '', value: '' }]);
    setValidationConditions([{ key: '', value: '' }]);  // Resetear las condiciones de validación
};



  const handleResponseImageModalSave = async () => {
    try {
      // Cargar la imagen al backend
      const formData = new FormData();
      formData.append('image', responseImage);

      const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = uploadResponse.data.imageUrl;
      const uniqueResponseImageName = `responseImage_${nodes.length + 1}`;
      const newId = randomId();
      const newNode = {
        id: newId,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: {
          label: `Enviar Imagen: ${responseImageName}`,
          code: [
            `responseImage = "${imageUrl}";`,
            `await sendImageMessage(io, { body: { phone: senderId, imageUrl: responseImage, conversationId } }, {});`,
          ],
          onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
        },
        parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

      const updatedNodes = [...nodes, newNode];
      const updatedEdges = [...edges, newEdge];
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setVariables((vars) => [...vars, { name: uniqueResponseImageName, displayName: responseImageName, nodeId: newNode.id }]);
      generateCodeFromNodes(updatedNodes, updatedEdges);
      setShowResponseImageModal(false);
      setResponseImage('');
      setResponseImageName('');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleResponseVideoModalSave = async () => {
    try {
      // Cargar el video al backend
      const formData = new FormData();
      formData.append('video', responseVideo);

      const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const videoUrl = uploadResponse.data.videoUrl;
      const videoDuration = uploadResponse.data.videoDuration;
      const videoThumbnail = uploadResponse.data.videoThumbnail;
      const uniqueResponseVideoName = `responseVideo_${nodes.length + 1}`;
      const newId = randomId();
      const newNode = {
        id: newId,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: {
          label: `Enviar Video: ${responseVideoName}`,
          code: [
            `responseVideo = "${videoUrl}";`,
            `videoDuration = "${videoDuration}";`,
            `videoThumbnail = "${videoThumbnail}";`,
            `await sendVideoMessage(io, { body: { phone: senderId, videoUrl: responseVideo, videoDuration, videoThumbnail, conversationId } }, {});`,
          ],
          onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
        },
        parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

      const updatedNodes = [...nodes, newNode];
      const updatedEdges = [...edges, newEdge];
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setVariables((vars) => [...vars, { name: uniqueResponseVideoName, displayName: responseVideoName, nodeId: newNode.id }]);
      generateCodeFromNodes(updatedNodes, updatedEdges);
      setShowResponseVideoModal(false);
      setResponseVideo('');
      setResponseVideoName('');
      setResponseVideoDuration('');
      setResponseVideoThumbnail('');
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const handleResponseDocumentModalSave = async () => {
    try {
      // Cargar el documento al backend
      const formData = new FormData();
      formData.append('document', responseDocument);

      const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const documentUrl = uploadResponse.data.documentUrl;
      const uniqueResponseDocumentName = `responseDocument_${nodes.length + 1}`;
      const newId = randomId();
      const newNode = {
        id: newId,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: {
          label: `Enviar Documento: ${responseDocumentName}`,
          code: [
            `responseDocument = "${documentUrl}";`,
            `await sendDocumentMessage(io, { body: { phone: senderId, documentUrl: responseDocument, conversationId } }, {});`,
          ],
          onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
        },
        parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

      const updatedNodes = [...nodes, newNode];
      const updatedEdges = [...edges, newEdge];
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setVariables((vars) => [...vars, { name: uniqueResponseDocumentName, displayName: responseDocumentName, nodeId: newNode.id }]);
      generateCodeFromNodes(updatedNodes, updatedEdges);
      setShowResponseDocumentModal(false);
      setResponseDocument('');
      setResponseDocumentName('');
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleResponseAudioModalSave = async () => {
    try {
      // Cargar el audio al backend
      const formData = new FormData();
      formData.append('audio', responseAudio);

      const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const audioUrl = uploadResponse.data.audioUrl;
      const uniqueResponseAudioName = `responseAudio_${nodes.length + 1}`;
      const newId = randomId();
      const newNode = {
        id: newId,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: {
          label: `Enviar Audio: ${responseAudioName}`,
          code: [
            `responseAudio = "${audioUrl}";`,
            `await sendAudioMessage(io, { body: { phone: senderId, audioUrl: responseAudio, conversationId } }, {});`,
          ],
          onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
        },
        parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

      const updatedNodes = [...nodes, newNode];
      const updatedEdges = [...edges, newEdge];
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setVariables((vars) => [...vars, { name: uniqueResponseAudioName, displayName: responseAudioName, nodeId: newNode.id }]);
      generateCodeFromNodes(updatedNodes, updatedEdges);
      setShowResponseAudioModal(false);
      setResponseAudio('');
      setResponseAudioName('');
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  const generateCodeForAgenda = async () => {
    let codeArray = [];

// Inicio del periodo
if (startDate.type === 'day') {
  if (startDate.value === 'today') {
    // Caso para "Hoy" (Inicio con la hora actual del cliente)
    codeArray.push(`const startDate = moment.tz('clientTimezone');\n`);
  } else if (startDate.value === 'inDays') {
    // Caso para "En [X] días" (Inicio con 00:00:00 AM)
    codeArray.push(`const startDate = moment.tz('clientTimezone').add(${customStartDays}, 'days').startOf('day');\n`);
  } else if (startDate.value === 'variable') {
    // Caso para "Variable"
    codeArray.push(`const startDate = ${selectedStartVariable};\n`);
  }
}

if (startDate.type === 'month') {
  if (startDate.value === 'thisMonth') {
    // Caso para "Este mes" (Inicio con la hora actual del cliente)
    codeArray.push(`const startDate = moment.tz('clientTimezone');\n`);
  } else if (startDate.value === 'inMonths') {
    // Caso para "En [X] meses" (Primer día del mes actual más X meses con 00:00:00 AM)
    codeArray.push(`const startDate = moment.tz('clientTimezone').add(${customStartMonths}, 'months').startOf('month');\n`);
  } else if (startDate.value === 'variable') {
    // Caso para "Variable"
    codeArray.push(`const startDate = ${selectedStartVariable};\n`);
  }
}

if (startDate.type === 'year') {
  if (startDate.value === 'thisYear') {
    // Caso para "Este año" (Inicio con la hora actual del cliente)
    codeArray.push(`const startDate = moment.tz('clientTimezone');\n`);
  } else if (startDate.value === 'inYears') {
    // Caso para "En [X] años" (Primer día del año actual más X años con 00:00:00 AM)
    codeArray.push(`const startDate = moment.tz('clientTimezone').add(${customStartYears}, 'years').startOf('year');\n`);
  } else if (startDate.value === 'variable') {
    // Caso para "Variable"
    codeArray.push(`const startDate = ${selectedStartVariable};\n`);
  }
}

// Fin del periodo
if (endDate.type === 'day') {
  if (endDate.value === 'today') {
    // Caso para "Hoy" (Fin con las 11:59:59 PM)
    codeArray.push(`const endDate = moment.tz('clientTimezone').endOf('day');\n`);
  } else if (endDate.value === 'inDays') {
    // Caso para "En [X] días" (Fin con las 11:59:59 PM)
    codeArray.push(`const endDate = moment.tz('clientTimezone').add(${customEndDays}, 'days').endOf('day');\n`);
  } else if (endDate.value === 'variable') {
    // Caso para "Variable"
    codeArray.push(`const endDate = ${selectedEndVariable};\n`);
  }
}

if (endDate.type === 'month') {
  if (endDate.value === 'thisMonth') {
    // Caso para "Este mes" (Último día del mes actual con 11:59:59 PM)
    codeArray.push(`const endDate = moment.tz('clientTimezone').endOf('month');\n`);
  } else if (endDate.value === 'inMonths') {
    // Caso para "En [X] meses" (Último día del mes actual más X meses con 11:59:59 PM)
    codeArray.push(`const endDate = moment.tz('clientTimezone').add(${customEndMonths}, 'months').endOf('month');\n`);
  } else if (endDate.value === 'variable') {
    // Caso para "Variable"
    codeArray.push(`const endDate = ${selectedEndVariable};\n`);
  }
}

if (endDate.type === 'year') {
  if (endDate.value === 'thisYear') {
    // Caso para "Este año" (Último día del año actual con 11:59:59 PM)
    codeArray.push(`const endDate = moment.tz('clientTimezone').endOf('year');\n`);
  } else if (endDate.value === 'inYears') {
    // Caso para "En [X] años" (Último día del año actual más X años con 11:59:59 PM)
    codeArray.push(`const endDate = moment.tz('clientTimezone').add(${customEndYears}, 'years').endOf('year');\n`);
  } else if (endDate.value === 'variable') {
    // Caso para "Variable"
    codeArray.push(`const endDate = ${selectedEndVariable};\n`);
  }
}

if (startDate.type === 'custom') {
  codeArray.push(`
  const dateArray = [${customStartDate}];
  `);
} else {
  // Generar arreglo de todas las fechas entre inicio y fin
  codeArray.push(`
  const generateDateArray = (startDate, endDate) => {
    const dateArray = [];
    let currentDate = moment(startDate).startOf('day');
  
    while (currentDate.isSameOrBefore(endDate, 'day')) {
      dateArray.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'day');
    }
  
    return dateArray;
  };
  
  const dateArray = generateDateArray(startDate, endDate);
  console.log(dateArray);
  `);
}


//Variable para almacenar entidades
codeArray.push(`
  const entityArray = [];
  `);

// Si se selecciona 'Usuario' como tipo de entidad
if (selectedEntityType.includes('Usuario')) {

  // Si se selecciona "Id" como parámetro de búsqueda
  if (selectedQueryParams.includes('Id') && searchData.id) {
    codeArray.push(`
    // Buscar por Id de usuario
    const userById = await pool.query("SELECT id_usuario, nombre, apellido, telefono FROM users WHERE id_usuario = $1", [${searchData.id}]);
    entityArray.push(...userById.rows.map(user => ({ 
      id: user.id_usuario, 
      nombre: user.nombre, 
      apellido: user.apellido, 
      telefono: user.telefono,
      tipoEntidad: 'usuario'
    })));
    `);
  }

  // Si se selecciona "Departamento" como parámetro de búsqueda
  if (selectedQueryParams.includes('Departamento') && selectedDepartment) {
    codeArray.push(`
    // Buscar por Departamento
    const usersByDepartment = await pool.query("SELECT id_usuario, nombre, apellido, telefono FROM users WHERE department_id = $1", [${selectedDepartment}]);
    entityArray.push(...usersByDepartment.rows.map(user => ({
      id: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      tipoEntidad: 'usuario'
    })));
    `);
  }

  // Si se selecciona "Rol" como parámetro de búsqueda
  if (selectedQueryParams.includes('Rol') && selectedRole) {
    codeArray.push(`
    // Buscar por Rol
    const usersByRole = await pool.query("SELECT id_usuario, nombre, apellido, telefono FROM users WHERE rol = $1", [${selectedRole}]);
    entityArray.push(...usersByRole.rows.map(user => ({
      id: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      tipoEntidad: 'usuario'
    })));
    `);
  }

  // Si se selecciona tanto "Departamento" como "Rol"
  if (selectedQueryParams.includes('Departamento') && selectedQueryParams.includes('Rol') && selectedDepartment && selectedRole) {
    codeArray.push(`
    // Buscar por Departamento y Rol
    const usersByDeptAndRole = await pool.query("SELECT id_usuario, nombre, apellido, telefono FROM users WHERE department_id = $1 AND rol = $2", [${selectedDepartment}, ${selectedRole}]);
    entityArray.push(...usersByDeptAndRole.rows.map(user => ({
      id: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      tipoEntidad: 'usuario'
    })));
    `);
  }
}

// Si se selecciona 'Colaborador' como tipo de entidad
if (selectedEntityType.includes('Colaborador')) {
  // Si se selecciona "Id" como parámetro de búsqueda
  if (selectedQueryParams.includes('Id') && searchData.id) {
    codeArray.push(`
    // Buscar por Id de colaborador
    const collaboratorById = await pool.query("SELECT id_colaborador, nombre, apellido, telefono FROM colaboradores WHERE id_colaborador = $1", [${searchData.id}]);
    entityArray.push(...collaboratorById.rows.map(collaborator => ({ 
      id: collaborator.id_colaborador, 
      nombre: collaborator.nombre, 
      apellido: collaborator.apellido, 
      telefono: collaborator.telefono,
      tipoEntidad: 'colaborador'
    })));
    `);
  }

  // Si se selecciona "Departamento" como parámetro de búsqueda
  if (selectedQueryParams.includes('Departamento') && selectedDepartment) {
    codeArray.push(`
    // Buscar por Departamento
    const collaboratorsByDepartment = await pool.query("SELECT id_colaborador, nombre, apellido, telefono FROM colaboradores WHERE department_id = $1", [${selectedDepartment}]);
    entityArray.push(...collaboratorsByDepartment.rows.map(collaborator => ({
      id: collaborator.id_colaborador,
      nombre: collaborator.nombre,
      apellido: collaborator.apellido,
      telefono: collaborator.telefono,
      tipoEntidad: 'colaborador'
    })));
    `);
  }

  // Si se selecciona "Rol" como parámetro de búsqueda
  if (selectedQueryParams.includes('Rol') && selectedRole) {
    codeArray.push(`
    // Buscar por Rol
    const collaboratorsByRole = await pool.query("SELECT id_colaborador, nombre, apellido, telefono FROM colaboradores WHERE rol = $1", [${selectedRole}]);
    entityArray.push(...collaboratorsByRole.rows.map(collaborator => ({
      id: collaborator.id_colaborador,
      nombre: collaborator.nombre,
      apellido: collaborator.apellido,
      telefono: collaborator.telefono,
      tipoEntidad: 'colaborador'
    })));
    `);
  }

  // Si se selecciona tanto "Departamento" como "Rol"
  if (selectedQueryParams.includes('Departamento') && selectedQueryParams.includes('Rol') && selectedDepartment && selectedRole) {
    codeArray.push(`
    // Buscar por Departamento y Rol
    const collaboratorsByDeptAndRole = await pool.query("SELECT id_colaborador, nombre, apellido, telefono FROM colaboradores WHERE department_id = $1 AND rol = $2", [${selectedDepartment}, ${selectedRole}]);
    entityArray.push(...collaboratorsByDeptAndRole.rows.map(collaborator => ({
      id: collaborator.id_colaborador,
      nombre: collaborator.nombre,
      apellido: collaborator.apellido,
      telefono: collaborator.telefono,
      tipoEntidad: 'colaborador'
    })));
    `);
  }
}

// Si se selecciona 'Instalación' como tipo de entidad
if (selectedEntityType.includes('Instalación')) {
  // Si se selecciona "Id" como parámetro de búsqueda
  if (selectedQueryParams.includes('Id') && searchData.id) {
    codeArray.push(`
    // Buscar por Id de instalación
    const installationById = await pool.query("SELECT id_instalacion, descripcion FROM instalaciones WHERE id_instalacion = $1", [${searchData.id}]);
    entityArray.push(...installationById.rows.map(installation => ({ 
      id: installation.id_instalacion, 
      nombre: installation.descripcion,
      tipoEntidad: 'instalacion'
    })));
    `);
  }

  // Si se selecciona "Departamento" como parámetro de búsqueda
  if (selectedQueryParams.includes('Departamento') && selectedDepartment) {
    codeArray.push(`
    // Buscar por Departamento
    const installationsByDepartment = await pool.query("SELECT id_instalacion, descripcion FROM instalaciones WHERE department_id = $1", [${selectedDepartment}]);
    entityArray.push(...installationsByDepartment.rows.map(installation => ({
      id: installation.id_instalacion,
      nombre: installation.descripcion,
      tipoEntidad: 'instalacion'
    })));
    `);
  }
}

codeArray.push(`
  // Array para almacenar los horarios de las entidades por fecha
  const scheduleArray = [];
  
  for (const date of dateArray) {
    // Obtener el día de la semana en español (Lunes, Martes, etc.)
    const dayOfWeek = moment(date).locale('es').format('dddd');
    const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  
    for (const entity of entityArray) {
      const { id, tipoEntidad } = entity;
  
      // Consultar los horarios de la entidad para el día de la semana actual
      const scheduleQuery = \`
        SELECT hora_inicio, hora_fin
        FROM horarios
        WHERE id_asignacion = $1
        AND tipo_asignacion = $2
        AND dia = $3
      \`;
      const schedule = await pool.query(scheduleQuery, [id, tipoEntidad, capitalizedDayOfWeek]);
  
      // Agregar los horarios al array de horarios con formato adecuado
      scheduleArray.push({
        date: date,
        entity: {
          id: entity.id,
          tipoEntidad: entity.tipoEntidad,
          nombre: entity.nombre,
          apellido: entity.apellido
        },
        horarios: schedule.rows.map(horario => ({
          hora_inicio: moment(horario.hora_inicio, 'HH:mm:ss').format('hh:mm A'),
          hora_fin: moment(horario.hora_fin, 'HH:mm:ss').format('hh:mm A')
        }))
      });
    }
  }
  
  // Imprimir el array de horarios con formato JSON
  console.log(JSON.stringify(scheduleArray, null, 2));
  
  // Array para almacenar los eventos de las entidades por fecha
  const eventsArray = [];
  
  for (const date of dateArray) {
    for (const entity of entityArray) {
      const { id, tipoEntidad } = entity;
  
      // Consultar los eventos de la entidad para la fecha actual
      const eventsQuery = \`
        SELECT fecha_inicio, fecha_fin, titulo, descripcion
        FROM eventos
        WHERE id_asignacion = $1
        AND tipo_asignacion = $2
        AND fecha_inicio::date <= $3
        AND fecha_fin::date >= $3
      \`;
      const events = await pool.query(eventsQuery, [id, tipoEntidad, date]);
  
      // Agregar los eventos al array de eventos con formato adecuado (solo hora de inicio y fin)
      eventsArray.push({
        date: date,
        entity: {
          id: entity.id,
          tipoEntidad: entity.tipoEntidad,
          nombre: entity.nombre,
          apellido: entity.apellido
        },
        eventos: events.rows.map(evento => ({
          titulo: evento.titulo,
          descripcion: evento.descripcion,
          hora_inicio: moment(evento.fecha_inicio, 'YYYY-MM-DD HH:mm:ss').format('hh:mm A'),
          hora_fin: moment(evento.fecha_fin, 'YYYY-MM-DD HH:mm:ss').format('hh:mm A')
        }))
      });
    }
  }
  
  // Imprimir el array de eventos con formato JSON
  console.log(JSON.stringify(eventsArray, null, 2));
  
  // Array para almacenar los resultados de espacios disponibles
const availableSlotsArray = [];

for (const date of dateArray) {
  for (const entity of entityArray) {
    const { id, tipoEntidad, nombre, apellido } = entity;

    // Obtener los horarios correspondientes a la fecha y entidad
    const horariosEntity = scheduleArray.find(horario => 
      horario.date === date && horario.entity.id === id && horario.entity.tipoEntidad === tipoEntidad
    )?.horarios || [];

    // Obtener los eventos correspondientes a la fecha y entidad
    const eventosEntity = eventsArray.find(evento => 
      evento.date === date && evento.entity.id === id && evento.entity.tipoEntidad === tipoEntidad
    )?.eventos || [];

    // Variable para almacenar los slots disponibles después de comparar con los eventos
    const availableSlots = [];

    // Iterar sobre los horarios y compararlos con los eventos
    for (const horario of horariosEntity) {
      let slotStart = moment(horario.hora_inicio, 'HH:mm A');
      let slotEnd = moment(horario.hora_fin, 'HH:mm A');

      // Iterar sobre los eventos ordenados por hora de inicio
      const sortedEvents = eventosEntity.sort((a, b) => 
        moment(a.hora_inicio, 'HH:mm A').diff(moment(b.hora_inicio, 'HH:mm A'))
      );

      for (const evento of sortedEvents) {
        let eventStart = moment(evento.hora_inicio, 'HH:mm A');
        let eventEnd = moment(evento.hora_fin, 'HH:mm A');

        // Verificar si el evento cae dentro del horario
        if (eventStart.isBetween(slotStart, slotEnd, null, '[)') || eventEnd.isBetween(slotStart, slotEnd, null, '(]')) {
          // Si el evento comienza después del inicio del slot, añadimos el espacio disponible antes del evento
          if (eventStart.isAfter(slotStart)) {
            availableSlots.push({
              hora_inicio: slotStart.format('HH:mm A'),
              hora_fin: eventStart.format('HH:mm A')
            });
          }

          // Ajustamos el slotStart para que comience después de que finalice el evento
          slotStart = eventEnd.isAfter(slotStart) ? eventEnd : slotStart;
        }
      }

      // Si queda un espacio disponible después del último evento, lo añadimos
      if (slotStart.isBefore(slotEnd)) {
        availableSlots.push({
          hora_inicio: slotStart.format('HH:mm A'),
          hora_fin: slotEnd.format('HH:mm A')
        });
      }
    }

    // Agregar los resultados al array final de espacios disponibles
    availableSlotsArray.push({
      date: date,
      entity: {
        id: id,
        tipoEntidad: tipoEntidad,
        nombre: nombre,
        apellido: apellido
      },
      availableSlots: availableSlots
    });
  }
}

// Imprimir el array de espacios disponibles
console.log(JSON.stringify(availableSlotsArray, null, 2));
`);

codeArray.push(`
  // Función para convertir el array de espacios disponibles en un formato de texto
  const generateAvailabilityText = (availableSlotsArray) => {
    let message = '';
  
    availableSlotsArray.forEach(slotInfo => {
      const { date, entity, availableSlots } = slotInfo;
  
      // Solo incluir entidades que tienen horarios disponibles
      if (availableSlots.length > 0) {
        // Formatear la fecha en dd/mm/yyyy
        const formattedDate = moment(date).format('DD/MM/YYYY');
  
        // Agregar la información de la entidad y los espacios disponibles
        message += \`📅 \${formattedDate}\\n\`;
        message += \`  *\${entity.nombre} \${entity.apellido}*\\n\`;
  
        availableSlots.forEach(slot => {
          message += \`   •\${slot.hora_inicio} - \${slot.hora_fin}\\n\`;
        });
  
        message += '\\n'; // Separar por línea para la próxima entidad
      }
    });
  
    return message;
  };
  
  // Llamar a la función y generar el mensaje
  let availabilityMessage = generateAvailabilityText(availableSlotsArray);
  
  // Mostrar el mensaje generado
  console.log(availabilityMessage);

  let allAvailabilityMessage = JSON.stringify(availableSlotsArray, null, 2);
  
  `);
  
      
  
    let updatedNodes, updatedEdges;
  
    const newVariables = [{
      name: 'availabilityMessage',
      displayName: 'Agenda Mensaje',
      nodeId: currentEditingNodeId || `${nodes.length + 1}`,  // ID del nodo actual o el nuevo
    },{
      name: 'allAvailabilityMessage',
      displayName: 'Toda la  Agenda',
      nodeId: currentEditingNodeId || `${nodes.length + 1}`,  // ID del nodo actual o el nuevo
    }
  ];
  
    setVariables((vars) => [...vars, ...newVariables]);  // Actualiza las variables en el estado
  
    if (currentEditingNodeId) {
      // Editar nodo existente
      updatedNodes = nodes.map(node => {
        if (node.id === currentEditingNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: `Consultar Agenda`,
              code: codeArray,
              tipo: 'agenda',
              onAddClick: (id) => openToolModal(id, true),  // Permite agregar nodos hijos
              editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),  // Permite editar el nodo
            },
          };
        }
        return node;
      });
      updatedEdges = edges;
      setCurrentEditingNodeId(null);
    } else {
      const newId = randomId();
      // Crear nuevo nodo
      const newNode = {
        id: newId,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: {
          label: `Consultar Agenda`,
          code: codeArray,
          tipo: 'agenda',
          onAddClick: (id) => openToolModal(id, true),  // Permite agregar nodos hijos
          editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),  // Permite editar el nodo
        },
        parentId: isInternal ? currentNodeId : null,
      };
  
      let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }
  
      updatedNodes = [...nodes, newNode];
      updatedEdges = [...edges, newEdge];
    }
  
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };  
  
  const handleSaveAgendaModal = () => {
    setShowAgendaModal(false);  // Cierra el modal
    generateCodeForAgenda();    // Genera el código para la consulta de agenda
    
  };

  const generateCodeForAgendar = async () => {
    let codeArray = [];

    codeArray.push(`
      // Consultar si ya existe un registro en requests para esta conversación
      existingRequestQuery = \`
        SELECT request_id, request_data, company_id
        FROM requests
        WHERE conversation_id = $1
          AND request_type = $2
          AND status IN ($3, $4)
          AND company_id = $5
      \`;
    
      existingRequestResult = await pool.query(existingRequestQuery, [conversationId, "agenda", "datosIncompletos", "datosCompletos", integrationDetails.company_id]);
    
      const newRequestData = {}; // Almacena los datos actualizados de la solicitud
      const selectedVariables = ${JSON.stringify(eventFields)};\n`); // Variables seleccionadas desde el modal
    
      console.log(`valor de eventos: ${eventCount}`);
      console.log(`valor de límite: ${limitVariable}`);
      
      if (eventCount) {
        codeArray.push(`
          const fixedEventCount = ${eventCount}; // Valor fijo de eventCount
        \n`);
      } else {
        codeArray.push(`
          const fixedEventCount = ${limitVariable}; // Variable de limitVariable
        \n`);
      }
    codeArray.push(`
      // Extraer valores reales de las variables seleccionadas
      Object.keys(selectedVariables).forEach((index) => {
        const eventData = selectedVariables[index];
        const processedData = {};
    
        Object.keys(eventData).forEach((fieldKey) => {
          const variableName = eventData[fieldKey];
          if (variableName && typeof variableName === 'string') {
            try {
              // Intentar obtener el valor real de la variable
              const value = eval(variableName); // eval simula un contexto dinámico
              if (value !== undefined && value !== null && value !== '') {
                processedData[fieldKey] = value; // Asignar solo si tiene un valor válido
              }
            } catch (error) {
              // Si eval falla, no asignar nada
            }
          }
        });
    
        // Agregar al newRequestData solo si tiene campos válidos
        if (Object.keys(processedData).length > 0) {
          newRequestData[index] = processedData;
        }
      });
    
      if (Object.keys(newRequestData).length === 0) {
        console.log("No hay datos válidos para insertar o actualizar. Operación terminada.");
        return;
      }
    
      if (existingRequestResult.rows.length === 0) {
        // Si no existe, crear un nuevo registro en requests
        insertRequestQuery = \`
          INSERT INTO requests (conversation_id, request_type, request_data, company_id, status)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING request_id;
        \`;
    
        await pool.query(insertRequestQuery, [
          conversationId,
          "agenda",
          JSON.stringify(newRequestData, (key, value) => 
            typeof value === "string" ? value.normalize("NFC") : value
          ),
          integrationDetails.company_id,
          "datosIncompletos"
        ]);
        console.log("Nuevo registro creado en requests con datos incompletos.");
      } else {
        // Si existe, actualizar solo los campos no vacíos
        const existingRequestId = existingRequestResult.rows[0].request_id;
        const existingRequestData = existingRequestResult.rows[0].request_data;
    
        // Fusionar datos existentes y nuevos, ignorando campos vacíos
        const updatedRequestData = { ...existingRequestData };
        Object.keys(newRequestData).forEach((index) => {
          if (!updatedRequestData[index]) {
            updatedRequestData[index] = {};
          }
          Object.keys(newRequestData[index]).forEach((key) => {
            if (newRequestData[index][key] !== null && newRequestData[index][key] !== '') {
              updatedRequestData[index][key] = newRequestData[index][key];
            }
          });
        });
    
        // Verificar si ya se tiene toda la información para la cantidad fija de eventos
        const hasAllData = Object.keys(updatedRequestData)
          .slice(0, fixedEventCount) // Limitar a la cantidad fija de eventos
          .every((index) => {
            const event = updatedRequestData[index];
            return event.titulo &&
              event.descripcion &&
              event.fecha_inicio &&
              event.hora_inicio &&
              event.fecha_fin &&
              event.hora_fin &&
              event.all_day !== null &&
              event.tipo_asignacion &&
              event.id_asignacion;
          });

        const newStatus = hasAllData ? "datosCompletos" : "datosIncompletos";

        updateRequestQuery = \`
          UPDATE requests
          SET request_data = $1,
              status = $2
          WHERE request_id = $3;
        \`;

        await pool.query(updateRequestQuery, [
          JSON.stringify(updatedRequestData, (key, value) => 
            typeof value === "string" ? value.normalize("NFC") : value
          ),
          newStatus,
          existingRequestId
        ]);

        // Asignar los datos a la variable dataEventsVariable
        const dataEventsVariable = [
          JSON.stringify(updatedRequestData, null, 2), // Convertir eventos a string con formato legible
          hasAllData, // Booleano indicando si están completos
        ];

        console.log(\`Registro en requests actualizado con estado: \${newStatus}\`);
        console.log("dataEventsVariable:", dataEventsVariable);
    `);           
      
    codeArray.push(`
      // Validar si la variable de confirmación es true
      if (confirmationVariable === true) {
        console.log("Confirmación válida. Procediendo con el agendamiento.");

        // Consulta la request para obtener el company_id y el request_data
        existingRequestQuery = \`
          SELECT request_id, request_data, company_id
          FROM requests
          WHERE conversation_id = $1
            AND request_type = $2
            AND status = $3
            AND company_id = $4
        \`;
      
        existingRequestResult = await pool.query(existingRequestQuery, [conversationId, "agenda", "datosCompletos", integrationDetails.company_id]);
      
        if (existingRequestResult.rows.length > 0) {
          const requestId = existingRequestResult.rows[0].request_id;
          const requestData = existingRequestResult.rows[0].request_data;
          const companyId = existingRequestResult.rows[0].company_id;
      
          // Obtener el default_timezone de la empresa
          const timezoneQuery = \`
            SELECT default_timezone
            FROM companies
            WHERE id = $1
          \`;
      
          const timezoneResult = await pool.query(timezoneQuery, [companyId]);
      
          if (timezoneResult.rows.length === 0) {
            return;
          }
      
          const companyTimezone = timezoneResult.rows[0].default_timezone || 'America/Bogota';
          const timezoneToUse = clientTimezone || companyTimezone;
      
          // Procesar los datos dinámicamente
          const eventos = [];
          Object.keys(requestData).forEach((index) => {
            const eventData = requestData[index];
            if (!eventData) {
              console.log(\`Error: El evento con índice \${index} es nulo o no válido. Ignorando...\`);
              return;
            }
      
            const {
              titulo = 'Evento sin título',
              descripcion = 'Descripción no disponible',
              fecha_inicio,
              hora_inicio,
              fecha_fin,
              hora_fin,
              all_day = 'false',
              tipo_asignacion,
              id_asignacion,
            } = eventData;
      
            // Validar datos obligatorios
            if (!fecha_inicio || !fecha_fin || (!hora_inicio && all_day.toLowerCase() !== 'true') || (!hora_fin && all_day.toLowerCase() !== 'true') || !tipo_asignacion || !id_asignacion) {
              console.log(\`Error: Faltan datos obligatorios para el evento con índice \${index}. Ignorando...\`);
              return;
            }
      
            // Validar formatos de fechas y horas
            const esFechaValida = (fecha) => /^\\d{4}-\\d{2}-\\d{2}$/.test(fecha);
            const esHoraValida = (hora) => /^\\d{2}:\\d{2}(:\\d{2})?$/.test(hora);
      
            if (all_day.toLowerCase() === 'true') {
              if (!esFechaValida(fecha_inicio) || !esFechaValida(fecha_fin)) {
                console.log(\`Error: Fechas inválidas para el evento con índice \${index}. Ignorando...\`);
                return;
              }
            } else {
              if (!esFechaValida(fecha_inicio) || !esFechaValida(fecha_fin) || !esHoraValida(hora_inicio) || !esHoraValida(hora_fin)) {
                console.log(\`Error: Fechas/Horas inválidas para el evento con índice \${index}. Ignorando...\`);
                return;
              }
            }
      
            // Convertir fechas y horas a UTC
            const fechaHoraInicio = all_day.toLowerCase() === 'true'
              ? \`\${fecha_inicio}T00:00:00\`
              : \`\${fecha_inicio}T\${hora_inicio}\`;
            const fechaHoraFin = all_day.toLowerCase() === 'true'
              ? \`\${fecha_fin}T23:59:59\`
              : \`\${fecha_fin}T\${hora_fin}\`;
            const fechaHoraInicioUTC = moment.tz(fechaHoraInicio, timezoneToUse).utc().format();
            const fechaHoraFinUTC = moment.tz(fechaHoraFin, timezoneToUse).utc().format();
      
            // Agregar evento a la lista
            eventos.push({
              titulo,
              descripcion,
              fechaHoraInicioUTC,
              fechaHoraFinUTC,
              allDay: all_day.toLowerCase() === 'true',
              tipoAsignacion: tipo_asignacion,
              idAsignacion: id_asignacion,
              companyId,
            });
          });
      
          // Insertar todos los eventos
          for (const evento of eventos) {
            const insertEventoQuery = \`
              INSERT INTO eventos (titulo, descripcion, fecha_inicio, fecha_fin, all_day, tipo_asignacion, id_asignacion, company_id)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              RETURNING id_evento;
            \`;
      
            const eventoResult = await pool.query(insertEventoQuery, [
              evento.titulo,
              evento.descripcion,
              evento.fechaHoraInicioUTC,
              evento.fechaHoraFinUTC,
              evento.allDay,
              evento.tipoAsignacion,
              evento.idAsignacion,
              evento.companyId,
            ]);
      
            if (eventoResult.rows.length > 0) {
              const eventoId = eventoResult.rows[0].id_evento;
      
              const updateRequestQuery = \`
                UPDATE requests
                SET request_data = request_data || $1::jsonb,
                    request_type = $2,
                    status = $3
                WHERE request_id = $4;
              \`;
      
              await pool.query(updateRequestQuery, [JSON.stringify(requestData), "agenda", "agendado", requestId]);
              console.log(\`Evento agendado con éxito: ID \${eventoId}\`);
            }
          }
        }

      } else{
       console.log("Sin confirmación de agendamiento. Agendamiento pendiente.");
      }
  }
    `);                          
  
    let updatedNodes, updatedEdges;

    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Agendar`,
        code: codeArray,
        onAddClick: (id) => openToolModal(id, true),
        onAddExternalClick: (id) => openToolModal(id, false),
      },
      parentId: isInternal ? currentNodeId : null,
    };

    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    updatedNodes = [...nodes, newNode];
    updatedEdges = [...edges, newEdge];

  setNodes(updatedNodes);
  setEdges(updatedEdges);
  };

  const generateCodeForExtractRequest = async () => {
    let codeArray = [];
  
    codeArray.push(`
      // Consulta la request para obtener el company_id y el request_data
      existingRequestQuery = \`
        SELECT request_id, request_data, company_id
        FROM requests
        WHERE conversation_id = $1
          AND request_type = $2
          AND status = $3
          AND company_id = $4
      \`;
  
      existingRequestResult = await pool.query(existingRequestQuery, [conversationId, "tipo_solicitud", "estatus_solicitud", integrationDetails.company_id]);
  
      if (existingRequestResult.rows.length > 0) {
        const requestId = existingRequestResult.rows[0].request_id;
        const requestData = existingRequestResult.rows[0].request_data;
        const companyId = existingRequestResult.rows[0].company_id;
  
        // Variables extraídas de request_data
    `);
  
    // Suponiendo que selectedFields contiene los nombres de los campos a extraer
    const selectedFields = ['nombre_campo1', 'nombre_campo2']; // Reemplazar con campos reales
  
    selectedFields.forEach((field) => {
      codeArray.push(`
        const ${field} = requestData['${field}'] || null;
      `);
    });
  
    codeArray.push(`
        // Comprobación de que los campos obligatorios no estén vacíos
        if (!${selectedFields.join(' || !')}) {
          console.log("Faltan datos obligatorios para continuar: ${selectedFields.join(', ')}");
        } else {
          // Aquí se puede continuar con la lógica deseada, como insertar o actualizar en otras tablas
          console.log("Datos obtenidos correctamente:", ${selectedFields.join(', ')});
        }
      } else {
        console.log("Datos incompletos o la solicitud no existe.");
      }
    `);
  
    let updatedNodes, updatedEdges;
  
    if (currentEditingNodeId) {
      // Editar nodo existente
      updatedNodes = nodes.map(node => {
        if (node.id === currentEditingNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: `Extract Request`,
              code: codeArray,
              tipo: 'extract_request',
              onAddClick: (id) => openToolModal(id, true),
              onAddExternalClick: (id) => openToolModal(id, false),
              editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
            },
          };
        }
        return node;
      });
      setCurrentEditingNodeId(null);
    } else {
      const newId = randomId();
      // Crear nuevo nodo
      const newNode = {
        id: newId,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: {
          label: `Extract Request`,
          code: codeArray,
          tipo: 'extract_request',
          onAddClick: (id) => openToolModal(id, true),
          onAddExternalClick: (id) => openToolModal(id, false),
          editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
        },
      };
  
      let newEdge;
      if (isInternal) {
        newEdge = {
          id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
          source: newNode.parentId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          style: { stroke: '#d033b9' },
          zIndex: 10,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#d033b9',
          },
        };
      } else {
        newEdge = {
          id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
          source: newNode.parentId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          sourceHandle: 'b',
          style: { stroke: '#d033b9' },
          zIndex: 10,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#d033b9',
          },
        };
      }
  
      updatedNodes = [...nodes, newNode];
      updatedEdges = [...edges, newEdge];
    }
  
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };
  
  
  const handleResponseLocationModalSave = () => {
    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Enviar Ubicación`,
        code: [
          `latitude = ${locationLatitude};`,
          `longitude = ${locationLongitude};`,
          `streetName = "${locationStreetName}";`,
          `await sendLocationMessage(io, { body: { phone: senderId, latitude, longitude, streetName, conversationId } }, {});`,
        ],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);
    setShowResponseLocationModal(false);
    setLocationLatitude('');
    setLocationLongitude('');
    setLocationStreetName('');
  };

  const addConcatVariable = () => {
    setConcatVariables([...concatVariables, { variable: '', validateExistence: false }]);
  };

  const removeConcatVariable = (index) => {
    setConcatVariables(concatVariables.filter((_, i) => i !== index));
  };

  const updateConcatVariable = (index, field, value) => {
    const newConcatVariables = [...concatVariables];
    newConcatVariables[index][field] = value;
    setConcatVariables(newConcatVariables);
  };

  const addUpdateContactNameNode = () => {
    setShowUpdateContactNameModal(true);
  };

  const addConditionalNode = () => {
    setShowModal(true);
    setShowToolModal(false);
  };

  const addConcatVariablesNode = () => {
    setShowConcatVariablesModal(true);
  };

  const addSwitchNode = () => {
    setShowSwitchModal(true);
    setShowToolModal(false);
  };

  const addCaseNode = () => {
    setShowCaseModal(true);
  };

  const addCondition = () => {
    setConditions([...conditions, { variable: '', operator: '==', value: '', logicalOperator: '' }]);
  };

  const addGptQueryNode = () => {
    setShowGptQueryModal(true);
  };

  const addSendTextNode = () => {
    setShowResponseTextModal(true);
    setResponseText(''); // Asegúrate de reiniciar el texto de respuesta
    setSelectedVariables([]); // Asegúrate de reiniciar las variables seleccionadas
    setShowToolModal(false);
  };

  const addUpdateContactNode = () => {
    setShowUpdateContactModal(true);
  };

  const addUpdateStateNode = () => {
    setShowUpdateStateModal(true);
  };

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  const addGptAssistantNode = () => {
    setShowGptAssistantModal(true);
  };

  const addSplitVariableNode = () => {
    setShowSplitVariableModal(true);
  };

  const addSplitResultName = () => {
    setSplitResultNames([...splitResultNames, '']);
  };

  const removeSplitResultName = (index) => {
    setSplitResultNames(splitResultNames.filter((_, i) => i !== index));
  };


  const updateSplitResultName = (index, value) => {
    const newSplitResultNames = [...splitResultNames];
    newSplitResultNames[index] = value;
    setSplitResultNames(newSplitResultNames);
  };

  const handleGptAssistantModalSave = () => {
  
    // Identifica si estás editando un nodo existente o creando uno nuevo
    if (currentEditingNodeId) {
      console.log("estas editandolo");
      const  tipo = 'gptAssistant';
      // Si estás editando un nodo existente
      const updatedNodes = nodes.map(node => {
        if (node.id === currentEditingNodeId) {
          // Actualiza la información del nodo existente
          return {
            ...node,
            data: {
              ...node.data,
              label: `Asistente GPT: ${assistantName}`,
              assistantName,
              gptModel,
              personality,
              tipo,  
              code: [
                `async function ${assistantName}(prompt) {`,
                `  apiKey = process.env.OPENAI_API_KEY;`,
                `  const url = "https://api.openai.com/v1/chat/completions";`,
                `  headers = {`,
                `    'Authorization': \`Bearer \${apiKey}\`,`,
                `    'Content-Type': 'application/json'`,
                `  };`,
                `  payload = {`,
                `    model: "${gptModel}",`,
                `    messages: [`,
                `      { role: "system", content: "${personality}" },`,
                `      { role: "user", content: prompt }`,
                `    ]`,
                `  };`,
                `  try {`,
                `    responseGpt = await axios.post(url, payload, { headers });`,
                `    const resultado = responseGpt.data.choices[0].message.content.trim();`,
                ` // Obtener los tokens de entrada y salida
                  const usage = responseGpt.data.usage;
                  const inputTokens = usage.prompt_tokens;
                  const outputTokens = usage.completion_tokens;
                  
                  // URL del backend
                  const backendUrl = "${process.env.REACT_APP_API_URL}/api/consumptions";

                  // Enviar al backend el consumo de la API en el input
                  const backendPayloadInput = {
                    api_name: "GPT",
                    model: "${gptModel}",
                    unit_type: "input_token",
                    unit_count: inputTokens,
                    query_details: "${assistantName}",
                    company_id: integrationDetails.company_id,
                    user_id: responsibleUserId,
                    conversationId: conversationId
                  };

                  await axios.post(backendUrl, backendPayloadInput);

                  // Enviar al backend el consumo de la API en el output
                  const backendPayloadOutput = {
                    api_name: "GPT",
                    model: "${gptModel}",
                    unit_type: "output_token",
                    unit_count: outputTokens,
                    query_details: "${assistantName}",
                    company_id: integrationDetails.company_id,
                    user_id: responsibleUserId,
                    conversationId: conversationId
                  };

                  await axios.post(backendUrl, backendPayloadOutput);
                  return resultado`,
                `  } catch (error) {`,
                `    console.error("Error al obtener respuesta de GPT:", error);`,
                `    return "Error al obtener la respuesta";`,
                `  }`,
                `}`,
              ],
            },
          };
        }
        return node;
      });
  
      // Actualiza el estado con los nodos editados
      setNodes(updatedNodes);
      generateCodeFromNodes(updatedNodes, edges);
      setCurrentEditingNodeId(null);
    } else {
      console.log("estas creandolo");
      // Verifica si ya existe un asistente con el mismo nombre
      if (assistants.some(assistant => assistant.name === assistantName)) {
        alert('Ya existe un asistente con ese nombre. Por favor, elige otro nombre.');
        return;
      }

      // Si estás creando un nuevo nodo
      const newAssistant = { name: assistantName, displayName: assistantName, model: gptModel, personality };
      const  tipo = 'gptAssistant';
      const newId = randomId();
      const newNode = {
        id: newId,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: {
          label: `Asistente GPT: ${assistantName}`,
          assistantName,
          gptModel,
          personality,
          tipo, 
          code: [
            `async function ${assistantName}(prompt) {`,
            `  apiKey = process.env.OPENAI_API_KEY;`,
            `  const url = "https://api.openai.com/v1/chat/completions";`,
            `  headers = {`,
            `    'Authorization': \`Bearer \${apiKey}\`,`,
            `    'Content-Type': 'application/json'`,
            `  };`,
            `  payload = {`,
            `    model: "${gptModel}",`,
            `    messages: [`,
            `      { role: "system", content: "${personality}" },`,
            `      { role: "user", content: prompt }`,
            `    ]`,
            `  };`,
            `  try {`,
            `    responseGpt = await axios.post(url, payload, { headers });`,
            `    const resultado = responseGpt.data.choices[0].message.content.trim();`,
            ` // Obtener los tokens de entrada y salida
            const usage = responseGpt.data.usage;
            const inputTokens = usage.prompt_tokens;
            const outputTokens = usage.completion_tokens;
            
            // URL del backend
            const backendUrl = "${process.env.REACT_APP_API_URL}/api/consumptions";

            // Enviar al backend el consumo de la API en el input
            const backendPayloadInput = {
              api_name: "GPT",
              model: "${gptModel}",
              unit_type: "input_token",
              unit_count: inputTokens,
              query_details: "${assistantName}",
              company_id: integrationDetails.company_id,
              user_id: responsibleUserId,
              conversationId: conversationId
            };

            await axios.post(backendUrl, backendPayloadInput);

            // Enviar al backend el consumo de la API en el output
            const backendPayloadOutput = {
              api_name: "GPT",
              model: "${gptModel}",
              unit_type: "output_token",
              unit_count: outputTokens,
              query_details: "${assistantName}",
              company_id: integrationDetails.company_id,
              user_id: responsibleUserId,
              conversationId: conversationId
            };

            await axios.post(backendUrl, backendPayloadOutput);
            return resultado`,
            `  } catch (error) {`,
            `    console.error("Error al obtener respuesta de GPT:", error);`,
            `    return "Error al obtener la respuesta";`,
            `  }`,
            `}`,
          ],
          
          onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false),  editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
        },
        parentId: isInternal ? currentNodeId : null,
      };
  
      let newEdge;
      if (isInternal) {
        newEdge = {
          id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
          source: newNode.parentId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        };
      } else {
        newEdge = {
          id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
          source: newNode.parentId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          sourceHandle: 'b',
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        };
      }
  
      const updatedNodes = [...nodes, newNode];
      console.log(updatedNodes);
      const updatedEdges = [...edges, newEdge];
      setNodes((prevNodes) => [...prevNodes, newNode]);
      setEdges((prevEdges) => [...prevEdges, newEdge]);
      generateCodeFromNodes(updatedNodes, updatedEdges);
  
      // Insertar el nuevo asistente en la lista de asistentes
      setAssistants([...assistants, newAssistant]);
    }
  
    // Resetear el modal y los estados
    setCurrentEditingNodeId(null); // Resetea el ID de edición actual
    setShowGptAssistantModal(false);
    setAssistantName('');
    setGptModel('');
    setPersonality('');
  };
  

  const addChangeResponsibleNode = () => {
    fetchResponsibles();
    setShowChangeResponsibleModal(true);
  };

  const handleResponseTemplateModalSave = () => {
    if (!selectedTemplate) {
      console.error('No template selected');
      return;
    }

    const companyId = localStorage.getItem('company_id');
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`; // Crear un identificador único

    const headerVariableCalculations = selectedTemplate.headerVariables?.map((variable, index) => {
      const varName = `header${uniqueId}_${index + 1}`;
      if (variable.source === 'date') {
        return `const ${varName} = calculateDateValue('${variable.variable}', clientTimezone, moment);`;
      } else {
        return `const ${varName} = await fetchVariableValue('${variable.source}', '${variable.variable}', senderId, ${companyId}, pool);`;
      }
    }).join('\n') || '';

    const bodyVariableCalculations = selectedTemplate.bodyVariables?.map((variable, index) => {
      const varName = `body${uniqueId}_${index + 1}`;
      if (variable.source === 'date') {
        return `const ${varName} = calculateDateValue('${variable.variable}', clientTimezone, moment);`;
      } else {
        return `const ${varName} = await fetchVariableValue('${variable.source}', '${variable.variable}', senderId, ${companyId}, pool);`;
      }
    }).join('\n') || '';

    const buttonVariableCalculations = selectedTemplate.buttonVariables?.map((variable, index) => {
      const varName = `button${uniqueId}_${index + 1}`;
      if (variable.source === 'date') {
        return `const ${varName} = calculateDateValue('${variable.variable}', clientTimezone, moment);`;
      } else {
        return `const ${varName} = await fetchVariableValue('${variable.source}', '${variable.variable}', senderId, ${companyId}, pool);`;
      }
    }).join('\n') || '';

    const payloadCode = `
      payload = {
        conversation: conversationData,
        template: {
          id: "${selectedTemplate.id}",
          type: "${selectedTemplate.type}",
          nombre: "${selectedTemplate.nombre}",
          language: "${selectedTemplate.language}",
          header_type: "${selectedTemplate.header_type}",
          type_medio: "${selectedTemplate.type_medio}",
          medio: "${selectedTemplate.medio}",
          body_text: "${selectedTemplate.body_text}",
          type_button: "${selectedTemplate.type_button}",
          button_text: "${selectedTemplate.button_text}",
          header_text: "${selectedTemplate.header_text}",
          footer: ${selectedTemplate.footer ? `"${selectedTemplate.footer}"` : 'null'},
          state: "${selectedTemplate.state}",
          company_id: ${selectedTemplate.company_id},
          buttons: ${JSON.stringify(selectedTemplate.buttons)},
          headerVariables: [
            ${selectedTemplate.headerVariables?.map((variable, index) => `{ "${variable.name}": header${uniqueId}_${index + 1} }`).join(', ') || ''}
          ],
          bodyVariables: [
            ${selectedTemplate.bodyVariables?.map((variable, index) => `{ "${variable.name}": body${uniqueId}_${index + 1} }`).join(', ') || ''}
          ],
          buttonVariables: [
            ${selectedTemplate.buttonVariables?.map((variable, index) => `{ "${variable.name}": button${uniqueId}_${index + 1} }`).join(', ') || ''}
          ]
        },
        parameters: [
          ${selectedTemplate.headerVariables?.map((variable, index) => `header${uniqueId}_${index + 1}`).join(', ') || ''},
          ${selectedTemplate.bodyVariables?.map((variable, index) => `body${uniqueId}_${index + 1}`).join(', ') || ''},
          ${selectedTemplate.buttonVariables?.map((variable, index) => `button${uniqueId}_${index + 1}`).join(', ') || ''}
        ],
        company_id: integrationDetails.company_id
      };
      await sendTemplateToSingleContact(io, { body: payload }, resTemplate);
    `;

    const generatedCode = `
      ${headerVariableCalculations}

      ${bodyVariableCalculations}

      ${buttonVariableCalculations}

      ${payloadCode}
    `;
    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Enviar Plantilla: ${selectedTemplate.nombre}`,
        code: [generatedCode],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);
    setShowResponseTemplateModal(false);
  };


  const handleChangeResponsibleModalSave = () => {
    const selectedResponsibleObject = responsibles.find(r => r.id_usuario === parseInt(selectedResponsible));
    const fullName = `${selectedResponsibleObject.nombre} ${selectedResponsibleObject.apellido}`;
    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Cambiar responsable a: ${fullName}`,
        code: [
          `await assignResponsibleUser(io, conversationId, responsibleUserId, ${selectedResponsible});`,
          `await processMessage(io, senderId, messageData, "Si", integrationDetails);`
        ],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);
    setShowChangeResponsibleModal(false);
    setSelectedResponsible('');
  };

  const handleUpdateContactInitializerModalSave = () => {
    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: 'Actualizador contacto',
        code: [
          `async function updateContact(io, phoneNumber, companyId, contactFieldName, contactFieldValue) {`,
          `  const query = \``,
          `    UPDATE contacts SET `,
          `    \${contactFieldName} = $3 `,
          `    WHERE phone_number = $1 AND company_id = $2`,
          `    RETURNING *;`,
          `  \`;`,
          `  try {`,
          `    const result = await pool.query(query, [phoneNumber, companyId, contactFieldValue]);`,
          `    if (result.rows.length > 0) {`,
          `      const updatedContact = result.rows[0];`,
          `      io.emit('contactUpdated', updatedContact);`,
          `    } else {`,
          `      console.log('No contact found for the given phone number and company ID.');`,
          `    }`,
          `  } catch (err) {`,
          `    console.error('Database error in updateContact:', err);`,
          `    throw err;`,
          `  }`,
          `}`,
        ],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);
    setShowUpdateContactInitializerModal(false);
  };

  const handleUpdateContactModalSave = () => {
    let contactField = selectedContactField;
    let contactFieldValue;

    // Si el campo seleccionado es 'label', utilizamos el ID de la fase seleccionada
    if (selectedContactField === 'label') {
      contactFieldValue = selectedPhase;
    } else {
      // En los demás casos, utilizamos la variable seleccionada
      contactFieldValue = selectedContactVariable;
    }

    const contactFieldDisplay = contactFields.find((f) => f.name === contactField)?.displayName;
    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Actualizar contacto: ${contactFieldDisplay}`,
        code: [
          `await updateContact(io, phoneNumber, integrationDetails.company_id, '${contactField}', ${contactFieldValue});`,
        ],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);
    setShowUpdateContactModal(false);
    setSelectedContactField('');
    setSelectedContactVariable('');
    setSelectedDepartment('');
    setSelectedPhase('');
  };

  const handleUpdateContactNameModalSave = () => {
    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: 'Actualizar nombre contacto',
        code: [
          `await updateContactName(io, senderId, integrationDetails.company_id, ${selectedFirstName}, ${selectedLastName} || null);`,
        ],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);

    setShowUpdateContactNameModal(false);
    setSelectedFirstName('');
    setSelectedLastName('');
  };

  const handleSwitchModalSave = () => {
    const variable = variables.find(v => v.name === selectedVariable);
    const variableName = variable ? variable.name : selectedVariable;

    let updatedNodes, updatedEdges, newNodeId;

    if (currentEditingNodeId) {
        // Si estamos editando un nodo existente
        updatedNodes = nodes.map(node => {
            if (node.id === currentEditingNodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: `Switch (${variableName})`,
                        code: [`switch (${variableName}) {`],
                        variable: variableName,
                        tipo: 'switch',  // Añadir tipo para identificación
                    },
                };
            }
            return node;
        });
        updatedEdges = edges;  // Mantén las aristas actuales
        newNodeId = currentEditingNodeId; // Usar el ID del nodo que se está editando
        setCurrentEditingNodeId(null);
    } else {
      const newId = randomId();
        // Si estamos creando un nuevo nodo
        const newNode = {
            id: newId,
            type: 'switch',
            position: { x: 250, y: 55 + 75 * nodes.length },
            data: {
                label: `Switch (${variableName})`,
                code: [`switch (${variableName}) {`],
                variable: variableName,  // Guardar variable para edición
                tipo: 'switch',  // Añadir tipo para identificación
                onAddClick: (id) => openToolModal(id, true),
                onAddExternalClick: (id) => openToolModal(id, false),
                addCaseNode: (id) => addCaseNode(id),
                editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
            },
            parentId: isInternal ? currentNodeId : null,
        };

        const defaultGroup = {
            id: `${newNode.id}-default`,
            type: 'groupNode',
            position: { x: newNode.position.x + 100, y: newNode.position.y + 100 },
            data: { label: 'default', onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false), setNodes },
            parentId: newNode.id,
            style: { width: 300, height: 200 },
        };

        let newEdges;
        if (isInternal) {
            newEdges = [
                {
                    id: `e${newNode.parentId || nodes.length}-${newNode.id}`,
                    source: newNode.parentId || `${nodes.length}`,
                    target: newNode.id,
                    animated: true,
                    style: { stroke: '#d033b9' },
                    zIndex: 10,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#d033b9',
                    },
                },
                {
                    id: `e${newNode.id}-${defaultGroup.id}`,
                    source: newNode.id,
                    sourceHandle: 'default',
                    target: defaultGroup.id,
                    animated: true,
                    style: { stroke: '#d033b9' },
                    zIndex: 10,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#d033b9',
                    },
                },
            ];
        } else {
            newEdges = [
                {
                    id: `e${newNode.parentId || nodes.length}-${newNode.id}`,
                    source: newNode.parentId || `${nodes.length}`,
                    target: newNode.id,
                    animated: true,
                    sourceHandle: 'b',
                    style: { stroke: '#d033b9' },
                    zIndex: 10,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#d033b9',
                    },
                },
                {
                    id: `e${newNode.id}-${defaultGroup.id}`,
                    source: newNode.id,
                    sourceHandle: 'default',
                    target: defaultGroup.id,
                    animated: true,
                    style: { stroke: '#d033b9' },
                    zIndex: 10,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#d033b9',
                    },
                },
            ];
        }

        updatedNodes = [...nodes, newNode, defaultGroup];
        updatedEdges = [...edges, ...newEdges];
        newNodeId = newNode.id; // Asigna el ID del nuevo nodo creado
    }

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setShowSwitchModal(false);
    setSelectedVariable('');
    setCurrentSwitchNode(newNodeId); // Usar newNodeId para definir el nodo actual
    generateCodeFromNodes(updatedNodes, updatedEdges);
};



  const handleCaseModalSave = () => {
    const variable = variables.find(v => v.name === selectedVariable);
    const variableName = variable ? variable.name : selectedVariable;
    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'caseNode',
      position: { x: 250, y: 55 + 75 * nodes.length },
      data: { label: `Caso (${comparisonValue})`, code: [`case '${comparisonValue}':`], onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false), setNodes, addCaseNode: (id) => addCaseNode(id) },
      parentId: currentSwitchNode,
    };
    let newEdge
    if(isInternal){
      newEdge = [
        {
          id: `e${currentSwitchNode}-${newNode.id}`,
          source: currentSwitchNode,
          sourceHandle: `${comparisonValue}`,
          target: newNode.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        }
      ];
    }else{
      newEdge = [
        {
          id: `e${currentSwitchNode}-${newNode.id}`,
          source: currentSwitchNode,
          sourceHandle: `${comparisonValue}`,
          target: newNode.id,
          animated: true,
          sourceHandle: 'b',
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        }
      ];
    }

    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => eds.concat(newEdge));
    setShowCaseModal(false);
    setComparisonValue('');
    generateCodeFromNodes(nodes.concat(newNode), edges.concat(newEdge));
  };

  const handleUpdateStateModalSave = () => {
    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Actualizar estado a: ${newState}`,
        code: [
          `await updateConversationState(conversationId, '${newState}');`,
        ],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);
    setShowUpdateStateModal(false);
    setNewState('');
  };

  const handleResponseTextModalSave = () => {
    const finalResponseText = `\`${responseText.replace(/\${([^}]+)}/g, '${$1}')}\``;
  
    if (currentEditingNodeId) {
      console.log("Editando enviar texto",currentEditingNodeId);
  
      const tipo = 'sendText';
  
      const updatedNodes = nodes.map(node => {
        if (node.id === currentEditingNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: `Enviar Texto: ${responseTextName}`,
              responseTextName,
              responseText,
              tipo, // Añade el tipo para identificación
              code: [
                `responseText = ${finalResponseText};`,
                `await sendTextMessage(io, { body: { phone: senderId, messageText: responseText, conversationId, integration_name: integrationDetails.integration_name } }, {});`,
              ],
            },
          };
        }
        return node;
      });
      setNodes(updatedNodes);
      generateCodeFromNodes(updatedNodes, edges);
      setCurrentEditingNodeId(null);
    } else {
      console.log("Creando nuevo enviar texto");
  
      const tipo = 'sendText';
      
      const newId = randomId();
      console.log(`new id `, newId);
  
      const newNode = {
        id: newId,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: {
          label: `Enviar Texto: ${responseTextName}`,
          responseTextName,
          responseText,
          tipo, // Añade el tipo para identificación
          code: [
            `responseText = ${finalResponseText};`,
            `await sendTextMessage(io, { body: { phone: senderId, messageText: responseText, conversationId } }, {});`,
          ],
          onAddClick: (id) => openToolModal(id, true),
          onAddExternalClick: (id) => openToolModal(id, false),
          editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
        },
        parentId: isInternal ? currentNodeId : null,
      };

      console.log("nodo nuevo", newNode);
  
      let newEdge;
      if (isInternal) {
        newEdge = {
          id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
          source: newNode.parentId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        };
      } else {
        newEdge = {
          id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
          source: newNode.parentId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          sourceHandle: 'b',
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        };
      }
  
      const updatedNodes = [...nodes, newNode];
      const updatedEdges = [...edges, newEdge];
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setVariables((vars) => [...vars, { name: 'responseText', displayName: responseTextName, nodeId: newNode.id }]);
      generateCodeFromNodes(updatedNodes, updatedEdges);
    }
  
    setShowResponseTextModal(false);
    setResponseText('');
    setResponseTextName('');
    setSelectedVariables([]);
    setCurrentEditingNodeId(null); // Resetea el ID de edición actual
  };
  

  const handleModalSave = () => {
    const conditionStr = conditions
        .map((condition, index) => {
            const { variable, operator, value, logicalOperator } = condition;
            const prefix = index === 0 ? '' : ` ${logicalOperator} `;
            if (operator === '!') {
                return `${prefix}!${variable}`;
            }
            return `${prefix}${variable} ${operator} '${value}'`;
        })
        .join('');

    let updatedNodes, updatedEdges;

    if (currentEditingNodeId) {
        // Si estamos editando un nodo existente
        updatedNodes = nodes.map(node => {
            if (node.id === currentEditingNodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: `Si ${conditionStr}`,
                        code: [`if (${conditionStr})`, `{`, `} else {`],
                        conditions, // Guardar las condiciones para editar
                        tipo: 'conditional', // Añade el tipo para identificación
                    },
                };
            }
            return node;
        });
        updatedEdges = edges; // Mantén las aristas actuales
        setCurrentEditingNodeId(null);
    } else {
        const newId = randomId();
        // Si estamos creando un nuevo nodo
        const newNode = {
            id: newId,
            type: 'conditional',
            position: { x: 250, y: 55 + 75 * nodes.length },
            data: {
                label: `Si ${conditionStr}`,
                code: [`if (${conditionStr})`, `{`, `} else {`],
                conditions, // Guardar las condiciones para editar
                tipo: 'conditional', // Añade el tipo para identificación
                onAddClick: (id) => openToolModal(id, true),
                onAddExternalClick: (id) => openToolModal(id, false),
                editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
            },
            parentId: isInternal ? currentNodeId : null,
        };

        const ifGroup = {
            id: `${newNode.id}-if`,
            type: 'groupNode',
            position: { x: newNode.position.x - 616, y: newNode.position.y - 20 },
            data: { label: 'Si', onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false), setNodes },
            parentId: newNode.id,
        };

        const elseGroup = {
            id: `${newNode.id}-else`,
            type: 'groupNode',
            position: { x: newNode.position.x + 0, y: newNode.position.y - 20 },
            data: { label: 'No', onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false), setNodes },
            parentId: newNode.id,
        };

        let newEdges;
        if (isInternal) {
            newEdges = [
                {
                    id: `e${newNode.parentId || nodes.length}-${newNode.id}`,
                    source: newNode.parentId || `${nodes.length}`,
                    target: newNode.id,
                    animated: true,
                    style: { stroke: '#d033b9' },
                    zIndex: 10,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#d033b9',
                    },
                },
                {
                    id: `e${newNode.id}-${ifGroup.id}`,
                    source: newNode.id,
                    sourceHandle: 'a',
                    target: ifGroup.id,
                    animated: true,
                    style: { stroke: '#d033b9' },
                    zIndex: 10,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#d033b9',
                    },
                },
                {
                    id: `e${newNode.id}-${elseGroup.id}`,
                    source: newNode.id,
                    sourceHandle: 'b',
                    target: elseGroup.id,
                    animated: true,
                    style: { stroke: '#d033b9' },
                    zIndex: 10,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#d033b9',
                    },
                },
            ];
        } else {
            newEdges = [
                {
                    id: `e${newNode.parentId || nodes.length}-${newNode.id}`,
                    source: newNode.parentId || `${nodes.length}`,
                    target: newNode.id,
                    animated: true,
                    sourceHandle: 'b',
                    style: { stroke: '#d033b9' },
                    zIndex: 10,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#d033b9',
                    },
                },
                {
                    id: `e${newNode.id}-${ifGroup.id}`,
                    source: newNode.id,
                    sourceHandle: 'a',
                    target: ifGroup.id,
                    animated: true,
                    style: { stroke: '#d033b9' },
                    zIndex: 10,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#d033b9',
                    },
                },
                {
                    id: `e${newNode.id}-${elseGroup.id}`,
                    source: newNode.id,
                    sourceHandle: 'b',
                    target: elseGroup.id,
                    animated: true,
                    style: { stroke: '#d033b9' },
                    zIndex: 10,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#d033b9',
                    },
                },
            ];
        }

        updatedNodes = [...nodes, newNode, ifGroup, elseGroup];
        updatedEdges = [...edges, ...newEdges];
    }

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);
    setShowModal(false);
    setSelectedVariable('');
    setSelectedOperator('==');
    setComparisonValue('');
    setConditions([{ variable: '', operator: '==', value: '', logicalOperator: '' }]);
};


  const handleGptQueryModalSave = () => {
    const finalPrompt = `\`${queryPrompt.replace(/\${([^}]+)}/g, '${$1}')}\``;

    if (currentEditingNodeId) {
        console.log("Editando consulta GPT");

        const tipo = 'queryGpt';

        const updatedNodes = nodes.map(node => {
            if (node.id === currentEditingNodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: `Consultar GPT: ${queryName}`,
                        selectedAssistant,
                        queryName,
                        queryPrompt,
                        tipo, // Añade el tipo para identificación
                        code: [
                            `const ${queryName} = await ${selectedAssistant}(${finalPrompt});`,
                        ],
                    },
                };
            }
            return node;
        });

        setNodes(updatedNodes);
        generateCodeFromNodes(updatedNodes, edges);
        setCurrentEditingNodeId(null);
    } else {
        console.log("Creando nueva consulta GPT");

        const tipo = 'queryGpt';
        const newId = randomId();

        const newNode = {
            id: newId,
            type: 'custom',
            position: { x: Math.random() * 250, y: Math.random() * 250 },
            data: {
                label: `Consultar GPT: ${queryName}`,
                selectedAssistant,
                queryName,
                queryPrompt,
                tipo, // Añade el tipo para identificación
                code: [
                    `const ${queryName} = await ${selectedAssistant}(${finalPrompt});`,
                ],
                onAddClick: (id) => openToolModal(id, true), 
                onAddExternalClick: (id) => openToolModal(id, false),  
                editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
            },
            parentId: isInternal ? currentNodeId : null,
        };

        let newEdge;
        if (isInternal) {
            newEdge = {
                id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
                source: newNode.parentId || `${nodes.length}`,
                target: newNode.id,
                animated: true,
                style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
                zIndex: 10, // Ajusta el zIndex si es necesario
                markerEnd: {
                    type: MarkerType.ArrowClosed, // Flecha al final de la línea
                    color: '#d033b9', // Ajusta el color de la flecha aquí
                },
            };
        } else {
            newEdge = {
                id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
                source: newNode.parentId || `${nodes.length}`,
                target: newNode.id,
                animated: true,
                sourceHandle: 'b',
                style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
                zIndex: 10, // Ajusta el zIndex si es necesario
                markerEnd: {
                    type: MarkerType.ArrowClosed, // Flecha al final de la línea
                    color: '#d033b9', // Ajusta el color de la flecha aquí
                },
            };
        }

        const updatedNodes = [...nodes, newNode];
        const updatedEdges = [...edges, newEdge];
        setNodes(updatedNodes);
        setEdges(updatedEdges);
        setVariables((vars) => [...vars, { name: queryName, displayName: queryName, nodeId: newNode.id }]);
        generateCodeFromNodes(updatedNodes, updatedEdges);
    }

    setShowGptQueryModal(false);
    setSelectedAssistant('');
    setQueryName('');
    setQueryPrompt('');
    setSelectedVariables([]);
    setCurrentEditingNodeId(null);
};


  const handleSplitVariableModalSave = () => {
    const resultNamesStr = splitResultNames.join(', ');
    const splitCode = `const [${resultNamesStr}] = ${splitVariable}.split('${splitParameter}').map(item => item.trim());`;

    // Validación manual
  if (!splitVariable) {
    alert('Debe seleccionar una variable a dividir.');
    return;
  }

  if (!splitParameter) {
    alert('Debe ingresar un parámetro para dividir.');
    return;
  }
  const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Dividir variable: ${splitVariable}`,
        code: [splitCode],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];

    const newVariables = splitResultNames.map((name) => ({ name, displayName: name, nodeId: newNode.id }));
    setVariables((vars) => [...vars, ...newVariables]);

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);

    setShowSplitVariableModal(false);
    setSplitVariable('');
    setSplitParameter('');
    setSplitResultNames(['']);
  };

  const handleEntityTypeChange = (option) => {
    if (option === "Instalación") {
      if (selectedEntityType.includes("Instalación")) {
        setSelectedEntityType([]);
      } else {
        setSelectedEntityType(["Instalación"]);
      }
    } else {
      if (selectedEntityType.includes(option)) {
        setSelectedEntityType((prev) => prev.filter((item) => item !== option));
      } else {
        if (!selectedEntityType.includes("Instalación")) {
          setSelectedEntityType((prev) => [...prev, option]);
        }
      }
    }
  };
  
  
  const handleQueryParamsChange = (option) => {
    if (option === "Id") {
      if (selectedQueryParams.includes("Id")) {
        setSelectedQueryParams([]);
      } else {
        setSelectedQueryParams(["Id"]);
      }
    } else {
      if (selectedQueryParams.includes(option)) {
        setSelectedQueryParams((prev) => prev.filter((item) => item !== option));
      } else {
        if (!selectedQueryParams.includes("Id")) {
          setSelectedQueryParams((prev) => [...prev, option]);
        }
      }
    }
  };  
  
  const renderSearchFields = () => {
    const fields = [];
  
    if (selectedQueryParams.includes("Id")) {
      fields.push(
        <div key="id">
          <label htmlFor="id">Ingrese el Id</label>
          <input type="text" id="id" onChange={(e) => setSearchData({ ...searchData, id: e.target.value })} />
        </div>
      );
    }
  
    if (selectedQueryParams.includes("Departamento")) {
      fields.push(
        <div key="departamento">
          <Form.Group controlId="formDepartment">
            <Form.Label>Departamento</Form.Label>
            <Form.Control
              as="select"
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSearchData({ ...searchData, departamento: e.target.value });
              }}
            >
              <option value="">Seleccione un departamento</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>
      );
    }
  
    if (selectedQueryParams.includes("Rol")) {
      fields.push(
        <div key="rol">
          <Form.Group controlId="formRole">
            <br></br>
            <Form.Label>Rol</Form.Label>
            <Form.Control
              as="select"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setSearchData({ ...searchData, rol: e.target.value });
              }}
            >
              <option value="">Seleccione un rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>
      );
    }
  
    return fields;
  };
   

  useEffect(() => {
    if (showAgendaModal) {
      const fetchDepartments = async () => {
        const companyId = localStorage.getItem("company_id");
        try {
          const departmentsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/departments/${companyId}`);
          setDepartments(departmentsResponse.data);
        } catch (error) {
          console.error('Error fetching departments:', error);
        }
      };
  
      const fetchRoles = async () => {
        const companyId = localStorage.getItem("company_id");
        try {
          const rolesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/roles/${companyId}`);
          setRoles(rolesResponse.data);
        } catch (error) {
          console.error('Error fetching roles:', error);
        }
      };
  
      fetchDepartments();  // Llama a la función para consultar los departamentos
      fetchRoles();        // Llama a la función para consultar los roles
    }
  }, [showAgendaModal]);
  
  const handleCustomPeriodChange = (type, periodType, value) => {
    if (periodType === 'days') {
      if (type === 'start') setCustomStartDays(value);
      else setCustomEndDays(value);
    } else if (periodType === 'months') {
      if (type === 'start') setCustomStartMonths(value);
      else setCustomEndMonths(value);
    } else if (periodType === 'years') {
      if (type === 'start') setCustomStartYears(value);
      else setCustomEndYears(value);
    }
  };

  const handleDateChange = (type, period, value) => {
    if (type === 'start') {
      setStartDate({ type: period, value });
      if (period === 'custom') {
        // Borrar los datos del periodo final si se selecciona "Custom"
        setEndDate({ type: '', value: '' });
      }
    } else {
      setEndDate({ type: period, value });
    }
  };
  
  const handleCustomStartDateChange = (e) => {
    setCustomStartDate(e.target.value);
  };
  
  const renderPeriodSelector = (type) => {
    return (
      <>
        <Form.Group controlId={`formPeriod${type}`} className="mb-3">
          <Form.Label>{type === 'start' ? 'Inicio del Periodo' : 'Fin del Periodo'}</Form.Label>
          <Form.Control
            as="select"
            value={type === 'start' ? startDate.type : endDate.type}
            onChange={(e) => handleDateChange(type, e.target.value, '')}
            disabled={type === 'end' && startDate.type === 'custom'}
          >
            <option value="">Seleccione un periodo</option>
            <option value="day">Día</option>
            <option value="month">Mes</option>
            <option value="year">Año</option>
            {type === 'start' && <option value="custom">Custom</option>} {/* Opción Custom solo para Inicio */}
          </Form.Control>
        </Form.Group>
  
        {/* Si el usuario selecciona 'custom', mostrar un input para la variable personalizada */}
        {(type === 'start' ? startDate.type : endDate.type) === 'custom' && (
        <Form.Group controlId={`formCustomStartDate${type}`} className="mb-3">
          <Form.Label>Seleccione la variable</Form.Label>
          <Form.Control
            as="select"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}  // Actualiza el estado con la variable seleccionada
          >
            <option value="">Seleccione una variable</option>
            {variables.map((variable) => (
              <option key={variable.name} value={variable.name}>
                {variable.displayName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      )}

      {(type === 'start' ? startDate.type : endDate.type) === 'day' && (
        <Form.Group controlId={`formCustomDays${type}`} className="mb-3">
          <Form.Label>Selección de Día</Form.Label>
          <Form.Control
            as="select"
            value={type === 'start' ? startDate.value : endDate.value}
            onChange={(e) => handleDateChange(type, 'day', e.target.value)}
          >
            <option value="">Seleccione una opción</option>
            <option value="today">Hoy</option>
            <option value="inDays">En [X] días</option>
            <option value="variable">Variable</option>
          </Form.Control>

          {(type === 'start' ? startDate.value : endDate.value) === 'inDays' && (
            <Form.Group className="mt-3">
              <Form.Label>Cantidad de días</Form.Label>
              <Form.Control
                type="number"
                placeholder="Número de días"
                value={type === 'start' ? customStartDays: customEndDays}
                onChange={(e) => handleCustomPeriodChange(type, 'days', e.target.value)}
                className="mb-3"
              />
            </Form.Group>
          )}

          {(type === 'start' ? startDate.value : endDate.value) === 'variable' && (
            <Form.Group className="mt-3">
              <Form.Label>Seleccione una variable</Form.Label>
              <Form.Control
                as="select"
                value={type === 'start' ? selectedStartVariable : selectedEndVariable}
                onChange={(e) => type === 'start' ? setSelectedStartVariable(e.target.value) : setSelectedEndVariable(e.target.value)}
                className="mb-3"
              >
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>
                    {variable.displayName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          )}
        </Form.Group>
      )}

      {(type === 'start' ? startDate.type : endDate.type) === 'month' && (
        <Form.Group controlId={`formCustomMonths${type}`} className="mb-3">
          <Form.Label>Selección de Mes</Form.Label>
          <Form.Control
            as="select"
            value={type === 'start' ? startDate.value : endDate.value}
            onChange={(e) => handleDateChange(type, 'month', e.target.value)}
          >
            <option value="">Seleccione una opción</option>
            <option value="thisMonth">Este mes</option>
            <option value="inMonths">En [X] meses</option>
            <option value="variable">Variable</option>
          </Form.Control>

          {(type === 'start' ? startDate.value : endDate.value) === 'inMonths' && (
            <Form.Group className="mt-3">
              <Form.Label>Cantidad de meses</Form.Label>
              <Form.Control
                type="number"
                placeholder="Número de meses"
                value={type === 'start' ? customStartMonths : customEndMonths}
                onChange={(e) => handleCustomPeriodChange(type, 'months', e.target.value)}
                className="mb-3"
              />
            </Form.Group>
          )}

          {(type === 'start' ? startDate.value : endDate.value) === 'variable' && (
            <Form.Group className="mt-3">
              <Form.Label>Seleccione una variable</Form.Label>
              <Form.Control
                as="select"
                value={type === 'start' ? selectedStartVariable : selectedEndVariable}
                onChange={(e) => type === 'start' ? setSelectedStartVariable(e.target.value) : setSelectedEndVariable(e.target.value)}
                className="mb-3"
              >
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>
                    {variable.displayName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          )}
        </Form.Group>
      )}

      {(type === 'start' ? startDate.type : endDate.type) === 'year' && (
        <Form.Group controlId={`formCustomYears${type}`} className="mb-3">
          <Form.Label>Selección de Año</Form.Label>
          <Form.Control
            as="select"
            value={type === 'start' ? startDate.value : endDate.value}
            onChange={(e) => handleDateChange(type, 'year', e.target.value)}
          >
            <option value="">Seleccione una opción</option>
            <option value="thisYear">Este año</option>
            <option value="inYears">En [X] años</option>
            <option value="variable">Variable</option>
          </Form.Control>

          {(type === 'start' ? startDate.value : endDate.value) === 'inYears' && (
            <Form.Group className="mt-3">
              <Form.Label>Cantidad de años</Form.Label>
              <Form.Control
                type="number"
                placeholder="Número de años"
                value={type === 'start' ? customStartYears : customEndYears}
                onChange={(e) => handleCustomPeriodChange(type, 'years', e.target.value)}
                className="mb-3"
              />
            </Form.Group>
          )}

          {(type === 'start' ? startDate.value : endDate.value) === 'variable' && (
            <Form.Group className="mt-3">
              <Form.Label>Seleccione una variable</Form.Label>
              <Form.Control
                as="select"
                value={type === 'start' ? selectedStartVariable : selectedEndVariable}
                onChange={(e) => type === 'start' ? setSelectedStartVariable(e.target.value) : setSelectedEndVariable(e.target.value)}
                className="mb-3"
              >
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>
                    {variable.displayName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          )}
        </Form.Group>
      )}
    </>
  );
}; 

const addGetRequestDataKey = () => {
  setGetRequestDataKeys([...getRequestDataKeys, { key: '' }]);
};

const removeGetRequestDataKey = (index) => {
  setGetRequestDataKeys(getRequestDataKeys.filter((_, i) => i !== index));
};

const updateGetRequestDataKey = (index, field, value) => {
  const newGetRequestDataKeys = [...getRequestDataKeys];
  newGetRequestDataKeys[index][field] = value;
  setGetRequestDataKeys(newGetRequestDataKeys);
};

const addGetValidationCondition = () => {
  setGetValidationConditions([...getValidationConditions, { key: '', value: '' }]);
};

const removeGetValidationCondition = (index) => {
  setGetValidationConditions(getValidationConditions.filter((_, i) => i !== index));
};

const updateGetValidationCondition = (index, field, value) => {
  const newGetValidationConditions = [...getValidationConditions];
  newGetValidationConditions[index][field] = value;
  setGetValidationConditions(newGetValidationConditions);
};

const handleGetRequestModalSave = async () => {
  const getValidationConditionsArray = getValidationConditions
    .filter(condition => condition.key && condition.value)
    .map(condition => `(request_data->>'${condition.key}') = '${condition.value}'`);

  const getValidationConditionString = getValidationConditionsArray.length > 0
    ? `AND ${getValidationConditionsArray.join(' AND ')}`
    : '';

  const getRequestDataKeysArray = getRequestDataKeys.map(data => data.key);

  let code = `getRequestType = "${getRequestType}";\n`;
  code += `getRequestStatus = "${getRequestStatus}";\n`;
  code += `getRequestDataKeys = [${getRequestDataKeysArray.map(key => `"${key}"`).join(', ')}];\n`;

  code += `
    selectRequestQuery = \`
      SELECT request_data
      FROM requests
      WHERE conversation_id = $1
        AND request_type = $2
        AND status = $3
        AND company_id = $4
        ${getValidationConditionString};
    \`;
    const requestResult = await pool.query(selectRequestQuery, [conversationId, getRequestType, getRequestStatus, integrationDetails.company_id]);

    if (requestResult.rows.length > 0) {
      const requestData = requestResult.rows[0].request_data;

      ${getRequestDataKeysArray.map(key => `const ${key} = requestData['${key}'];`).join('\n')}
      console.log(${getRequestDataKeysArray.map(key => `"${key}: " + ${key}`).join(', ')});

      requestDataText = JSON.stringify(requestData, null, 2);
    } else {
      console.log("No se encontró la solicitud.");
    }
  `;

  let updatedNodes, updatedEdges;

  if (currentEditingNodeId) {
    // Si estamos editando un nodo existente
    updatedNodes = nodes.map(node => {
      if (node.id === currentEditingNodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            label: `Obtener Solicitud: ${getRequestType}`,
            code: [code],
            getRequestType,
            getRequestStatus,
            getValidationConditions,
            getRequestDataKeys,
            tipo: 'getRequest',
            onAddClick: (id) => openToolModal(id, true), 
            onAddExternalClick: (id) => openToolModal(id, false),  
            editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
          },
        };
      }
      return node;
    });
    updatedEdges = edges; // Mantén las aristas actuales
    setCurrentEditingNodeId(null);
  } else {
    // Si estamos creando un nuevo nodo
    const newNode = {
      id: randomId(),
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Obtener Solicitud: ${getRequestType}`,
        code: [code],
        getRequestType,
        getRequestStatus,
        getValidationConditions,
        getRequestDataKeys,
        tipo: 'getRequest',
        onAddClick: (id) => openToolModal(id, true), 
        onAddExternalClick: (id) => openToolModal(id, false),  
        editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
      },
    };

    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

     // Agregar nuevas variables para cada dato extraído
  const newVariables = getRequestDataKeysArray.map((name) => ({
    name, 
    displayName: name, 
    nodeId: newNode.id 
  }));

  // Agregar la variable de la solicitud completa como texto
  const requestDataTextVariable = {
    name: 'requestDataText',
    displayName: 'Datos de Solicitud Completa (Texto)',
    nodeId: newNode.id,
    value: 'requestDataText' // Será el nombre de la variable generada
  };

  // Actualizar el estado de variables
  setVariables((vars) => [...vars, ...newVariables]);

  // Actualizar el estado de variables con las variables extraídas y la solicitud completa en texto
  setVariables((vars) => [...vars, ...newVariables, requestDataTextVariable]);

    updatedNodes = [...nodes, newNode];
    updatedEdges = [...edges, newEdge];
  }

  setNodes(updatedNodes);
  setEdges(updatedEdges);
  generateCodeFromNodes(updatedNodes, updatedEdges);

  setShowGetRequestModal(false);
  setGetRequestType('');
  setGetRequestStatus('');
  setGetValidationConditions([{ key: '', value: '' }]);
  setGetRequestDataKeys([{ key: '' }]);
};

const handleSaveDelayModal = () => {
  setShowDelayModal(false);  // Cierra el modal
  generateCodeForDelay();    // Genera el código para el retardo
};

const generateCodeForDelay = async () => {
  let codeArray = [];
  let timeInMilliseconds;

  // Convertir el tiempo a milisegundos según la unidad de medida
  switch (delayUnit) {
    case 'Segundos':
      timeInMilliseconds = delayTime * 1000;
      break;
    case 'Minutos':
      timeInMilliseconds = delayTime * 60 * 1000;
      break;
    case 'Horas':
      timeInMilliseconds = delayTime * 60 * 60 * 1000;
      break;
    default:
      timeInMilliseconds = delayTime * 1000;  // Por defecto segundos
  }

  // Código para implementar el retardo
  codeArray.push(`// Retardo de ejecución por ${delayTime} ${delayUnit}\n`);
  codeArray.push(`await new Promise(resolve => setTimeout(resolve, ${timeInMilliseconds}));\n`);

  // Crear la nueva variable si es necesaria (en este caso no es necesario almacenar variables globales)

  // Continuar con la creación o actualización del nodo
  let updatedNodes, updatedEdges;

  if (currentEditingNodeId) {
    // Editar nodo existente
    updatedNodes = nodes.map(node => {
      if (node.id === currentEditingNodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            label: `Retardo de ${delayTime} ${delayUnit}`,
            code: codeArray,
            tipo: 'delay',
            onAddClick: (id) => openToolModal(id, true),  // Permite agregar nodos hijos
            editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),  // Permite editar el nodo
          },
        };
      }
      return node;
    });
    setCurrentEditingNodeId(null);
  } else {
    const newId = randomId();
    // Crear nuevo nodo
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Retardo de ${delayTime} ${delayUnit}`,
        code: codeArray,
        tipo: 'delay',
        onAddClick: (id) => openToolModal(id, true),  // Permite agregar nodos hijos
        editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),  // Permite editar el nodo
      },
    };

    // Crear la nueva conexión (edge) con el estilo correcto
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }else{
      newEdge = {
        id: `e${currentNodeId || nodes.length}-${nodes.length + 1}`,
        source: currentNodeId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
        zIndex: 10, // Ajusta el zIndex si es necesario
        markerEnd: {
          type: MarkerType.ArrowClosed, // Flecha al final de la línea
          color: '#d033b9', // Ajusta el color de la flecha aquí
        },
      };
    }

    updatedNodes = [...nodes, newNode];
    updatedEdges = [...edges, newEdge];
  }

  setNodes(updatedNodes);
  setEdges(updatedEdges);
};

const loadRecipients = async (type) => {
  const companyId = localStorage.getItem("company_id");
  try {
      let data = [];
      switch (type) {
          case 'user':
            const usersResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?company_id=${companyId}`);
            data = usersResponse.data;
              break;
          case 'colaborador':
              const colaboradoresResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/colaboradores?company_id=${companyId}`);
              data = colaboradoresResponse.data;
              break;
          case 'contact':
              const contactsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/contacts?company_id=${companyId}`);
              data = contactsResponse.data;
              break;
          case 'variable':
              data = variables; // Esto depende de si tienes variables cargadas previamente en el estado
              break;
      }
      
      console.log(`Datos recibidos para ${type}:`, data); // Verifica los datos en consola
      setRecipients((prev) => ({ ...prev, [type]: data }));
  } catch (error) {
      console.error(`Error fetching ${type}:`, error);
  }
};

const handleSendMessageSave = () => {
  const finalMessageText = `\`${messageText.replace(/\${([^}]+)}/g, '${$1}')}\``;

  let updatedNodes, updatedEdges;

  if (currentEditingNodeId) {
    console.log("Editando nodo enviar a tercero", currentEditingNodeId);

    updatedNodes = nodes.map(node => {
      if (node.id === currentEditingNodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            label: `Enviar a Tercero: ${responseTextName}`,
            responseTextName,
            messageText,
            selectedRecipient,
            tipo: 'sendToThirdParty',
            code: [
              `const ThirdPartyContactId = await getOrCreateContact(${selectedRecipient}, integrationDetails.company_id);`,
              `const ThirdPartyConversationId = await getOrCreateConversation(ThirdPartyContactId, ${selectedRecipient}, integrationDetails.integration_id, integrationDetails.company_id);`,
              `const messageText = ${finalMessageText};`,
              `await sendTextMessage(io, { body: { phone: ${selectedRecipient}, messageText, conversationId: ThirdPartyConversationId } }, {});`
            ],
          },
        };
      }
      return node;
    });
    setNodes(updatedNodes);
    generateCodeFromNodes(updatedNodes, edges);
    setCurrentEditingNodeId(null);
  } else {
    console.log("Creando nuevo nodo enviar a tercero");

    const newId = randomId();
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Enviar a Tercero: ${responseTextName}`,
        responseTextName,
        messageText,
        selectedRecipient,
        tipo: 'sendToThirdParty',
        code: [
          `const ThirdPartyContactId = await getOrCreateContact(${selectedRecipient}, integrationDetails.company_id);`,
          `const ThirdPartyConversationId = await getOrCreateConversation(ThirdPartyContactId, ${selectedRecipient}, integrationDetails.integration_id, integrationDetails.company_id);`,
          `const messageText = ${finalMessageText};`,
          `await sendTextMessage(io, { body: { phone: ${selectedRecipient}, messageText, conversationId: ThirdPartyConversationId } }, {});`
        ],
        onAddClick: (id) => openToolModal(id, true),
        onAddExternalClick: (id) => openToolModal(id, false),
        editarNodo: (id, tipo, datos) => editarNodo(id, tipo, datos, setNodes),
      },
      parentId: isInternal ? currentNodeId : null,
    };

    console.log("Nuevo nodo creado:", newNode);

    let newEdge;
    if (isInternal) {
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        style: { stroke: '#d033b9' },
        zIndex: 10,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#d033b9',
        },
      };
    } else {
      newEdge = {
        id: `e${newNode.parentId || nodes.length}-${nodes.length + 1}`,
        source: newNode.parentId || `${nodes.length}`,
        target: newNode.id,
        animated: true,
        sourceHandle: 'b',
        style: { stroke: '#d033b9' },
        zIndex: 10,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#d033b9',
        },
      };
    }

    updatedNodes = [...nodes, newNode];
    updatedEdges = [...edges, newEdge];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setVariables((vars) => [...vars, { name: 'messageText', displayName: responseTextName, nodeId: newNode.id }]);
    generateCodeFromNodes(updatedNodes, updatedEdges);
  }

  setShowSendMessageModal(false);
  setResponseTextName('');
  setMessageText('');
  setSelectedRecipient('');
  setSelectedRecipientType('');
  setCurrentEditingNodeId(null); // Resetea el ID de edición actual
};

const updateEventFields = (index, key, value) => {
  const updatedFields = [...eventFields];
  if (!updatedFields[index]) {
    updatedFields[index] = {};
  }
  updatedFields[index][key] = value;
  setEventFields(updatedFields);
};



const handleSaveAgendar = () => {
  if (limitType === 'fixed' && (!eventCount || parseInt(eventCount) <= 0)) {
    alert('Por favor, especifique una cantidad válida de eventos.');
    return;
  }

  if (limitType === 'variable' && (!maxEvents || parseInt(maxEvents) <= 0 || !limitVariable)) {
    alert('Por favor, complete el máximo permitido y la variable que determina el límite.');
    return;
  }

  if (!eventFields || eventFields.length === 0) {
    alert('Debe configurar al menos un evento.');
    return;
  }

  // Generar el código basado en la selección
  generateCodeForAgendar();

  // Cerrar el modal
  setShowAgendarModal(false);
};


  const generateCodeFromNodes = (nodes, edges) => {
    let initialDeclarations = 'let responseText;\nlet responseImage;\nlet responseVideo;\nlet responseDocument;\nlet responseAudio;\nlet latitude;\nlet longitude;\nlet streetName;\nlet videoDuration;\nlet videoThumbnail;\nlet payload;\nlet requestType;\nlet requestStatus;\nlet nuevoStatus;\nlet requestData;\nlet existingRequestQuery;\nlet existingRequestResult;\nlet requestId;\nlet updateRequestQuery;\nlet insertRequestQuery;\nlet headersRequest;\nlet requestQueryExternal;\nlet requestResultExternal;\nlet requestDataExternal;\nlet credentialsRequest;\nlet updateStatusQueryExternal;\nlet responseExternal;\nlet intentions;\nlet apiKey;\nlet url;\nlet headers;\nlet responseGpt;\nlet gptResponse;\nlet requestDataText;\nlet confirmationVariable;\nlet dataEventsVariable;\n';

    initialDeclarations += `const queryConversation = \`
    SELECT
      c.conversation_id,
      c.contact_id,
      c.state,
      c.last_update,
      c.unread_messages,
      c.id_usuario,
      ct.id,
      ct.phone_number,
      ct.first_name,
      ct.last_name,
      ct.organization,
      ct.profile_url,
      ct.label,
      ct.edad_approx,
      ct.fecha_nacimiento,
      ct.nacionalidad,
      ct.ciudad_residencia,
      ct.direccion_completa,
      ct.email,
      ct.genero,
      ct.orientacion_sexual,
      ct.pagina_web,
      ct.link_instagram,
      ct.link_facebook,
      ct.link_linkedin,
      ct.link_twitter,
      ct.link_tiktok,
      ct.link_youtube,
      ct.nivel_ingresos,
      ct.ocupacion,
      ct.nivel_educativo,
      ct.estado_civil,
      ct.cantidad_hijos,
      ct.estilo_de_vida,
      ct.personalidad,
      ct.cultura,
      ct.preferencias_contacto,
      ct.historial_compras,
      ct.historial_interacciones,
      ct.observaciones_agente,
      ct.fecha_creacion_cliente,
      u.nombre as responsable_nombre,
      u.apellido as responsable_apellido,
      dp.id as phase_id,
      dp.name as phase_name,
      dp.color as phase_color,
      last_message_info.last_message,
      last_message_info.last_message_time,
      last_message_info.message_type
    FROM
      conversations c
    LEFT JOIN users u ON c.id_usuario = u.id_usuario
    LEFT JOIN contacts ct ON c.contact_id = ct.id
    LEFT JOIN department_phases dp ON ct.label = dp.id
    LEFT JOIN LATERAL (
      SELECT
        sub.last_message,
        sub.last_message_time,
        sub.message_type
      FROM (
        SELECT
          message_text AS last_message,
          received_at AS last_message_time,
          message_type
        FROM messages
        WHERE conversation_fk = c.conversation_id
        UNION
        SELECT
          reply_text AS last_message,
          created_at AS last_message_time,
          reply_type AS message_type
        FROM replies
        WHERE conversation_fk = c.conversation_id
      ) sub
      ORDER BY sub.last_message_time DESC
      LIMIT 1
    ) last_message_info ON true
    WHERE c.conversation_id = $1;
  \`;

  const conversation = await pool.query(queryConversation, [conversationId]);
  if (conversation.rows.length === 0) {
    throw new Error('Conversation not found');
  }
  const conversationData = conversation.rows[0];\n\n`;

  initialDeclarations += `
  // Asegúrate de que esta función esté en el alcance del código generado
  const calculateDateValue = (type, clientTimezone, moment) => {
    const now = moment().tz(clientTimezone);
    switch (type) {
      case 'today':
        return now.format('DD/MM/YY');
      case 'yesterday':
        return \`ayer \${now.clone().subtract(1, 'day').format('dddd')}\`;
      case 'tomorrow':
        return \`mañana \${now.clone().add(1, 'day').format('dddd')}\`;
      case 'weekend':
        const nextSaturday = now.clone().day(6); // 6 es Sábado en moment.js
        return \`este fin de semana \${nextSaturday.format('DD/MM')}\`;
      case 'this_month':
        return now.format('MMMM');
      case 'working day':
        const hour = now.hour();
        if (hour >= 6 && hour < 12) return 'dias';
        if (hour >= 12 && hour < 18) return 'tardes';
        return 'noches';
      case 'hour':
        return now.format('HH:mm');
      case 'day_name':
        return now.format('dddd');
      default:
        return '';
    }
  };\n\n

  // Asegúrate de que esta función esté en el alcance del código generado
  const fetchVariableValue = async (source, variable, senderId, companyId, pool) => {
  let query = '';
  switch (source) {
    case 'contacts':
      query = \`SELECT \${variable} FROM contacts WHERE phone_number = \$1\ and company_id = \$2\`;
      return (await pool.query(query, [senderId, companyId])).rows[0]?.[variable] || '';
    case 'users':
      const responsibleConv = await pool.query('SELECT id_usuario FROM conversations WHERE conversation_id = $1', [conversationId]);
      const responsibleUserIdConv = responsibleConv.rows[0].id_usuario;
      query = \`SELECT \${variable} FROM users WHERE id_usuario = \$1\ and company_id = \$2\`;
      return (await pool.query(query, [responsibleUserIdConv,companyId])).rows[0]?.[variable] || '';
    case 'companies':
      query = \`SELECT \${variable} FROM companies WHERE id = \$1\`;
      return (await pool.query(query, [companyId])).rows[0]?.[variable] || '';
    default:
      return '';
  }
};\n\n

let resTemplate = {
  status: function(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json: function(data) {
    console.log('Response:', data);
    return this;
  }
};\n\n

async function updateContact(io, phoneNumber, companyId, contactFieldName, contactFieldValue) {
 const query = \`
 UPDATE contacts SET
 \${contactFieldName} = $3
 WHERE phone_number = $1 AND company_id = $2
 RETURNING *;
 \`;
 try {
 const result = await pool.query(query, [phoneNumber, companyId, contactFieldValue]);
 if (result.rows.length > 0) {
 const updatedContact = result.rows[0];
 io.emit('contactUpdated', updatedContact);
 } else {
 console.log('No contact found for the given phone number and company ID.');
 }
 } catch (err) {
 console.error('Database error in updateContact:', err);
 throw err;
 }
 }\n\n
`;

initialDeclarations +=`async function getOrCreateContact(phoneNumber, companyId) {
  const findQuery = 'SELECT id FROM contacts WHERE phone_number = $1 AND company_id = $2';
  try {
    let result = await pool.query(findQuery, [phoneNumber, companyId]);
    if (result.rows.length > 0) {
      return result.rows[0].id;
    } else {
      const contactQuery = 'INSERT INTO contacts (phone_number, company_id) VALUES ($1, $2) RETURNING id';
      const contactResult = await pool.query(contactQuery, [phoneNumber, companyId]);
      const contactId = contactResult.rows[0].id;
      console.log(\`ID del contacto: \${contactId}\`);
      return contactId;
    }
  } catch (err) {
    console.error('Error de base de datos en getOrCreateContact:', err);
    throw err;
  }
}\n\n`;

initialDeclarations +=`async function getOrCreateConversation(contactId, phoneNumber, integrationId, companyId) {
  const findQuery = 'SELECT conversation_id, id_usuario FROM conversations WHERE contact_id = $1';
  try {
    let result = await pool.query(findQuery, [contactId]);
    if (result.rows.length > 0) {
      return result.rows[0].conversation_id;
    } else {
      // Obtener el usuario predeterminado para la empresa
      const defaultUserQuery = \`
        SELECT id_usuario 
        FROM default_users 
        WHERE company_id = $1
      \`;
      const defaultUserResult = await pool.query(defaultUserQuery, [companyId]);
      const defaultUserId = defaultUserResult.rows[0].id_usuario;

      const insertQuery = 'INSERT INTO conversations (phone_number, state, id_usuario, contact_id, integration_id) VALUES ($1, $2, $3, $4, $5) RETURNING conversation_id';
      const conversationResult = await pool.query(insertQuery, [phoneNumber, 'new', defaultUserId, contactId, integrationId]);
      const conversationId = conversationResult.rows[0].conversation_id;
      return conversationId;
    }
  } catch (err) {
    console.error('Error de base de datos en getOrCreateConversation:', err);
    throw err;
  }
}`;

initialDeclarations +=`const contactInfo = await getContactInfo(senderId, integrationDetails.company_id);

const responsibleRes = await pool.query('SELECT id_usuario FROM conversations WHERE conversation_id = $1', [conversationId]);
const responsibleUserId = responsibleRes.rows[0].id_usuario;

// Obtener el estado de la conversación,
const conversationStateQuery = 'SELECT state FROM conversations WHERE conversation_id = $1';
const conversationStateResult = await pool.query(conversationStateQuery, [conversationId]);
let conversationState = conversationStateResult.rows[0]?.state;\n\n`;

initialDeclarations +=`const currentTime = moment.tz(clientTimezone);\n\n`;

const generateNodeCode = (node, indent = '') => {
  let nodeCode = '';

  if (node.type === 'custom') {
    nodeCode += `${indent}${node.data.code.join('\n')}\n`;

    const childNodes = nodes.filter((n) => n.parentId === node.id).sort((a, b) => a.position.y - b.position.y);
    childNodes.forEach((child) => {
      nodeCode += generateNodeCode(child, indent + '  ');
    });

  } else if (node.type === 'conditional') {
    const condition = node.data.code[0];
    nodeCode += `${indent}${condition} {\n`;

    const ifChildren = nodes.filter((n) => n.parentId === `${node.id}-if`).sort((a, b) => a.position.y - b.position.y);
    ifChildren.forEach((child) => {
      nodeCode += generateNodeCode(child, indent + '  ');
    });

    nodeCode += `${indent}} else {\n`;

    const elseChildren = nodes.filter((n) => n.parentId === `${node.id}-else`).sort((a, b) => a.position.y - b.position.y);
    elseChildren.forEach((child) => {
      nodeCode += generateNodeCode(child, indent + '  ');
    });

    nodeCode += `${indent}}\n`;

  } else if (node.type === 'switch') {
    const switchStatement = node.data.code[0];
    nodeCode += `${indent}${switchStatement}\n`;

    const caseChildren = nodes.filter((n) => n.parentId === node.id).sort((a, b) => a.position.y - b.position.y);
    caseChildren.forEach((child) => {
      nodeCode += generateNodeCode(child, indent + '  ');
    });

    nodeCode += `${indent}}\n`;

  } else if (node.type === 'caseNode') {
    const caseStatement = node.data.code[0];
    nodeCode += `${indent}${caseStatement}\n`;

    const caseChildren = nodes.filter((n) => n.parentId === node.id).sort((a, b) => a.position.y - b.position.y);
    caseChildren.forEach((child) => {
      nodeCode += generateNodeCode(child, indent + '  ');
    });

    nodeCode += `${indent}  break;\n`;

  } else if (node.type === 'groupNode') {
    const groupLabel = node.data.label;
    if (groupLabel === 'default') {
      nodeCode += `${indent}default:\n`;
    }

    const groupChildren = nodes.filter((n) => n.parentId === node.id).sort((a, b) => a.position.y - b.position.y);
    groupChildren.forEach((child) => {
      nodeCode += generateNodeCode(child, indent + '  ');
    });

    if (groupLabel === 'default') {
      nodeCode += `${indent}  break;\n`;
    }
  }

  return nodeCode;
};


    const rootNodes = nodes.filter((node) => !node.parentId);
    let fullCode = initialDeclarations;
    rootNodes.forEach((rootNode) => {
      fullCode += generateNodeCode(rootNode);
    });

    setCode(fullCode);
  };

  useEffect(() => {
    generateCodeFromNodes(nodes, edges);
  }, [nodes, edges]);

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Editar Bot de Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={2}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <button
                  className={`button-tool ${selectedTab === 'Diagrama' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('Diagrama')}
                >
                  Diagrama
                </button>
              </Nav.Item>
              <Nav.Item>
                <button
                  className={`button-tool ${selectedTab === 'Código' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('Código')}
                >
                  Código
                </button>
              </Nav.Item>
            </Nav>
          </Col>
          <Col md={10}>
            {selectedTab === 'Código' && (
              <Form.Group controlId="formBotCode">
                <Form.Label>Código del Bot</Form.Label>
                <CodeMirror
                  value={code}
                  height="500px"
                  extensions={[javascript({ jsx: true })]}
                  onChange={(value) => setCode(value)}
                />
              </Form.Group>
            )}
            {selectedTab === 'Diagrama' && (
              <ReactFlowProvider>
              <div className="diagram-container" style={{ display: 'flex', height: '500px' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={(nds) => {
                    onNodesChangeState(nds);
                    generateCodeFromNodes(nds, edges);
                  }}
                  onEdgesChange={(eds) => {
                    onEdgesChangeState(eds);
                    generateCodeFromNodes(nodes, eds);
                  }}
                  onConnect={onConnect}
                  onElementsRemove={onElementsRemove}
                  onEdgeUpdate={onEdgeUpdate}
                  onEdgesDelete={onEdgeDelete}
                  nodeTypes={nodeTypes}
                  onNodeClick={(_, node) => {
                    setCurrentParentId(node.id);
                    if (node.type === 'switch' || node.type === 'groupNode' || node.type === 'caseNode' || node.type === 'conditional') {
                      setCurrentSwitchNode(node.id);
                    } else {
                      setCurrentSwitchNode(null);
                    }
                  }}
                  edgeOptions={{
                    style: {
                      stroke: '#3498db', // Cambia el color de las líneas
                      strokeWidth: 2, // Ajusta el grosor de las líneas
                    },
                    markerEnd: {
                      type: MarkerType.ArrowClosed, // Cambia la flecha al final de la línea
                    },
                    type: 'smoothstep', // Cambia el tipo de línea (puede ser 'default', 'smoothstep', 'step', 'straight', etc.)
                  }}
                  style={{ flexGrow: 1 }}
                >
                  <MiniMap />
                  <Controls />
                  <Background />
                </ReactFlow>
                <div className="toolbar" style={{ width: '250px', marginLeft: '70%', padding: '0px', background: 'none', border: 'none' }}>
                  <Button variant="primary" onClick={() => setShowToolModal(true)}>
                    Agregar elemento
                  </Button>
                </div>
              </div>
            </ReactFlowProvider>

            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar
        </Button>
      </Modal.Footer>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Condicional</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {conditions.map((condition, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                {index > 0 && (
                  <Form.Group controlId={`formLogicalOperator${index}`}>
                    <Form.Label>Operador Lógico</Form.Label>
                    <Form.Control as="select" value={condition.logicalOperator} onChange={(e) => updateCondition(index, 'logicalOperator', e.target.value)}>
                      <option value="&&">Y</option>
                      <option value="||">O</option>
                    </Form.Control>
                  </Form.Group>
                )}
                <Form.Group controlId={`formVariable${index}`}>
                  <Form.Label>Variable</Form.Label>
                  <Form.Control as="select" value={condition.variable} onChange={(e) => updateCondition(index, 'variable', e.target.value)}>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>{variable.displayName}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId={`formOperator${index}`}>
                  <Form.Label>Operador</Form.Label>
                  <Form.Control as="select" value={condition.operator} onChange={(e) => updateCondition(index, 'operator', e.target.value)}>
                    <option value="==">Igual</option>
                    <option value="!=">Distinto</option>
                    <option value=">">Mayor</option>
                    <option value="<">Menor</option>
                    <option value=">=">Mayor igual</option>
                    <option value="<=">Menor igual</option>
                    <option value="!">No Existe</option>
                    <option value="includes">Incluye</option>
                  </Form.Control>
                </Form.Group>
                {condition.operator !== '!' && (
                  <Form.Group controlId={`formComparisonValue${index}`}>
                    <Form.Label>Valor de Comparación</Form.Label>
                    <Form.Control type="text" value={condition.value} onChange={(e) => updateCondition(index, 'value', e.target.value)} />
                  </Form.Group>
                )}
                <Button variant="danger" onClick={() => removeCondition(index)}>Eliminar</Button>
              </div>
            ))}
            <Button variant="primary" onClick={addCondition}>Agregar Condición</Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSwitchModal} onHide={() => setShowSwitchModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Switch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formSwitchVariable">
              <Form.Label>Variable</Form.Label>
              <Form.Control as="select" value={selectedVariable} onChange={(e) => setSelectedVariable(e.target.value)}>
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>{variable.displayName}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSwitchModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSwitchModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>



      <Modal show={showResponseTextModal} onHide={() => setShowResponseTextModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Enviar Texto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formResponseTextName">
              <Form.Label>Nombre de la Respuesta</Form.Label>
              <Form.Control type="text" value={responseTextName} onChange={(e) => setResponseTextName(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formResponseText">
              <Form.Label>Texto de la Respuesta</Form.Label>
              <Form.Control as="textarea" rows={3} value={responseText} onChange={(e) => setResponseText(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formVariables">
              <Form.Label>Agregar Variables</Form.Label>
              <Form.Control
                as="select"
                multiple
                value={selectedVariables}
                onChange={(e) => {
                  const selectedOptions = [...e.target.selectedOptions].map(o => o.value);
                  setSelectedVariables(selectedOptions);
                  const variablesStr = selectedOptions.map(variable => `\${${variable}}`).join(' ');
                  setResponseText(responseText + variablesStr);
                }}
              >
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>{variable.displayName}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResponseTextModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleResponseTextModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUpdateContactNameModal} onHide={() => setShowUpdateContactNameModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Actualizar nombre contacto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFirstName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control as="select" value={selectedFirstName} onChange={(e) => setSelectedFirstName(e.target.value)}>
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>{variable.displayName}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formLastName">
              <Form.Label>Apellido</Form.Label>
              <Form.Control as="select" value={selectedLastName} onChange={(e) => setSelectedLastName(e.target.value)}>
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>{variable.displayName}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateContactNameModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateContactNameModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUpdateStateModal} onHide={() => setShowUpdateStateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Actualizar Estado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNewState">
              <Form.Label>Nuevo Estado de la Conversación</Form.Label>
              <Form.Control type="text" value={newState} onChange={(e) => setNewState(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateStateModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateStateModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showGptAssistantModal} onHide={() => setShowGptAssistantModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Configurar Asistente GPT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formAssistantName">
              <Form.Label>Nombre del Asistente</Form.Label>
              <Form.Control
                type="text"
                value={assistantName}
                onChange={(e) => {
                  const { value } = e.target;
                  setAssistantName(value);
                }}
                isInvalid={assistants.some(assistant => assistant.name === assistantName)}
              />
              <Form.Control.Feedback type="invalid">
                Ya existe un asistente con ese nombre. Por favor, elige otro nombre.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formGptModel">
              <Form.Label>Modelo GPT</Form.Label>
              <Form.Control
                as="select"
                value={gptModel}
                onChange={(e) => setGptModel(e.target.value)}
              >
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                <option value="gpt-4">gpt-4</option>
                <option value="gpt-4-turbo">gpt-4-turbo</option>
                <option value="gpt-4-32k">gpt-4-32k</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formPersonality">
              <Form.Label>Personalidad</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGptAssistantModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGptAssistantModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showGptQueryModal} onHide={() => setShowGptQueryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Consulta GPT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formAssistantSelect">
              <Form.Label>Seleccionar Asistente</Form.Label>
              <Form.Control as="select" value={selectedAssistant} onChange={(e) => setSelectedAssistant(e.target.value)}>
                {assistants.map((assistant) => (
                  <option key={assistant.name} value={assistant.name}>{assistant.displayName}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formQueryName">
              <Form.Label>Nombre de la Consulta</Form.Label>
              <Form.Control type="text" value={queryName} onChange={(e) => setQueryName(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formQueryPrompt">
              <Form.Label>Prompt</Form.Label>
              <Form.Control as="textarea" rows={3} value={queryPrompt} onChange={(e) => setQueryPrompt(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formVariables">
              <Form.Label>Agregar Variables</Form.Label>
              <Form.Control
                as="select"
                multiple
                value={selectedVariables}
                onChange={(e) => {
                  const selectedOptions = [...e.target.selectedOptions].map(o => o.value);
                  const newVariables = selectedOptions.filter(option => !selectedVariables.includes(option));
                  setSelectedVariables([...selectedVariables, ...newVariables]);
                  const variablesStr = newVariables.map(variable => `\${${variable}}`).join(' ');
                  setQueryPrompt(queryPrompt + variablesStr);
                }}
              >
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>{variable.displayName}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGptQueryModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGptQueryModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConcatVariablesModal} onHide={() => setShowConcatVariablesModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Concatenar Variables</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formConcatResultName">
              <Form.Label>Nombre de la Variable Resultado</Form.Label>
              <Form.Control type="text" value={concatResultName} onChange={(e) => setConcatResultName(e.target.value)} />
            </Form.Group>
            {concatVariables.map((variable, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <Form.Group controlId={`formConcatVariable${index}`}>
                  <Form.Label>Variable</Form.Label>
                  <Form.Control as="select" value={variable.variable} onChange={(e) => updateConcatVariable(index, 'variable', e.target.value)}>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>{variable.displayName}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId={`formValidateExistence${index}`}>
                  <Form.Check
                    type="checkbox"
                    label="Validar existencia"
                    checked={variable.validateExistence}
                    onChange={(e) => updateConcatVariable(index, 'validateExistence', e.target.checked)}
                  />
                </Form.Group>
                <Button variant="danger" onClick={() => removeConcatVariable(index)}>Eliminar</Button>
              </div>
            ))}
            <Button variant="primary" onClick={addConcatVariable}>Agregar Variable</Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConcatVariablesModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConcatVariablesSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSplitVariableModal} onHide={() => setShowSplitVariableModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Dividir Variable</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formSplitVariable">
              <Form.Label>Variable a Dividir</Form.Label>
              <Form.Control 
                as="select" 
                value={splitVariable} 
                onChange={(e) => setSplitVariable(e.target.value)} 
                required
              >
                <option value="">Seleccione una opción</option> {/* Opción por defecto vacía */}
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>{variable.displayName}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formSplitParameter">
              <Form.Label>Parámetro para Dividir</Form.Label>
              <Form.Control 
                type="text" 
                value={splitParameter} 
                onChange={(e) => setSplitParameter(e.target.value)} 
                required
              />
            </Form.Group>
            {splitResultNames.map((resultName, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <Form.Group controlId={`formSplitResultName${index}`}>
                  <Form.Label>Nombre del Resultado {index + 1}</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={resultName} 
                    onChange={(e) => updateSplitResultName(index, e.target.value)} 
                  />
                </Form.Group>
                {index > 1 && (
                  <Button variant="danger" onClick={() => removeSplitResultName(index)}>Eliminar</Button>
                )}
              </div>
            ))}
            <Button variant="primary" onClick={addSplitResultName}>Agregar Resultado</Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSplitVariableModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSplitVariableModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUpdateContactInitializerModal} onHide={() => setShowUpdateContactInitializerModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Configurar Actualizador contacto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Este componente agrega la función de actualización de contacto al diagrama.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateContactInitializerModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateContactInitializerModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUpdateContactModal} onHide={() => setShowUpdateContactModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Actualizar contacto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Selector para elegir el campo a modificar */}
            <Form.Group controlId="formContactField">
              <Form.Label>Campo a Modificar</Form.Label>
              <Form.Control
                as="select"
                value={selectedContactField}
                onChange={(e) => {
                  setSelectedContactField(e.target.value);
                  if (e.target.value !== 'label') {
                    setSelectedDepartment('');
                    setSelectedPhase('');
                  }
                }}>
                {contactFields.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.displayName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Mostrar los campos adicionales solo si "label" es seleccionado */}
            {selectedContactField === 'label' ? (
              <>
                <Form.Group controlId="formDepartment">
                  <Form.Label>Departamento</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setSelectedPhase(''); // Reset the selected phase when department changes
                    }}
                  >
                    <option value="">Seleccione un departamento</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formPhase">
                  <Form.Label>Etiqueta</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedPhase}
                    onChange={(e) => setSelectedPhase(e.target.value)}
                    disabled={!selectedDepartment} // Disable phase selector if no department is selected
                  >
                    <option value="">Seleccione una etiqueta</option>
                    {phases.map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </>
            ) : (
              // Selector para elegir la variable solo si "label" no es seleccionado
              <Form.Group controlId="formContactVariable">
                <Form.Label>Variable para Modificar</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedContactVariable}
                  onChange={(e) => setSelectedContactVariable(e.target.value)}
                >
                  {variables.map((variable) => (
                    <option key={variable.name} value={variable.name}>
                      {variable.displayName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateContactModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateContactModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>


      <Modal show={showChangeResponsibleModal} onHide={() => setShowChangeResponsibleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Responsable</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formSelectResponsible">
              <Form.Label>Seleccionar Responsable</Form.Label>
              <Form.Control as="select" value={selectedResponsible} onChange={(e) => setSelectedResponsible(e.target.value)}>
                {responsibles.map((responsible) => (
                  <option key={responsible.id_usuario} value={responsible.id_usuario}>
                    {responsible.nombre} {responsible.apellido}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangeResponsibleModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleChangeResponsibleModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showResponseImageModal} onHide={() => setShowResponseImageModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Enviar Imagen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formResponseImageName">
              <Form.Label>Nombre de la Imagen</Form.Label>
              <Form.Control type="text" value={responseImageName} onChange={(e) => setResponseImageName(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formResponseImage">
              <Form.Label>Seleccionar Imagen</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={(e) => setResponseImage(e.target.files[0])} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResponseImageModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleResponseImageModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showResponseVideoModal} onHide={() => setShowResponseVideoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Enviar Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formResponseVideoName">
              <Form.Label>Nombre del Video</Form.Label>
              <Form.Control type="text" value={responseVideoName} onChange={(e) => setResponseVideoName(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formResponseVideo">
              <Form.Label>Seleccionar Video</Form.Label>
              <Form.Control type="file" accept="video/*" onChange={(e) => setResponseVideo(e.target.files[0])} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResponseVideoModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleResponseVideoModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showResponseDocumentModal} onHide={() => setShowResponseDocumentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Enviar Documento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formResponseDocumentName">
              <Form.Label>Nombre del Documento</Form.Label>
              <Form.Control
                type="text"
                value={responseDocumentName}
                onChange={(e) => setResponseDocumentName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formResponseDocument">
              <Form.Label>Seleccionar Documento</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf" // Puedes ajustar los tipos de archivos aceptados según tus necesidades
                onChange={(e) => setResponseDocument(e.target.files[0])}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResponseDocumentModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleResponseDocumentModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showResponseAudioModal} onHide={() => setShowResponseAudioModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Enviar Audio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formResponseAudioName">
              <Form.Label>Nombre del Audio</Form.Label>
              <Form.Control
                type="text"
                value={responseAudioName}
                onChange={(e) => setResponseAudioName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formResponseAudio">
              <Form.Label>Seleccionar Audio</Form.Label>
              <Form.Control
                type="file"
                accept="audio/*" // Acepta cualquier tipo de archivo de audio
                onChange={(e) => setResponseAudio(e.target.files[0])}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResponseAudioModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleResponseAudioModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showResponseLocationModal} onHide={() => setShowResponseLocationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Enviar Ubicación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formLocationLatitude">
              <Form.Label>Latitud</Form.Label>
              <Form.Control
                type="text"
                value={locationLatitude}
                onChange={(e) => setLocationLatitude(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formLocationLongitude">
              <Form.Label>Longitud</Form.Label>
              <Form.Control
                type="text"
                value={locationLongitude}
                onChange={(e) => setLocationLongitude(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formLocationStreetName">
              <Form.Label>Nombre de la Calle</Form.Label>
              <Form.Control
                type="text"
                value={locationStreetName}
                onChange={(e) => setLocationStreetName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formVariables">
              <Form.Label>Agregar Variables</Form.Label>
              <Form.Control
                as="select"
                multiple
                onChange={(e) => {
                  const selectedOptions = [...e.target.selectedOptions].map(o => o.value);
                  if (selectedOptions.length > 0) {
                    const field = selectedOptions[selectedOptions.length - 1];
                    if (!locationLatitude) {
                      setLocationLatitude(`\${${field}}`);
                    } else if (!locationLongitude) {
                      setLocationLongitude(`\${${field}}`);
                    } else if (!locationStreetName) {
                      setLocationStreetName(`\${${field}}`);
                    }
                  }
                }}
              >
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>{variable.displayName}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResponseLocationModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleResponseLocationModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showResponseTemplateModal} onHide={() => setShowResponseTemplateModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Plantilla</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Buscar por nombre"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                setTemplates(templates.filter(template => template.nombre.toLowerCase().includes(searchTerm)));
              }}
            />
            <Form.Select onChange={(e) => {
              const filterType = e.target.value;
              setTemplates(templates.filter(template => template.type === filterType));
            }}>
              <option value="">Filtrar por tipo</option>
              <option value="MARKETING">Marketing</option>
              <option value="UTILITY">Utilidad</option>
            </Form.Select>
          </InputGroup>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <Row>
              <Col md={6} className="templates-list-column">
                <div className="templates-list">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {templates.length > 0 ? (
                        templates.map(template => (
                          <tr key={template.id} onClick={() => setSelectedTemplate(template)}>
                            <td>{template.nombre}</td>
                            <td>{template.type}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="text-center">No se encontraron plantillas.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Col>
              <Col md={6} className="preview-column">
                {selectedTemplate && !loading && (
                  <div>
                    <div className='text-center'>
                      <h3>Vista Previa de la Plantilla</h3>
                    </div>
                    <div className="preview-container">
                      <div className="whatsapp-preview">
                        <div className="message">
                          <div className="header">
                            {selectedTemplate.header_type === 'TEXT' && <div><strong>{selectedTemplate.header_text}</strong></div>}
                            {selectedTemplate.header_type === 'IMAGE' && selectedTemplate.medio && <img src={`${process.env.REACT_APP_API_URL}${selectedTemplate.medio}`} alt="Header" style={{ width: '100%' }} />}
                            {selectedTemplate.header_type === 'VIDEO' && selectedTemplate.medio && <video src={`${process.env.REACT_APP_API_URL}${selectedTemplate.medio}`} controls style={{ width: '100%' }} />}
                            {selectedTemplate.header_type === 'DOCUMENT' && selectedTemplate.medio && (
                              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <iframe
                                  src={`${process.env.REACT_APP_API_URL}${selectedTemplate.medio}`}
                                  style={{ width: '100%', aspectRatio: '4/3', zoom: 2, border: '0', overflow: 'hidden' }}
                                  frameBorder="0"
                                ></iframe>
                              </div>
                            )}
                          </div>
                          <div className="body">
                            {selectedTemplate.body_text}
                          </div>
                          {selectedTemplate.footer && <div className="footer small">{selectedTemplate.footer}</div>}
                          {selectedTemplate.type_button !== 'none' && (
                            <div className="buttons">
                              {selectedTemplate.type_button === 'QUICK_REPLY' && <button className="btn btn-success w-100 mt-2">{selectedTemplate.button_text}</button>}
                              {selectedTemplate.type_button === 'PHONE_NUMBER' && <button className="btn btn-success w-100 mt-2">{selectedTemplate.button_text}</button>}
                              {selectedTemplate.type_button === 'URL' && <button className="btn btn-success w-100 mt-2">{selectedTemplate.button_text}</button>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedTemplate.headerVariables && selectedTemplate.headerVariables.length > 0 && (
                      <Form className="mt-4">
                        <h4>Variables de Encabezado</h4>
                        {selectedTemplate.headerVariables.map(variable => (
                          <Form.Group key={variable.name} className="mb-3">
                            <Form.Label>{variable.name}</Form.Label>
                            <Form.Control
                              type="text"
                              value={variableValues[`header_${variable.name.replace(/{{|}}/g, '')}`] || ''}
                              onChange={(e) => setVariableValues(prev => ({ ...prev, [`header_${variable.name.replace(/{{|}}/g, '')}`]: e.target.value }))}
                            />
                          </Form.Group>
                        ))}
                      </Form>
                    )}
                    {selectedTemplate.bodyVariables && selectedTemplate.bodyVariables.length > 0 && (
                      <Form className="mt-4">
                        <h4>Variables del Cuerpo</h4>
                        {selectedTemplate.bodyVariables.map(variable => (
                          <Form.Group key={variable.name} className="mb-3">
                            <Form.Label>{variable.name}</Form.Label>
                            <Form.Control
                              type="text"
                              value={variableValues[`body_${variable.name.replace(/{{|}}/g, '')}`] || ''}
                              onChange={(e) => setVariableValues(prev => ({ ...prev, [`body_${variable.name.replace(/{{|}}/g, '')}`]: e.target.value }))}
                            />
                          </Form.Group>
                        ))}
                      </Form>
                    )}
                    {selectedTemplate.buttonVariables && selectedTemplate.buttonVariables.length > 0 && (
                      <Form className="mt-4">
                        <h4>Variables de Botón</h4>
                        {selectedTemplate.buttonVariables.map(variable => (
                          <Form.Group key={variable.name} className="mb-3">
                            <Form.Label>{variable.name}</Form.Label>
                            <Form.Control
                              type="text"
                              value={variableValues[`button_${variable.name.replace(/{{|}}/g, '')}`] || ''}
                              onChange={(e) => setVariableValues(prev => ({ ...prev, [`button_${variable.name.replace(/{{|}}/g, '')}`]: e.target.value }))}
                            />
                          </Form.Group>
                        ))}
                      </Form>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResponseTemplateModal(false)}>
            Cerrar
          </Button>
          {selectedTemplate && (
            <Button
              variant="primary"
              onClick={handleResponseTemplateModalSave}
            >
              Guardar
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showCaseModal} onHide={() => setShowCaseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Caso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formCaseValue">
              <Form.Label>Valor del Caso</Form.Label>
              <Form.Control type="text" value={comparisonValue} onChange={(e) => setComparisonValue(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCaseModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCaseModalSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Llenar Solicitud</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group controlId="formValidateExistence">
        <Form.Check
          type="checkbox"
          label="Validar existencia de solicitud"
          checked={validateExistence}
          onChange={(e) => setValidateExistence(e.target.checked)}
        />
      </Form.Group>

      <Form.Group controlId="formRequestType">
        <Form.Label>Tipo de Solicitud</Form.Label>
        <Form.Control
          type="text"
          value={requestType}
          onChange={(e) => setRequestType(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formRequestStatus">
        <Form.Label>Estatus de la Solicitud (Para seleccionar o crear)</Form.Label>
        <Form.Control
          type="text"
          value={requestStatus}
          onChange={(e) => setRequestStatus(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formNuevoStatus">
        <Form.Label>Nuevo Estatus de la Solicitud (Para actualizar o crear)</Form.Label>
        <Form.Control
          type="text"
          value={nuevoStatus}
          onChange={(e) => setNuevoStatus(e.target.value)}
        />
      </Form.Group>

      <hr />

      <h5>Condiciones de Validación</h5>
      {validationConditions.map((condition, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <Form.Group controlId={`formValidationConditionKey${index}`}>
            <Form.Label>Clave de Validación</Form.Label>
            <Form.Control
              type="text"
              value={condition.key}
              onChange={(e) => updateValidationCondition(index, 'key', e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId={`formValidationConditionValue${index}`}>
            <Form.Label>Valor de Validación</Form.Label>
            <Form.Control
              type="text"
              value={condition.value}
              onChange={(e) => updateValidationCondition(index, 'value', e.target.value)}
            />
          </Form.Group>
          <Button variant="danger" onClick={() => removeValidationCondition(index)}>Eliminar</Button>
        </div>
      ))}
      <Button variant="primary" onClick={addValidationCondition}>Agregar Condición de Validación</Button>

      <hr />

      <h5>Datos de la Solicitud</h5>
      {requestData.map((data, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <Form.Group controlId={`formRequestDataKey${index}`}>
            <Form.Label>Nombre del Dato</Form.Label>
            <Form.Control
              type="text"
              value={data.key}
              onChange={(e) => updateRequestData(index, 'key', e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId={`formRequestDataValue${index}`}>
            <Form.Label>Valor del Dato</Form.Label>
            <Form.Group>
            <Form.Group>
            <Form.Group className="mb-3">
            <Form.Label>Seleccionar Variable o Escribir Texto</Form.Label>

            <Form.Control
              as="select"
              value={requestData[index]?.value?.startsWith('${') ? requestData[index].value.slice(2, -1) : ''}
              onChange={(e) => {
                const selectedVariable = e.target.value;
                updateRequestData(index, 'value', selectedVariable ? `\${${selectedVariable}}` : '');
              }}
              disabled={requestData[index]?.value && !requestData[index].value.startsWith('${')}
              className="mb-2"
            >
              <option value="">Seleccionar una variable</option>
              {variables.map((variable) => (
                <option key={variable.name} value={variable.name}>
                  {variable.displayName}
                </option>
              ))}
            </Form.Control>

            <Form.Control
              type="text"
              value={requestData[index]?.value && !requestData[index].value.startsWith('${') ? requestData[index].value : ''}
              onChange={(e) => updateRequestData(index, 'value', e.target.value)}
              placeholder="Escribir texto"
              disabled={requestData[index]?.value?.startsWith('${')}
            />
          </Form.Group>
          </Form.Group>
          </Form.Group>
          </Form.Group>
          <Button variant="danger" onClick={() => removeRequestData(index)}>Eliminar</Button>
        </div>
      ))}
      <Button variant="primary" onClick={addRequestData}>Agregar Dato a la Solicitud</Button>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowRequestModal(false)}>
      Cancelar
    </Button>
    <Button variant="primary" onClick={handleRequestModalSave}>
      Guardar
    </Button>
  </Modal.Footer>
</Modal>

<Modal show={showExternalRequestModal} onHide={() => setShowExternalRequestModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Crear Solicitud Externa</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group controlId="formExternalServiceName">
        <Form.Label>Nombre del Servicio Externo</Form.Label>
        <Form.Control
          type="text"
          value={externalServiceName}
          onChange={(e) => setExternalServiceName(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formExternalServiceUrl">
        <Form.Label>URL del Servicio</Form.Label>
        <Form.Control
          type="text"
          value={externalServiceUrl}
          onChange={(e) => setExternalServiceUrl(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formCredentialsLocation">
        <Form.Label>Ubicación de las Credenciales</Form.Label>
        <Form.Control
          as="select"
          value={credentialsLocation}
          onChange={(e) => setCredentialsLocation(e.target.value)}
        >
          <option value="headers">Headers</option>
          <option value="body">Body</option>
        </Form.Control>
      </Form.Group>

      <Form.Label>Credenciales</Form.Label>
      {externalCredentials.map((cred, index) => (
        <div key={index}>
          <Form.Group controlId={`formCredKey${index}`}>
            <Form.Label>Nombre de la Credencial</Form.Label>
            <Form.Control
              type="text"
              value={cred.key}
              onChange={(e) => {
                const newCreds = [...externalCredentials];
                newCreds[index].key = e.target.value;
                setExternalCredentials(newCreds);
              }}
            />
          </Form.Group>
          <Form.Group controlId={`formCredValue${index}`}>
            <Form.Label>Valor de la Credencial</Form.Label>
            <Form.Control
              type="text"
              value={cred.value}
              onChange={(e) => {
                const newCreds = [...externalCredentials];
                newCreds[index].value = e.target.value;
                setExternalCredentials(newCreds);
              }}
            />
          </Form.Group>
          <Button
            variant="danger"
            onClick={() =>
              setExternalCredentials(externalCredentials.filter((_, i) => i !== index))
            }
          >
            Eliminar
          </Button>
        </div>
      ))}
      <Button
        variant="primary"
        onClick={() => setExternalCredentials([...externalCredentials, { key: '', value: '' }])}
      >
        Agregar Credencial
      </Button>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowExternalRequestModal(false)}>
      Cancelar
    </Button>
    <Button variant="primary" onClick={handleExternalRequestModalSave}>
      Guardar
    </Button>
  </Modal.Footer>
</Modal>

<Modal show={showSendRequestModal} onHide={() => setShowSendRequestModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Seleccionar Servicio Externo</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group controlId="formServiceSelection">
        <Form.Label>Seleccione el Servicio</Form.Label>
        <Form.Control
          as="select"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {externalRequests.map((service, index) => (
            <option key={index} value={service.name}>
              {service.name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowSendRequestModal(false)}>
      Cancelar
    </Button>
    <Button variant="primary" onClick={handleAddRequestComponent}>
      Agregar Solicitud
    </Button>
  </Modal.Footer>
</Modal>

<Modal show={showExternalDataModal} onHide={() => setShowExternalDataModal(false)}>
    <Modal.Header closeButton>
      <Modal.Title>Agregar Datos Externos</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {externalDataItems.map((item, index) => (
        <div key={index} className="mb-3">
          <Form.Group>
            <Form.Label>Nombre de la Variable</Form.Label>
            <Form.Control
              type="text"
              value={item.variableName}
              onChange={(e) => handleExternalDataChange(index, 'variableName', e.target.value)}
              placeholder="Nombre de la variable"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Ruta del Dato en externalData</Form.Label>
            <Form.Control
              type="text"
              value={item.dataPath}
              onChange={(e) => handleExternalDataChange(index, 'dataPath', e.target.value)}
              placeholder="Ruta del dato (e.g., travelInfo.id_viaje)"
            />
          </Form.Group>
        </div>
      ))}
      <Button variant="secondary" onClick={handleAddExternalData}>
        Agregar otro dato
      </Button>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowExternalDataModal(false)}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleExternalDataSave}>
        Guardar
      </Button>
    </Modal.Footer>
  </Modal>

  <Modal show={showIntentionModal} onHide={() => setShowIntentionModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Editar Intención' : 'Crear Intención'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        {/* Formulario para nombre de la intención */}
        <Form.Group>
            <Form.Label>Nombre de la Intención</Form.Label>
            <Form.Control
                type="text"
                value={currentIntention.name}
                onChange={(e) => setCurrentIntention({ ...currentIntention, name: e.target.value })}
                placeholder="Nombre de la intención"
            />
        </Form.Group>
        <hr />
        <h5>Agregar o Editar Estado y Descripción</h5>
        {/* Formulario para estado y descripción */}
        <Form.Group>
            <Form.Label>Estado</Form.Label>
            <Form.Control
                type="text"
                value={currentState.state}
                onChange={(e) => setCurrentState({ ...currentState, state: e.target.value })}
                placeholder="Estado"
            />
        </Form.Group>
        <Form.Group>
            <Form.Label>Descripción</Form.Label>
            <Form.Control
                type="text"
                value={currentState.description}
                onChange={(e) => setCurrentState({ ...currentState, description: e.target.value })}
                placeholder="Descripción"
            />
        </Form.Group>
        <Button variant="secondary" onClick={handleAddState}>
            {selectedStateIndex !== null ? 'Guardar Cambios en Estado' : 'Agregar Estado y Descripción'}
        </Button>
        <hr />
        <h6>Estados actuales:</h6>
        <ul>
            {currentIntention.states.map((stateItem, index) => (
                <li key={index}>
                    {stateItem.state}: {stateItem.description}
                    <Button variant="link" onClick={() => {handleEditState(index);handleDeleteState(index)}}>Editar</Button>
                    <Button variant="link" onClick={() => handleDeleteState(index)}>Eliminar</Button>
                </li>
            ))}
        </ul>
        <hr />
        <Button variant="primary" onClick={handleAddIntention}>
            {selectedIntentionIndex !== null ? 'Guardar Cambios en Intención' : 'Agregar Intención'}
        </Button>
        <h6>Intenciones actuales:</h6>
        <ul>
            {intentions.map((intention, index) => (
                <li key={index}>
                    {intention.name}:
                    <ul>
                        {intention.states.map((stateItem, sIndex) => (
                            <li key={sIndex}>
                                {stateItem.state}: {stateItem.description}
                            </li>
                        ))}
                    </ul>
                    <Button variant="link" onClick={() => {handleEditIntention(index);handleDeleteIntention(index)}}>Editar</Button>
                    <Button variant="link" onClick={() => handleDeleteIntention(index)}>Eliminar</Button>
                </li>
            ))}
        </ul>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowIntentionModal(false)}>
            Cancelar
        </Button>
        <Button variant="primary" onClick={handleSaveIntentionModal}>
            Guardar Intenciones
        </Button>
    </Modal.Footer>
</Modal>


        <Modal show={showContextModal} onHide={() => setShowContextModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generar Contexto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formMessageCount">
              <Form.Label>Cantidad de Mensajes</Form.Label>
              <Form.Control
                type="number"
                min="1"
                disabled={selectAllMessages}
                value={messageCount}
                onChange={(e) => setMessageCount(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formSelectAllMessages">
              <Form.Check
                type="checkbox"
                label="Todos"
                checked={selectAllMessages}
                onChange={(e) => setSelectAllMessages(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowContextModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleContextModalSave}>
            Generar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showToolModal} onHide={closeToolModal} dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Seleccionar Herramienta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="toolbar-grid-scroll">
          {/* Primera columna */}
          <div className="toolbar-column">
            <button className="tool-button" onClick={() => {addConsoleLogNode(currentNodeId);setShowToolModal(false);}}>Imprimir en consola</button>
            <button className="tool-button" onClick={() => {handleOpenContextModal(true);setShowToolModal(false);}}>Generar Contexto</button>
            <button className="tool-button" onClick={() => {addExternalRequestNode(currentNodeId);setShowToolModal(false);}}>Crear Solicitud Externa</button>
            <button className="tool-button" onClick={() => {setShowSendRequestModal(true);setShowToolModal(false);}} disabled={externalRequests.length === 0}>Agregar Solicitud Externa</button>
            <button className="tool-button" onClick={() => {setShowRequestModal(true);setShowToolModal(false);}}>Llenar Solicitud</button>
            <button className="tool-button" onClick={() => {setShowGetRequestModal(true); setShowToolModal(false);}}>
              Obtener Solicitud
            </button>
            <button
              className="tool-button"
              onClick={() => {
                setShowIntentionModal(true);
                setShowToolModal(false);
              }}
              disabled={intentions.length > 0} // Deshabilitar si ya hay una intención
            >
              Crear Intenciones
            </button>
            <button className="tool-button" onClick={() => {setShowExternalDataModal(true);setShowToolModal(false);}}>Agregar Dato Externo</button>
            <button className="tool-button" onClick={() => setShowDelayModal(true)}>
              Crear Retardo
            </button>
          </div>

          {/* Segunda columna */}
          <div className="toolbar-column">
            <button className="tool-button" onClick={() => {addConditionalNode(currentNodeId);setShowToolModal(false);}}>Condicional</button>
            <button className="tool-button" onClick={() => {addSwitchNode(currentNodeId);setShowToolModal(false);}}>Switch</button>
            <button className="tool-button" onClick={() => {addUpdateStateNode(currentNodeId);setShowToolModal(false);}}>Actualizar Estado</button>
            <button className="tool-button" onClick={() => {addConcatVariablesNode(currentNodeId);setShowToolModal(false);}}>Concatenar Variables</button>
            <button className="tool-button" onClick={() => {addSplitVariableNode(currentNodeId);setShowToolModal(false);}}>Dividir Variable</button>
            <button className="tool-button" onClick={() => {setShowAgendaModal(true);setShowToolModal(false);}}>
              Consultar Agenda
            </button>
            <button className="tool-button" onClick={() => {setShowAgendarModal(true);setShowToolModal(false);}}>
              Agendar
            </button>
          </div>

          {/* Tercera columna */}
          <div className="toolbar-column">
            <button className="tool-button" onClick={() => {addSendTextNode(currentNodeId);setShowToolModal(false);}}>Enviar Texto</button>
            <button className="tool-button" onClick={() => {setShowResponseImageModal(true);setShowToolModal(false);}}>Enviar Imagen</button>
            <button className="tool-button" onClick={() => {setShowResponseVideoModal(true);setShowToolModal(false);}}>Enviar Video</button>
            <button className="tool-button" onClick={() => {setShowResponseAudioModal(true);setShowToolModal(false);}}>Enviar Audio</button>
            <button className="tool-button" onClick={() => {setShowResponseLocationModal(true);setShowToolModal(false);}}>Enviar Ubicación</button>
            <button className="tool-button" onClick={() => {setShowResponseDocumentModal(true);setShowToolModal(false);}}>Enviar Documento</button>
            <button className="tool-button" onClick={() => {openTemplateModal(true);setShowToolModal(false);}}>Enviar Plantilla</button>
            <button className="tool-button" onClick={() => {setShowSendMessageModal(true);setShowToolModal(false);}}>Enviar Mensaje a Terceros</button>
          </div>

          {/* Cuarta columna */}
          <div className="toolbar-column">
            <button className="tool-button" onClick={() => {addUpdateContactNameNode(currentNodeId);setShowToolModal(false);}}>Actualizar nombre contacto</button>
            <button className="tool-button" onClick={() => {setShowUpdateContactModal(true);setShowToolModal(false);}}>Actualizar contacto</button>
            <button className="tool-button" onClick={() => {addChangeResponsibleNode(currentNodeId);setShowToolModal(false);}}>Cambiar responsable</button>
          </div>

          {/* Quinta columna */}
          <div className="toolbar-column">
            <button className="tool-button" onClick={() => {addGptAssistantNode(currentNodeId);setShowToolModal(false);}}>Asistente GPT</button>
            <button className="tool-button" onClick={() => {addGptQueryNode(currentNodeId);setShowToolModal(false);}}>Consultar GPT</button>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeToolModal}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>

    <Modal show={showAgendaModal} onHide={() => setShowAgendaModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Consultar Agenda</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        {/* Tipo de entidad */}
        <div className="mb-4">
            <label className="form-label">Tipo de entidad</label>
            <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="usuario" 
                  checked={selectedEntityType.includes("Usuario")} 
                  onChange={() => handleEntityTypeChange("Usuario")} 
                  disabled={selectedEntityType.includes("Instalación")} 
                />
                <label className="form-check-label" htmlFor="usuario">Usuario</label>
            </div>
            <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="colaborador" 
                  checked={selectedEntityType.includes("Colaborador")} 
                  onChange={() => handleEntityTypeChange("Colaborador")} 
                  disabled={selectedEntityType.includes("Instalación")} 
                />
                <label className="form-check-label" htmlFor="colaborador">Colaborador</label>
            </div>
            <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="instalacion" 
                  checked={selectedEntityType.includes("Instalación")} 
                  onChange={() => handleEntityTypeChange("Instalación")} 
                  disabled={selectedEntityType.includes("Usuario") || selectedEntityType.includes("Colaborador")} 
                />
                <label className="form-check-label" htmlFor="instalacion">Instalación</label>
            </div>
        </div>

        {/* Parámetro de consulta */}
        <div className="mb-4">
            <label className="form-label">Parámetro de consulta</label>
            <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="id" 
                  checked={selectedQueryParams.includes("Id")} 
                  onChange={() => handleQueryParamsChange("Id")} 
                />
                <label className="form-check-label" htmlFor="id">Id</label>
            </div>
            <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="departamento" 
                  checked={selectedQueryParams.includes("Departamento")} 
                  onChange={() => handleQueryParamsChange("Departamento")} 
                  disabled={selectedQueryParams.includes("Id")} 
                />
                <label className="form-check-label" htmlFor="departamento">Departamento</label>
            </div>
            <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="rol" 
                  checked={selectedQueryParams.includes("Rol")} 
                  onChange={() => handleQueryParamsChange("Rol")} 
                  disabled={selectedQueryParams.includes("Id") || selectedEntityType.includes("Instalación")} 
                />
                <label className="form-check-label" htmlFor="rol">Rol</label>
            </div>
        </div>

        {/* Campos de búsqueda dinámicos */}
        <div>
            {renderSearchFields()}
        </div>

        {/* Inicio del Periodo */}
        {renderPeriodSelector('start')}

      {/* Fin del Periodo */}
      {renderPeriodSelector('end')}
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAgendaModal(false)}>
                  Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveAgendaModal}>
                  Crear
              </Button>
          </Modal.Footer>
      </Modal>

      <Modal show={showGetRequestModal} onHide={() => setShowGetRequestModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Obtener Solicitud</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formGetRequestType">
              <Form.Label>Tipo de Solicitud</Form.Label>
              <Form.Control
                type="text"
                value={getRequestType}
                onChange={(e) => setGetRequestType(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formGetRequestStatus">
              <Form.Label>Estatus de la Solicitud</Form.Label>
              <Form.Control
                type="text"
                value={getRequestStatus}
                onChange={(e) => setGetRequestStatus(e.target.value)}
              />
            </Form.Group>

            <hr />

            <h5>Condiciones de Validación (Opcional)</h5>
            {getValidationConditions.map((condition, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <Form.Group controlId={`formGetValidationConditionKey${index}`}>
                  <Form.Label>Clave de Validación</Form.Label>
                  <Form.Control
                    type="text"
                    value={condition.key}
                    onChange={(e) => updateGetValidationCondition(index, 'key', e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId={`formGetValidationConditionValue${index}`}>
                  <Form.Label>Valor de Validación</Form.Label>
                  <Form.Control
                    type="text"
                    value={condition.value}
                    onChange={(e) => updateGetValidationCondition(index, 'value', e.target.value)}
                  />
                </Form.Group>
                <Button variant="danger" onClick={() => removeGetValidationCondition(index)}>Eliminar</Button>
              </div>
            ))}
            <Button variant="primary" onClick={addGetValidationCondition}>Agregar Condición de Validación</Button>

            <hr />

            <h5>Datos a Extraer</h5>
            {getRequestDataKeys.map((data, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <Form.Group controlId={`formGetRequestDataKey${index}`}>
                  <Form.Label>Nombre del Dato</Form.Label>
                  <Form.Control
                    type="text"
                    value={data.key}
                    onChange={(e) => updateGetRequestDataKey(index, 'key', e.target.value)}
                  />
                </Form.Group>
                <Button variant="danger" onClick={() => removeGetRequestDataKey(index)}>Eliminar</Button>
              </div>
            ))}
            <Button variant="primary" onClick={addGetRequestDataKey}>Agregar Dato</Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGetRequestModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGetRequestModalSave}>
            Obtener
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDelayModal} onHide={() => setShowDelayModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Retardo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Tiempo del Retardo</Form.Label>
              <Form.Control
                type="number"
                value={delayTime}
                onChange={(e) => setDelayTime(e.target.value)}
                placeholder="Introduce el tiempo del retardo"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Unidad de Medida</Form.Label>
              <Form.Control
                as="select"
                value={delayUnit}
                onChange={(e) => setDelayUnit(e.target.value)}
              >
                <option value="Segundos">Segundos</option>
                <option value="Minutos">Minutos</option>
                <option value="Horas">Horas</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelayModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveDelayModal}>
            Crear
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSendMessageModal} onHide={() => setShowSendMessageModal(false)}>
          <Modal.Header closeButton>
              <Modal.Title>Enviar Mensaje a Terceros</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form>
                  <Form.Group controlId="formResponseTextName">
                      <Form.Label>Nombre del Mensaje</Form.Label>
                      <Form.Control
                          type="text"
                          value={responseTextName}
                          onChange={(e) => setResponseTextName(e.target.value)}
                      />
                  </Form.Group>
                  <Form.Group controlId="formRecipientType">
                      <Form.Label>Tipo de Destinatario</Form.Label>
                      <Form.Control
                          as="select"
                          value={selectedRecipientType}
                          onChange={(e) => {
                              setSelectedRecipientType(e.target.value);
                              loadRecipients(e.target.value); // Cargar destinatarios según el tipo
                              setSelectedRecipient(''); // Limpia el destinatario cuando cambia el tipo
                          }}
                      >
                          <option value="">Selecciona tipo</option>
                          <option value="user">Usuario</option>
                          <option value="colaborador">Colaborador</option>
                          <option value="contact">Cliente</option>
                          <option value="variable">Variable</option>
                      </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="formRecipient">
                    <br></br>
                      <Form.Label>Destinatario</Form.Label>
                      {selectedRecipientType === 'variable' ? (
                          <>
                              <Form.Control
                                  type="text"
                                  placeholder="Escribe el número o selecciona una variable"
                                  value={selectedRecipient}
                                  onChange={(e) => setSelectedRecipient(e.target.value)}
                              />
                              <Form.Control as="select" onChange={(e) => setSelectedRecipient(e.target.value)}>
                                {variables.map((variable) => (
                                  <option key={variable.name} value={variable.name}>
                                    {variable.displayName}
                                  </option>
                                ))}
                              </Form.Control>
                          </>
                      ) : (
                          <Form.Control
                              as="select"
                              value={selectedRecipient}
                              onChange={(e) => setSelectedRecipient(e.target.value)}
                          >
                              <option value="">Selecciona destinatario</option>
                              {recipients[selectedRecipientType]?.map((recipient) => {
                                  let displayName = '';
                                  let phone = '';

                                  switch (selectedRecipientType) {
                                      case 'user':
                                          displayName = `${recipient.nombre} ${recipient.apellido}`;
                                          phone = recipient.telefono;
                                          break;
                                      case 'colaborador':
                                          displayName = `${recipient.nombre} ${recipient.apellido}`;
                                          phone = recipient.telefono;
                                          break;
                                      case 'contact':
                                          displayName = `${recipient.first_name} ${recipient.last_name || ''}`;
                                          phone = recipient.phone_number;
                                          break;
                                      default:
                                          displayName = recipient.name || recipient.displayName;
                                          phone = '';
                                          break;
                                  }

                                  return (
                                      <option key={recipient.id_usuario || recipient.id_colaborador || recipient.id} value={phone}>
                                          {displayName} - {phone || 'Sin número'}
                                      </option>
                                  );
                              })}
                          </Form.Control>
                      )}
                  </Form.Group>
                  <Form.Group controlId="formMessageText">
                    <br></br>
                      <Form.Label>Texto del Mensaje</Form.Label>
                      <Form.Control
                          as="textarea"
                          rows={3}
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                      />
                  </Form.Group>
              </Form>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowSendMessageModal(false)}>
                  Cancelar
              </Button>
              <Button variant="primary" onClick={handleSendMessageSave}>
                  Crear
              </Button>
          </Modal.Footer>
      </Modal>

      <Modal show={showAgendarModal} onHide={() => setShowAgendarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Configurar Agendamiento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Validar disponibilidad antes de agendar */}
            <Form.Group controlId="formValidateAvailability">
              <Form.Check
                type="checkbox"
                label="¿Validar disponibilidad antes de agendar?"
                checked={validateAvailability}
                onChange={(e) => setValidateAvailability(e.target.checked)}
              />
            </Form.Group>
            {/* Seleccionar el tipo de límite */}
            <Form.Group controlId="formLimitType">
              <Form.Label>¿Cómo desea determinar el límite?</Form.Label>
              <Form.Control
                as="select"
                value={limitType}
                onChange={(e) => setLimitType(e.target.value)}
              >
                <option value="fixed">Número Fijo</option>
                <option value="variable">Variable</option>
              </Form.Control>
            </Form.Group>

            {/* Si es un número fijo, pide la cantidad */}
            {limitType === 'fixed' && (
              <Form.Group controlId="formEventCount">
                <Form.Label>Cantidad de Eventos a Agendar</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={eventCount}
                  onChange={(e) => setEventCount(e.target.value)}
                  placeholder="Especificar número"
                />
              </Form.Group>
            )}

            {/* Si es una variable, pide máximo permitido y variable que determina */}
            {limitType === 'variable' && (
              <>
                <Form.Group controlId="formMaxEvents">
                  <Form.Label>Máximo Permitido</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={maxEvents}
                    onChange={(e) => setMaxEvents(e.target.value)}
                    placeholder="Número máximo de eventos"
                  />
                </Form.Group>
                <Form.Group controlId="formLimitVariable">
                  <Form.Label>Variable que Determina el Límite</Form.Label>
                  <Form.Control
                    as="select"
                    value={limitVariable}
                    onChange={(e) => setLimitVariable(e.target.value)}
                  >
                    <option value="">Seleccionar una variable</option>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>
                        {variable.displayName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </>
            )}

            <hr />

            {/* Campos dinámicos para cada evento */}
            <h5>Información de los Eventos</h5>
            {[...Array(
              limitType === 'fixed'
                ? Math.max(parseInt(eventCount) || 0, 0)
                : Math.max(parseInt(maxEvents) || 0, 0)
            )].map((_, index) => (
              <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                <h6>Evento {index + 1}</h6>
                <Form.Group controlId={`formEventTitle${index}`}>
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    as="select"
                    value={eventFields[index]?.titulo || ''}
                    onChange={(e) => updateEventFields(index, 'titulo', e.target.value)}
                  >
                    <option value="">Seleccionar una variable</option>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>
                        {variable.displayName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId={`formEventDescription${index}`}>
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="select"
                    value={eventFields[index]?.descripcion || ''}
                    onChange={(e) => updateEventFields(index, 'descripcion', e.target.value)}
                  >
                    <option value="">Seleccionar una variable</option>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>
                        {variable.displayName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId={`formEventAllDay${index}`}>
                  <Form.Label>Todo el Día</Form.Label>
                  <Form.Control
                    as="select"
                    value={eventFields[index]?.all_day || ''}
                    onChange={(e) => updateEventFields(index, 'all_day', e.target.value)}
                  >
                    <option value="">Seleccionar una variable</option>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>
                        {variable.displayName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId={`formEventStartDate${index}`}>
                  <Form.Label>Fecha de Inicio</Form.Label>
                  <Form.Control
                    as="select"
                    value={eventFields[index]?.fecha_inicio || ''}
                    onChange={(e) => updateEventFields(index, 'fecha_inicio', e.target.value)}
                  >
                    <option value="">Seleccionar una variable</option>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>
                        {variable.displayName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId={`formEventStartTime${index}`}>
                  <Form.Label>Hora de Inicio</Form.Label>
                  <Form.Control
                    as="select"
                    value={eventFields[index]?.hora_inicio || ''}
                    onChange={(e) => updateEventFields(index, 'hora_inicio', e.target.value)}
                  >
                    <option value="">Seleccionar una variable</option>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>
                        {variable.displayName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId={`formEventEndDate${index}`}>
                  <Form.Label>Fecha de Finalización</Form.Label>
                  <Form.Control
                    as="select"
                    value={eventFields[index]?.fecha_fin || ''}
                    onChange={(e) => updateEventFields(index, 'fecha_fin', e.target.value)}
                  >
                    <option value="">Seleccionar una variable</option>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>
                        {variable.displayName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId={`formEventEndTime${index}`}>
                  <Form.Label>Hora de Finalización</Form.Label>
                  <Form.Control
                    as="select"
                    value={eventFields[index]?.hora_fin || ''}
                    onChange={(e) => updateEventFields(index, 'hora_fin', e.target.value)}
                  >
                    <option value="">Seleccionar una variable</option>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>
                        {variable.displayName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId={`formEventAssignmentType${index}`}>
                  <Form.Label>Tipo de Asignación</Form.Label>
                  <Form.Control
                    as="select"
                    value={eventFields[index]?.tipo_asignacion || ''}
                    onChange={(e) => updateEventFields(index, 'tipo_asignacion', e.target.value)}
                  >
                    <option value="">Seleccionar una variable</option>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>
                        {variable.displayName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId={`formEventAssignmentId${index}`}>
                  <Form.Label>ID de Asignación</Form.Label>
                  <Form.Control
                    as="select"
                    value={eventFields[index]?.id_asignacion || ''}
                    onChange={(e) => updateEventFields(index, 'id_asignacion', e.target.value)}
                  >
                    <option value="">Seleccionar una variable</option>
                    {variables.map((variable) => (
                      <option key={variable.name} value={variable.name}>
                        {variable.displayName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAgendarModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleSaveAgendar(); // Genera el código y cierra el modal
            }}
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

    </Modal>
  );
};

export default EditChatBotModal;