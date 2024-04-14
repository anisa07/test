import React from "react";
import ReactDOM from "react-dom";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
// import App from './App.js'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

// hydrateRoot(document.getElementById('root'), <App />);

export const App = ({ children }: { children: JSX.Element }) => {
  return <>{children}</>;
};

// export const hydrateApp = (children: React.JSX.Element) => {
//   //   return ReactDOM.createRoot(document.getElementById("root")!).render(
//   //     <App>{children}</App>
//   //   );
//   return typeof window !== "undefined"
//     ? hydrateRoot(document.getElementById("root")!, <App>{children}</App>)
//     : renderToString(<App>{children}</App>);
// };
