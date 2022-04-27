import React from "react";
import { ToastContextProvider } from "./contexts/ToastContext";
import { UbiContextProvider } from "./contexts/UbiContext";
import { WalletContextProvider } from "./contexts/WalletContext";
import Dashboard from "./components/Dashboard";
import "./App.css";

const App = () => {
  return (
    <ToastContextProvider>
      <WalletContextProvider>
        <UbiContextProvider>
          <Dashboard />
        </UbiContextProvider>
      </WalletContextProvider>
    </ToastContextProvider>
  );
};

export default App;
