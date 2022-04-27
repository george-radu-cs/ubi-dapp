import React from "react";
import Ubi from "../Ubi";

const UbiContext = React.createContext();

export const UbiContextProvider = ({ children }) => {
  const ubi = new Ubi();

  return (
    <UbiContext.Provider value={ubi}>
      {children}
    </UbiContext.Provider>
  );
};

export default UbiContext;
