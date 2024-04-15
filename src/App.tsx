
    import React from "react";
    import { createRoot } from "react-dom/client";
    import Page from "./pages//page";
    createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <Page {...{"test":"this is test static props"}} />
      </React.StrictMode>);
    