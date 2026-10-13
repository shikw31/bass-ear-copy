import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("#root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
);
