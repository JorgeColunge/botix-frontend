import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Table, Form, InputGroup, FormControl, Row, Col, Nav, Spinner } from 'react-bootstrap';
import { ArrowDownCircle, ArrowLeft, ArrowLeftCircle, ArrowRightCircle, ArrowUpCircle } from 'react-bootstrap-icons';
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
  const [height, setHeight] = useState(data.height || 200); // Estado para la altura del primer div
  const [width, setWidth] = useState(data.width || 300); // Estado para el ancho del primer div

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
    </div>
  ), 
  conditional: ({ data }) => (
    <div style={{position: 'relative', padding: '10px', paddingTop: '25px', paddingBottom: '25px', border: '1px solid #b1b1b1', borderRadius: '15px', background: '#fff', boxShadow: '0px 0px 20px #7a7a7a' }}>
      <Handle type="target" position="top" />
      <div>{data.label}</div>
      <Handle type="source" position="bottom" id="a" style={{ left: '25%' }} />
      <Handle type="source" position="bottom" id="b" style={{ left: '75%' }} />
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
  const [variables, setVariables] = useState([{ name: 'Seleccione variable', displayName: 'Seleccione variable' }]);
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
  const [gptModel, setGptModel] = useState('gpt-3.5');
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
        const { nodes: initialNodesFromCode, edges: initialEdgesFromCode, variables: initialVariables, assistants: initialAssistants = [] } = JSON.parse(bot.react_flow);
        
        // Filtra duplicados basados en nombre y displayName
        const uniqueVariables = [
          { name: 'Seleccione variable', displayName: 'Seleccione variable' },
          { name: 'messageData.text', displayName: 'Mensaje de Texto' },
          { name: 'responsibleUserId', displayName: 'ID del Responsable' },
          ...initialVariables
        ].filter((v, index, self) =>
          index === self.findIndex((t) => (
            t.name === v.name && t.displayName === v.displayName
          ))
        );

        // Filtrar duplicados para asistentes
        const uniqueAssistants = [
          { name: 'Seleccione asistente', displayName: 'Seleccione asistente' },
          ...initialAssistants
        ].filter((a, index, self) =>
          index === self.findIndex((t) => (
            t.name === a.name && t.displayName === a.displayName && t.model === a.model && t.personality === a.personality
          ))
        );
  
        // Añadir métodos onAddClick y onAddExternalClick a cada nodo, independientemente del tipo
        const nodesWithFunctions = initialNodesFromCode.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onAddClick: (id) => openToolModal(id, true),
            onAddExternalClick: (id) => openToolModal(id, false),
            setNodes,
          },
        }));
  
        setNodes(nodesWithFunctions);
        setEdges(initialEdgesFromCode);
        setVariables(uniqueVariables);
        setAssistants(uniqueAssistants);
      }
    }
  }, [bot]);
  
  

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

const generateCodeForIntentions = () => {
  let codeArray = [];
  codeArray.push("const intentions = [\n");
  intentions.forEach(intention => {
      codeArray.push(`  {\n    name: "${intention.name}",\n    states: [\n`);
      intention.states.forEach(state => {
          codeArray.push(`      { state: "${state.state}", description: "${state.description}" },\n`);
      });
      codeArray.push("    ]\n  },\n");
  });
  codeArray.push("];\n");

  const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
          label: `Intenciones`,
          code: codeArray,
          onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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

  // Aquí puedes guardar o manejar el código generado
  console.log(codeArray.join('')); 
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
    
      // Crear el nuevo nodo y actualizar el flujo
      const newNode = {
        id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        
      const newNode = {
        id: `${nodes.length + 1}`,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: { label: `Crear Solicitud Externa: ${externalServiceName}`, code: [externalRequestCode], onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false) },
        parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
    
      // Guardar el nombre del servicio en un arreglo de solicitudes externas
      setExternalRequests((reqs) => [...reqs, { name: externalServiceName, url: externalServiceUrl }]);
      
      setNodes(updatedNodes);
      setEdges(updatedEdges);
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
      const newNode = {
        id: `${nodes.length + 1}`,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: { label: `Enviar Solicitud a: ${selectedService}`, code: [`await ${functionName}(requestId);`], onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false) },
        parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
    setEdges((eds) => eds.map((edge) => {
      if (edge.id === oldEdge?.id) {
        return newConnection;
      }
      return edge;
    }));
  
    // Actualizar el parentId del nodo hijo con la nueva conexión
    setNodes((nds) => nds.map((node) => {
      if (node.id === newConnection.target) {
        return {
          ...node,
          parentId: newConnection.source,
        };
      }
      return node;
    }));
  };  

  const handleEdgeDelete = (edgeToDelete) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeToDelete.id));
  
    // Eliminar el parentId del nodo hijo que estaba conectado, si existía una conexión previa
    setNodes((nds) => nds.map((node) => {
      if (node.id === edgeToDelete.target) {
        return {
          ...node,
          parentId: null,
        };
      }
      return node;
    }));
  };
  
  const onConnect = (params) => {
    const newEdge = {
      id: `e${params.source}-${params.target}`,
      source: params.source,
      target: params.target,
      animated: true,
      style: { stroke: '#d033b9' },
      zIndex: 10,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#d033b9',
      },
    };
    handleEdgeUpdate(null, newEdge);
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
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: { label: `Imprimir: ${message}`, code: [`console.log('${message}');`], onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false) },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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

  const addConversationStateNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: { 
        label: 'Obtener el estado de la conversación', 
        code: [
          `// Obtener el estado de la conversación`,
          `const conversationStateQuery = 'SELECT state FROM conversations WHERE conversation_id = $1';`,
          `const conversationStateResult = await pool.query(conversationStateQuery, [conversationId]);`,
          `const conversationState = conversationStateResult.rows[0]?.state;`
        ],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
    // Filtra duplicados
    const newVariable = { name: 'conversationState', displayName: 'Estado de la Conversación', nodeId: newNode.id };
    const uniqueVariables = [...variables, newVariable].filter((v, index, self) =>
      index === self.findIndex((t) => (
        t.name === v.name && t.displayName === v.displayName
      ))
    );
  
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setVariables(uniqueVariables);
    generateCodeFromNodes(updatedNodes, updatedEdges);
  };

  const addResponsibleNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: 'Obtener responsable',
        code: [
          `const responsibleRes = await pool.query('SELECT id_usuario FROM conversations WHERE conversation_id = $1', [conversationId]);`,
          `const responsibleUserId = responsibleRes.rows[0].id_usuario;`
        ],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
    // Filtra duplicados
    const newVariable = { name: 'responsibleUserId', displayName: 'ID del Responsable', nodeId: newNode.id };
    const uniqueVariables = [...variables, newVariable].filter((v, index, self) =>
      index === self.findIndex((t) => (
        t.name === v.name && t.displayName === v.displayName
      ))
    );
  
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setVariables(uniqueVariables);
    generateCodeFromNodes(updatedNodes, updatedEdges);
  };  

  const addContactInfoNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: { 
        label: 'Obtener información del contacto', 
        code: [`const contactInfo = await getContactInfo(senderId, integrationDetails.company_id);`],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
    // Filtra duplicados
    const newVariables = [
      { name: 'contactInfo', displayName: 'Información del contacto', nodeId: newNode.id },
      { name: 'contactInfo.first_name', displayName: 'Nombre del contacto', nodeId: newNode.id },
      { name: 'contactInfo.last_name', displayName: 'Apellido del contacto', nodeId: newNode.id },
      { name: 'contactInfo.phone_number', displayName: 'Número del contacto', nodeId: newNode.id },
      { name: 'contactInfo.organization', displayName: 'Organización', nodeId: newNode.id },
      { name: 'contactInfo.label', displayName: 'Etiqueta', nodeId: newNode.id },
      { name: 'contactInfo.profile_url', displayName: 'URL del perfil', nodeId: newNode.id },
      { name: 'contactInfo.edad_approx', displayName: 'Edad aproximada', nodeId: newNode.id },
      { name: 'contactInfo.fecha_nacimiento', displayName: 'Fecha de nacimiento', nodeId: newNode.id },
      { name: 'contactInfo.nacionalidad', displayName: 'Nacionalidad', nodeId: newNode.id },
      { name: 'contactInfo.ciudad_residencia', displayName: 'Ciudad de residencia', nodeId: newNode.id },
      { name: 'contactInfo.direccion_completa', displayName: 'Dirección completa', nodeId: newNode.id },
      { name: 'contactInfo.email', displayName: 'Email', nodeId: newNode.id }
    ];
  
    const uniqueVariables = [...variables, ...newVariables].filter((v, index, self) =>
      index === self.findIndex((t) => (
        t.name === v.name && t.displayName === v.displayName
      ))
    );
  
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setVariables(uniqueVariables);
    generateCodeFromNodes(updatedNodes, updatedEdges);
  };
  

  const handleConcatVariablesSave = () => {
    const variablesStr = concatVariables
      .map(({ variable, validateExistence }) => validateExistence ? `\${${variable} ? ${variable} : ''}` : `\${${variable}}`)
      .join(' ');

    const concatCode = `const ${concatResultName} = \`${variablesStr}\`;`;
    
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: { label: 'Concatenar Variables', code: [concatCode], onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false) },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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

    // Genera las condiciones de validación basadas en `request_data`
    const validationConditionsArray = validationConditions
        .filter(condition => condition.key && condition.value)
        .map(condition => `(request_data->>'${condition.key}') = '${condition.value}'`);

    // Genera la cadena de condiciones de validación
    const validationConditionString = validationConditionsArray.length > 0 
        ? ` AND ${validationConditionsArray.join(' AND ')}` 
        : '';

    // Genera el código para la inserción/actualización de la solicitud
    let code = `requestType = "${requestType}";\n`;
    code += `requestStatus = "${requestStatus}";\n`;
    code += `nuevoStatus = "${nuevoStatus}";\n`;
    code += `requestData = ${JSON.stringify(requestDataObject)};\n`;

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
          await pool.query(insertQuery, [integrationDetails.company_id, requestType, JSON.stringify(requestData), conversationId, nuevoStatus]);
        }
        `;
    } else {
        // En lugar de intentar insertar, aquí solo se hace un update asumiendo que la solicitud ya existe
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

    const newNode = {
        id: `${nodes.length + 1}`,
        type: 'custom',
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        data: {
            label: `Llenar Solicitud: ${requestType}`,
            code: [code],
            onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
        },
        parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
      const newNode = {
        id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
      const newNode = {
        id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
      const newNode = {
        id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
      const newNode = {
        id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
  const handleResponseLocationModalSave = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  };

  const addConcatVariablesNode = () => {
    setShowConcatVariablesModal(true);
  };  

  const addSwitchNode = () => {
    setShowSwitchModal(true);
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
    if (assistants.some(assistant => assistant.name === assistantName)) {
      alert('Ya existe un asistente con ese nombre. Por favor, elige otro nombre.');
      return;
    }

    if (assistants.some(assistant => assistant.name === assistantName)) {
      alert('Ya existe un asistente con ese nombre. Por favor, elige otro nombre.');
      return;
    }
  
    const newAssistant = { name: assistantName, displayName: assistantName, model: gptModel, personality };
  
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Asistente GPT: ${assistantName}`,
        code: [
          `async function ${assistantName}(prompt) {`,
          `  const apiKey = process.env.OPENAI_API_KEY;`,
          `  const url = "https://api.openai.com/v1/chat/completions";`,
          `  const headers = {`,
          `    'Authorization': \`Bearer \${apiKey}\`,`,
          `    'Content-Type': 'application/json'`,
          `  };`,
          `  const payload = {`,
          `    model: "${gptModel}",`,
          `    messages: [`,
          `      { role: "system", content: "${personality}" },`,
          `      { role: "user", content: prompt }`,
          `    ]`,
          `  };`,
          `  try {`,
          `    const response = await axios.post(url, payload, { headers });`,
          `    return response.data.choices[0].message.content.trim();`,
          `  } catch (error) {`,
          `    console.error("Error al obtener respuesta de GPT:", error);`,
          `    return "Error al obtener la respuesta";`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
    // Insertar el nuevo asistente en la lista de asistentes
    setAssistants([...assistants, newAssistant]);
  
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
  
    const newNode = {
      id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
    const newNode = {
      id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
    const newNode = {
      id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
    const newNode = {
      id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
    const newNode = {
      id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'switch',
      position: { x: 250, y: 55 + 75 * nodes.length },
      data: { label: `Switch (${variableName})`, code: [`switch (${variableName}) {`], onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false), addCaseNode: (id) => addCaseNode(id) },
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

    let newEdges
    if(isInternal){
      newEdges = [
        {
          id: `e${currentParentId || nodes.length}-${newNode.id}`,
          source: currentParentId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        },
        {
          id: `e${newNode.id}-${defaultGroup.id}`,
          source: newNode.id,
          sourceHandle: 'default',
          target: defaultGroup.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        },
      ];
    }else{
      newEdges = [
        {
          id: `e${currentParentId || nodes.length}-${newNode.id}`,
          source: currentParentId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          sourceHandle: 'b',
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        },
        {
          id: `e${newNode.id}-${defaultGroup.id}`,
          source: newNode.id,
          sourceHandle: 'default',
          target: defaultGroup.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        },
      ];
    }

    setNodes((nds) => nds.concat(newNode, defaultGroup));
    setEdges((eds) => eds.concat(newEdges));
    setShowSwitchModal(false);
    setSelectedVariable('');
    setCurrentSwitchNode(newNode.id);
    generateCodeFromNodes(nodes.concat(newNode, defaultGroup), edges.concat(newEdges));
  };

  const handleCaseModalSave = () => {
    const variable = variables.find(v => v.name === selectedVariable);
    const variableName = variable ? variable.name : selectedVariable;
    const newNode = {
      id: `${nodes.length + 1}`,
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
    const newNode = {
      id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
  
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Enviar Texto: ${responseTextName}`,
        code: [
          `responseText = ${finalResponseText};`,
          `await sendTextMessage(io, { body: { phone: senderId, messageText: responseText, conversationId } }, {});`,
        ],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
    setShowResponseTextModal(false);
    setResponseText('');
    setResponseTextName('');
    setSelectedVariables([]);
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

    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'conditional',
      position: { x: 250, y: 55 + 75 * nodes.length },
      data: { label: `Si ${conditionStr}`, code: [`if (${conditionStr})`, `{`, `} else {`], onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false) },
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
      data: { label: 'No',onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false), setNodes},
      parentId: newNode.id,
    };

    let newEdges
    if(isInternal){
      newEdges = [
        {
          id: `e${currentParentId || nodes.length}-${newNode.id}`,
          source: currentParentId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        },
        {
          id: `e${newNode.id}-${ifGroup.id}`,
          source: newNode.id,
          sourceHandle: 'a',
          target: ifGroup.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        },
        {
          id: `e${newNode.id}-${elseGroup.id}`,
          source: newNode.id,
          sourceHandle: 'b',
          target: elseGroup.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        },
      ];
    }else{
      newEdges = [
        {
          id: `e${currentParentId || nodes.length}-${newNode.id}`,
          source: currentParentId || `${nodes.length}`,
          target: newNode.id,
          animated: true,
          sourceHandle: 'b',
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        },
        {
          id: `e${newNode.id}-${ifGroup.id}`,
          source: newNode.id,
          sourceHandle: 'a',
          target: ifGroup.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        },
        {
          id: `e${newNode.id}-${elseGroup.id}`,
          source: newNode.id,
          sourceHandle: 'b',
          target: elseGroup.id,
          animated: true,
          style: { stroke: '#d033b9' }, // Ajusta el color de la línea aquí
          zIndex: 10, // Ajusta el zIndex si es necesario
          markerEnd: {
            type: MarkerType.ArrowClosed, // Flecha al final de la línea
            color: '#d033b9', // Ajusta el color de la flecha aquí
          },
        },
      ];
    }
  
    setNodes((nds) => nds.concat(newNode, ifGroup, elseGroup));
    setEdges((eds) => eds.concat(newEdges));
    setShowModal(false);
    setSelectedVariable('');
    setSelectedOperator('==');
    setComparisonValue('');
    setConditions([{ variable: '', operator: '==', value: '', logicalOperator: '' }]);
    generateCodeFromNodes(nodes.concat(newNode, ifGroup, elseGroup), edges.concat(newEdges));
  };

  const handleGptQueryModalSave = () => {
    const finalPrompt = `\`${queryPrompt.replace(/\${([^}]+)}/g, '${$1}')}\``;
  
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Consultar GPT: ${queryName}`,
        code: [
          `const ${queryName} = await ${selectedAssistant}(${finalPrompt});`,
        ],
        onAddClick: (id) => openToolModal(id, true), onAddExternalClick: (id) => openToolModal(id, false)
      },
      parentId: isInternal ? currentNodeId : null,
    };
    let newEdge
    if(isInternal){
      newEdge = {
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
    setShowGptQueryModal(false);
    setSelectedAssistant('');
    setQueryName('');
    setQueryPrompt('');
    setSelectedVariables([]);
  };

  const handleSplitVariableModalSave = () => {
    const resultNamesStr = splitResultNames.join(', ');
    const splitCode = `const [${resultNamesStr}] = ${splitVariable}.split('${splitParameter}');`;
  
    const newNode = {
      id: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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
        id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
        source: currentParentId || `${nodes.length}`,
        target: `${nodes.length + 1}`,
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

  const generateCodeFromNodes = (nodes, edges) => {
    let initialDeclarations = 'let responseText;\nlet responseImage;\nlet responseVideo;\nlet responseDocument;\nlet responseAudio;\nlet latitude;\nlet longitude;\nlet streetName;\nlet videoDuration;\nlet videoThumbnail;\nlet payload;\nlet requestType;\nlet requestStatus;\nlet nuevoStatus;\nlet requestData;\nlet existingRequestQuery;\nlet existingRequestResult;\nlet requestId;\nlet updateRequestQuery;\nlet insertRequestQuery;\nlet headersRequest;\nlet requestQueryExternal;\nlet requestResultExternal;\nlet requestDataExternal;\nlet credentialsRequest;\nlet updateStatusQueryExternal;\nlet responseExternal;\n';

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
};\n\n`;
  
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
                <option value="gpt-3.5">gpt-3.5</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                <option value="gpt-4">gpt-4</option>
                <option value="gpt-4-turbo">gpt-4-turbo</option>
                <option value="gpt-4o">gpt-4o</option>
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
              <Form.Control as="select" value={splitVariable} onChange={(e) => setSplitVariable(e.target.value)}>
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>{variable.displayName}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formSplitParameter">
              <Form.Label>Parámetro para Dividir</Form.Label>
              <Form.Control type="text" value={splitParameter} onChange={(e) => setSplitParameter(e.target.value)} />
            </Form.Group>
            {splitResultNames.map((resultName, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <Form.Group controlId={`formSplitResultName${index}`}>
                  <Form.Label>Nombre del Resultado {index + 1}</Form.Label>
                  <Form.Control type="text" value={resultName} onChange={(e) => updateSplitResultName(index, e.target.value)} />
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
            <Form.Control
              type="text"
              value={data.value}
              onChange={(e) => updateRequestData(index, 'value', e.target.value)}
            />
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
                <Modal.Title>Crear Intención</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                <h5>Agregar Estado y Descripción</h5>
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
                    Agregar Estado y Descripción
                </Button>
                <hr />
                <h6>Estados actuales:</h6>
                <ul>
                    {currentIntention.states.map((stateItem, index) => (
                        <li key={index}>
                            {stateItem.state}: {stateItem.description}
                        </li>
                    ))}
                </ul>
                <hr />
                <Button variant="primary" onClick={handleAddIntention}>
                    Agregar Intención
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

        <Modal show={showToolModal} onHide={closeToolModal}>
  <Modal.Header closeButton>
    <Modal.Title>Seleccionar Herramienta</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="toolbar">
      <button onClick={() => addConsoleLogNode(currentNodeId)}>Imprimir en consola</button>
      <button onClick={() => addConversationStateNode(currentNodeId)}>Estado de la conversación</button>
      <button onClick={() => addResponsibleNode(currentNodeId)}>Responsable conversación</button>
      <button onClick={() => addContactInfoNode(currentNodeId)}>Información del contacto</button>
      <button onClick={() => addConditionalNode(currentNodeId)}>Condicional</button>
      <button onClick={() => addSwitchNode(currentNodeId)}>Switch</button>
      <button onClick={() => addCaseNode(currentNodeId)} disabled={!currentSwitchNode}>Caso</button>
      <button onClick={() => addSendTextNode(currentNodeId)}>Enviar Texto</button>
      <button onClick={() => setShowResponseImageModal(true)}>Enviar Imagen</button>
      <button onClick={() => setShowResponseVideoModal(true)}>Enviar Video</button>
      <button onClick={() => setShowResponseAudioModal(true)}>Enviar Audio</button>
      <button onClick={() => setShowResponseLocationModal(true)}>Enviar Ubicación</button>
      <button onClick={() => setShowResponseDocumentModal(true)}>Enviar Documento</button>
      <button onClick={openTemplateModal}>Enviar Plantilla</button>
      <button onClick={() => addUpdateStateNode(currentNodeId)}>Actualizar Estado</button>
      <button onClick={() => addConcatVariablesNode(currentNodeId)}>Concatenar Variables</button>
      <button onClick={() => addGptAssistantNode(currentNodeId)}>Asistente GPT</button>
      <button onClick={() => addGptQueryNode(currentNodeId)}>Consultar GPT</button>
      <button onClick={() => addSplitVariableNode(currentNodeId)}>Dividir Variable</button>
      <button onClick={() => addUpdateContactNameNode(currentNodeId)}>Actualizar nombre contacto</button>
      <button onClick={() => setShowUpdateContactInitializerModal(true)}>Actualizador contacto</button>
      <button onClick={() => {
        if (nodes.some(node => node.data.label === 'Actualizador contacto')) {
          setShowUpdateContactModal(true);
        } else {
          alert('Debe agregar primero un "Actualizador contacto".');
        }
      }}>Actualizar contacto</button>
      <button onClick={() => addChangeResponsibleNode(currentNodeId)}>Cambiar responsable</button>
      <button onClick={() => setShowRequestModal(true)}>Llenar Solicitud</button>
      <button onClick={() => addExternalRequestNode(currentNodeId)}>Crear Solicitud Externa</button>
      <Button
        variant="primary"
        onClick={() => setShowSendRequestModal(true)}
        disabled={externalRequests.length === 0}
      >
        Agregar Solicitud Externa
      </Button>
      <Button variant="primary" onClick={() => setShowExternalDataModal(true)}>
        Agregar Dato Externo
      </Button>
      <Button variant="primary" onClick={() => setShowIntentionModal(true)}>
        Crear Intenciones
      </Button>
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={closeToolModal}>
      Cancelar
    </Button>
  </Modal.Footer>
</Modal>


    </Modal>

    

    
  );
};

export default EditChatBotModal;
