import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import amplifyconfig from './amplifyconfiguration.json';
import App from './App';
import './index.css';

// Configure Amplify
Amplify.configure(amplifyconfig);

// Verify it worked
console.log('Config after apply:', Amplify.getConfig());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);