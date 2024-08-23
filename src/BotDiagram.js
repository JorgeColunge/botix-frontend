import React, { useCallback, useState, useEffect } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import './BotDiagram.css';
import { Modal, Button, Form } from 'react-bootstrap';

const initialNodes = [
  { id: '1', type: 'custom', position: { x: 250, y: 5 }, data: { label: 'Inicio', code: [] } },
];

const initialEdges = [];

const nodeTypes = {
  custom: ({ data }) => (
    <div style={{ backgroundColor: '#FF5733', color: '#fff', padding: '10px', borderRadius: '5px' }}>
      <Handle type="target" position="top" />
      <div>{data.label}</div>
      <Handle type="source" position="bottom" />
    </div>
  ),
  conditional: ({ data }) => (
    <div style={{ backgroundColor: '#3498DB', color: '#fff', padding: '10px', borderRadius: '5px' }}>
      <Handle type="target" position="top" />
      <div>{data.label}</div>
      <Handle type="source" position="bottom" id="a" style={{ left: '25%' }} />
      <Handle type="source" position="bottom" id="b" style={{ left: '75%' }} />
    </div>
  ),
  groupNode: ({ data }) => (
    <div className="node group" style={{ backgroundColor: '#2ECC71', color: '#fff', padding: '10px', borderRadius: '5px' }}>
      <Handle type="target" position="top" />
      <div>{data.label}</div>
    </div>
  ),
};


const parseCodeToNodesAndEdges = (code) => {
  const nodes = [];
  const edges = [];
  const variables = [];
  const lines = code.split('\n');
  let previousNodeId = '1';
  let yPos = 55;

  let currentNode = null;

  lines.forEach((line, index) => {
    if (line.trim() === '') return;

    if (line.includes("console.log") || line.includes("const conversationStateQuery")) {
      if (currentNode) {
        nodes.push(currentNode);
      }
      const message = line.includes("console.log")
        ? line.match(/console\.log\('([^']*)'\);/)[1]
        : 'Obtener el estado de la conversación';
      const nodeId = `${index + 2}`;

      currentNode = {
        id: nodeId,
        type: 'custom',
        position: { x: 250, y: yPos },
        data: { label: message, code: [line.trim()] },
      };
      edges.push({
        id: `e${previousNodeId}-${nodeId}`,
        source: previousNodeId,
        target: nodeId,
        animated: true,
      });
      previousNodeId = nodeId;
      yPos += 75;
    } else if (currentNode) {
      currentNode.data.code.push(line.trim());
    }

    if (line.includes("const")) {
      const variableName = line.match(/const\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=/)[1];
      const displayName = line.includes("conversationState") ? "Estado Conversación" : variableName;
      variables.push({ name: variableName, displayName });
    }
  });

  if (currentNode) {
    nodes.push(currentNode);
  }

  return { nodes, edges, variables };
};

const BotDiagram = ({ botCode, onNodesChange, onEdgesChange, onDiagramChange }) => {
  const [variables, setVariables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState('');
  const [comparisonValue, setComparisonValue] = useState('');
  const { nodes: initialNodesFromCode, edges: initialEdgesFromCode, variables: initialVariables } = parseCodeToNodesAndEdges(botCode);
  const [nodes, setNodes, onNodesChangeState] = useNodesState([...initialNodes, ...initialNodesFromCode]);
  const [edges, setEdges, onEdgesChangeState] = useEdgesState([...initialEdges, ...initialEdgesFromCode]);
  const [currentParentId, setCurrentParentId] = useState(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    setVariables(initialVariables);
  }, [initialVariables]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onElementsRemove = useCallback(
    (elementsToRemove) => {
      setNodes((nds) => applyNodeChanges(nds.filter(node => !elementsToRemove.includes(node.id)), nds));
      setEdges((eds) => applyEdgeChanges(eds.filter(edge => !elementsToRemove.includes(edge.id)), eds));
    },
    [setNodes, setEdges]
  );

  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    [setEdges]
  );

  const addConsoleLogNode = () => {
    const message = prompt("Enter the message to print:");
    if (!message) return;
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: { label: `Imprimir: ${message}`, code: [`console.log('${message}');`] },
      parentId: currentParentId,
    };
    const newEdge = {
      id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
      source: currentParentId || `${nodes.length}`,
      target: `${nodes.length + 1}`,
      animated: true,
    };
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
      },
      parentId: currentParentId,
    };
    const newEdge = {
      id: `e${currentParentId || nodes.length}-${nodes.length + 1}`,
      source: currentParentId || `${nodes.length}`,
      target: `${nodes.length + 1}`,
      animated: true,
    };
    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    generateCodeFromNodes(updatedNodes, updatedEdges);
  };

  const addConditionalNode = () => {
    setShowModal(true);
  };

  const handleModalSave = () => {
    const condition = `${selectedVariable} == ${comparisonValue}`;
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'conditional',
      position: { x: 250, y: 55 + 75 * nodes.length },
      data: { label: `Si ${condition}`, code: [`if (${condition}) {`, `} else {`, `}`] },
    };

    const ifGroup = {
      id: `${newNode.id}-if`,
      type: 'groupNode',
      position: { x: newNode.position.x - 100, y: newNode.position.y + 100 },
      data: { label: 'if' },
      parentId: newNode.id,
      style: { width: 170, height: 140 },
    };

    const elseGroup = {
      id: `${newNode.id}-else`,
      type: 'groupNode',
      position: { x: newNode.position.x + 100, y: newNode.position.y + 100 },
      data: { label: 'else' },
      parentId: newNode.id,
      style: { width: 170, height: 140 },
    };

    const ifConnector = {
      id: `${ifGroup.id}-connector`,
      type: 'input',
      position: { x: ifGroup.position.x + 50, y: ifGroup.position.y + 50 },
      data: { label: 'Si' },
      parentId: ifGroup.id,
    };
    const elseConnector = {
      id: `${elseGroup.id}-connector`,
      type: 'input',
      position: { x: elseGroup.position.x + 50, y: elseGroup.position.y + 50 },
      data: { label: 'No' },
      parentId: elseGroup.id,
    };

    const newEdges = [
      {
        id: `e${nodes.length}-${newNode.id}`,
        source: `${nodes.length}`,
        target: newNode.id,
        animated: true,
      },
      {
        id: `e${newNode.id}-${ifConnector.id}`,
        source: newNode.id,
        sourceHandle: 'a',
        target: ifConnector.id,
        animated: true,
      },
      {
        id: `e${newNode.id}-${elseConnector.id}`,
        source: newNode.id,
        sourceHandle: 'b',
        target: elseConnector.id,
        animated: true,
      },
    ];

    setNodes((nds) => nds.concat(newNode, ifGroup, elseGroup, ifConnector, elseConnector));
    setEdges((eds) => eds.concat(newEdges));
    setShowModal(false);
    setSelectedVariable('');
    setComparisonValue('');
    generateCodeFromNodes(nodes.concat(newNode, ifGroup, elseGroup, ifConnector, elseConnector), edges.concat(newEdges));
  };

  const generateCodeFromNodes = (nodes, edges) => {
    const generateNodeCode = (node, indent = '') => {
      let nodeCode = '';
      if (node.type === 'custom') {
        nodeCode += `${indent}${node.data.code.join('\n')}\n`;
      } else if (node.type === 'conditional') {
        const condition = node.data.code[0];
        nodeCode += `${indent}${condition}\n`;
        const ifChildren = nodes.filter((n) => n.parentId === `${node.id}-if` || (n.parentId && n.parentId.startsWith(`${node.id}-if`)));
        nodeCode += `${indent}{\n`;
        ifChildren.forEach((child) => {
          nodeCode += generateNodeCode(child, indent + '  ');
        });
        nodeCode += `${indent}}\n${indent}else {\n`;
        const elseChildren = nodes.filter((n) => n.parentId === `${node.id}-else` || (n.parentId && n.parentId.startsWith(`${node.id}-else`)));
        elseChildren.forEach((child) => {
          nodeCode += generateNodeCode(child, indent + '  ');
        });
        nodeCode += `${indent}}\n`;
      }
      return nodeCode;
    };

    const rootNodes = nodes.filter((node) => !node.parentId);
    let fullCode = '';
    rootNodes.forEach((rootNode) => {
      fullCode += generateNodeCode(rootNode);
    });

    // Elimina la línea redundante
    fullCode = fullCode.replace(/\n\)([^)]*\);)/g, '');

    setCode(fullCode);
    onDiagramChange(fullCode);
  };

  useEffect(() => {
    generateCodeFromNodes(nodes, edges);
  }, [nodes, edges]);

  return (
    <ReactFlowProvider>
      <div className="diagram-container">
        <div className="toolbar">
          <button onClick={addConsoleLogNode}>Imprimir en consola</button>
          <button onClick={addConversationStateNode}>Obtener el estado de la conversación</button>
          <button onClick={addConditionalNode}>Condicional</button>
        </div>
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
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setCurrentParentId(node.id)}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Condicional</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formVariable">
              <Form.Label>Variable</Form.Label>
              <Form.Control as="select" value={selectedVariable} onChange={(e) => setSelectedVariable(e.target.value)}>
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>{variable.displayName}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formComparisonValue">
              <Form.Label>Valor de Comparación</Form.Label>
              <Form.Control type="text" value={comparisonValue} onChange={(e) => setComparisonValue(e.target.value)} />
            </Form.Group>
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

      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '20px' }}>{code}</pre>
    </ReactFlowProvider>
  );
};

export default BotDiagram;
