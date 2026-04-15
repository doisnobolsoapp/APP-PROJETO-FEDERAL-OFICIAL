import './style.css';
import './app.js';

console.log("🚀 MAIN INICIADO");

// SERVICE WORKER
if ('serviceWorker' in navigator && location.hostname !== "localhost") {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('✅ SW registrado:', reg))
      .catch(err => console.log('❌ SW erro:', err));
  });
}
