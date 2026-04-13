import './style.css';
import './app.js';

// Garante que o DOM carregou
document.addEventListener("DOMContentLoaded", () => {
  console.log("App iniciado com sucesso");

  // Verificação de segurança
  const app = document.getElementById('app');
  if (!app) {
    console.error("❌ ERRO: div #app não encontrada");
  }
});

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(error => {
        console.log('SW registration failed: ', error);
      });
  });
}
