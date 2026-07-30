import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import "./index.css";
import "@jetbrains/ring-ui-built/components/style.css";

const root = ReactDOM.createRoot(
    document.getElementById("root")!
);
root.render(
    <React.StrictMode>
            <App/>
    </React.StrictMode>
);
