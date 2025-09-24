import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import GlobalStyle from './GlobalStyle';
import store from './store/store.js';

// Set --vh CSS variable to handle mobile viewport height correctly
function setVhVar() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVhVar();
window.addEventListener('resize', setVhVar);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <GlobalStyle />
    <App />
  </Provider>
);
