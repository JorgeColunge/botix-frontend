import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Modal, Button, Form, DropdownButton, Dropdown, Accordion, Card, useAccordionButton, NavDropdown } from 'react-bootstrap';
import { PersonCircle, TelephoneFill, EnvelopeFill, Globe, Instagram, Facebook, Linkedin, Twitter, Tiktok, Youtube, GenderAmbiguous, HourglassSplit, CalendarX, SignpostFill, GeoFill, GlobeAmericas, CashCoin, PersonWorkspace, Mortarboard, PersonVcard, PersonHearts, CloudSun, EmojiGrin, FlagFill, Bullseye, ArrowThroughHeart } from 'react-bootstrap-icons';
import axios from 'axios';
import './EditContactModal.css';
import { useConversations } from './ConversationsContext';
import { AppContext } from './context';

const EditContactModal = ({ show, onHide, contact, socket }) => {
  const { phases, currentConversation, handleResponsibleChange, handleEndConversation, allUsers } = useConversations();
  const {state, setConversacionActual} = useContext(AppContext)
  const [editContact, setEditContact] = useState(contact);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (contact && contact.id && (editContact.id !== contact.id)) {
      setEditContact(contact);
    }
  }, [contact]);
  
  const handleSelectLabel = useCallback(async (value) => {
    if (!editContact.id) {
      console.error('Contact ID is not defined');
      return;
    }

    setEditContact(prev => ({ ...prev, label: value }));
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/edit-contact/${editContact.id}`, { label: value });
    } catch (error) {
      console.error('Error al actualizar la etiqueta:', error);
    }
  }, [editContact]);

  const handleImageChange = useCallback(async (event) => {
    if (!editContact.id) {
      console.error('Contact ID is not defined');
      return;
    }

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('profile', file);

      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-profileContact`, formData);
        const profileUrl = response.data.profileUrl;
        setEditContact(prev => ({ ...prev, profile_url: profileUrl }));
        await axios.put(`${process.env.REACT_APP_API_URL}/api/edit-contact/${editContact.id}`, { profile_url: profileUrl });
      } catch (error) {
        console.error('Error al cargar la imagen:', error);
      }
    }
  }, [editContact]);

  const handleSave = useCallback(async () => {
    if (!editContact.id) {
      console.error('Contact ID is not defined');
      return;
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/edit-contact/${editContact.id}`, editContact);
      setIsEditMode(false);
      onHide();
    } catch (error) {
      console.error('Error al guardar contacto:', error);
    }
  }, [editContact, onHide]);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setEditContact(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCancel = useCallback(() => {
    setEditContact(contact);
    setIsEditMode(false);
  }, [contact]);

  const ensureFullUrl = (url) => {
    if (url.startsWith('http')) {
      return url;
    }
    return `${process.env.REACT_APP_API_URL}${url}`;
  };

  return (
    <Modal show={show} onHide={onHide} size="md">
      <Modal.Header closeButton>
        <Modal.Title>Información del Contacto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container-fluid">
          <div className="row mb-4">
            <div className="col-12 text-center">
              {isEditMode ? (
                <input type="file" onChange={handleImageChange} accept="image/*" className="form-control" />
              ) : (
                editContact.profile_url ? (
                  <img 
                    src={ensureFullUrl(editContact.profile_url)} 
                    alt="Profile" 
                    className="rounded-circle" 
                    style={{ width: '150px', height: '150px' }} 
                  />
                ) : (
                  <PersonCircle className="rounded-circle" size={150} />
                )
              )}
            </div>
            <div className="col-12 text-center mt-3">
              {isEditMode ? (
                
                <>
      
                  <input type="text" name="first_name" value={editContact.first_name || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Nombre" />
                  <input type="text" name="last_name" value={editContact.last_name || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Apellido" />
                  <input type="text" name="organization" value={editContact.organization || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Compañía" />
                  <select 
                    name="label" 
                    value={editContact.label || ''} 
                    onChange={handleInputChange} 
                    className="form-control mt-2"
                  >
                    <option value="">Seleccione una etiqueta</option>
                    {Object.entries(phases).map(([id, phase]) => (
                      <option key={id} value={id}>{phase.name}</option>
                    ))}
                  </select>

                  <textarea
                    name="observaciones_agente"
                    value={editContact.observaciones_agente || ''}
                    onChange={handleInputChange}
                    className="form-control mt-2"
                    placeholder="Observaciones del agente"
                    rows="4"
                  ></textarea>
                </>
              ) : (
                <>
                  <h4>{editContact.first_name} {editContact.last_name}</h4>
                  <p>{editContact.organization}</p>
                  <div className="row">
                    <div className="col-12 gap-1 d-flex align-items-center justify-content-center">
                      <p className="mb-0 mr-2">{phases[editContact.label]?.name || 'Seleccione una etiqueta'}  </p>
                      <DropdownButton
                        id="dropdown-label-select"
                        title=""
                        onSelect={handleSelectLabel}
                        variant="light"
                      >
                        {Object.entries(phases).map(([id, phase]) => (
                          <Dropdown.Item key={id} eventKey={id}>{phase.name}</Dropdown.Item>
                        ))}
                      </DropdownButton>
                      <NavDropdown
                    id="nav-dropdown-dark-example"
                    title="Responsable"
                    menuVariant="white"
                  >
                    {allUsers.map((user) => (
                      <Dropdown.Item
                        key={user.id_usuario}
                        onClick={() => {handleResponsibleChange(user.id_usuario, currentConversation.id_usuario); setConversacionActual({...state.conversacion_Actual,position_scroll:false})}}
                        className={user.id_usuario === currentConversation.id_usuario ? 'bg-info text-white' : ''}
                      >
                        {user.nombre} {user.apellido}
                      </Dropdown.Item>
                    ))}
                    <hr />
                    <Dropdown.Item
                      className="text-danger"
                      key="finalizar-conversacion"
                      onClick={() => {handleEndConversation(currentConversation.conversation_id); setConversacionActual({...state.conversacion_Actual,position_scroll:false})}}
                    >
                      Finalizar Conversación
                    </Dropdown.Item>
                  </NavDropdown>
                    </div>
                  </div>
                  <hr></hr>
                  <h5>Observaciones del agente</h5>
                  <p>{editContact.observaciones_agente}</p>
                </>
              )}
            </div>
          </div>
          <Accordion defaultActiveKey="0">
            <Card>
              <Card.Header>
                <CustomToggle eventKey="0">Información Personal</CustomToggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  {isEditMode ? (
                    <input type="text" name="edad_approx" value={editContact.edad_approx || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Edad" />
                  ) : (
                    <p><a className='icon_rrss'  title="Edad Aproximada"><HourglassSplit /></a> {editContact.edad_approx}</p>
                  )}
                  {isEditMode ? (
                    <select name="genero" value={editContact.genero || ''} onChange={handleInputChange} className="form-control">
                      <option value="">Genero</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="no_binario">No binario</option>
                      <option value="otro">Otro</option>
                    </select>
                  ) : (
                    <p><a className='icon_rrss'  title="Genero"><GenderAmbiguous /></a> {editContact.genero}</p>
                  )}
                  {isEditMode ? (
                    <select name="orientacion_sexual" value={editContact.orientacion_sexual || ''} onChange={handleInputChange} className="form-control">
                      <option value="">Orientación Sexual</option>
                      <option value="heterosexual">Heterosexual</option>
                      <option value="gay">Gay</option>
                      <option value="lesbiana">Lesbiana</option>
                      <option value="bisexual">Bisexual</option>
                      <option value="asexual">Asexual</option>
                      <option value="otro">Otro</option>
                    </select>
                  ) : (
                    <p><a className='icon_rrss'  title="Orientación Sexual"><ArrowThroughHeart /></a> {editContact.orientacion_sexual}</p>
                  )}
                  {isEditMode ? (
                    <input type="date" name="fecha_nacimiento" value={editContact.fecha_nacimiento || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Fecha de Nacimiento" />
                  ) : (
                    <p><a className='icon_rrss'  title="Fecha de Nacimiento"><CalendarX /></a> {editContact.fecha_nacimiento}</p>
                  )}
                  {isEditMode ? (
                    <input type="text" name="direccion_completa" value={editContact.direccion_completa || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Dirección Completa" />
                  ) : (
                    <p><a className='icon_rrss'  title="Dirección"><SignpostFill /></a> {editContact.direccion_completa}</p>
                  )}
                  {isEditMode ? (
                    <input type="text" name="ciudad_residencia" value={editContact.ciudad_residencia || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Ciudad de Residencia" />
                  ) : (
                    <p><a className='icon_rrss'  title="Ciudad de Residencia"><GeoFill /></a> {editContact.ciudad_residencia}</p>
                  )}
                  {isEditMode ? (
                    <input type="text" name="nacionalidad" value={editContact.nacionalidad || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Pais de Residencia" />
                  ) : (
                    <p><a className='icon_rrss'  title="Pais de Residencia"><GlobeAmericas /></a> {editContact.nacionalidad}</p>
                  )}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <CustomToggle eventKey="1">Información de contacto</CustomToggle>
              </Card.Header>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  {isEditMode ? (
                    <input type="text" name="preferencias_contacto" value={editContact.preferencias_contacto || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Preferencias de Contacto" />
                  ) : (
                    <p><a className='icon_rrss'  title="Preferencias de Contacto"><Bullseye /></a> {editContact.preferencias_contacto}</p>
                  )}
                  {isEditMode ? (
                    <input type="tel" name="phone_number" value={editContact.phone_number || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Número de Teléfono" />
                  ) : (
                    <p><a className='icon_rrss' href={`tel:${editContact.phone_number}`}><TelephoneFill /></a> {editContact.phone_number}</p>
                  )}
                  {isEditMode ? (
                    <input type="email" name="email" value={editContact.email || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Email" />
                  ) : (
                    <p><a className='icon_rrss' href={`mailto:${editContact.email}`}><EnvelopeFill /></a> {editContact.email} </p>
                  )}
                  {isEditMode ? (
                    <input type="url" name="pagina_web" value={editContact.pagina_web || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Página Web" />
                  ) : (
                    <p><a className='icon_rrss' href={editContact.pagina_web} target="_blank"><Globe /></a> {editContact.pagina_web} </p>
                  )}
                  {isEditMode ? (
                    <input type="url" name="link_instagram" value={editContact.link_instagram || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Instagram" />
                  ) : (
                    <p><a className='icon_rrss' href={editContact.link_instagram} target="_blank"><Instagram /></a> {editContact.link_instagram} </p>
                  )}
                  {isEditMode ? (
                    <input type="url" name="link_facebook" value={editContact.link_facebook || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Facebook" />
                  ) : (
                    <p><a className='icon_rrss' href={editContact.link_facebook} target="_blank"><Facebook /></a> {editContact.link_facebook} </p>
                  )}
                  {isEditMode ? (
                    <input type="url" name="link_linkedin" value={editContact.link_linkedin || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="LinkedIn" />
                  ) : (
                    <p><a className='icon_rrss' href={editContact.link_linkedin} target="_blank"><Linkedin /></a> {editContact.link_linkedin} </p>
                  )}
                  {isEditMode ? (
                    <input type="url" name="link_twitter" value={editContact.link_twitter || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Twitter" />
                  ) : (
                    <p><a className='icon_rrss' href={editContact.link_twitter} target="_blank"><Twitter /></a> {editContact.link_twitter} </p>
                  )}
                  {isEditMode ? (
                    <input type="url" name="link_tiktok" value={editContact.link_tiktok || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="TikTok" />
                  ) : (
                    <p><a className='icon_rrss' href={editContact.link_tiktok} target="_blank"><Tiktok /></a> {editContact.link_tiktok} </p>
                  )}
                  {isEditMode ? (
                    <input type="url" name="link_youtube" value={editContact.link_youtube || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="YouTube" />
                  ) : (
                    <p><a className='icon_rrss' href={editContact.link_youtube} target="_blank"><Youtube /></a> {editContact.link_youtube} </p>
                  )}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <CustomToggle eventKey="2">Datos Demográficos</CustomToggle>
              </Card.Header>
              <Accordion.Collapse eventKey="2">
                <Card.Body>
                  {isEditMode ? (
                    <select 
                      name="nivel_ingresos" 
                      value={editContact.nivel_ingresos || ''} 
                      onChange={handleInputChange} 
                      className="form-control mt-2"
                    >
                      <option value="">Seleccionar nivel de ingresos</option>
                      <option value="Bajos">Bajos</option>
                      <option value="Medios">Medios</option>
                      <option value="Altos">Altos</option>
                      <option value="Muy altos">Muy altos</option>
                    </select>
                  ) : (
                    <p><a className='icon_rrss'  title="Nivel de Ingresos"><CashCoin /></a> {editContact.nivel_ingresos}</p>
                  )}
                  {isEditMode ? (
                    <input type="text" name="ocupacion" value={editContact.ocupacion || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Ocupación" />
                  ) : (
                    <p><a className='icon_rrss'  title="Ocupación"><PersonWorkspace /></a> {editContact.ocupacion}</p>
                  )}
                  {isEditMode ? (
                    <input type="text" name="nivel_educativo" value={editContact.nivel_educativo || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Nivel Educativo" />
                  ) : (
                    <p><a className='icon_rrss'  title="Nivel Educativo"><Mortarboard /></a> {editContact.nivel_educativo}</p>
                  )}
                  {isEditMode ? (
                    <input type="text" name="estado_civil" value={editContact.estado_civil || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Estado Civil" />
                  ) : (
                    <p><a className='icon_rrss'  title="Estado Civil"><PersonVcard /></a> {editContact.estado_civil}</p>
                  )}
                  {isEditMode ? (
                    <input type="number" name="cantidad_hijos" value={editContact.cantidad_hijos || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Cantidad de Hijos" />
                  ) : (
                    <p><a className='icon_rrss'  title="Cantidad de Hijos"><PersonHearts /></a> {editContact.cantidad_hijos}</p>
                  )}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <CustomToggle eventKey="3">Datos Psicográficos</CustomToggle>
              </Card.Header>
              <Accordion.Collapse eventKey="3">
                <Card.Body>
                  {isEditMode ? (
                    <input type="text" name="estilo_de_vida" value={editContact.estilo_de_vida || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Estilo de Vida" />
                  ) : (
                    <p><a className='icon_rrss'  title="Estilo de Vida"><CloudSun /></a> {editContact.estilo_de_vida}</p>
                  )}
                  {isEditMode ? (
                    <input type="text" name="personalidad" value={editContact.personalidad || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Personalidad" />
                  ) : (
                    <p><a className='icon_rrss'  title="Personalidad"><EmojiGrin /></a> {editContact.personalidad}</p>
                  )}
                  {isEditMode ? (
                    <input type="text" name="cultura" value={editContact.cultura || ''} onChange={handleInputChange} className="form-control mt-2" placeholder="Cultura" />
                  ) : (
                    <p><a className='icon_rrss'  title="Cultura"><FlagFill /></a> {editContact.cultura}</p>
                  )}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </div>
      </Modal.Body>
      <Modal.Footer>
        {isEditMode ? (
          <>
            <Button className='icon-save' variant="success" onClick={handleSave}>Guardar</Button>
            <Button className='icon-cancel' variant="danger" onClick={handleCancel}>Cancelar</Button>
          </>
        ) : (
          <Button className='icon-edit' variant="primary" onClick={() => setIsEditMode(true)}>Editar</Button>
        )}
        <Button className='icon-close' variant="secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

function CustomToggle({ children, eventKey }) {
  const decoratedOnClick = useAccordionButton(eventKey, () => {
    console.log('Accordion toggled!');
  });

  return (
    <div className="accordion-header" onClick={decoratedOnClick}>
      {children}
    </div>
  );
}

export default EditContactModal;
