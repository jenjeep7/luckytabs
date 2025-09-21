import { Capacitor } from '@capacitor/core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { HashRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
console.log('[BOOT] href:', window.location.href);
if (Capacitor.isNativePlatform() && !window.location.hash) {
  window.location.replace(
    window.location.href + (window.location.href.endsWith('/') ? '#/' : '/#/')
  );
}



const el = document.getElementById('root') as HTMLElement;
ReactDOM.createRoot(el).render(
  <HashRouter>
    <App />
  </HashRouter>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
