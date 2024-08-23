import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Modal, Spinner, ButtonGroup } from 'react-bootstrap';
import { Code, TypeBold, TypeItalic, TypeStrikethrough } from 'react-bootstrap-icons'
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './CreateTemplate.css';

const socket = io(process.env.REACT_APP_BACKEND_URL);

const languages = [
  { name: 'Afrikáans', code: 'af' },
  { name: 'Albanés', code: 'sq' },
  { name: 'Árabe', code: 'ar' },
  { name: 'Azerbaiyano', code: 'az' },
  { name: 'Bengalí', code: 'bn' },
  { name: 'Búlgaro', code: 'bg' },
  { name: 'Catalán', code: 'ca' },
  { name: 'Chino (China)', code: 'zh_CN' },
  { name: 'Chino (Hong Kong)', code: 'zh_HK' },
  { name: 'Chino (Taiwán)', code: 'zh_TW' },
  { name: 'Croata', code: 'hr' },
  { name: 'Checo', code: 'cs' },
  { name: 'Danés', code: 'da' },
  { name: 'Neerlandés', code: 'nl' },
  { name: 'Inglés', code: 'en' },
  { name: 'Inglés (Reino Unido)', code: 'en_GB' },
  { name: 'Inglés (EE. UU.)', code: 'en_US' },
  { name: 'Estonio', code: 'et' },
  { name: 'Filipino', code: 'fil' },
  { name: 'Finés', code: 'fi' },
  { name: 'Francés', code: 'fr' },
  { name: 'Alemán', code: 'de' },
  { name: 'Griego', code: 'el' },
  { name: 'Guyaratí', code: 'gu' },
  { name: 'Hausa', code: 'ha' },
  { name: 'Hebreo', code: 'he' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Húngaro', code: 'hu' },
  { name: 'Indonesio', code: 'id' },
  { name: 'Irlandés', code: 'ga' },
  { name: 'Italiano', code: 'it' },
  { name: 'Japonés', code: 'ja' },
  { name: 'Canarés', code: 'kn' },
  { name: 'Kazajo', code: 'kk' },
  { name: 'Coreano', code: 'ko' },
  { name: 'Lao', code: 'lo' },
  { name: 'Letón', code: 'lv' },
  { name: 'Lituano', code: 'lt' },
  { name: 'Macedonio', code: 'mk' },
  { name: 'Malayo', code: 'ms' },
  { name: 'Malayalam', code: 'ml' },
  { name: 'Maratí', code: 'mr' },
  { name: 'Noruego', code: 'nb' },
  { name: 'Persa', code: 'fa' },
  { name: 'Polaco', code: 'pl' },
  { name: 'Portugués (Brasil)', code: 'pt_BR' },
  { name: 'Portugués (Portugal)', code: 'pt_PT' },
  { name: 'Punyabí', code: 'pa' },
  { name: 'Rumano', code: 'ro' },
  { name: 'Ruso', code: 'ru' },
  { name: 'Serbio', code: 'sr' },
  { name: 'Eslovaco', code: 'sk' },
  { name: 'Esloveno', code: 'sl' },
  { name: 'Español', code: 'es' },
  { name: 'Español (Argentina)', code: 'es_AR' },
  { name: 'Español (España)', code: 'es_ES' },
  { name: 'Español (México)', code: 'es_MX' },
  { name: 'Suajili', code: 'sw' },
  { name: 'Sueco', code: 'sv' },
  { name: 'Tamil', code: 'ta' },
  { name: 'Telugu', code: 'te' },
  { name: 'Tailandés', code: 'th' },
  { name: 'Turco', code: 'tr' },
  { name: 'Ucraniano', code: 'uk' },
  { name: 'Urdu', code: 'ur' },
  { name: 'Uzbeko', code: 'uz' },
  { name: 'Vietnamita', code: 'vi' },
  { name: 'Zulu', code: 'zu' },
];

const sources = {
  contacts: [
    { name: 'Nombre', value: 'first_name' },
    { name: 'Apellido', value: 'last_name' },
    { name: 'Telefono', value: 'phone_number' },
    { name: 'Organizacion', value: 'organization' },
    { name: 'Fecha de nacimiento', value: 'fecha_nacimiento' },
    { name: 'Pais', value: 'nacionalidad' },
    { name: 'Ciudad', value: 'ciudad_residencia' },
    { name: 'Dirección', value: 'direccion_completa' },
    { name: 'Correo', value: 'email' },
    { name: 'Ocupación', value: 'ocupacion' },
    { name: 'Identificador', value: 'id' },
  ],
  users: [
    { name: 'Identificador', value: 'id_usuario' },
    { name: 'Nombre', value: 'nombre' },
    { name: 'Apellido', value: 'apellido' },
    { name: 'Nombre Completo', value: 'nombre && apellido' },
    { name: 'Telefono', value: 'telefono' },
    { name: 'Correo', value: 'email' },
    { name: 'Rol', value: 'rol' },
    { name: 'Departamento', value: 'department_id' },
  ],
  companies: [
    { name: 'Nombre', value: 'name' },
    { name: 'Tipo Documento', value: 'document_type' },
    { name: 'Numero de documento', value: 'document_number' },
    { name: 'Dirección', value: 'address' },
    { name: 'Ciudad', value: 'city' },
    { name: 'Pais', value: 'country' },
    { name: 'Codigo', value: 'postal_code' },
    { name: 'Correo', value: 'email' },
    { name: 'Telefono', value: 'phone' },
  ],
  date: [
    { name: 'Hoy', value: 'today' },
    { name: 'Ayer', value: 'yesterday' },
    { name: 'Mañana', value: 'tomorrow' },
    { name: 'Fin de semana', value: 'weekend' },
    { name: 'Mes actual', value: 'this_month' },
    { name: 'Jornada', value: 'working day' },
    { name: 'Hora actual', value: 'hour' },
    { name: 'Nombre del dia', value: 'day_name' },
  ],
};

const CreateTemplate = () => {
  const [category, setCategory] = useState('Marketing');
  const [subType, setSubType] = useState('Personalizado');
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('es');
  const [headerType, setHeaderType] = useState('none');
  const [mediaType, setMediaType] = useState('image');
  const [headerText, setHeaderText] = useState('');
  const [headerExample, setHeaderExample] = useState('');
  const [headerSource, setHeaderSource] = useState('');
  const [headerVariable, setHeaderVariable] = useState('');
  const [headerVariableAdded, setHeaderVariableAdded] = useState(false);
  const [bodyText, setBodyText] = useState('');
  const [bodyExamples, setBodyExamples] = useState({});
  const [bodySources, setBodySources] = useState({});
  const [bodyVariables, setBodyVariables] = useState({});
  const [buttonText, setButtonText] = useState('');
  const [buttonType, setButtonType] = useState('none');
  const [buttonPhoneNumber, setButtonPhoneNumber] = useState('');
  const [buttonPhoneCode, setButtonPhoneCode] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [buttonUrlType, setButtonUrlType] = useState('static');
  const [buttonUrlExample, setButtonUrlExample] = useState('');
  const [headerImage, setHeaderImage] = useState(null);
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [headerVideo, setHeaderVideo] = useState(null);
  const [headerVideoUrl, setHeaderVideoUrl] = useState('');
  const [headerDocument, setHeaderDocument] = useState(null);
  const [headerDocumentUrl, setHeaderDocumentUrl] = useState('');
  const [footerText, setFooterText] = useState('');
  const [customValidity, setCustomValidity] = useState(false);
  const [validityPeriod, setValidityPeriod] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [templateStatus, setTemplateStatus] = useState('PENDING');
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [buttons, setButtons] = useState([]);

  const navigate = useNavigate();
  const {id_plantilla} = useParams();

  useEffect(() => {
    const fetchTemplates = async () => {
      if (id_plantilla) {
        const companyId = localStorage.getItem('company_id');
        const token = localStorage.getItem('token');
        if (!companyId || !token) {
          console.error('No company ID or token found');
          return;
        }
  
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/templates`, {
            params: { company_id: companyId },
            headers: { Authorization: `Bearer ${token}` }
          });
          if (id_plantilla) {
               const templete = response.data.find(temp => temp.id == id_plantilla)
               setCategory(templete.type)
               setName(templete.nombre)
               setLanguage(templete.language)
               setHeaderType(templete.header_type)
               setBodyText(templete.body_text)
               setFooterText(templete.footer)
               const newBodyExample = templete.bodyVariables.reduce((acc, variable, index) => {
                acc[`{{${index + 1}}}`] = variable.example;
                return acc;
              }, {});
              console.log(templete)
              setBodyExamples(newBodyExample); 
          }
        } catch (error) {
          console.error('Error fetching templates:', error);
        }
      }   
    };
    fetchTemplates();
  }, [])
  
  useEffect(() => {
    socket.on('templateStatusUpdate', ({ templateId, status }) => {
      console.log(`Received templateStatusUpdate for templateId: ${templateId} with status: ${status}`);
      setTemplateStatus(status);
    });

    return () => {
      socket.off('templateStatusUpdate');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (category === 'UTILITY' && !headerText.includes('{{') && !bodyText.includes('{{')) {
      alert('Las plantillas de utilidad deben incluir al menos una variable en el cuerpo o en el encabezado.');
      setLoading(false);
      return;
    }
  
    const bodyExampleArray = Object.keys(bodyExamples).map(key => bodyExamples[key]);
    const bodySourceArray = Object.keys(bodySources).map(key => bodySources[key]);
    const bodyVariableArray = Object.keys(bodyVariables).map(key => bodyVariables[key]);
  
    const headerExampleArray = headerVariableAdded ? [headerExample] : [];
    const headerSourceArray = headerVariableAdded ? [headerSource] : [];
    const headerVariableArray = headerVariableAdded ? [headerVariable] : [];
  
    const components = [
      ...(headerType === 'text' ? [{
        type: 'HEADER',
        format: 'TEXT',
        text: headerText,
        example: headerVariableAdded ? { header_text: headerExampleArray } : undefined,
      }] : headerType === 'media' ? [{
        type: 'HEADER',
        format: mediaType.toUpperCase(),
        example: { header_handle: [headerImageUrl || headerVideoUrl || headerDocumentUrl] }
      }] : headerType === 'location' ? [{
        type: 'HEADER',
        format: 'LOCATION'
      }] : []),
      {
        type: 'BODY',
        text: bodyText,
        example: bodyExampleArray.length > 0 ? { body_text: [bodyExampleArray] } : undefined,
      },
      ...(footerText ? [{
        type: 'FOOTER',
        text: footerText
      }] : []),
      ...(buttons.length > 0 ? [{
        type: 'BUTTONS',
        buttons: buttons.map(button => {
          if (button.type === 'QUICK_REPLY') {
            return {
              type: 'QUICK_REPLY',
              text: button.text
            };
          } else if (button.type === 'PHONE_NUMBER') {
            return {
              type: 'PHONE_NUMBER',
              text: button.text,
              phone_number: `${button.phoneCode}${button.phoneNumber}`
            };
          } else if (button.type === 'URL') {
            return {
              type: 'URL',
              text: button.text,
              url: button.url,
              example: button.urlType === 'dynamic' ? { url_text: button.urlExample } : undefined,
            };
          } else {
            return null;
          }
        }).filter(Boolean)
      }] : [])
    ];
  
    const componentsWithSourceAndVariable = [
      ...(headerType === 'text' ? [{
        type: 'HEADER',
        format: 'TEXT',
        text: headerText,
        example: headerVariableAdded ? { header_text: headerExampleArray } : undefined,
        source: headerVariableAdded ? headerSourceArray : undefined,
        variable: headerVariableAdded ? headerVariableArray : undefined
      }] : headerType === 'media' ? [{
        type: 'HEADER',
        format: mediaType.toUpperCase(),
        example: { header_handle: [headerImageUrl || headerVideoUrl || headerDocumentUrl] }
      }] : headerType === 'location' ? [{
        type: 'HEADER',
        format: 'LOCATION'
      }] : []),
      {
        type: 'BODY',
        text: bodyText,
        example: bodyExampleArray.length > 0 ? { body_text: [bodyExampleArray] } : undefined,
        source: bodySourceArray.length > 0 ? bodySourceArray : undefined,
        variable: bodyVariableArray.length > 0 ? bodyVariableArray : undefined
      },
      ...(footerText ? [{
        type: 'FOOTER',
        text: footerText
      }] : []),
      ...(buttons.length > 0 ? [{
        type: 'BUTTONS',
        buttons: buttons.map(button => {
          if (button.type === 'QUICK_REPLY') {
            return {
              type: 'QUICK_REPLY',
              text: button.text
            };
          } else if (button.type === 'PHONE_NUMBER') {
            return {
              type: 'PHONE_NUMBER',
              text: button.text,
              phone_number: `${button.phoneCode}${button.phoneNumber}`
            };
          } else if (button.type === 'URL') {
            return {
              type: 'URL',
              text: button.text,
              url: button.url,
              example: button.urlType === 'dynamic' ? { url_text: button.urlExample } : undefined,
            };
          } else {
            return null;
          }
        }).filter(Boolean)
      }] : [])
    ];
  
    const companyId = localStorage.getItem('company_id');
  
    const templateData = {
      name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      language,
      category: category.toUpperCase(),
      components,
      componentsWithSourceAndVariable,
      company_id: companyId,
      ...(customValidity ? { validity_period: validityPeriod } : {})
    };
  
    console.log('Template Data:', templateData);
  
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      setLoading(false);
      return;
    }
   console.log(templateData)
   console.log("datos a conocer:", componentsWithSourceAndVariable)

   if (id_plantilla) {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/edit-template`, {...templateData, id_plantilla}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Template created successfully:', response.data);
  
      if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(mediaType.toUpperCase())) {
        setResponseMessage('Plantilla almacenada con éxito. Ahora debe crear la misma plantilla con las mismas características en WhatsApp.');
      } else {
        setResponseMessage(`Estado de la Plantilla: ${response.data.status}`);
      }
  
      setTemplateStatus(response.data.status);
      setLoading(false);
      setShowModal(true);
      resetForm();
    } catch (error) {
      console.error('Error creating template:', error);
      setResponseMessage('Error al crear la plantilla. Por favor, inténtelo de nuevo.');
      setLoading(false);
      setShowModal(true);
    }
   }else{
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/create-template`, templateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Template created successfully:', response.data);
  
      if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(mediaType.toUpperCase())) {
        setResponseMessage('Plantilla almacenada con éxito. Ahora debe crear la misma plantilla con las mismas características en WhatsApp.');
      } else {
        setResponseMessage(`Estado de la Plantilla: ${response.data.status}`);
      }
  
      setTemplateStatus(response.data.status);
      setLoading(false);
      setShowModal(true);
      resetForm();
    } catch (error) {
      console.error('Error creating template:', error);
      setResponseMessage('Error al crear la plantilla. Por favor, inténtelo de nuevo.');
      setLoading(false);
      setShowModal(true);
    }
   }
  }; 

  const resetForm = () => {
    setCategory('Marketing');
    setSubType('Personalizado');
    setName('');
    setLanguage('');
    setHeaderType('none');
    setMediaType('image');
    setHeaderText('');
    setHeaderExample('');
    setHeaderSource('');
    setHeaderVariable('');
    setHeaderVariableAdded(false);
    setBodyText('');
    setBodyExamples({});
    setBodySources({});
    setBodyVariables({});
    setButtonText('');
    setButtonType('none');
    setButtonPhoneNumber('');
    setButtonPhoneCode('');
    setButtonUrl('');
    setButtonUrlType('static');
    setButtonUrlExample('');
    setHeaderImage(null);
    setHeaderImageUrl('');
    setHeaderVideo(null);
    setHeaderVideoUrl('');
    setHeaderDocument(null);
    setHeaderDocumentUrl('');
    setFooterText('');
    setCustomValidity(false);
    setValidityPeriod('');
  };

  const handleMediaChange = async (e, mediaType) => {
    const file = e.target.files[0];
    if (mediaType === 'image') {
      setHeaderImage(file);
      setHeaderVideo(null);
      setHeaderDocument(null);
    } else if (mediaType === 'video') {
      setHeaderImage(null);
      setHeaderVideo(file);
      setHeaderDocument(null);
    } else if (mediaType === 'document') {
      setHeaderImage(null);
      setHeaderVideo(null);
      setHeaderDocument(file);
    }

    const formData = new FormData();
    formData.append('media', file);

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/upload-template-media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      const mediaUrl = response.data.mediaUrl;
      if (mediaType === 'image') {
        setHeaderImageUrl(mediaUrl);
      } else if (mediaType === 'video') {
        setHeaderVideoUrl(mediaUrl);
      } else if (mediaType === 'document') {
        setHeaderDocumentUrl(mediaUrl);
      }
      setLoading(false);
      console.log('Media uploaded successfully:', mediaUrl);
    } catch (error) {
      console.error('Error uploading media:', error);
      setLoading(false);
    }
  };

  const removeMedia = (mediaType) => {
    if (mediaType === 'image') {
      setHeaderImage(null);
      setHeaderImageUrl('');
    } else if (mediaType === 'video') {
      setHeaderVideo(null);
      setHeaderVideoUrl('');
    } else if (mediaType === 'document') {
      setHeaderDocument(null);
      setHeaderDocumentUrl('');
    }
  };

  const addHeaderVariable = () => {
    if (!headerVariableAdded) {
      setHeaderText(`${headerText} {{1}}`);
      setHeaderVariableAdded(true);
    }
  };

  const removeHeaderVariable = () => {
    setHeaderText(headerText.replace(' {{1}}', ''));
    setHeaderExample('');
    setHeaderSource('');
    setHeaderVariable('');
    setHeaderVariableAdded(false);
  };
 
  const addBodyVariable = () => {
    
    const variableCount = Object.keys(bodyExamples).length + 1;
    setBodyText(`${bodyText} {{${variableCount}}}`);
    setBodyExamples({ ...bodyExamples, [`{{${variableCount}}}`]: '' });
    setBodySources({ ...bodySources, [`{{${variableCount}}}`]: '' });
    setBodyVariables({ ...bodyVariables, [`{{${variableCount}}}`]: '' });
  };

  const updateBodyExample = (variable, value) => {
    setBodyExamples({ ...bodyExamples, [variable]: value });
  };

  const updateBodySource = (variable, value) => {
    setBodySources({ ...bodySources, [variable]: value });
  };
  const updateBodyVariable = (variable, value) => {
    console.log("cariables app", variable, value)
    setBodyVariables({ ...bodyVariables, [variable]: value });
  };

  const removeBodyVariable = (variable) => {
    setBodyText(bodyText.replace(variable, ''));
    const updatedExamples = { ...bodyExamples };
    delete updatedExamples[variable];
    setBodyExamples(updatedExamples);
    const updatedSources = { ...bodySources };
    delete updatedSources[variable];
    setBodySources(updatedSources);
    const updatedVariables = { ...bodyVariables };
    delete updatedVariables[variable];
  };

  const renderSubTypeOptions = () => {
    switch (category) {
      case 'Marketing':
        return (
          <>
            <Form.Check
              type="radio"
              label="Personalizado"
              value="Personalizado"
              checked={subType === 'Personalizado'}
              onChange={(e) => setSubType(e.target.value)}
            />
          </>
        );
      case 'UTILITY':
        return (
          <>
            <Form.Check
              type="radio"
              label="Personalizado"
              value="Personalizado"
              checked={subType === 'Personalizado'}
              onChange={(e) => setSubType(e.target.value)}
            />
          </>
        );
      default:
        return null;
    }
  };

  const renderTextWithExamples = (text, examples) => {
    return text.replace(/{{\d+}}/g, (match) => {
      const key = match;
      return examples[key] || 'Ejemplo';
    });
  };

  const formatTextToHtml = (text) => {
    // Reemplazar los formatos con etiquetas HTML
    const formattedText = text
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>') // Negrita
      .replace(/_(.*?)_/g, '<em>$1</em>') // Itálica
      .replace(/~(.*?)~/g, '<del>$1</del>') // Tachado
      .replace(/`(.*?)`/g, '<code class="text-black">$1</code>'); // Monospaciado

    return formattedText.replace(/\n/g, '<br>'); // Reemplazar saltos de línea con <br>
  };

  const handleNameChange = (e) => {
    const formattedName = e.target.value.toLowerCase().replace(/ /g, '_');
    setName(formattedName);
  };

  const applyFormat = (formatType) => {
    const textarea = document.getElementById('bodyTextArea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const beforeText = text.slice(0, start);
    const selectedText = text.slice(start, end);
    const afterText = text.slice(end);

    const beforeSpaces = selectedText.match(/^\s*/)[0];
    const afterSpaces = selectedText.match(/\s*$/)[0];
    const trimmedText = selectedText.trim();

    let formattedText;
    let formatChar;
    let regex;

    switch (formatType) {
      case 'bold':
        formatChar = '*';
        regex = new RegExp(`\\${formatChar}${trimmedText}\\${formatChar}`);
        break;
      case 'italic':
        formatChar = '_';
        regex = new RegExp(`\\${formatChar}${trimmedText}\\${formatChar}`);
        break;
      case 'strikethrough':
        formatChar = '~';
        regex = new RegExp(`\\${formatChar}${trimmedText}\\${formatChar}`);
        break;
      case 'monospace':
        formatChar = '`';
        regex = new RegExp(`\\${formatChar}${trimmedText}\\${formatChar}`);
        break;
      default:
        formatChar = '';
        regex = null;
    }

    if (regex && regex.test(text)) {
      // Eliminar formato
      formattedText = text.replace(regex, trimmedText);
    } else {
      // Aplicar formato
      formattedText = `${beforeText}${beforeSpaces}${formatChar}${trimmedText}${formatChar}${afterSpaces}${afterText}`;
    }

    setBodyText(formattedText);

    const newPosition = beforeText.length + beforeSpaces.length + trimmedText.length + 2; // +2 for the format characters
    textarea.focus();
    textarea.setSelectionRange(newPosition, newPosition);
  };

  const urlButtonsCount = buttons.filter(button => button.type === 'URL').length;
  const phoneButtonsCount = buttons.filter(button => button.type === 'PHONE_NUMBER').length;

  const addButton = (type) => {
    const urlButtons = buttons.filter(button => button.type === 'URL').length;
    const phoneButtons = buttons.filter(button => button.type === 'PHONE_NUMBER').length;

    if (buttons.length >= 10) {
      alert('No puedes agregar más de 10 botones.');
      return;
    }

    if (type === 'URL' && urlButtons >= 2) {
      alert('No puedes agregar más de 2 botones de tipo URL.');
      return;
    }

    if (type === 'PHONE_NUMBER' && phoneButtons >= 1) {
      alert('No puedes agregar más de 1 botón de tipo Número de Teléfono.');
      return;
    }

    setButtons([...buttons, { type: 'none', text: '', phoneCode: '', phoneNumber: '', url: '', urlType: 'static', urlExample: '' }]);
  };

  const handleButtonTypeChange = (index, type) => {
    const urlButtons = buttons.filter(button => button.type === 'URL').length;
    const phoneButtons = buttons.filter(button => button.type === 'PHONE_NUMBER').length;

    if (type === 'URL' && urlButtons >= 2) {
      alert('No puedes agregar más de 2 botones de tipo URL.');
      return;
    }

    if (type === 'PHONE_NUMBER' && phoneButtons >= 1) {
      alert('No puedes agregar más de 1 botón de tipo Número de Teléfono.');
      return;
    }

    const newButtons = [...buttons];
    newButtons[index].type = type;
    setButtons(newButtons);
  };

  const handleButtonTextChange = (index, text) => {
    const newButtons = [...buttons];
    newButtons[index].text = text;
    setButtons(newButtons);
  };

  const handleButtonPhoneCodeChange = (index, phoneCode) => {
    const newButtons = [...buttons];
    newButtons[index].phoneCode = phoneCode;
    setButtons(newButtons);
  };

  const handleButtonPhoneNumberChange = (index, phoneNumber) => {
    const newButtons = [...buttons];
    newButtons[index].phoneNumber = phoneNumber;
    setButtons(newButtons);
  };

  const handleButtonUrlChange = (index, url) => {
    const newButtons = [...buttons];
    newButtons[index].url = url;
    setButtons(newButtons);
  };

  const handleButtonUrlTypeChange = (index, urlType) => {
    const newButtons = [...buttons];
    newButtons[index].urlType = urlType;
    setButtons(newButtons);
  };

  const handleButtonUrlExampleChange = (index, urlExample) => {
    const newButtons = [...buttons];
    newButtons[index].urlExample = urlExample;
    setButtons(newButtons);
  };

  const removeButton = (index) => {
    const newButtons = buttons.filter((_, i) => i !== index);
    setButtons(newButtons);
  };

  return (
    <Container fluid>
      {loading && (
        <div className="loading-spinner">
          <Spinner animation="border" />
        </div>
      )}
      <Row className={`justify-content-between m-4 ${loading ? 'loading-content' : ''}`}>
        <Col xs={9} className="text-center">
          <h2>Crear Plantilla de WhatsApp</h2>
        </Col>
        <Col xs={1} className="text-start">
          <Button variant="dark" className="action-button" onClick={() => navigate(-1)}>Atrás</Button>
        </Col>
        <Col xs={1} className="text-end">
          <Button variant="outline-danger" className="action-button" onClick={resetForm}>Cancelar</Button>
        </Col>
        <Col xs={1} className="text-center">
          <Button variant="primary" type="submit" className="action-button" onClick={handleSubmit}>Guardar</Button>
        </Col>
      </Row>
      <Form onSubmit={handleSubmit}>
        <Row className="justify-content-center">
          <Col xs={12} md={3} className='type_template'>
            <h3 className="text-center">Tipo de Plantilla</h3>
            <br></br>
            <Form.Group className="mb-3">
              <Form.Label>Categoría:</Form.Label>
              <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Seleccionar Categoría</option>
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utilidad</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>SubTipo:</Form.Label>
              {renderSubTypeOptions()}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre:</Form.Label>
              <Form.Control type="text" value={name} onChange={handleNameChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Idioma:</Form.Label>
              <Form.Select value={language} onChange={(e) => setLanguage(e.target.value)} required>
                <option value="">Seleccionar Idioma</option>
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6} className='edit_template' style={{ height: '100dvh', overflowY: 'auto' }}>
            <h3 className="text-center">Editar Plantilla</h3>
            <br></br>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Encabezado:</Form.Label>
              <Form.Select value={headerType} onChange={(e) => setHeaderType(e.target.value)}>
                <option value="none">Ninguno</option>
                <option value="TEXT">Mensaje de texto</option>
                <option value="MEDIA">Medios (Beta)</option>
                <option value="LOCATION">Ubicación</option>
              </Form.Select>
            </Form.Group>
            {headerType === 'media' && (
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Medio:</Form.Label>
                <Form.Select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                  <option value="document">Documento</option>
                </Form.Select>
                <p className="text-warning">
                  Este proceso está en etapa beta. Debes crear también la plantilla en WhatsApp con el mismo nombre y la misma estructura.
                </p>
              </Form.Group>
            )}
            {headerType === 'text' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Texto de Encabezado:</Form.Label>
                  <Form.Control type="text" value={headerText} onChange={(e) => setHeaderText(e.target.value)} required />
                </Form.Group>
                {!headerVariableAdded && (
                  <div className="text-end">
                    <button className='btn btn-link text-decoration-none text-dark' onClick={addHeaderVariable}>
                      Agregar variable
                    </button>
                  </div>
                )}
                {headerVariableAdded && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Ejemplo de Encabezado:</Form.Label>
                      <Form.Control type="text" value={headerExample} onChange={(e) => setHeaderExample(e.target.value)} required />
                    </Form.Group>
                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Fuente:</Form.Label>
                          <Form.Select value={headerSource} onChange={(e) => setHeaderSource(e.target.value)} required>
                            <option value="">Seleccionar Fuente</option>
                            {Object.keys(sources).map(source => (
                              <option key={source} value={source}>{source}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Variables:</Form.Label>
                          <Form.Select value={headerVariable} onChange={(e) => {setHeaderVariable(e.target.value); console.log(e)}} required>
                            <option value="">Seleccionar Variable</option>
                            {headerSource && sources[headerSource]?.map(variable => (
                              <option key={variable.value} value={variable.value}>{variable.name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                    </Row>

                    <div className="text-end">
                      <button className='btn btn-link text-decoration-none text-danger' onClick={removeHeaderVariable}>
                        Eliminar variable
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
            {headerType === 'media' && mediaType === 'image' && (
              <Form.Group className="mb-3">
                <Form.Label>Imagen de Encabezado:</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e) => handleMediaChange(e, 'image')} />
                {headerImageUrl && (
                  <div>
                    <p>{headerImageUrl.split('/').pop()}</p>
                    <button className="btn btn-danger" onClick={() => removeMedia('image')}>Eliminar Imagen</button>
                  </div>
                )}
              </Form.Group>
            )}
            {headerType === 'media' && mediaType === 'video' && (
              <Form.Group className="mb-3">
                <Form.Label>Video de Encabezado:</Form.Label>
                <Form.Control type="file" accept="video/*" onChange={(e) => handleMediaChange(e, 'video')} />
                {headerVideoUrl && (
                  <div>
                    <p>{headerVideoUrl.split('/').pop()}</p>
                    <button className="btn btn-danger" onClick={() => removeMedia('video')}>Eliminar Video</button>
                  </div>
                )}
              </Form.Group>
            )}
            {headerType === 'media' && mediaType === 'document' && (
              <Form.Group className="mb-3">
                <Form.Label>Documento de Encabezado:</Form.Label>
                <Form.Control type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleMediaChange(e, 'document')} />
                {headerDocumentUrl && (
                  <div>
                    <p>{headerDocumentUrl.split('/').pop()}</p>
                    <button className="btn btn-danger" onClick={() => removeMedia('document')}>Eliminar Documento</button>
                  </div>
                )}
              </Form.Group>
            )}
            {headerType === 'location' && (
              <div className="mb-3">
                <p>La ubicación se proporcionará en el momento del envío.</p>
              </div>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Texto del Cuerpo:</Form.Label>
              <Form.Control
                as="textarea"
                id="bodyTextArea"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                required
              />
              <div className="mt-2 d-flex justify-content-between">
                <ButtonGroup>
                  <Button variant="outline-secondary" size="icon" style={{ height: '40px' }} title="Negrita" onClick={() => applyFormat('bold')}><TypeBold /></Button>
                  <Button variant="outline-secondary" size="icon" style={{ height: '40px' }} title="Itálica" onClick={() => applyFormat('italic')}><TypeItalic /></Button>
                  <Button variant="outline-secondary" size="icon" style={{ height: '40px' }} title="Tachado" onClick={() => applyFormat('strikethrough')}><TypeStrikethrough /></Button>
                  <Button variant="outline-secondary" size="icon" style={{ height: '40px' }} title="Monospace" onClick={() => applyFormat('monospace')}><Code /></Button>
                </ButtonGroup>
                <Button className='w-auto px-4' variant="secondary" onClick={addBodyVariable}>
                  Agregar variable
                </Button>
              </div>
            </Form.Group>
            {Object.keys(bodyExamples).map((variable) => (
              <div key={variable}>
                <Form.Group className="mb-3">
                  <Form.Label>{`Ejemplo para ${variable}:`}</Form.Label>
                  <Form.Control
                    type="text"
                    value={bodyExamples[variable]}
                    onChange={(e) => updateBodyExample(variable, e.target.value)}
                    required
                  />
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Fuente:</Form.Label>
                      <Form.Select value={bodySources[variable]} onChange={(e) => updateBodySource(variable, e.target.value)} required>
                        <option value="">Seleccionar Fuente</option>
                        {Object.keys(sources).map(source => (
                          <option key={source} value={source}>{source}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Variable:</Form.Label>
                      <Form.Select
                        value={bodyVariables[variable]}
                        onChange={(e) => updateBodyVariable(variable, e.target.value)}
                        required
                      >
                        <option value="">Seleccionar Variable</option>
                        {bodySources[variable] && sources[bodySources[variable]]?.map(varOption => (
                          <option key={varOption.value} value={varOption.value}>{varOption.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="text-end">
                  <button className='btn btn-link text-decoration-none text-danger' onClick={() => removeBodyVariable(variable)}>
                    Eliminar variable
                  </button>
                </div>
              </div>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>Texto de Pie de Página (Opcional):</Form.Label>
              <Form.Control type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} />
            </Form.Group>
            {buttons.map((button, index) => (
              <div key={index} className="button-group p-4 rounded mb-3" style={{ border: 'dashed 1px gray' }}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Botón:</Form.Label>
                  <Form.Select value={button.type} onChange={(e) => handleButtonTypeChange(index, e.target.value)}>
                    <option value="none">Ninguno</option>
                    <option value="QUICK_REPLY">Respuesta Rápida</option>
                    <option value="PHONE_NUMBER" disabled={phoneButtonsCount >= 1}>
                      Número de Teléfono ({phoneButtonsCount}/1)
                    </option>
                    <option value="URL" disabled={urlButtonsCount >= 2}>
                      URL ({urlButtonsCount}/2)
                    </option>
                  </Form.Select>
                </Form.Group>
                {button.type === 'PHONE_NUMBER' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Código de Teléfono:</Form.Label>
                    <Form.Control type="text" value={button.phoneCode} onChange={(e) => handleButtonPhoneCodeChange(index, e.target.value)} />
                    <Form.Label>Número de Teléfono:</Form.Label>
                    <Form.Control type="text" value={button.phoneNumber} onChange={(e) => handleButtonPhoneNumberChange(index, e.target.value)} />
                  </Form.Group>
                )}
                {button.type === 'URL' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>URL:</Form.Label>
                      <Form.Control type="text" value={button.url} onChange={(e) => handleButtonUrlChange(index, e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de URL:</Form.Label>
                      <Form.Select value={button.urlType} onChange={(e) => handleButtonUrlTypeChange(index, e.target.value)}>
                        <option value="static">Estática</option>
                        <option value="dynamic">Dinámica</option>
                      </Form.Select>
                    </Form.Group>
                    {button.urlType === 'dynamic' && (
                      <div>
                        <Form.Group className="mb-3">
                          <Form.Label>Ejemplo de URL:</Form.Label>
                          <Form.Control type="text" value={button.urlExample} onChange={(e) => handleButtonUrlExampleChange(index, e.target.value)} />
                        </Form.Group>
                        <Row>
                          <Col>
                            <Form.Group className="mb-3">
                              <Form.Label>Fuente:</Form.Label>
                              <Form.Select value={bodySources[button.urlExample]} onChange={(e) => updateBodySource(button.urlExample, e.target.value)} required>
                                <option value="">Seleccionar Fuente</option>
                                {Object.keys(sources).map(source => (
                                  <option key={source} value={source}>{source}</option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mb-3">
                              <Form.Label>Variable:</Form.Label>
                              <Form.Select
                                value={bodyVariables[button.urlExample]}
                                onChange={(e) => updateBodyVariable(button.urlExample, e.target.value)}
                                required
                              >
                                <option value="">Seleccionar Variable</option>
                                {bodySources[button.urlExample] && sources[bodySources[button.urlExample]]?.map(varOption => (
                                  <option key={varOption.value} value={varOption.value}>{varOption.name}</option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </>
                )}
                {button.type !== 'none' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Texto del Botón:</Form.Label>
                    <Form.Control type="text" value={button.text} onChange={(e) => handleButtonTextChange(index, e.target.value)} />
                  </Form.Group>
                )}
                <Button variant="btn btn-outline-danger" onClick={() => removeButton(index)}>Eliminar Botón</Button>
              </div>
            ))}
            {buttons.length < 10 && (
              <Button variant="secondary" onClick={addButton}>
                Agregar Botón ({buttons.length}/10)
              </Button>
            )}

            {category === 'UTILITY' && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Establecer un período de validez personalizado para tu mensaje"
                  checked={customValidity}
                  onChange={(e) => setCustomValidity(e.target.checked)}
                />
                {customValidity && (
                  <Form.Select value={validityPeriod} onChange={(e) => setValidityPeriod(e.target.value)}>
                    <option value="">Seleccionar el período de validez</option>
                    <option value="1 minute">1 minuto</option>
                    <option value="2 minutes">2 minutos</option>
                    <option value="5 minutes">5 minutos</option>
                    <option value="10 minutes">10 minutos</option>
                    <option value="15 minutes">15 minutos</option>
                    <option value="30 minutes">30 minutos</option>
                    <option value="60 minutes">60 minutos</option>
                  </Form.Select>
                )}
              </Form.Group>
            )}
          </Col>
          <Col xs={12} md={3} className='preview_template'>
            <h3 className="text-center">Vista Previa</h3>
            <br></br>
            <div className="preview-container">
              <div className="whatsapp-preview">
                <div className="message">
                  <div className="header">
                    {headerType === 'text' && <div><strong>{renderTextWithExamples(headerText, { '{{1}}': headerExample })}</strong></div>}
                    {headerType === 'media' && mediaType === 'image' && headerImageUrl && <img src={`${process.env.REACT_APP_API_URL}${headerImageUrl}`} alt="Header" style={{ width: '100%' }} />}
                    {headerType === 'media' && mediaType === 'video' && headerVideoUrl && <video src={`${process.env.REACT_APP_API_URL}${headerVideoUrl}`} controls style={{ width: '100%' }} />}
                    {headerType === 'media' && mediaType === 'document' && headerDocumentUrl && (
                      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <iframe
                          src={`${process.env.REACT_APP_API_URL}${headerDocumentUrl}`}
                          style={{ width: '100%', aspectRatio: '4/3', zoom: 2, border: '0', overflow: 'hidden' }}
                          frameBorder="0"
                        ></iframe>
                      </div>
                    )}
                    {headerType === 'location' && <div><strong>Ubicación: Ejemplo de ubicación</strong></div>}
                  </div>
                  <div className="body" dangerouslySetInnerHTML={{ __html: formatTextToHtml(bodyText) }}></div>
                  {footerText && <div className="footer small">{footerText}</div>}
                  {buttons.length > 0 && (
                    <div className="buttons">
                      {buttons.map((button, index) => (
                        <button key={index} className="btn btn-success w-100 mt-2">{button.text}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Plantilla Enviada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{responseMessage}</p>
          {loading && <Spinner animation="border" />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateTemplate;