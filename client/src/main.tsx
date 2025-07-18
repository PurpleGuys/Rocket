import React from "react";
import { createRoot } from "react-dom/client";
import "./lib/stripe-config"; // Load Stripe config first
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
