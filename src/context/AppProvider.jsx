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
  });

  const setConversacionActual = (conversacion_Actual) => {
    setState((prevState) => ({ ...prevState, conversacion_Actual }));
  };
  const setStatus = (status) => setState((prevState) => ({ ...prevState, status }));
  const setCampaigns = (campañas) => setState((prevState) => ({ ...prevState, campañas }));
  const setTemplates = (plantillas) => setState((prevState) => ({ ...prevState, plantillas }));

  return (
    <AppContext.Provider value={{ state, setConversacionActual, setStatus, setCampaigns, setTemplates }}>
      {children}
    </AppContext.Provider>
  );
};