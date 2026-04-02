import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css';
import { AuthProvider } from "./context/AuthContext";

// ye hai toaster 
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      {/*  Toaster component yahan implement hoga */}
      <Toaster position="top-center" reverseOrder={false} />
      <App />
    </AuthProvider>
  </StrictMode>
);
