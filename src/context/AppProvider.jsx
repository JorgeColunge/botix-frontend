import  React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    conversacion_Actual: {
      position_scroll: false
    },
    status: false,
    campañas: [],
    plantillas: [],
    contactos: [],
    usuarios: [],
    fases: [],
    roles: [],
    departamentos: [],
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

  return (
    <AppContext.Provider value={{ state, setConversacionActual, setStatus, setCampaigns, setTemplates, setContacts, setUsers, setPhases, setRoles, setDepartments }}>
      {children}
    </AppContext.Provider>
  );
};