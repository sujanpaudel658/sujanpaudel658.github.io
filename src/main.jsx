import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

// Configure Google OAuth Provider
const googleClientId = "70701411090-qn40im1n8qi1773qdd4qt7sv8d0db4kb.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider
      clientId={googleClientId}
      onScriptLoadError={() => console.error('Google Script failed to load')}
      onScriptLoadSuccess={() => console.log('Google Script loaded successfully')}
    >
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)