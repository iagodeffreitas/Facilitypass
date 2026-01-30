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
  console.error("Erro fatal na inicialização:", error);
  rootElement.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; text-align:center; padding:20px;">
      <h1 style="color:#e63946">Erro ao carregar aplicação</h1>
      <p style="color:#555">Ocorreu um problema ao iniciar o sistema. Verifique o console para mais detalhes.</p>
      <button onclick="window.location.reload()" style="margin-top:20px; padding:10px 20px; background:#000; color:#fff; border:none; border-radius:5px; cursor:pointer;">Recarregar Página</button>
    </div>
  `;
}