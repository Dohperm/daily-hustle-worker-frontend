// index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

//  Correct import for your context
// Use default import, NOT `{ AppDataProvider }`
import AppDataProvider from "./context/App/AppDataContext.jsx";

//  Theme Provider (you can keep this named if it's exported that way)
import { ThemeProvider } from "./context/Theme/ThemeProvider.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css"; // ← Font Awesome import
import "./index.css";
import "./App.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.error("ErrorBoundary caught:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary stack:", info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container text-center mt-5">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message || "Please refresh the page."}</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

//  Proper hierarchical structure
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        {/*  Provider Order — AppDataProvider wraps ThemeProvider, which wraps App */}
        <AppDataProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AppDataProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
