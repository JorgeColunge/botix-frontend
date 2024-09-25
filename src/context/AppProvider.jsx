import  React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    conversacion_Actual: {
      position_scroll: false,
      audioRecord: null
    },
    status: false,
    campañas: [],
    plantillas: [],
    contactos: [],
    usuarios: [],
    fases: [],
    roles: [],
    departamentos: [],
    usuario: {},
    compania: {}
  });

  const setConversacionActual = (conversacion_Actual) => {setState((prevState) => ({ ...prevState, conversacion_Actual }));};
  const setDepartments = (departamentos) => setState((prevState) => ({ ...prevState, departamentos }));
  const setCampaigns = (campañas) => setState((prevState) => ({ ...prevState, campañas }));
  const setTemplates = (plantillas) => setState((prevState) => ({ ...prevState, plantillas }));
  const setContacts = (contactos) => setState((prevState) => ({ ...prevState, contactos }));
  const setStatus = (status) => setState((prevState) => ({ ...prevState, status }));
  const setUsers = (usuarios) => setState((prevState) => ({ ...prevState, usuarios }));
  const setRoles = (roles) => setState((prevState) => ({ ...prevState, roles }));
  const setPhases = (fases) => setState((prevState) => ({ ...prevState, fases }));
  const setUsuario = (usuario) => setState((prevState) => ({ ...prevState, usuario }));
  const setCompania = (compania) => setState((prevState) => ({ ...prevState, compania }));

  return (
    <AppContext.Provider value={{ state, setConversacionActual, setStatus, setCampaigns, setCompania, setTemplates, setContacts, setUsers, setPhases, setRoles, setDepartments, setUsuario }}>
      {children}
    </AppContext.Provider>
  );
};