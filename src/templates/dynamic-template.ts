export const dynamicTemplate = (fullPath: string, pageInMarkup: string) => `
import React from "react";
import { createRoot } from "react-dom/client";
import Page from "../pages${fullPath.replace(".tsx", "")}";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    ${pageInMarkup}
  </React.StrictMode>);
`;
