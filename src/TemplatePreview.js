import React from 'react';
import { Button } from 'react-bootstrap';
import { ListUl } from 'react-bootstrap-icons';

const TemplatePreview = ({ template }) => {
  if (!template) {
    return <h3>Selecciona una plantilla para ver la vista previa</h3>;
  }

  const replaceVariables = (text, variables) => {
    let replacedText = text;
    variables.forEach(variable => {
      replacedText = replacedText.replace(variable.name, variable.example);
    });
    return replacedText;
  };

  return (
    <>
      <div className='text-center'>
        <h3>Vista Previa de la Plantilla</h3>
      </div>
      <div className="preview-container">
        <div className="whatsapp-preview">
          <div className="message">
            <div className="header">
              {template.header_type === 'TEXT' && <div><strong>{replaceVariables(template.header_text, template.headerVariables)}</strong></div>}
              {template.header_type === 'MEDIA' && template.type_medio == 'IMAGE' && template.medio && <img src={`${process.env.REACT_APP_API_URL}${template.medio}`} alt="Header" style={{ width: '100%' }} />}
              {template.header_type === 'MEDIA' && template.type_medio == 'VIDEO' && template.medio && <video src={`${process.env.REACT_APP_API_URL}${template.medio}`} controls style={{ width: '100%' }} />}
              {template.header_type === 'MEDIA' && template.type_medio == 'DOCUMENT' && template.medio && (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <iframe 
                    src={`${process.env.REACT_APP_API_URL}${template.medio}`} 
                    style={{ width: '100%', aspectRatio: '4/3', zoom: 2, border: '0', overflow: 'hidden' }} 
                    frameBorder="0"
                  ></iframe>
                </div>
              )}
            </div>
            <div className="body">
              {replaceVariables(template.body_text, template.bodyVariables)}
            </div>
            {template.footer && <div className="footer small">{template.footer}</div>}
            {template.buttons && template.buttons.length > 0 && (
              <div className="buttons">
                {template.buttons.slice(0, template.buttons.length > 3 ? 2 : 3).map((button, index) => (
                  <>
                    <hr />
                    <Button key={index} variant="link" style={{textDecoration: 'none',padding: '0 10px', backgroundColor: 'transparent', color: '#46afec', fontWeight: 'bold'}}>
                      {button.text}
                    </Button>
                  </>
                ))}
                {template.buttons.length > 3 && (
                  <>
                    <hr />
                    <Button variant="link" style={{textDecoration: 'none',padding: '0 10px', backgroundColor: 'transparent', color: '#46afec', fontWeight: 'bold'}}>
                      <ListUl /> Ver todas las opciones
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplatePreview;
