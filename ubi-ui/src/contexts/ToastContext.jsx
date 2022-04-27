import React, { useCallback, useEffect, useState, createContext } from "react";

const ToastContext = createContext();

export const ToastContextProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => setToasts((ts) => ts.slice(1)), 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const addToast = useCallback(
    (toast) => {
      setToasts((ts) => [...ts, toast]);
    },
    [setToasts]
  );

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          bottom: 24,
          right: 24,
          zIndex: 98,
        }}
      >
        {toasts.map((toast, index) => (
          <button
            key={index}
            onClick={() => {
              window.open(toast.link, "_blank");
            }}
            disabled={!toast.link}
            style={{
              cursor: !toast.link ? "default" : "pointer",
              backgroundColor: toast.isError ? "#D22B2B" : "#1BD909",
              color: "white",
              margin: 5,
              padding: 15,
              zIndex: 99,
              width: 300,
              wordWrap: "break-word",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 24, marginBottom: 5 }}>
              {toast.title}
            </div>
            <div style={{ fontSize: 16 }}>{toast.message}</div>
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
