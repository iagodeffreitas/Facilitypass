import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical Application Error:", error);
  rootElement.innerHTML = `
    <div style="padding: 2rem; font-family: sans-serif; text-align: center; color: #333;">
      <h1>Erro ao carregar aplicação</h1>
      <p>Ocorreu um problema na inicialização. Tente limpar o cache ou recarregar a página.</p>
    </div>
  `;
}