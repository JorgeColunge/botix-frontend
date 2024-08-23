import  React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    conversacion_Actual: {
      position_scroll: false
    },
    status: false,
  });

  const setConversacionActual = (conversacion_Actual) => {
    setState((prevState) => ({ ...prevState, conversacion_Actual }));
  };
  const setStatus = (status) => setState((prevState) => ({ ...prevState, status }));


  return (
    <AppContext.Provider value={{ state, setConversacionActual, setStatus,  }}>
      {children}
    </AppContext.Provider>
  );
};