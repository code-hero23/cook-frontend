
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { TaskProvider } from "./context/TaskContext";
import { ToastProvider } from "./components/ToastProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ToastProvider>
    <TaskProvider>
      <App />
    </TaskProvider>
  </ToastProvider>
);
