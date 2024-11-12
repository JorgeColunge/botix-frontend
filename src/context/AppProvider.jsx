import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    conversacion_Actual: {
      position_scroll: false,
      audioRecord: null
    },
    status: false,
    ruta: '',
    campañas: [],
    plantillas: [],
    contactos: [],
    usuarios: [],
    fases: [],
    roles: [],
    departamentos: [],
    colaboradores: [],
    usuario: {},
    compania: {},
    privilegios: {},
    licencias: {},
    integraciones: [],
    automatizaciones: [],
    usuario_predefinido: {}
  });

  const setConversacionActual = (conversacion_Actual) => {setState((prevState) => ({ ...prevState, conversacion_Actual }));};
  const setDepartments = (departamentos) => setState((prevState) => ({ ...prevState, departamentos }));
  const setCampaigns = (campañas) => setState((prevState) => ({ ...prevState, campañas }));
  const setTemplates = (plantillas) => setState((prevState) => ({ ...prevState, plantillas }));
  const setContacts = (contactos) => setState((prevState) => ({ ...prevState, contactos }));
  const setStatus = (status) => setState((prevState) => ({ ...prevState, status }));
  const setRouter = (ruta) => setState((prevState) => ({ ...prevState, ruta }));
  const setUsers = (usuarios) => setState((prevState) => ({ ...prevState, usuarios }));
  const setRoles = (roles) => setState((prevState) => ({ ...prevState, roles }));
  const setPhases = (fases) => setState((prevState) => ({ ...prevState, fases }));
  const setColaboradores = (colaboradores) => setState((prevState) => ({ ...prevState, colaboradores })); 
  const setUsuario = (usuario) => setState((prevState) => ({ ...prevState, usuario }));
  const setCompania = (compania) => setState((prevState) => ({ ...prevState, compania }));
  const setPrivilegios = (privilegios) => setState((prevState) => ({ ...prevState, privilegios }));
  const setLicences = (licencias) => setState((prevState) => ({ ...prevState, licencias }));
  const setIntegrations = (integraciones) => setState((prevState) => ({ ...prevState, integraciones }));
  const setAutomations = (automatizaciones) => setState((prevState) => ({ ...prevState, automatizaciones }));
  const setDefaultUser = (usuario_predefinido) => setState((prevState) => ({ ...prevState, usuario_predefinido }));

  return (
    <AppContext.Provider value={{
      setConversacionActual,
      setColaboradores,
      setIntegrations,
      setDepartments,
      setDefaultUser,
      setPrivilegios,
      setAutomations,
      setCampaigns,
      setTemplates,
      setCompania,
      setContacts,
      setLicences,
      setUsuario,
      setRouter,
      setStatus,
      setPhases,
      setUsers,
      setRoles,
      state,
    }}>
      {children}
    </AppContext.Provider>
  );
};
