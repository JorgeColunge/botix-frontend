import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form, InputGroup, FormControl, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import Mustache from 'mustache';
import he from 'he'; // Importar la librería he para decodificación HTML

const TemplateModal = ({ show, handleClose, conversation, contact }) => {
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variableValues, setVariableValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  console.log("Plantilla", selectedTemplate)
  useEffect(() => {
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

    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchVariableValues = async () => {
      if (selectedTemplate && conversation) {
        try {
          setLoading(true);
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/conversation-variable-values/${selectedTemplate.id}/${conversation.conversation_id}`);
          setVariableValues(response.data);
        } catch (error) {
          console.error('Error fetching variable values:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVariableValues();
  }, [selectedTemplate, conversation]);

  const handleSendTemplate = async () => {
    setSending(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const token = localStorage.getItem('token');
  
      if (!selectedTemplate || !conversation) {
        console.error('No template or conversation selected');
        setSending(false);
        return;
      }
  
      const parameters = [];
      selectedTemplate.headerVariables?.forEach(variable => {
        const value = variableValues[`header_${variable.name.replace(/{{|}}/g, '')}`] || '';
        parameters.push(value);
      });
      selectedTemplate.bodyVariables?.forEach(variable => {
        const value = variableValues[`body_${variable.name.replace(/{{|}}/g, '')}`] || '';
        parameters.push(value);
      });
      selectedTemplate.buttonVariables?.forEach(variable => {
        const value = variableValues[`button_${variable.name.replace(/{{|}}/g, '')}`] || '';
        parameters.push(value);
      });
  
      const payload = {
        conversation,
        template: selectedTemplate,
        parameters,
        company_id: companyId
      };
  
      console.log('Sending payload:', payload);
  
      await axios.post(`${process.env.REACT_APP_API_URL}/api/send-template`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      console.log('Plantilla enviada exitosamente');
    } catch (error) {
      console.error('Error sending template:', error);
    } finally {
      setSending(false);
    }
  };
  
  
  

  const handleVariableChange = (variableName, newValue) => {
    setVariableValues(prevValues => ({
      ...prevValues,
      [variableName]: newValue
    }));
  };

  const cleanAndFormatVariable = (value) => {
    // Decodificar entidades HTML
    return he.decode(value);
  };

  const replaceVariables = (template, scope) => {
    let view = {};
    (template[`${scope}Variables`] || []).forEach(variable => {
      const variableName = variable.name.replace(/{{|}}/g, '');
      view[variableName] = cleanAndFormatVariable(variableValues[`${scope}_${variableName}`] || variable.example || '');
    });

    return Mustache.render(template[`${scope}_text`] || '', view);
  };

  const filteredTemplates = templates.filter(template => {
    return (
      (template.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || template.type?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType ? template.type === filterType : true)
    );
  });

  console.log("variables boton:", variableValues)
  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Seleccionar Plantilla</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
                    {filteredTemplates.length > 0 ? (
                      filteredTemplates.map(template => (
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
                          {selectedTemplate.header_type === 'TEXT' && <div><strong>{replaceVariables(selectedTemplate, 'header')}</strong></div>}
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
                          {replaceVariables(selectedTemplate, 'body')}
                        </div>
                        {selectedTemplate.footer && <div className="footer small">{selectedTemplate.footer}</div>}
                        {(selectedTemplate.type_button !== 'none' || selectedTemplate.buttonVariables.length !== 0) && (
                          <div className="buttons">
                            {selectedTemplate.type_button === 'QUICK_REPLY' && <button className="btn btn-success w-100 mt-2">{selectedTemplate.button_text}</button>}
                            {selectedTemplate.type_button === 'PHONE_NUMBER' && <button className="btn btn-success w-100 mt-2">{selectedTemplate.button_text}</button>}
                            {selectedTemplate.type_button === 'URL' && <button className="btn btn-success w-100 mt-2">{selectedTemplate.button_text}</button>}
                            {
                              selectedTemplate.buttonVariables.length !== 0 && (
                                selectedTemplate.buttonVariables.map((btn, index) => (
                                  <button key={index} className="btn btn-success w-100 mt-2">
                                    {btn.name}
                                  </button>
                                ))
                              )
                            }
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
                            onChange={(e) => handleVariableChange(`header_${variable.name.replace(/{{|}}/g, '')}`, e.target.value)}
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
                            onChange={(e) => handleVariableChange(`body_${variable.name.replace(/{{|}}/g, '')}`, e.target.value)}
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
                            onChange={(e) => handleVariableChange(`button_${variable.name.replace(/{{|}}/g, '')}`, e.target.value)}
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
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        {selectedTemplate && (
          <Button 
            variant="primary" 
            onClick={handleSendTemplate}
            disabled={sending}
          >
            {sending ? 'Enviando...' : 'Enviar Plantilla'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TemplateModal;
