import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")).render(
  <>
    <ToastContainer
      position="top-right"
      hideProgressBar={true}
      newestOnTop={false}
      rtl={false}
      closeOnClick={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </>
);
