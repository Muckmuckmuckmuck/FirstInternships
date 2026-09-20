import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./FirstInternships.jsx";
import "./styles.css";
import "./polish.css";

const element = <StrictMode><App pathname={window.location.pathname} /></StrictMode>;
const root = document.getElementById("root");
if (root.hasChildNodes()) hydrateRoot(root, element);
else createRoot(root).render(element);
